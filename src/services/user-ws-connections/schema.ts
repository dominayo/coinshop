import { Schema } from 'mongoose';
import { UserRoles } from '../../common/interface';

export const UserWebSocketConnectionSchema: Schema = new Schema({
	userId: String,
	role: {
		type: String,
		enum: Object.values(UserRoles)
	},
	connections: [String]
}, { timestamps: true });

UserWebSocketConnectionSchema.index({ createdAt: 1 });
UserWebSocketConnectionSchema.index({ updatedAt: 1 });

export default UserWebSocketConnectionSchema;
