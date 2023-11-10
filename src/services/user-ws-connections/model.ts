import { model } from 'mongoose';
import { IWSConnection, IDocument } from './interface';
import UserWebSocketConnectionSchema from './schema';

const Model = model<IDocument>(
	'UserWebSocketConnection', UserWebSocketConnectionSchema, 'user-websocket-connections'
);

export class UserWebSocketConnection extends Model implements IWSConnection {}
