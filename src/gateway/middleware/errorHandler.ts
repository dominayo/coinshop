import { NextFunction, Request, Response } from 'express';
import { COMMON_ERRORS, AUTHORIZATION_ERROR } from '../../common/errors';

export async function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): Promise<Response | void> {
	if (Object.values(COMMON_ERRORS).includes(err.message)) {
		res.status(422).json({ code: 422, error: { message: err.message } });
	}
	else if (Object.values(AUTHORIZATION_ERROR).includes(err.message)) {
		res.status(401).json({ code: 401, error: { message: err.message } });
	}
	// eslint-disable-next-line no-useless-escape
	else if (err?.message?.startsWith('\"')) {
		const error = err.message.split(' ');
		let path = error[0];

		path = path.substring(1, path.length - 1);
		const message = err.message.substring(path.length + 3);

		res.status(422).json({ code: 422, error: { path, message: path + ' ' + message }});
	}
	else {
		res.status(500).json({ code: 500, message: err.message });
	}

	next();
}
