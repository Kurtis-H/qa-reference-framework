import { z } from 'zod';

/**
 * API contract schemas. If the API changes a field name or type, these fail loudly
 * instead of tests silently passing on bad data. `.strict()` also catches NEW fields,
 * which can mean accidental data exposure (e.g. a password hash leaking into a response).
 */
export const HealthSchema = z.object({ status: z.literal('ok'), mode: z.enum(['vulnerable', 'secure']) }).strict();

export const ProductSchema = z
  .object({ id: z.number().int().positive(), name: z.string().min(1), price: z.number().nonnegative() })
  .strict();
export const ProductListSchema = z.array(ProductSchema);

export const LoginResponseSchema = z.object({ token: z.string().regex(/^[\w-]+\.[\w-]+\.[\w-]+$/) }).strict();

export const OrderSchema = z
  .object({
    id: z.number().int().positive(),
    user_id: z.number().int().positive(),
    product_id: z.number().int().positive(),
    shipping_address: z.string().min(1),
  })
  .strict();

export const ReviewCreatedSchema = z.object({ id: z.number().int().positive() }).strict();

export const ChatReplySchema = z.object({ reply: z.string() }).strict();

export const ErrorSchema = z.object({ detail: z.unknown() });

export type Product = z.infer<typeof ProductSchema>;
export type Order = z.infer<typeof OrderSchema>;
