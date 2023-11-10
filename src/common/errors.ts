export const AUTHORIZATION_ERROR = {
	USER_PASSWORD_RULES_VALIDATION_ERROR: 'User password should includes at least one upper case letter, number, and be at least 8 symbols',
	USER_NOT_EXISTS: 'User not exists',
	INVALID_TOKEN_SIGNATURE: 'Invalid token signature',
	AUTHORIZATION_IS_REQUIRED: 'Authorization is required',
	USER_EMAIL_VALIDATION_ERROR: 'Please, enter email correctly',
	TOKEN_IS_INVALID: 'Token is invalid',
	EMAIL_IS_NOT_VERIFIED: 'Email is not verified',
	TOKEN_EXPIRED: 'Token expired',
	AUTH_CODE_IS_INVALID: 'Auth code is invalid',
	AUTH_CODE_IS_NOT_PROVIDED: 'Auth code is not provided'
};

export const COMMON_ERRORS = {
	VALIDTION_ERROR: 'Data is invalid',
	USER_ALREADY_EXISTS: 'User already exists',
	EMAIL_OR_PASSWORD_DOES_NOT_MATCH: 'Email or password does not match',
	ADVERT_NOT_FOUND: 'Advert not found',
	PERMISSION_DENIED: 'Permission denied',
	TRANSACTION_FAILED: 'Transaction failed',
	BAD_BINANCE_RESPONSE: 'Bad binance response',
	BAD_PRIVAT_RESPONSE: 'Bad privat response',
	DEAL_NOT_FOUND: 'Deal not found',
	DEAL_BAD_STATUS: 'Deal bad status',
	DEAL_NOT_OWNER: 'Deal not owner',
	ADVERT_NOT_OWNER: 'Advert not owner',
	ADVERT_NOT_ACTIVE: 'Advert not active',
	ADVERT_CAN_NOT_BE_CREATED_WHILE_REQUISITES_ARE_UNDEFINED: 'Advert can not be created while requisites are undefined',
	ADVERT_CAN_NOT_BE_DEACTIVATED_WHILE_IT_IS_NOT_ACTIVE: 'Advert can not be deactivated while it is not active',
	ADVERT_CAN_NOT_BE_ACTIVATED_WHILE_IT_IS_ACTIVE: 'Advert can not be activated while it is active',
	ADVERT_CAN_NOT_BE_UPDATED_DUE_DEAL_IS_OPEN: 'Advert can not be updated due to opened deal',
	ADVERT_OWNER_CANNOT_CREATE_DEAL: 'Advert owner cannot create deal',
	ADVERT_MIN_LIMIT_CAN_NOT_BE_BIGGER_THEN_MAX_LIMIT: 'Advert min limit can not be bigger then max limit',
	DEAL_CAN_NOT_BE_CREATED_WHILE_REQUISITES_ARE_UNDEFINED: 'Deal can not be created while requisites are undefined',
	DEAL_NOT_CUSTOMER: 'Deal not customer',
	DEAL_NOT_PARTICIPANT: 'Deal not participant',
	DEAL_CAN_NOT_SET_AMOUNT_BIGGER_THEN_MAX_LIMIT: 'Deal can not set amount bigger then max limit',
	DEAL_CAN_NOT_SET_AMOUNT_LESS_THEN_MIN_LIMIT: 'Deal can not set amount less then min limit',
	DEAL_SUMM_IN_OPENED_DEALS_BIGGER_THEN_MAX_LIMIT_IN_ADVERT: 'Deal summ in opened deals bigger then max limit in advert',
	DEAL_TIME_EXPIRED: 'Deal time expired',
	COMMENTS_ARE_REQUIRED: 'Comments are required',
	WALLET_NOT_FOUND: 'Wallet not found',
	WALLET_NOT_OWNER: 'Wallet not owner',
	CRYPTO_WALLETS_NOT_ENOUGH: 'Crypto wallets not enough',
	CURRENCY_NOT_ENOUGH: 'Currency not enough',
	CHAT_NOT_FOUND: 'Chat not found',
	CHAT_NOT_PARTICIPANT: 'Chat not participant',
	CHAT_DISPUTE_NOT_FOUND: 'Chat dispute not found',
	CHAT_DISPUTE_NOT_PARTICIPANT: 'Chat dispute not participant',
	CHAT_MESSAGE_NOT_FOUND: 'Chat message not found',
	COMMISSION_ALREADY_EXISTS: 'Commission already exists',
	FILE_ALREADY_EXISTS: 'File already exists',
	FILE_NOT_SAVED: 'File not saved',
	FILE_INVALID_MAX_SIZE: 'File invalid max size'
};

export const ERRORS = {
	...AUTHORIZATION_ERROR,
	...COMMON_ERRORS
} as const;

export default ERRORS;
