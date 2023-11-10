import axios from 'axios';
import { IRequestParams } from './interface';

export class TransportService {
	async getRequest(params: IRequestParams): Promise<any> {
		try {
			const { url } = params;
			const response = await axios.get(url, {
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				}
			});
			// console.log(response.data.result[0].ABI)

			return response.data.result;
		} catch (e) {
			throw new Error(e);
		}
	}
}
