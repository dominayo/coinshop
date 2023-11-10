/* eslint-disable no-unused-vars */
import { Document } from 'mongoose';
import * as moment from 'moment';
import { ICreatedUpdated, ExchangeType } from '../../common/interface';

export enum Status {
	Created = 'CREATED',
	Confirmed = 'CONFIRMED',
	MoneySent = 'MONEY_SENT',
	MoneyReceived = 'MONEY_RECEIVED',
	DisputeOpened = 'DISPUT_OPENED',
	// CryptoCurrencyRecieved = 'CRYPTO_CURRENCY_RECIEVED',
	Canceled = 'CANCELED',
	Closed = 'CLOSED',
	Сompleted = 'COMPLETED'
}

export enum StatusTiming {
	CREATED = 10,
	CONFIRMED = 10,
	MONEY_SENT = 0,
	DISPUT_OPENED = 0
}

export interface IDeal {
	type: ExchangeType;
	owner: string;
	customerId: string;
	advertId: string;
	amount: number;
	status: Status;
	exchangeRate: number;
	expiresAt: moment.Moment;
	statusHistory: [{
		status: Status;
		changedAt: moment.Moment;
	}],
	comments?: string;
}

export interface IDealCreate {
	type: ExchangeType;
	owner: string;
	customerId: string;
	advertId: string;
	amount: number;
	status: Status;
	exchangeRate: number;
	expiresAt: moment.Moment;
	statusHistory: [{
		status: Status;
		changedAt: moment.Moment;
	}],
	comments?: string;
}

export interface IDealList {
	type?: ExchangeType;
	status?: Status;
	skip?: number;
	limit?: number;
}

export interface IFindById {
	id: string;
}

export interface IDealStatusUpdate {
	id: string;
	status: Status;
	statusTiming: {
		status: Status;
		changedAt: moment.Moment;
	}
}

export interface IDealDelete {
	id: string;
}

export interface IIsExists {
	id: string;
}

export interface IIsStatusesMatch {
	id: string;
	statuses: Status[];
}

export interface IIsNotStatusesMatch {
	id: string;
	statuses: Status[];
}

export interface IIsOwner {
	dealId: string;
	owner: string
}

export interface IIsCusomer {
	dealId: string;
	customerId: string
}

export interface IIsInDeal {
	id: string;
	userId: string;
}

export interface IIsSeller {
	dealId: string;
	userId: string;
}

export interface IIsBuyer {
	dealId: string;
	userId: string;
}

export interface IFindByAdvertId {
	advertId: string;
}

export interface IFindListByUserId {
	userId: string;
	type?: ExchangeType;
	status?: Status;
	skip?: number;
	limit?: number;
}

export interface IIsAmountOfCurrencyLessThenSummInOpenedDeals {
	advertId: string;
	amount: number;
}

export interface IIsExipred {
	dealId: string;
}

export interface IAddDealTime {
	dealId: string;
	statusTiming: StatusTiming;
}

export interface ICountByParticipantId {
	userId: string;
	skip?: number;
	limit?: number;
}

export interface IIsStatusesMatchForDispute {
	id: string;
	statuses: string[];
}

export interface IGetUserTransactionList {
	userId: string;
}

export interface IDocument extends IDeal, ICreatedUpdated, Document {}

export default IDocument;
