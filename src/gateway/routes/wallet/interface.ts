export interface IDeposit {
	id: string;
	amount: number;
}

export interface IWithdraw {
	id: string;
	amount: number;
	to: string;
	isTron?: boolean;
}

