import { NextFunction, Response } from 'express';
import { Request } from 'express-fileupload';
import { ERRORS } from '../../../../common/errors';
import { TokenService } from '../../../../utils/token';
import { Authorization } from '../../middleware/auth';
import { Validator } from '../validator';
import { FileManager } from '../../../../utils/file-manager';
import { CryptoWalletService } from '../../../../services/crypto-wallets/service';
import dotenv from 'dotenv';

dotenv.config();

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = req.files.file;
		// const name = req.files.name;
		const type = req.body.type;

		const authorization = new Authorization();
		const token = await authorization.getToken(req);

		if (!token) {
			throw new Error(ERRORS.AUTHORIZATION_IS_REQUIRED);
		}

		const { userId: adminId } = await authorization.decodeToken(token);

		await Validator.isUserExists(adminId);
		await Validator.isSuperAdmin(adminId);

		const buffer = new Buffer(params.data);
		const text = buffer.toString('utf-8');

		const path = `${process.env.HIDDEN_FILES_PATH}/${type}/${params.name}`;

		const fileManager = new FileManager();

		await fileManager.createDir(`${process.env.HIDDEN_FILES_PATH}/${type}/`);
		await fileManager.createFile(params.name, path, text);

		const cryptoWalletService = new CryptoWalletService();
		const parsedWallets = await cryptoWalletService.parseWallets({ text, cryptoCurrency: type });
		const docs = await cryptoWalletService.createMany(parsedWallets);

		const tokenService = new TokenService();
		const jwt = await tokenService.create({ userId: adminId });

		res.cookie('authorization', `Bearer ${jwt}`, {
			sameSite: 'strict'
		});
		res.status(201).json({ status: 201, message: docs });
	} catch (e) {
		next(e);
	}
};

export default route;
