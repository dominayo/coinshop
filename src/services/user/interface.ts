/* eslint-disable no-unused-vars */
import { Document } from 'mongoose';
import { ICreatedUpdated, UserRoles } from '../../common/interface';

export enum UserRating {
	DEAL_AMOUNT = 0.1,
	DISPUTE_LOSE = -50,
	DEAL_CANCEL = -5,
	SUMM_IN_DEAL = 1,
	REACTION_LOW_SPEED = -10,
	REACTION_STANDART_SPEED = 2.5,
	REACTION_FAST_SPEED = 5
}

export enum ReactionSpeed {
	REACTION_LOW_SPEED = 7.5,
	REACTION_STANDART_SPEED = 5,
	REACTION_FAST_SPEED = 1
}

export interface IUser {
	email: string;
	name: string;
	passwordHash: string;
	role: UserRoles;
	rating: number;
	transactionInFiat: number;
	isVerified: boolean;
	twoFactorAuthenticationCode: string;
}

export interface IUserCreate {
	email: string;
	name: string;
	passwordHash: string;
}

export interface IUserAdminCreate {
	email: string;
	name: string;
	passwordHash: string;
}

export interface IIsUserExists {
	userId: string;
}

export interface IGetUserByIds {
	userIds: string[];
}

export interface IList {
	skip?: number;
	limit?: number;
}

export interface IFindOneAndUpdate {
	userId: string;
	name?: string;
	isVerified?: boolean;
	is2FAEnabled?: boolean;
	twoFactorAuthenticationCode?: string;
}

export interface IUpdateUserRating {
	userId: string;
	rating: number;
}

export interface IUpdateUserFiatSumm {
	userId: string;
	transactionInFiat: number;
}

export interface IDocument extends IUser, ICreatedUpdated, Document {}
