export interface IPayload {
	userId: string;
	iat: Date;
	exp: Date;
}

export interface IVerifyTwoFactorAuthenticationCode {
	userId: string;
	code: string;
}

export interface IGetTwoFactorAuthenticationCode {
	otpauthUrl: string;
	base32: string;
}
