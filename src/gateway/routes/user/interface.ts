import { Direction } from '../../../common/interface';

export interface IUserCreate {
	email: string;
	name: string;
	password: string;
}

export interface IUserFindOne {
	email: string;
	password: string;
	code?: string;
}

export interface IIsEmailExists {
	email: string;
}

export interface IIsNameExists {
	name: string;
}

export interface IUserUpdate {
	userId: string;
	name?: string;
}

export interface IEnableGoogle2fa {
	enable: boolean;
}

export interface IUserUpdateRequisites {
	requisites: [
		{
			direction: Direction;
			fiatWallet: string;
		}
	]
}

export interface IEmailVerify {
	token: string;
}

