import Joi from 'joi';
import { IAdvertList } from './interface';

export class Validator {
	public static async userList(params: IAdvertList): Promise<void> {
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
