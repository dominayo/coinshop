import { model } from 'mongoose';
import { IUser, IDocument } from './interface';
import UserSchema from './schema';

const Model = model<IDocument>(
	'User', UserSchema, 'users'
);

export class User extends Model implements IUser {}
