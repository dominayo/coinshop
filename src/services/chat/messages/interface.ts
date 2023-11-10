/* eslint-disable no-unused-vars */
import { Document } from 'mongoose';
import { ICreatedUpdated } from '../../../common/interface';

export enum ContentType {
	jpg = 'image/jpeg',
	png = 'image/png',
	pdf = 'application/pdf'
}

export enum MessageType {
	Text = 'TEXT',
	File = 'FILE'
}

export interface IChatMessage {
	chatId: string;
	userId: string;
	message: string;
	messageType: MessageType;
	contentType?: ContentType;
}

export interface IChatMessageCreate {
	chatId: string;
	userId: string;
	message: string;
	messageType: MessageType;
	contentType?: ContentType;
}

export interface IChatMessageList {
	chatId: string;
}

export interface IGetMessage {
	id: string;
}

export interface IDocument extends IChatMessage, ICreatedUpdated, Document {}
