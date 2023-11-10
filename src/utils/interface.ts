/* eslint-disable @typescript-eslint/ban-types */
export interface IUserCreate {
	userId: string;
}

export interface IDecodeJWT {
	userId: string;
	iat: Date;
	exp: Date;
}

export interface ITokenParams {
	token: string;
}

export interface IReadFile {
	fileName: string;
}

export interface IRequestParams {
	url: string;
}
