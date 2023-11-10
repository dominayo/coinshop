import { model } from 'mongoose';
import { IDashboardNotifications, IDocument } from './interface';
import DashboardNotificationSchema from './schema';

const Model = model<IDocument>(
	'DashboardNotification', DashboardNotificationSchema, 'dashboard-notifications'
);

export class DashboardNotification extends Model implements IDashboardNotifications {}
