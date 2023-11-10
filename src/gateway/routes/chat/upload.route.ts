import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { Fields, Files, IncomingForm } from 'formidable';
import { Authorization } from '../../middleware/auth';
import UserValidator from '../user/validator';
import DealValidator from '../../../services/deal/validator';
import ChatValidator from '../../../services/chat/validator';
import { ERRORS } from '../../../common/errors';
import { FileManager } from '../../../utils/file-manager';
import { ChatService } from '../../../services/chat/service';
import { ChatMessageService } from '../../../services/chat/messages/service';
import { ICreateParams } from './interface';
import { MessageType } from '../../../services/chat/messages/interface';
import { Validator } from './validator';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as ICreateParams;
		const authorization = new Authorization();
		const token = await authorization.getToken(req);

		if (!token) {
			throw new Error(ERRORS.AUTHORIZATION_IS_REQUIRED);
		}

		const payload = await authorization.decodeToken(token);
		const { userId } = payload;

		await UserValidator.isUserExists(userId);
		await Validator.createParams(params);

		const { chatId } = params;

		await ChatValidator.isExists({ id: chatId });
		await ChatValidator.isChatParticipant({ id: chatId, userId });

		const chatService = new ChatService();
		const { dealId } = await chatService.findById({ id: chatId });

		await DealValidator.isExists({ id: dealId });

		const form = new IncomingForm();

		form.parse(req, async (err, fields: Fields, files: Files) => {
			try {
				if (!files?.File) {
					res.status(422).json({ code: 422, message: 'No incoming data' });
				}

				const { File: { name, path, type: contentType, size } } = files;

				await Validator.contentTypeParams({ contentType });
				await Validator.isValidSize(size);

				const dirPaths = [
					`${process.env.DEAL_FILE_PATH}/deals`,
					`${process.env.DEAL_FILE_PATH}/deals/${dealId}`,
					`${process.env.DEAL_FILE_PATH}/deals/${dealId}/chats`,
					`${process.env.DEAL_FILE_PATH}/deals/${dealId}/chats/${chatId}`
				];

				const innerPath = `${process.env.DEAL_FILE_PATH}/deals/${dealId}/chats/${chatId}/${name}`;
				const fileManager = new FileManager();

				await fileManager.createDirMany(dirPaths);
				await fileManager.createReadWriteStream(path, innerPath);

				// const chatMessageService = new ChatMessageService();

				// const chatMessageDoc = await chatMessageService.create(
				// 	{ chatId, userId, message: name, messageType: MessageType.File, contentType });

				// const dto = _.pick(chatMessageDoc,
				// 	['id', 'dealId', 'chatId', 'message', 'messageType', 'contentType', 'createdAt', 'updatedAt']);

				res.status(201).json({ code: 201, message: { created: true } });
			} catch (e) {
				next(e);
			}
		});
	}	catch (e) {
		next(e);
	}
};

export default route;
