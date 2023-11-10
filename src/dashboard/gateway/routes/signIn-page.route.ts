import { NextFunction, Request, Response } from 'express';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		res.sendFile('signIn.html',  { root: './views/' });
	} catch (e) {
		next(e);
	}
};

export default route;
