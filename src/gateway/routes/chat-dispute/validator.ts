import Joi from 'joi';
import ERRORS from '../../../common/errors';
import { ContentType } from '../../../services/chat/messages/interface';
import { IDisputeMessageList, ICreateParams, IContentType, IGetParams } from './interface';

export class Validator {
	public static async disputeMessageList(params: IDisputeMessageList): Promise<void> {
		const schema = Joi.object().keys({
			chatId: Joi.string().hex().length(24).required()
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.details[0].message);
		}
	}

	public static async createParams(params: ICreateParams): Promise<void> {
		const schema = Joi.object().keys({
			chatId: Joi.string().hex().length(24).required()
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.details[0].message);
		}
	}

	public static async getParams(params: IGetParams): Promise<void> {
		const schema = Joi.object().keys({
			id: Joi.string().hex().length(24).required()
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.details[0].message);
		}
	}

	public static async contentTypeParams(params: IContentType): Promise<void> {
		const schema = Joi.object().keys({
			contentType: Joi.string().valid(...Object.values(ContentType)).required()
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.details[0].message);
		}
	}

	public static async isValidSize(size: number): Promise<void> {
		if (Number(size) > Number(process.env.FILE_MAX_SIZE)) {
			throw new Error(ERRORS.FILE_INVALID_MAX_SIZE);
		}
	}
}

export default Validator;
