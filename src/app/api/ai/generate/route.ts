import { NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';

export const runtime = 'nodejs';

function mapModel(m?: string) {
  if (!m) return 'googleai/gemini-2.0-flash';
  return m.startsWith('google/') ? m.replace(/^google\//, 'googleai/') : m;
}

export async function POST(req: Request) {
  try {
    const { model, prompt, jsonSchema } = await req.json();
    const result = await ai.generate({
      model: mapModel(model),
      prompt,
      output: jsonSchema ? { jsonSchema } : undefined,
    });
    return NextResponse.json({ object: result.output, text: result.text });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'AI error' }, { status: 500 });
  }
}
