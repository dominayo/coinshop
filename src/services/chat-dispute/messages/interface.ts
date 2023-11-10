/* eslint-disable no-unused-vars */
import { Document } from 'mongoose';
import { UserRoles, ICreatedUpdated } from '../../../common/interface';

export enum ContentType {
	jpg = 'image/jpeg',
	png = 'image/png',
	pdf = 'application/pdf'
}

export enum MessageType {
	Text = 'TEXT',
	File = 'FILE'
}

export interface IChatDisputeMessage {
	chatId: string;
	message: string;
	userId: string;
	role: UserRoles;
	messageType: MessageType;
	contentType?: ContentType;
}

export interface ICreate {
	chatId: string;
	message: string;
	userId: string;
	role: UserRoles;
	messageType: MessageType;
	contentType?: ContentType;
}

export interface IList {
	chatId: string;
}

export interface IGetMessage {
	id: string;
}

export interface IDocument extends IChatDisputeMessage, ICreatedUpdated, Document {}
