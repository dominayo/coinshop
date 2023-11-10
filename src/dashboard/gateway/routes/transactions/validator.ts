import Joi from 'joi';
import { ITransactionList, ITransactionVerdict } from './interface';

export class Validator {
	public static async transactionList(params: ITransactionList): Promise<void> {
		const schema = Joi.object().keys({
			skip: Joi.string().min(0),
			limit: Joi.string().min(0)
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.message);
		}
	}

	public static async transactionVerdictParams(params: ITransactionVerdict): Promise<void> {
		const schema = Joi.object().keys({
			transactionId: Joi.string().hex().length(24).required(),
			verdict: Joi.boolean().required()
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.message);
		}
	}
}

export default Validator;
