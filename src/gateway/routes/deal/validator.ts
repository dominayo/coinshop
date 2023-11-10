import Joi from 'joi';
import { IDealCreate, IDealList, IDealDelete, IDealConfirm, IDealMoneySent, IDealMoneyRecieved, IDealFind,
	IDealMoneyNotRecieved, IRequisites, IIsMaxLimitLessThenAmount, IIsMinLimitBiggerThenAmount, IIsOwner,
	IIsCommentsExists, IsStatusFitComments, ICryptoCurrencyRecieved } from './interface';
import { Status } from '../../../services/deal/interface';
import { ExchangeType } from '../../../common/interface';
import { ERRORS } from '../../../common/errors';

export class Validator {
	public static async create(params: IDealCreate): Promise<void> {
		const schema = Joi.object().keys({
			advertId: Joi.string().hex().length(24).required(),
			amount: Joi.number().positive().required(),
			comments: Joi.string().disallow('')
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.details[0].message);
		}
	}

	public static async find(params: IDealFind): Promise<void> {
		const schema = Joi.object().keys({
			id: Joi.string().hex().length(24).required()
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.details[0].message);
		}
	}

	public static async confirm(params: IDealConfirm): Promise<void> {
		const schema = Joi.object().keys({
			id: Joi.string().hex().length(24).required()
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.details[0].message);
		}
	}

	public static async moneyNotReceived(params: IDealMoneyNotRecieved): Promise<void> {
		const schema = Joi.object().keys({
			id: Joi.string().hex().length(24).required()
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.details[0].message);
		}
	}

	public static async moneySent(params: IDealMoneySent): Promise<void> {
		const schema = Joi.object().keys({
			id: Joi.string().hex().length(24).required()
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.details[0].message);
		}
	}

	public static async moneyRecieved(params: IDealMoneyRecieved): Promise<void> {
		const schema = Joi.object().keys({
			id: Joi.string().hex().length(24).required()
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.details[0].message);
		}
	}

	public static async cryptoCurrencyRecieved(params: ICryptoCurrencyRecieved): Promise<void> {
		const schema = Joi.object().keys({
			id: Joi.string().hex().length(24).required()
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.details[0].message);
		}
	}

	public static async listParams(params: IDealList): Promise<void> {
		const schema = Joi.object().keys({
			type: Joi.string().valid(...Object.values(ExchangeType)),
			status: Joi.string().valid(...Object.values(Status)),
			skip: Joi.string().allow(0),
			limit: Joi.string().allow(0)
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.details[0].message);
		}
	}

	public static async delete(params: IDealDelete): Promise<void> {
		const schema = Joi.object().keys({
			id: Joi.string().hex().length(24).required()
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.details[0].message);
		}
	}

	public static async requisites(params: IRequisites): Promise<void> {
		const schema = Joi.object().keys({
			id: Joi.string().hex().length(24).required()
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.details[0].message);
		}
	}

	public static async isAmountLessThenMaxLimit(params: IIsMaxLimitLessThenAmount): Promise<void> {
		const { maxLimit, amount } = params;

		if (amount > maxLimit) {
			throw new Error(ERRORS.DEAL_CAN_NOT_SET_AMOUNT_BIGGER_THEN_MAX_LIMIT);
		}
	}

	public static async isMinLimitBiggerThenAmount(params: IIsMinLimitBiggerThenAmount): Promise<void> {
		const { minLimit, amount } = params;

		if (amount < minLimit) {
			throw new Error(ERRORS.DEAL_CAN_NOT_SET_AMOUNT_LESS_THEN_MIN_LIMIT);
		}
	}

	public static async isOwner(params: IIsOwner): Promise<boolean> {
		const { userId, owner } = params;

		if (userId === owner) {
			return true;
		}

		return false;
	}

	public static async isCommentsExists(params: IIsCommentsExists): Promise<void> {
		if (!params?.comments) {
			throw new Error(ERRORS.COMMENTS_ARE_REQUIRED);
		}
	}

	public static async isStatusFitComments(params: IsStatusFitComments): Promise<boolean> {
		const { status } = params;

		if (status === Status.Confirmed || status === Status.MoneySent || status ===Status.DisputeOpened) {
			return true;
		}

		return false;
	}
}
