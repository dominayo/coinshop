import bcrypt from 'bcrypt';
import { ERRORS } from '../common/errors';

const SALT_ROUNDS = 12;

export class Crypto {
	async createHash(password: string): Promise<string> {
		return bcrypt.hash(password, SALT_ROUNDS);
	}

	async verifyHash(password: string, passwordHash: string): Promise<void> {
		const isVerified = await bcrypt.compare(password, passwordHash);

		if (!isVerified) {
			throw new Error(ERRORS.EMAIL_OR_PASSWORD_DOES_NOT_MATCH);
		}
	}
}

