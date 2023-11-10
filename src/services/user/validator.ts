import { UserService } from './service';
import { ERRORS } from '../../common/errors';
import { IIsUserExists, IDocument } from './interface';
import { UserRoles } from '../../common/interface';

export class Validator {
	public static async isUserExists(params: IIsUserExists): Promise<IDocument> {
		const { userId } = params;
		const userService = new UserService();
		const doc = await userService.findById(userId);

		if (!doc) {
			throw new Error(ERRORS.USER_NOT_EXISTS);
		}

		return doc;
	}

	public static async isAdmin(userId: string): Promise<void> {
		const userService = new UserService();
		const { role } = await userService.findById(userId);

		if (role === UserRoles.Client) {
			throw new Error(ERRORS.PERMISSION_DENIED);
		}
	}
}
