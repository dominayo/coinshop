import Joi from 'joi';
import { IChatDisputeMessageList, IChatFileParams, IApproveParams } from './interface';

export class Validator {
	public static async chatDisputeMessageList(params: IChatDisputeMessageList): Promise<void> {
		const schema = Joi.object().keys({
			chatDisputeId: Joi.string().hex().length(24).required()
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.details[0].message); // TODO check error handler
		}
	}

	public static async chatDisputeFileParams(params: IChatFileParams): Promise<void> {
		const schema = Joi.object().keys({
			id: Joi.string().hex().length(24).required()
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.details[0].message); // TODO check error handler
		}
	}

	public static async approveParams(params: IApproveParams): Promise<void> {
		const schema = Joi.object().keys({
			approve: Joi.boolean().required(),
			dealId: Joi.string().hex().length(24).required()
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.details[0].message); // TODO check error handler
		}
	}
}

export default Validator;
