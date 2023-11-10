import { NextFunction, Request, Response } from 'express';
import { ERRORS } from '../../../../common/errors';
import { Validator } from '../validator';
import { TokenService } from '../../../../utils/token';
import { Authorization } from '../../middleware/auth';
import { ChatDisputeService } from '../../../../services/chat-dispute/service';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const authorization = new Authorization();
		const token = await authorization.getToken(req);

		if (!token) {
			throw new Error(ERRORS.AUTHORIZATION_IS_REQUIRED);
		}

		const { userId: adminId } = await authorization.decodeToken(token);

		await Validator.isUserExists(adminId);
		await Validator.isAdmin(adminId);

		const chatDisputeService = new ChatDisputeService();
		const chatIds = await (await chatDisputeService.list())
			.map((chat) => {
				return chat.id;
			});

		const tokenService = new TokenService();
		const jwt = await tokenService.create({ userId: adminId });

		res.cookie('authorization', `Bearer ${jwt}`, {
			sameSite: 'strict'
		});
		res.status(201).json({ status: 201, message: chatIds });
	} catch (e) {
		next(e);
	}
};

export default route;
