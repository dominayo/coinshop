import { Document } from 'mongoose';
import { ICreatedUpdated } from '../../common/interface';
/* eslint-disable no-unused-vars */
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

export interface IUserProfile {
	userId: string;
	deals: number;
	summInTransactions: number;
	disputeLost: number;
	reactionSpeed: number[],
	canceledDeals: number;
	disputeOpenedCount: number;
	rating: any;
}

export interface ICreateParams {
	userId: string;
}

export interface IUpdateParams {
	userId: string;
	deals?: number;
	summInTransactions?: number;
	disputeLost?: number;
	reactionSpeed?: number,
	canceledDeals?: number;
	disputeOpenedCount?: number;
}

export interface IFindByUserId {
	userId: string;
}

export interface calculateDealsRating {
	userId: string;
}

export interface ICalculateSummInTransactionRating {
	userId: string;
}

export interface ICalculateDisputeLostRating {
	userId: string;
}

export interface ICalculateCanceledDealsRating {
	userId: string;
}

export interface ICalculateReactionSpeed {
	userId: string;
}

export interface IDocument extends IUserProfile, ICreatedUpdated, Document {}
