import { CryptoCurrency } from '../../../common/interface';
import { TransactionType, Status } from '../../../services/inner-crypto-transaction/interface';

export interface IFindUserList {
	skip?: string;
	limit?: string;
	transactionType?: TransactionType;
	cryptoCurrency?: CryptoCurrency;
	status?: Status;
}

