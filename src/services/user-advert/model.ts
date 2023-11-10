import { model } from 'mongoose';
import { IUserAdvert, IDocument } from './interface';
import UserAdvertSchema from './schema';

const Model = model<IDocument>(
	'UserAdvert', UserAdvertSchema, 'user-adverts'
);

export class UserAdvert extends Model implements IUserAdvert {}
