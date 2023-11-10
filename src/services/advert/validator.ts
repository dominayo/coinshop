import { ERRORS } from '../../common/errors';
import { IIsExists, IIsNotOwner, IIsMaxLimitEqualZero, IIsActive, IDocument } from './interface';
import { AdvertService } from './service';

export class Validator {
	public static async isExists(params: IIsExists): Promise<IDocument> {
		const advertService = new AdvertService();
		const doc = await advertService.findById(params);

		if (!doc) {
			throw new Error(ERRORS.ADVERT_NOT_FOUND);
		}

		return doc as IDocument;
	}

	public static async isNotOwner(params: IIsNotOwner): Promise<void> {
		const advertService = new AdvertService();
		const { advertId, userId } = params;
		const doc = await advertService.findById({ id: advertId });

		if (doc?.owner === userId) {
			throw new Error(ERRORS.ADVERT_OWNER_CANNOT_CREATE_DEAL);
		}
	}

	public static async isMaxLimitEqualZero(params: IIsMaxLimitEqualZero): Promise<void> {
		const { id, maxLimit } = params;
		const advertService = new AdvertService();

		if (Number(maxLimit) === 0) {
			await advertService.update({ id, isActive: false });
		}
	}

	public static async isActive(params: IIsActive): Promise<IDocument> {
		const { id } = params;
		const advertService = new AdvertService();
		const advertDoc = await advertService.findById({ id });

		if (advertDoc.isActive === false) {
			throw new Error(ERRORS.ADVERT_NOT_ACTIVE);
		}

		return advertDoc;
	}
}
