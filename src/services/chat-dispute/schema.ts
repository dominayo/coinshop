import { Schema } from 'mongoose';
import { UserRoles } from '../../common/interface';

export const ChatDisputeSchema : Schema = new Schema({
	dealId: String,
	creatorId: String,
	participants: [
		{
			userId: String,
			role: {
				type: String,
				enum: Object.values(UserRoles)
			}
		}
	],
	isActive: {
		type: Boolean,
		default: true
	}
}, { timestamps: true });

ChatDisputeSchema.index({ createdAt: 1 });
ChatDisputeSchema.index({ updatedAt: 1 });

export default ChatDisputeSchema;
