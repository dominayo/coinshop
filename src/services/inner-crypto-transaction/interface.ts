/* eslint-disable @typescript-eslint/no-empty-interface */
import { Document } from 'mongoose';
import { CryptoCurrency, ICreatedUpdated } from '../../common/interface';

/* eslint-disable no-unused-vars */
export enum TransactionType {
	Deposit = 'DEPOSIT',
	Withdraw = 'WITHDRAW',
	Transfer = 'TRANSFER'
}

export enum Status {
	Start = 'START',
	Processing = 'PROCESSING',
	Success = 'SUCCESS',
	Abort = 'ABORT',
	Failed = 'FAILED'
}

export interface ICryptoTranssaction {
	userId: string;
	recipientId?: string;
	transactionType: TransactionType;
	cryptoCurrency: CryptoCurrency;
	amount: number;
	status: Status;
	wallet: string;
	isInner: boolean;
	to?: string;
}

export interface ICryptoTransactionCreate {
	userId: string;
	recipientId?: string;
	transactionType: TransactionType;
	cryptoCurrency: CryptoCurrency;
	amount: number;
	status: Status;
	isInner?: boolean;
	to?: string;
}

export interface ICryptoTranssactionUpdate {
	id: string;
	status: Status;
}

export interface ICyptoTransactionList {
	status?: Status;
	transactionType?: TransactionType;
	cryptoCurrency?: CryptoCurrency;
	skip?: number;
	limit?: number;
}

export interface IProcessingCyptoTransactionList {
	skip?: number;
	limit?: number;
}

export interface IUserList {
	userId: string;
	skip?: number;
	limit?: number;
	transactionType?: TransactionType;
	cryptoCurrency?: CryptoCurrency;
	status?: Status;
}

export interface ICountByUserId {
	userId: string;
	transactionType?: TransactionType;
	cryptoCurrency?: CryptoCurrency;
	status?: Status;
	skip?: number;
	limit?: number;
}

export interface IGetUserSummOfSuccessTransactions {
	userId: string;
	cryptoCurrency: CryptoCurrency;
}

export interface IListByStatus {
	status: Status;
}

export interface IFindById {
	id: string;
}

export interface IDocument extends ICryptoTranssaction, ICreatedUpdated, Document {}
