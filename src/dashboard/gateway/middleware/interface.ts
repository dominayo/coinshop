export interface IPayload {
	userId: string;
	iat: Date;
	exp: Date;
}

export interface IIsHavePermissions {
	socket: any;
}
