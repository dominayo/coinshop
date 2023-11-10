import { CryptoCurrency, UserRoles } from '../../../common/interface';

export interface ISignIn {
	email: string;
	password: string;
}

export interface IAdminCreate {
	name: string;
	secondName: string;
	email: string;
	password: string;
	role: UserRoles;
}

export interface IAdvertList {
	sortOrder: string;
}

export interface ICommission {
	cryptoCurrency: CryptoCurrency;
	commission: number;
}

export interface ICommissionUpdate {
	cryptoCurrency: CryptoCurrency;
	commission: number;
}

export interface IChatMessageList {
	chatId: string;
}
