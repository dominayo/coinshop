import { Schema } from 'mongoose';

export const UserProfileSchema: Schema = new Schema({
	userId: String,
	deals: {
		type: Number,
		default: 0
	},
	summInTransactions: {
		type: Number,
		default: 0
	},
	disputeLost: {
		type: Number,
		default: 0
	},
	reactionSpeed: [{
		type: Number
	}],
	canceledDeals: {
		type: Number,
		default: 0
	},
	disputeOpenedCount: {
		type: Number,
		default: 0
	},
	rating: {
		type: Number,
		default: 0
	}
}, { timestamps: true });

UserProfileSchema.index({ userId: 1 }, { unique: true });
UserProfileSchema.index({ createdAt: 1 });
UserProfileSchema.index({ updatedAt: 1 });

export default UserProfileSchema;
