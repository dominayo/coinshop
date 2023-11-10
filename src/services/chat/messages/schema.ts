import { Schema } from 'mongoose';
import { MessageType, ContentType } from './interface';

export const ChatMessageSchema : Schema = new Schema({
	chatId: String,
	userId: String,
	message: String,
	messageType: {
		type: String,
		enum: Object.values(MessageType)
	},
	contentType: {
		type: String,
		enum: Object.values(ContentType)
	}
}, { timestamps: true });

ChatMessageSchema.index({ chatId: 1, userId: 1 });
ChatMessageSchema.index({ chatId: 1 });
ChatMessageSchema.index({ createdAt: 1 });
ChatMessageSchema.index({ updatedAt: 1 });

export default ChatMessageSchema;
