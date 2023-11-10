import Joi from 'joi';
import { ICommissionUpdate } from './interface';
import { CryptoCurrency } from '../../../../common/interface';

export class Validator {
	public static async update(params: ICommissionUpdate): Promise<void> {
		const schema = Joi.object().keys({
			cryptoCurrency: Joi.string().allow(...Object.values(CryptoCurrency)).required(),
			commission: Joi.number().min(0).max(1).required()
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.details[0].message);
		}
	}
}

export default Validator;
