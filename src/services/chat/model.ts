import { model } from 'mongoose';
import { IChat, IDocument } from './interface';
import ChatSchema from './schema';

const Model = model<IDocument>(
	'Chat', ChatSchema, 'chats'
);

export class Chat extends Model implements IChat {}
