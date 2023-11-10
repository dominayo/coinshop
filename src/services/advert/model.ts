import { model } from 'mongoose';
import { IAdvert, IDocument } from './interface';
import AdvertSchema from './schema';

const Model = model<IDocument>(
	'Advert', AdvertSchema, 'adverts'
);

export class Advert extends Model implements IAdvert {}
