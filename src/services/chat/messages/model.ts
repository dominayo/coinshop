import { model } from 'mongoose';
import { IChatMessage, IDocument } from './interface';
import ChatMessageSchema from './schema';

const Model = model<IDocument>(
	'ChatMessage', ChatMessageSchema, 'chat-messages'
);

export class ChatMessage extends Model implements IChatMessage {}
