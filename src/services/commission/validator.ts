import { CommissionService } from './service';
import { ERRORS } from '../../common/errors';
import { IIsExists } from './interface';

export class Validator {
	public static async isNotExists(params: IIsExists): Promise<void> {
		const commissionService = new CommissionService();
		const doc = await commissionService.findOne(params);

		if (doc) {
			throw new Error(ERRORS.COMMISSION_ALREADY_EXISTS);
		}
	}
}

export default Validator;
