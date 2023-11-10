import fs, { ReadStream, WriteStream} from 'fs';
import Validator from './validator';
import { ERRORS } from '../common/errors';
import { IReadFile } from './interface';

export class FileManager {
	async createFile(name: string, path: string, text: string): Promise<void> {
		try {
			await Validator.isFileExists({ path });
			fs.writeFileSync(path, text);
		} catch(e) {
			throw new Error(ERRORS.FILE_ALREADY_EXISTS);
		}
	}

	async createReadWriteStream(path: string, outPath: string): Promise<void> {
		try {
			const readStream: ReadStream = fs.createReadStream(path);
			const uploadStream: WriteStream = fs.createWriteStream(outPath);

			readStream
				.pipe(uploadStream);
		} catch (e) {
			throw new Error(ERRORS.FILE_NOT_SAVED);
		}

	}

	async createDir(path: string): Promise<void> {
		if (!fs.existsSync(path)){
			fs.mkdirSync(path);
		}
	}

	async createDirMany(paths: string[]): Promise<void> {
		for (const path of paths) {
			if (!fs.existsSync(path)){
				fs.mkdirSync(path);
			}
		}
	}

	async createABIFile(path: string, text: string): Promise<void> {
		try {
			fs.writeFileSync(path, text);
		} catch(e) {
			throw new Error(e);
		}
	}

	async readFile(params: IReadFile): Promise<string> {
		try {
			const { fileName } = params;
			const fileData = fs.readFileSync(`${__dirname}/../../${fileName}`, 'utf8');

			return fileData;
		} catch (e) {
			throw new Error(e);
		}
	}

	async readFileUniversal(params: IReadFile): Promise<string> {
		try {
			const { fileName } = params;
			const fileData = fs.readFileSync(fileName, 'utf-8');

			return fileData;
		} catch (e) {
			throw new Error(e);
		}
	}

}

