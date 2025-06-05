import * as HttpStatusPhrases from 'stoker/http-status-phrases'
import { createMessageObjectSchema } from 'stoker/openapi/schemas'

export const ZOD_ERROR_MESSAGES = {
	REQUIRED: 'Required',
	EXPECTED_NUMBER: 'Expected number, received NaN',
	NO_UPDATES: 'No updates provided',
}

export const ZOD_ERROR_CODES = {
	INVALID_UPDATES: 'invalid_updates',
	CUSTOM: 'custom',
}

export const NOT_FOUND_SCHEMA = createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND)
