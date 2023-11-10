import { Schema } from 'mongoose';
import { CryptoCurrency } from '../../common/interface';

export const CommissionSchema : Schema = new Schema({
	cryptoCurrency: {
		type: String,
		enum: Object.values(CryptoCurrency),
		index: true,
		unique: true
	},
	commission: Number
}, { timestamps: true });

CommissionSchema.index({ cryptoCurrency: 1 }, { unique: true });
CommissionSchema.index({ createdAt: 1 });
CommissionSchema.index({ updatedAt: 1 });

export default CommissionSchema;
