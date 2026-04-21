/**
 * Universal client shim — replaces the Blink SDK with a fully local,
 * dependency-free implementation:
 *   - auth: persisted to localStorage (single-user, no server verification)
 *   - db:   persisted to localStorage as JSON tables
 *   - ai:   delegates to /api/ai/* server routes (Genkit + Gemini)
 */

import type { z } from 'zod';
import { zodToJsonSchema } from './zod-to-json-schema';

export interface LocalUser {
  id: string;
  email: string;
  displayName?: string;
}

const isBrowser = typeof window !== 'undefined';

// ---------- storage helpers ----------
function read<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
}

// ---------- auth ----------
const USER_KEY = 'zenith.user';
const CRED_KEY = 'zenith.credentials';
const USERS_KEY = 'zenith.users';

type AuthState = { user: LocalUser | null; isLoading: boolean; isAuthenticated: boolean };
type AuthListener = (state: AuthState) => void;
const listeners = new Set<AuthListener>();

function emit() {
  const user = read<LocalUser | null>(USER_KEY, null);
  const state: AuthState = { user, isLoading: false, isAuthenticated: !!user };
  listeners.forEach((l) => l(state));
}

async function hash(input: string): Promise<string> {
  if (isBrowser && globalThis.crypto?.subtle) {
    const buf = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return input;
}

const auth = {
  onAuthStateChanged(cb: AuthListener) {
    listeners.add(cb);
    Promise.resolve().then(() => {
      const user = read<LocalUser | null>(USER_KEY, null);
      cb({ user, isLoading: false, isAuthenticated: !!user });
    });
    return () => listeners.delete(cb);
  },

  async signInWithEmail(email: string, password: string) {
    const creds = read<Record<string, string>>(CRED_KEY, {});
    const hashed = await hash(password);
    if (!creds[email]) throw new Error('No account found for that email. Please sign up.');
    if (creds[email] !== hashed) throw new Error('Incorrect password.');
    const users = read<Record<string, LocalUser>>(USERS_KEY, {});
    const user = users[email] ?? { id: email, email };
    write(USER_KEY, user);
    emit();
    return user;
  },

  async signUp(args: { email: string; password: string; displayName?: string }) {
    const creds = read<Record<string, string>>(CRED_KEY, {});
    if (creds[args.email]) throw new Error('An account with that email already exists.');
    creds[args.email] = await hash(args.password);
    write(CRED_KEY, creds);

    const users = read<Record<string, LocalUser>>(USERS_KEY, {});
    const user: LocalUser = { id: args.email, email: args.email, displayName: args.displayName };
    users[args.email] = user;
    write(USERS_KEY, users);
    write(USER_KEY, user);
    emit();
    return user;
  },

  async signOut() {
    if (isBrowser) localStorage.removeItem(USER_KEY);
    emit();
  },

  async changePassword(oldPassword: string, newPassword: string) {
    const user = read<LocalUser | null>(USER_KEY, null);
    if (!user) throw new Error('Not signed in.');
    const creds = read<Record<string, string>>(CRED_KEY, {});
    const hashedOld = await hash(oldPassword);
    if (creds[user.email] !== hashedOld) throw new Error('Old password is incorrect.');
    creds[user.email] = await hash(newPassword);
    write(CRED_KEY, creds);
  },
};

// ---------- db ----------
type Row = Record<string, any> & { id: string };
type Where = Record<string, any>;

const tableKey = (name: string) => `zenith.db.${name}`;
const loadTable = (name: string): Row[] => read<Row[]>(tableKey(name), []);
const saveTable = (name: string, rows: Row[]) => write(tableKey(name), rows);
const matches = (row: Row, where?: Where) =>
  !where || Object.entries(where).every(([k, v]) => row[k] === v);

function table(name: string) {
  return {
    async list({ where, orderBy }: { where?: Where; orderBy?: Record<string, 'asc' | 'desc'> } = {}) {
      let rows = loadTable(name).filter((r) => matches(r, where));
      if (orderBy) {
        const [key, dir] = Object.entries(orderBy)[0];
        rows = [...rows].sort((a, b) => {
          if (a[key] === b[key]) return 0;
          return (a[key] > b[key] ? 1 : -1) * (dir === 'desc' ? -1 : 1);
        });
      }
      return { data: rows };
    },
    async create(row: Row) {
      const rows = loadTable(name);
      const newRow = { ...row, id: row.id ?? (isBrowser ? crypto.randomUUID() : String(Date.now())) };
      rows.push(newRow);
      saveTable(name, rows);
      return newRow;
    },
    async update(patch: Partial<Row> & { id: string }) {
      const rows = loadTable(name);
      const idx = rows.findIndex((r) => r.id === patch.id);
      if (idx >= 0) {
        rows[idx] = { ...rows[idx], ...patch };
        saveTable(name, rows);
        return rows[idx];
      }
      return null;
    },
    async delete(id: string) {
      saveTable(name, loadTable(name).filter((r) => r.id !== id));
    },
  };
}

const db = new Proxy({} as Record<string, ReturnType<typeof table>>, {
  get(_t, prop: string) {
    return table(prop);
  },
});

// ---------- ai (calls server API routes) ----------
const aiClient = {
  async generateObject<T extends z.ZodTypeAny>(opts: {
    model?: string;
    prompt: string;
    schema: T;
  }): Promise<{ object: z.infer<T> }> {
    const jsonSchema = zodToJsonSchema(opts.schema);
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: opts.model, prompt: opts.prompt, jsonSchema }),
    });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(error || 'AI generation failed');
    }
    const data = await res.json();
    return { object: data.object as z.infer<T> };
  },

  async streamText(opts: { model?: string; prompt: string }) {
    const res = await fetch('/api/ai/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: opts.model, prompt: opts.prompt }),
    });
    if (!res.ok || !res.body) {
      throw new Error('AI stream failed');
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    async function* textStream() {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        if (text) yield text;
      }
    }
    return { textStream: textStream() };
  },
};

export const blink = { auth, db, ai: aiClient };
export type BlinkUser = LocalUser;
