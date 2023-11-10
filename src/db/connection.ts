import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { logger } from '../utils/logger';

dotenv.config();

export default class DataBase {
	async connect(): Promise<void> {
		const URI = process.env.MONGO_URI;

		return await mongoose.connect(
			URI,
			{
				useNewUrlParser: true,
				autoIndex: true,
				useCreateIndex: true,
				useUnifiedTopology: true,
				useFindAndModify: false
			})
			.then(() => {
				logger.info('Сonnected to DB');
			})
			.catch((error) => {
				logger.error(error);
			});
	}
}
