import Joi from 'joi';
import { IFindUserList } from './interface';
import { CryptoCurrency } from '../../../common/interface';
import { TransactionType, Status } from '../../../services/inner-crypto-transaction/interface';

export class Validator {
	public static async findUserList(params: IFindUserList): Promise<void> {
		const schema = Joi.object().keys({
			skip: Joi.string(),
			limit: Joi.string(),
			transactionType: Joi.string().valid(...Object.values(TransactionType)),
			cryptoCurrency: Joi.string().valid(...Object.values(CryptoCurrency)),
			status: Joi.string().valid(...Object.values(Status))
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.details[0].message);
		}
	}
}
