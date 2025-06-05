import db from '@/db'
import { api_keys } from '@/db/schema'
import { create_api_key, revoke_api_key } from '@/lib/auth'
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from '@/lib/constants'
import type { AppRouteHandler } from '@/lib/types'
import { and, eq } from 'drizzle-orm'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import * as HttpStatusPhrases from 'stoker/http-status-phrases'
import type {
	CreateRoute,
	GetOneRoute,
	ListRoute,
	PatchRoute,
	RemoveRoute,
} from './api-keys.routes'

export const list: AppRouteHandler<ListRoute> = async (c) => {
	const current_user = c.get('user')
	if (!current_user) {
		return c.json(
			{
				message: HttpStatusPhrases.UNAUTHORIZED,
			},
			HttpStatusCodes.UNAUTHORIZED
		)
	}

	const userApiKeys = await db.query.api_keys.findMany({
		where: (api_keys, { eq }) => eq(api_keys.user_id, current_user.id),
		columns: {
			key_hash: false, // Exclude sensitive data
		},
	})

	return c.json(userApiKeys, HttpStatusCodes.OK)
}

export const create: AppRouteHandler<CreateRoute> = async (c) => {
	const current_user = c.get('user')
	if (!current_user) {
		return c.json(
			{
				message: HttpStatusPhrases.UNAUTHORIZED,
			},
			HttpStatusCodes.UNAUTHORIZED
		)
	}

	const body = c.req.valid('json')

	try {
		const expires_at = body.expires_at ? new Date(body.expires_at) : undefined
		const { api_key, key } = await create_api_key(c, current_user.id, body.name, expires_at)

		// Return the API key info plus the actual key (only time it's shown)
		// Remove sensitive data using destructuring
		const { key_hash, ...api_key_without_hash } = api_key
		const response = {
			...api_key_without_hash,
			key, // Include the actual key in response
		}

		return c.json(response, HttpStatusCodes.CREATED)
	} catch (error) {
		c.var.logger.error('Failed to create API key:', error)
		return c.json(
			{
				message: 'Failed to create API key',
			},
			HttpStatusCodes.INTERNAL_SERVER_ERROR
		)
	}
}

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
	const current_user = c.get('user')
	if (!current_user) {
		return c.json(
			{
				message: HttpStatusPhrases.UNAUTHORIZED,
			},
			HttpStatusCodes.UNAUTHORIZED
		)
	}

	const { id } = c.req.valid('param')

	const apiKey = await db.query.api_keys.findFirst({
		where: (api_keys, { eq, and }) =>
			and(eq(api_keys.id, id), eq(api_keys.user_id, current_user.id)),
		columns: {
			key_hash: false, // Exclude sensitive data
		},
	})

	if (!apiKey) {
		return c.json(
			{
				message: HttpStatusPhrases.NOT_FOUND,
			},
			HttpStatusCodes.NOT_FOUND
		)
	}

	return c.json(apiKey, HttpStatusCodes.OK)
}

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
	const current_user = c.get('user')
	if (!current_user) {
		return c.json(
			{
				message: HttpStatusPhrases.UNAUTHORIZED,
			},
			HttpStatusCodes.UNAUTHORIZED
		)
	}

	const { id } = c.req.valid('param')
	const updates = c.req.valid('json')

	// Check if any updates are provided
	if (Object.keys(updates).length === 0) {
		return c.json(
			{
				success: false,
				error: {
					issues: [
						{
							code: ZOD_ERROR_CODES.INVALID_UPDATES,
							path: [] as (string | number)[],
							message: ZOD_ERROR_MESSAGES.NO_UPDATES,
						},
					],
					name: 'ZodError',
				},
			},
			HttpStatusCodes.UNPROCESSABLE_ENTITY
		)
	}

	try {
		const [updatedApiKey] = await db
			.update(api_keys)
			.set({
				...updates,
				expires_at: updates.expires_at ? new Date(updates.expires_at) : undefined,
			})
			.where(and(eq(api_keys.id, id), eq(api_keys.user_id, current_user.id)))
			.returning()

		if (!updatedApiKey) {
			return c.json(
				{
					message: HttpStatusPhrases.NOT_FOUND,
				},
				HttpStatusCodes.NOT_FOUND
			)
		}

		// Remove sensitive data using destructuring
		const { key_hash, ...response } = updatedApiKey

		return c.json(response, HttpStatusCodes.OK)
	} catch (error) {
		if (error instanceof Error && error.message.includes('unique constraint')) {
			return c.json(
				{
					success: false,
					error: {
						issues: [
							{
								code: ZOD_ERROR_CODES.CUSTOM,
								path: ['name'] as (string | number)[],
								message: ZOD_ERROR_MESSAGES.DUPLICATE_VALUE,
							},
						],
						name: 'ZodError',
					},
				},
				HttpStatusCodes.UNPROCESSABLE_ENTITY
			)
		}

		c.var.logger.error('Failed to update API key:', error)
		return c.json(
			{
				message: 'Failed to update API key',
			},
			HttpStatusCodes.INTERNAL_SERVER_ERROR
		)
	}
}

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
	const current_user = c.get('user')
	if (!current_user) {
		return c.json(
			{
				message: HttpStatusPhrases.UNAUTHORIZED,
			},
			HttpStatusCodes.UNAUTHORIZED
		)
	}

	const { id } = c.req.valid('param')

	try {
		const success = await revoke_api_key(c, id, current_user.id)

		if (!success) {
			return c.json(
				{
					message: HttpStatusPhrases.NOT_FOUND,
				},
				HttpStatusCodes.NOT_FOUND
			)
		}

		return c.body(null, HttpStatusCodes.NO_CONTENT)
	} catch (error) {
		c.var.logger.error('Failed to delete API key:', error)
		return c.json(
			{
				message: 'Failed to delete API key',
			},
			HttpStatusCodes.INTERNAL_SERVER_ERROR
		)
	}
}
