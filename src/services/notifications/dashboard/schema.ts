import { Schema } from 'mongoose';

export const DashboardNotificationSchema : Schema = new Schema({
	chatDisputeId: String,
	isRead: {
		type: Boolean,
		default: false
	}
}, { timestamps: true });

DashboardNotificationSchema.index({ createdAt: 1 });
DashboardNotificationSchema.index({ updatedAt: 1 });

export default DashboardNotificationSchema;
