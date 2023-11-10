import Joi from 'joi';
import dotenv from 'dotenv';
import fs from 'fs';
import { ITokenParams } from './interface';
import { ERRORS } from '../common/errors';
// import { CryptoCurrencyBlockService } from '../services/user-transactions/service';

dotenv.config();

export class Validator {
	public static async tokenParams(params: ITokenParams): Promise<void> {
		const schema = Joi.object().keys({
			token: Joi.string().hex().length(24).required()
		});
		const { error } = schema.validate(params);

		if (error) {
			return null;
		}
	}

	public static async isFileExists(params: { path: string }): Promise<void> {
		const { path } = params;

		if (fs.existsSync(path)) {
			throw new Error(ERRORS.FILE_ALREADY_EXISTS);
		}
	}

	// public static async isBlockExists(params: { cryptoCurrency: CryptoCurrency }): Promise<boolean> {
	// 	const cryptoCurrencyBlockService = new CryptoCurrencyBlockService();
	// 	const doc = await cryptoCurrencyBlockService.findCurrentBlock(params);

	// 	if (!doc) {
	// 		return false;
	// 	}

	// 	return true;
	// }
}

export default Validator;
