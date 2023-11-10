/* eslint-disable no-prototype-builtins */
import { ISkipLimit } from './interface';

export class ConvertService {
	static async skipLimitToInt(params: ISkipLimit): Promise<any> {
		const prepareParams = {};

		Object.assign(prepareParams, params);
		if (params.hasOwnProperty('skip')) {
			Object.assign(prepareParams, { skip: parseInt(params.skip) });
		}

		if (params.hasOwnProperty('limit')) {
			Object.assign(prepareParams, { limit: parseInt(params.limit) });
		}

		return prepareParams;
	}

}
