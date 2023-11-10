import { Schema } from 'mongoose';

export const UserAdvertSchema: Schema = new Schema({
	userId: String,
	advertId: String
}, { timestamps: true });

UserAdvertSchema.index({ name: 'text' }, { unique: true });
UserAdvertSchema.index({ createdAt: 1 });
UserAdvertSchema.index({ updatedAt: 1 });

export default UserAdvertSchema;
