import { model } from 'mongoose';
import { IWallet, IDocument } from './interface';
import WalletSchema from './schema';

const Model = model<IDocument>(
	'Wallet', WalletSchema, 'wallets'
);

export class Wallet extends Model implements IWallet {}
