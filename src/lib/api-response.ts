import { z } from '@hono/zod-openapi'

export const baseResponseSchema = z.object({
	success: z.boolean().describe('Whether the request was successful'),
	message: z.string().describe('Human-readable message describing the result'),
	data: z.unknown().optional().describe('The actual response data'),
	error: z
		.object({
			code: z.string(),
			details: z.unknown().optional(),
		})
		.optional()
		.describe('Error information if success is false'),
})

export function createApiResponse<T extends z.ZodType>(dataSchema: T) {
	return z.object({
		success: z.literal(true),
		message: z.string(),
		data: dataSchema,
	})
}

export const errorResponseSchema = z.object({
	success: z.literal(false),
	message: z.string(),
	error: z.object({
		code: z.string(),
		details: z.unknown().optional(),
	}),
})

export function createPaginatedResponse<T extends z.ZodType>(itemSchema: T) {
	return z.object({
		success: z.literal(true),
		message: z.string(),
		data: z.object({
			items: z.array(itemSchema),
			pagination: z.object({
				page: z.number(),
				limit: z.number(),
				total: z.number(),
				totalPages: z.number(),
			}),
		}),
	})
}
