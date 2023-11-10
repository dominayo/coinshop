import { Schema } from 'mongoose';
import { CryptoCurrency } from '../../common/interface';

export const UserTransactionsSchema : Schema = new Schema({
	userId: String,
	cryptoCurrency: {
		type: String,
		enum: CryptoCurrency
	},
	transactions: [String],
	block: String
}, { timestamps: true });

UserTransactionsSchema.index({ userId: 1, cryptoCurrency: 1 }, { unique: true });
UserTransactionsSchema.index({ block: 1 });
UserTransactionsSchema.index({ createdAt: 1 });
UserTransactionsSchema.index({ updatedAt: 1 });

export default UserTransactionsSchema;
