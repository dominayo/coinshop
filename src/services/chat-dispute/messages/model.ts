import { model } from 'mongoose';
import { IChatDisputeMessage, IDocument } from './interface';
import ChatDisputeMessageSchema from './schema';

const Model = model<IDocument>(
	'ChatDisputeMessage', ChatDisputeMessageSchema, 'chat-dispute-messages'
);

export class ChatDisputeMessage extends Model implements IChatDisputeMessage {}
