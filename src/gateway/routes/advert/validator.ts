import Joi from 'joi';
import {
	IAdvertCreate, IAdvertUpdate, IAdvertList, IAdvertDelete, IAdvertGet, IIsMaxBiggerThenMinLimit, IIsExists
	, IIsOwner, IIsDealOpen, IDiactivate, IUserListParams, IIsStatusNotMatch, IActivate, IIsDeactivated } from './interface';
import { ERRORS } from '../../../common/errors';
import { UserAdvertService } from '../../../services/user-advert/service';
import { IDocument as IUserAdvertDoc } from '../../../services/user-advert/interface';
import { ExchangeType, Direction, CryptoCurrency } from '../../../common/interface';
import { IDocument as IDealDocument } from '../../../services/deal/interface';
import { DealService } from '../../../services/deal/service';
import { AdvertService } from '../../../services/advert/service';
import { Error } from 'mongoose';

export class Validator {

	public static async create(params: IAdvertCreate): Promise<void> {
		const minCryptoCurrencyValue = 0.00000001 as const;

		const schema = Joi.object().keys({
			type: Joi.string().valid(...Object.values(ExchangeType)).required(),
			cryptoCurrency: Joi.string().valid(...Object.values(CryptoCurrency)).required(),
			direction: Joi.string().valid(...Object.values(Direction)).required(),
			isFixedRate: Joi.boolean().required(),
			exchangeRate: Joi.any().when('isFixedRate', {
				is: true,
				then: Joi.number().positive().precision(2).required(),
				otherwise: Joi.allow('')
			}),
			spread: Joi.number().min(0).max(100).allow('').when('isFixedRate', {
				is: false,
				then: Joi.disallow('').required()
			}),
			minLimit: Joi.number().positive().min(minCryptoCurrencyValue).required(),
			maxLimit: Joi.number().positive().min(minCryptoCurrencyValue).required(),
			comments: Joi.string().when('type', {
				is: ExchangeType.Sell,
				then: Joi.string().required(),
				otherwise: Joi.forbidden()
			})
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.details[0].message);
		}
	}

	public static async update(params: IAdvertUpdate): Promise<void> {
		const minCryptoCurrencyValue = 0.00000001 as const;

		const schema = Joi.object().keys({
			id: Joi.string().hex().length(24).required(),
			isFixedRate: Joi.boolean().required(),
			exchangeRate: Joi.any().when('isFixedRate', {
				is: true,
				then: Joi.number().positive().required(),
				otherwise: Joi.allow('')
			}),
			spread: Joi.number().min(0).max(100).allow('').when('isFixedRate', {
				is: false,
				then: Joi.disallow('').required()
			}),
			minLimit: Joi.number().positive().min(minCryptoCurrencyValue),
			maxLimit: Joi.number().positive().min(minCryptoCurrencyValue),
			comments: Joi.string().allow('')
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.details[0].message);
		}
	}

	public static async deactivate(params: IDiactivate): Promise<void> {
		const schema = Joi.object().keys({
			id: Joi.string().hex().length(24).required()
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.details[0].message);
		}
	}

	public static async vivaActivia(params: IActivate): Promise<void> {
		const schema = Joi.object().keys({
			id: Joi.string().hex().length(24).required()
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.details[0].message);
		}
	}

	public static async delete(params: IAdvertDelete): Promise<void> {
		const schema = Joi.object().keys({
			id: Joi.string().hex().length(24).required()
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.details[0].message);
		}
	}

	public static async list(params: IAdvertList): Promise<IAdvertList> {
		const schema = Joi.object().keys({
			type: Joi.string().valid(...Object.values(ExchangeType)),
			cryptoCurrency: Joi.string().valid(...Object.values(CryptoCurrency)),
			direction: Joi.string().valid(...Object.values(Direction)),
			isFixedRate: Joi.boolean(),
			skip: Joi.number().integer().min(0),
			limit: Joi.number().integer().min(1)
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.details[0].message);
		}

		return params;
	}

	public static async userListParams(params: IUserListParams): Promise<IUserListParams> {
		const schema = Joi.object().keys({
			type: Joi.string().valid(...Object.values(ExchangeType)),
			cryptoCurrency: Joi.string().valid(...Object.values(CryptoCurrency)),
			direction: Joi.string().valid(...Object.values(Direction)),
			isFixedRate: Joi.boolean(),
			skip: Joi.number().integer().min(0),
			limit: Joi.number().integer().min(1)
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.details[0].message);
		}

		return params;
	}

	public static async get(params: IAdvertGet): Promise<void> {
		const schema = Joi.object().keys({
			id: Joi.string().hex().length(24).required()
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.details[0].message);
		}
	}

	public static async isExists(params: IIsExists): Promise<void> {
		const { id } = params;
		const advertService = new AdvertService();
		const doc = await advertService.findById({ id });

		if (!doc) {
			throw new Error(ERRORS.ADVERT_NOT_FOUND);
		}
	}

	public static async isOwner(params: IIsOwner): Promise<IUserAdvertDoc> {
		const { userId, advertId } = params;
		const userAdvertService = new UserAdvertService();
		const userAdvertDoc = await userAdvertService.find({ advertId });

		if (!userAdvertDoc) {
			throw new Error(ERRORS.ADVERT_NOT_FOUND);
		}

		if (userAdvertDoc.userId !== userId) {
			throw new Error(ERRORS.ADVERT_NOT_OWNER);
		}

		return userAdvertDoc as IUserAdvertDoc;
	}

	public static async isDealOpen(params: IIsDealOpen): Promise<IDealDocument[]> {
		const dealService = new DealService();
		const docs = await dealService.findOpenedByAdvertId(params);

		if (docs.length > 0) {
			throw new Error(ERRORS.ADVERT_CAN_NOT_BE_UPDATED_DUE_DEAL_IS_OPEN);
		}

		return docs as IDealDocument[];
	}

	public static async isMaxLimitBiggerThenMinLimit(params: IIsMaxBiggerThenMinLimit): Promise<void> {
		const { minLimit, maxLimit } = params;

		if (Number(minLimit) > Number(maxLimit)) {
			throw new Error(ERRORS.ADVERT_MIN_LIMIT_CAN_NOT_BE_BIGGER_THEN_MAX_LIMIT);
		}
	}

	public static async isStatusNotMatch(params: IIsStatusNotMatch): Promise<void> {
		const { id } = params;
		const advertService = new AdvertService();
		const { isActive } = await advertService.findById({ id });

		if (isActive === false) {
			throw new Error(ERRORS.ADVERT_CAN_NOT_BE_DEACTIVATED_WHILE_IT_IS_NOT_ACTIVE);
		}
	}

	public static async isDeactivated(params: IIsDeactivated): Promise<void> {
		const { id } = params;
		const advertService = new AdvertService();
		const { isActive } = await advertService.findById({ id });

		if (isActive === true) {
			throw new Error(ERRORS.ADVERT_CAN_NOT_BE_DEACTIVATED_WHILE_IT_IS_NOT_ACTIVE);
		}
	}
}
