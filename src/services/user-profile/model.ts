import { model } from 'mongoose';
import { IUserProfile, IDocument } from './interface';
import UserProfileSchema from './schema';

const Model = model<IDocument>(
	'UserProfile', UserProfileSchema, 'user-profiles'
);

export class UserProfile extends Model implements IUserProfile {}
