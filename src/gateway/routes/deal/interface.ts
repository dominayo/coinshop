import { ExchangeType } from '../../../common/interface';
import { Status } from '../../../services/deal/interface';

export interface IDealCreate {
	advertId: string;
	comments?: string;
	amount: number;
}

export interface IDealFind {
	id: string;
}

export interface IDealConfirm {
	id: string;
}

export interface IDealMoneySent {
	id: string;
}

export interface IDealMoneyRecieved {
	id: string;
}

export interface ICryptoCurrencyRecieved {
	id: string;
}

export interface IDealMoneyNotRecieved {
	id: string;
}

export interface IDealCancel {
	id: string;
}

export interface IDealDelete {
	id: string;
}

export interface IIsMaxLimitLessThenAmount {
	maxLimit: number;
	amount: number;
}

export interface IIsMinLimitBiggerThenAmount {
	minLimit: number;
	amount: number;
}

export interface IDealList {
	type?: ExchangeType;
	status?: Status;
	skip?: string;
	limit?: string;
}

export interface IRequisites {
	id: string;
}

export interface IIsOwner {
	userId: string;
	owner: string;
}

export interface IIsCommentsExists {
	comments?: string;
}

export interface IsStatusFitComments {
	status: Status;
}
