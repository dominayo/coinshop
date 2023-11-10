import { CryptoCurrency } from '../../../../common/interface';

export interface ICommissionUpdate {
	cryptoCurrency: CryptoCurrency;
	commission: number;
}
