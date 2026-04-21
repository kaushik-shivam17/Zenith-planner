import { ai } from '@/ai/genkit';

export const runtime = 'nodejs';

function mapModel(m?: string) {
  if (!m) return 'googleai/gemini-2.0-flash';
  return m.startsWith('google/') ? m.replace(/^google\//, 'googleai/') : m;
}

export async function POST(req: Request) {
  const { model, prompt } = await req.json();
  const { stream } = ai.generateStream({ model: mapModel(model), prompt });

  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const t = chunk.text;
          if (t) controller.enqueue(encoder.encode(t));
        }
        controller.close();
      } catch (err: any) {
        controller.enqueue(encoder.encode(`\n[stream error: ${err?.message}]`));
        controller.close();
      }
    },
  });

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
