/* eslint-disable camelcase */
export interface IGetEthWalletBalace {
	wallet: string;
}

export interface IEthNewBlock {
	block: string;
}

export interface IEthGetBlockByHash {
	block: string;
}

export interface IGetEthTransactionDetails {
	transactionHash: string;
}

export interface IInfuraRequest {
	method: string;
	params: any;
}

export interface IBlockChairRequest {
	url: string;
	wallets: string[];
}

export interface ISendEthTransaction {
	to: string;
	value: number;
}

export interface ISendUsdtTransaction {
	to: string;
	value: number;
}

export interface ISendBtcTransaction {
	to: string;
	value: number;
}

export interface ICreateBtcTestTransaction {
	to: string;
	value: number;
	fee?: number;
}

export interface ISendTestBtcTransaction {
	tHex: string;
}

export interface IGetBtcWalletBalance {
	wallet: string;
}

export interface IGetBtcTestWallet {
	wallet: string;
}

export interface ICalculateByteSize {
	tHex: string;
}

export interface IIncomingTransactions {
	block_id: number;
	transaction_hash: string;
	index: number;
	value: number;
}

export interface ICalculateNumberOfNeededBtcTransactions {
	incomingTransactions: [
		IIncomingTransactions
	]
	toWidthraw: number;
	fee?: number;
}

export interface ICreateUsdtTransactionFromTron {
	to: string;
	value: number;
}

export interface ISendUsdtTransactionFromTron {
	to: string;
	value: number;
}
