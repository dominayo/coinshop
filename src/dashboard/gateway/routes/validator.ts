import Joi from 'joi';
import { ERRORS } from '../../../common/errors';
import { RULES } from '../../../common/rules';
import { ISignIn, IAdminCreate, IChatMessageList } from './interface';
import { User } from '../../../services/user/model';
import { UserRoles } from '../../../common/interface';

export class Validator {
	public static async signIn(params: ISignIn): Promise<void> {
		const schema = Joi.object().keys({
			email: Joi.string().regex(RULES.EMAIL).required(),
			password: Joi.string().regex(RULES.PASSWORD).required()
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.details[0].message);
		}
	}

	public static async createAdmin(params: IAdminCreate): Promise<void> {
		const schema = Joi.object().keys({
			email: Joi.string().regex(RULES.EMAIL).required(),
			name: Joi.string().required(),
			secondName: Joi.string().required(),
			password: Joi.string().regex(RULES.PASSWORD).required(),
			role: Joi.string().allow(...Object.values(UserRoles)).required()
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.details[0].message);
		}
	}

	public static async chatMessageListParams(params: IChatMessageList): Promise<void> {
		const schema = Joi.object().keys({
			chatId: Joi.string().hex().length(24).required()
		});
		const { error } = schema.validate(params);

		if (error) {
			throw new Error(error.details[0].message);
		}
	}

	public static async isUserExists(userId: string): Promise<void> {
		const exists = await User.findById({ _id: userId }).exec();

		if (!exists) {
			throw new Error(ERRORS.USER_NOT_EXISTS);
		}
	}

	public static async isUserNotExists(userId: string): Promise<void> {
		const exists = await User.findById({ _id: userId }).exec();

		if (exists) {
			throw new Error(ERRORS.USER_ALREADY_EXISTS);
		}
	}

	public static async isAdmin(userId: string): Promise<void> {
		const { role } = await User.findById({ _id: userId }).exec();

		if (role === UserRoles.Client) {
			throw new Error(ERRORS.PERMISSION_DENIED);
		}
	}

	public static async isSuperAdmin(userId: string): Promise<void> {
		const { role } = await User.findById({ _id: userId }).exec();

		if (role !== UserRoles.Admin) {
			throw new Error(ERRORS.PERMISSION_DENIED);
		}
	}
}

export default Validator;
