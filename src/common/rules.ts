export const RULES = {
	PASSWORD: /^(?=.*\d)(?=.*[a-zA-z])(?=.*[A-Z]).{8,}$/,
	EMAIL: /^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,6})$/,
	FIAT: /\d?(\.\d{0,2})?/
} as const;
