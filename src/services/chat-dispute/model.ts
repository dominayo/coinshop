import { model } from 'mongoose';
import { IChatDispute, IDocument } from './interface';
import ChatDisputeSchema from './schema';

const Model = model<IDocument>(
	'ChatDispute', ChatDisputeSchema, 'chat-disputes'
);

export class ChatDispute extends Model implements IChatDispute {}
