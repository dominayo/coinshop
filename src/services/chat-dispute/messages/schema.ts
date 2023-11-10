import { Schema } from 'mongoose';
import { MessageType, ContentType } from './interface';
import { UserRoles } from '../../../common/interface';

export const ChatDisputeMessageSchema : Schema = new Schema({
	chatId: String,
	userId: String,
	message: String,
	role: {
		type: String,
		enum: Object.values(UserRoles)
	},
	messageType: {
		type: String,
		enum: Object.values(MessageType)
	},
	contentType: {
		type: String,
		enum: Object.values(ContentType)
	}
}, { timestamps: true });

ChatDisputeMessageSchema.index({ createdAt: 1 });
ChatDisputeMessageSchema.index({ updatedAt: 1 });

export default ChatDisputeMessageSchema;
