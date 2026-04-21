import { createClient } from '@blinkdotnew/sdk'

let _blink: ReturnType<typeof createClient> | null = null;

function getBlink() {
  if (_blink) return _blink;
  const projectId = process.env.NEXT_PUBLIC_BLINK_PROJECT_ID;
  const publishableKey = process.env.NEXT_PUBLIC_BLINK_PUBLISHABLE_KEY;
  if (!projectId) {
    throw new Error(
      'NEXT_PUBLIC_BLINK_PROJECT_ID is not set. Add it in Replit Secrets.'
    );
  }
  _blink = createClient({
    projectId,
    publishableKey: publishableKey ?? '',
    auth: { mode: 'managed' },
  });
  return _blink;
}

export const blink: ReturnType<typeof createClient> = new Proxy({} as any, {
  get(_t, prop) {
    const target = getBlink() as any;
    const val = target[prop];
    return typeof val === 'function' ? val.bind(target) : val;
  },
});
