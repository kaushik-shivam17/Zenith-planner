/**
 * Minimal Zod -> JSON Schema converter (covers the schemas used by this app:
 * objects, arrays, strings). Avoids pulling an extra dependency.
 */
import type { z } from 'zod';

export function zodToJsonSchema(schema: z.ZodTypeAny): any {
  const def: any = (schema as any)._def;
  switch (def?.typeName) {
    case 'ZodObject': {
      const shape = def.shape();
      const properties: Record<string, any> = {};
      const required: string[] = [];
      for (const [key, val] of Object.entries(shape)) {
        properties[key] = zodToJsonSchema(val as z.ZodTypeAny);
        if (!(val as any).isOptional?.()) required.push(key);
      }
      return { type: 'object', properties, required };
    }
    case 'ZodArray':
      return { type: 'array', items: zodToJsonSchema(def.type) };
    case 'ZodString':
      return { type: 'string' };
    case 'ZodNumber':
      return { type: 'number' };
    case 'ZodBoolean':
      return { type: 'boolean' };
    case 'ZodOptional':
    case 'ZodNullable':
      return zodToJsonSchema(def.innerType);
    case 'ZodEnum':
      return { type: 'string', enum: def.values };
    default:
      return {};
  }
}
