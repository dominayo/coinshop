import { Schema } from 'mongoose';

export const ChatSchema : Schema = new Schema({
	dealId: String,
	owner: String,
	customerId: String
}, { timestamps: true });

ChatSchema.index({ dealId: 1 }, { unique: true });
ChatSchema.index({ createdAt: 1 });
ChatSchema.index({ updatedAt: 1 });

export default ChatSchema;
