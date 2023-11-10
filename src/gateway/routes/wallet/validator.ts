import Joi from 'joi';
import { IDeposit, IWithdraw } from './interface';

export class Validator {
	public static async deposit(params: IDeposit): Promise<void> {
		const schema = Joi.object().keys({
			id: Joi.string().hex().length(24).required(),
			amount: Joi.number().positive().required()
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.details[0].message);
		}
	}

	public static async widthraw(params: IWithdraw): Promise<void> {
		const schema = Joi.object().keys({
			id: Joi.string().hex().length(24).required(),
			amount: Joi.number().positive().required(),
			to: Joi.string().required(),
			isTron: Joi.boolean()
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.details[0].message);
		}
	}
}
