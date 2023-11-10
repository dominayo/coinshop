import { Schema } from 'mongoose';
import { UserRoles } from '../../common/interface';

export const UserSchema: Schema = new Schema({
	email: String,
	name: String,
	passwordHash: String,
	role: {
		type: String,
		enum: Object.values(UserRoles),
		default: UserRoles.Client
	},
	rating: {
		type: Number,
		default: 0
	},
	transactionInFiat: {
		type: Number,
		default: 0
	},
	isVerified: {
		type: Boolean,
		default: false
	},
	is2FAEnabled: {
		type: Boolean,
		default: false
	},
	twoFactorAuthenticationCode: String
}, { timestamps: true });

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ name: 1 }, { unique: true });
UserSchema.index({ createdAt: 1 });
UserSchema.index({ updatedAt: 1 });

export default UserSchema;
