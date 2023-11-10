import Joi from 'joi';
import { IUpdateParams } from './interface';

export class Validator {
	public static async updateParams(params: IUpdateParams): Promise<void> {
		const schema = Joi.object().keys({
			chatId: Joi.string().hex().length(24).required()
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.details[0].message);
		}
	}
}

export default Validator;
