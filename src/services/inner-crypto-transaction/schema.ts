import { Schema } from 'mongoose';
import { TransactionType, Status } from './interface';
import { CryptoCurrency } from '../../common/interface';

export const CryptoTransactionSchema: Schema = new Schema({
	userId: String,
	recipientId: String,
	transactionType: {
		type: String,
		enum: Object.values(TransactionType)
	},
	cryptoCurrency: {
		type: String,
		enum: Object.values(CryptoCurrency)
	},
	amount: Number,
	status: {
		type: String,
		enum: Object.values(Status),
		default: Status.Start
	},
	wallet: String,
	isInner: {
		type: Boolean,
		default: true
	},
	to: String
}, { timestamps: true });

CryptoTransactionSchema.index({ createdAt: 1 });
CryptoTransactionSchema.index({ updatedAt: 1 });

export default CryptoTransactionSchema;
