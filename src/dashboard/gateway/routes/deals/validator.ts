import Joi from 'joi';
import { IDealList } from './interface';

export class Validator {
	public static async dealList(params: IDealList): Promise<void> {
		const schema = Joi.object().keys({
			skip: Joi.string().min(0),
			limit: Joi.string().min(0)
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.message);
		}
	}
}

export default Validator;
