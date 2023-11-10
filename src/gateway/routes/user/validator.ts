import Joi from 'joi';
import { IUserCreate, IUserFindOne, IIsEmailExists, IUserUpdate, IUserUpdateRequisites, IIsNameExists, IEmailVerify,
	IEnableGoogle2fa } from './interface';
import { Direction } from '../../../common/interface';
import { ERRORS } from '../../../common/errors';
import { RULES } from '../../../common/rules';
import { User } from '../../../services/user/model';
import { UserService } from '../../../services/user/service';

export class Validator {
	public static async create(params: IUserCreate): Promise<void> {
		const schema = Joi.object().keys({
			email: Joi.string().regex(RULES.EMAIL).required().error(new Error(ERRORS.USER_EMAIL_VALIDATION_ERROR)),
			name: Joi.string().max(20).required(),
			password: Joi.string().max(40).regex(RULES.PASSWORD).required().error(new Error(ERRORS.USER_PASSWORD_RULES_VALIDATION_ERROR))
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.message);
		}
	}

	public static async update(params: IUserUpdate): Promise<void> {
		const schema = Joi.object().keys({
			name: Joi.string(),
			secondName: Joi.string()
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.message);
		}
	}

	public static async enableGoogle2faParams(params: IEnableGoogle2fa): Promise<void> {
		const schema = Joi.object().keys({
			enable: Joi.boolean().required()
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.message);
		}
	}

	public static async emailVerify(params: IEmailVerify): Promise<void> {
		const schema = Joi.object().keys({
			token: Joi.string().required()
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.message);
		}
	}

	public static async updateRequisites(params: IUserUpdateRequisites): Promise<void> {
		const schema = Joi.object().keys({
			requisites: Joi.array().items(
				Joi.object().keys({
					direction: Joi.string().valid(...Object.values(Direction)).required(),
					fiatWallet: Joi.string().required()
				})
			)});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.message);
		}
	}

	public static async signInParams(params: IUserFindOne): Promise<void> {
		const schema = Joi.object().keys({
			email: Joi.string().regex(RULES.EMAIL).required().error(new Error(ERRORS.USER_EMAIL_VALIDATION_ERROR)),
			password: Joi.string().regex(RULES.PASSWORD).required().error(new Error(ERRORS.USER_PASSWORD_RULES_VALIDATION_ERROR)),
			code: Joi.string()
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.message);
		}
	}

	public static async isEmailExists(email: string): Promise<void> {
		const exists: number = await User.countDocuments({ email }).exec();

		if (exists > 0) {
			throw new Error(ERRORS.USER_ALREADY_EXISTS);
		}
	}

	public static async isUserExists(userId: string): Promise<any> {
		const exists = await User.findById({ _id: userId }).exec();

		if (!exists) {
			throw new Error(ERRORS.USER_NOT_EXISTS);
		}

		return exists;
	}

	public static async isUserEmailExists(params: IIsEmailExists): Promise<boolean> {
		const schema = Joi.object().keys({
			email: Joi.string().regex(RULES.EMAIL).required().error(new Error(ERRORS.USER_EMAIL_VALIDATION_ERROR))
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.message);
		}

		const { email } = params;

		const userService = new UserService();
		const doc = await userService.findOne(email);

		if (doc) {
			return true;
		}

		return false;
	}

	public static async isUserNameExists(params: IIsNameExists): Promise<boolean> {
		const schema = Joi.object().keys({
			name: Joi.string().required()
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.message);
		}

		const { name } = params;

		const userService = new UserService();
		const doc = await userService.findByName(name);

		if (doc) {
			return true;
		}

		return false;
	}
}

export default Validator;
