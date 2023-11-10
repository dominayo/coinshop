import { AxiosResponse } from 'axios';

export class Validator {
	static async isValidResponse(response: AxiosResponse): Promise<boolean> {
		if (response?.data?.error || response?.data?.result?.length === 0) {
			return false;
		}

		return true;
	}
}
