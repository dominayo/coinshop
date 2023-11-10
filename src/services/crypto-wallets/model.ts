import { model } from 'mongoose';
import { ICryptoWallets, IDocument } from './interface';
import CryptoWalletSchema from './schema';

const Model = model<IDocument>(
	'CryptoWallets', CryptoWalletSchema, 'crypto-wallets'
);

export class CryptoWallet extends Model implements ICryptoWallets {}
