/* eslint-disable camelcase */
/* eslint-disable no-console */
import axios, { AxiosResponse } from 'axios';
import Web3 from 'web3';
import dotenv from 'dotenv';
// import HDWalletProvider from '@truffle/hdwallet-provider';
import { hdkey } from 'ethereumjs-wallet';
import { mnemonicToSeed, generateMnemonic } from 'bip39';
import { CryptoCurrency } from '../../common/interface';
import { IEthGetBlockByHash, IGetEthTransactionDetails, IInfuraRequest, IBlockChairRequest, IGetBtcTestWallet,
	ISendEthTransaction, ISendUsdtTransaction, ISendBtcTransaction, ISendTestBtcTransaction, IGetBtcWalletBalance,
	ICreateBtcTestTransaction, ICalculateByteSize, ICalculateNumberOfNeededBtcTransactions, IIncomingTransactions,
	ICreateUsdtTransactionFromTron, ISendUsdtTransactionFromTron } from './interface';
import InputDataDecoder from 'ethereum-input-data-decoder';
import { EthBlockFilterService } from '../../services/eth-block-filter/service';
import { WalletService } from '../../services/wallet/service';
import { CryptoTransactionService } from '../../services/inner-crypto-transaction/service';
import { Validator } from './validator';
import { FileManager } from '../../utils/file-manager';
import * as bitcoin from 'bitcoinjs-lib';
import TronWeb from 'tronweb';
import { generateAccount } from 'tron-create-address';
import { logger } from '../../utils/logger';
import fs from 'fs';

dotenv.config();

export class RPCTransportService {
	private infuraURL = process.env.ETH_RPC_CREDENTIALS;
	public WEI_IN_ETHEREUM = Number(process.env.WEI_IN_ETHEREUM);
	private ETH_ABI_FILE_COLACTION = `${__dirname}/../../../src/common/json/${'usdt-abi.json'}`
	private USDT_ABI_DECODER = new InputDataDecoder(this.ETH_ABI_FILE_COLACTION);
	private TRANSFER_INPUT = '0xa9059cbb';
	private readonly USDT_CONTRACT_ADDRESS = '0xdac17f958d2ee523a2206206994597c13d831ec7'
	private readonly FIRST_SKIP_LENGTH = 24;
	private readonly CRYPTO_WALLET_LENGTH = 40;
	private readonly SATOSHI_INO_BTC = 100000000;

	async sendEthTransaction(params: ISendEthTransaction): Promise<any> {
		try {
			const { to, value } = params;

			console.log('widthraw transaction');

			const fileManager = new FileManager();
			const fileData = await fileManager.readFileUniversal({ fileName: `${process.env.COLD_WALLETS_PATH}/ETH/eth.txt` });
			const addressFrom = `${fileData.split('\n')[0]}`;
			const privateKey = `${fileData.split('\n')[1]}`;

			console.log('addressFrom ', addressFrom);

			// const mnemonic = await generateMnemonic();
			// const mnemonic = 'strike boil impact industry private cheap dignity develop advice that film vendor';

			// const provider = new HDWalletProvider(
			// 	mnemonic,
			// 	'HTTP://127.0.0.1:7545'
			// );

			// const web3 = new Web3(provider);
			const web3 = new Web3();

			// https://mainnet.infura.io/v3/

			web3.eth.setProvider(process.env.INFURA_TESTNET_ADDRESS);

			const gasPrice =  await web3.eth.getGasPrice();
			const estimateGas =  await web3.eth.estimateGas({ gas: gasPrice });

			console.log('gasPrice ', gasPrice);
			console.log('estimateGas ', estimateGas);

			const createTransaction = await web3.eth.accounts.signTransaction(
				{
					from: addressFrom,
					to,
					value: web3.utils.toWei(`${value}`, 'ether'),
					gas: estimateGas
				},
				privateKey
			);

			console.log('createTransaction ', createTransaction);

			const createReceipt = await web3.eth.sendSignedTransaction(
				createTransaction.rawTransaction
			);

			console.log(`Transaction successful: ${JSON.stringify(createReceipt)}`);

			return createReceipt.transactionHash;
		} catch (e) {
			console.error(e);
			throw new Error(e);
		}
	}

	async sendUsdtTransaction(params: ISendUsdtTransaction): Promise<any> {
		const { to, value } = params;

		console.log(params);
		const fileManager = new FileManager();
		const abiContract = await fileManager.readFileUniversal({ fileName: this.ETH_ABI_FILE_COLACTION });
		// Use BigNumber

		const web3 = new Web3();

		web3.eth.setProvider(process.env.INFURA_TESTNET_ADDRESS); // TODO

		const fileData = await fileManager.readFileUniversal({ fileName: `${process.env.COLD_WALLETS_PATH}/ETH/eth.txt` });
		const addressFrom = `${fileData.split('\n')[0]}`;
		const privateKey = `${fileData.split('\n')[1]}`;

		// const web3 = new Web3(provider);
		// const count = await web3.eth.getTransactionCount(addressFrom);
		const abiArray = JSON.parse(abiContract);

		const contract = new web3.eth.Contract(abiArray, this.USDT_CONTRACT_ADDRESS, { from: addressFrom });

		const gasPrice =  await web3.eth.getGasPrice();
		const estimateGas =  await web3.eth.estimateGas({ gas: gasPrice });

		const amount = (value * 1000000).toFixed(0);

		const rawTransaction = {
			'gasLimit': web3.utils.toHex(58000),
			'from': addressFrom,
			'gasPrice': gasPrice,
			'to': this.USDT_CONTRACT_ADDRESS,
			'value': '0x0',
			'data': contract.methods.transfer(to, amount).encodeABI(),
			'chainId': 0x03,
			'gas': web3.utils.toHex(estimateGas)
		};

		console.log(rawTransaction);

		const createTransaction = await web3.eth.accounts.signTransaction(
			rawTransaction,
			privateKey
		);

		console.log('transaction: ', createTransaction);

		try {
			const createReceipt = await web3.eth.sendSignedTransaction(
				createTransaction.rawTransaction
			);

			console.log(`Transaction successful: ${JSON.stringify(createReceipt)}`);

			return createReceipt.transactionHash;
		} catch (e) {
			throw new Error(e);
		}
	}

	async transactionBuilder(params: ISendBtcTransaction): Promise<any> {
		const transactionFeeCoefficient = 3;

		const valueInSatoshi = Number(this.SATOSHI_INO_BTC) * params.value;

		Object.assign(params, { value: valueInSatoshi });

		const estimateFeeTransactionHex = await this.createBtcTestTransaction(params);

		const byteSize: number = await this.calculateByteSize({ tHex: estimateFeeTransactionHex });

		// const transactionHex = await this.createBtcTestTransaction({ ...params, fee: byteSize * transactionFeeCoefficient });
		const transactionHex = await this.createBtcTestTransaction({ ...params, fee: byteSize * transactionFeeCoefficient });

		const transaction = await this.sendTestnetBtcTransaction({ tHex: transactionHex });

		return transaction.data.data.transaction_hash;
	}

	async calculateByteSize(params: ICalculateByteSize): Promise<number> {
		const { tHex } = params;
		const byteSize = Buffer.byteLength(tHex, 'utf8');

		return byteSize;
	}

	async createBtcTestTransaction(params: ICreateBtcTestTransaction): Promise<any> {
		const fileManager = new FileManager();
		const data = await fileManager.readFileUniversal({ fileName: `${process.env.COLD_WALLETS_PATH}BTC/btc.txt` });
		const splitedData = data.split('\n');
		const TESTNET = bitcoin.networks[process.env.BITCOIN_PROVIDER];
		const address = splitedData[0];
		const { to, value, fee = 500 } = params;
		const transactionBuilder = new bitcoin.TransactionBuilder(TESTNET);
		const addressData = await this.getBtcTestWallet({ wallet: address });

		console.log('uxto ', addressData.data[address].utxo);

		// console.log('latestTx', transactions[0].outputs[0].value_int);
		// console.log('latest tx', latestTx);
		// console.log('fee', fee);

		// const balance = await this.getBtcTestWalletBalance({ wallet: address });
		// const balance = transactions[1].outputs[0].value_int - (Number(0.00001357) * Number(this.SATOSHI_INO_BTC)) ;

		// console.log('transactions[1]', transactions[1]);

		const toWithdrawWithFee = Number((Number(value) + Number(fee)).toFixed(8));

		const neededTransactions = await this.calculateNumberOfNeededBtcTransactions(
			{ incomingTransactions: addressData.data[address].utxo, toWidthraw: toWithdrawWithFee });

		let totalTransactionAmount = 0;

		for (const neededTransaction of neededTransactions) {
			totalTransactionAmount = Number(totalTransactionAmount) + Number(neededTransaction.value);
			transactionBuilder.addInput(neededTransaction.transaction_hash, neededTransaction.index);
		}

		transactionBuilder.addOutput(to, value);

		const sendBack = parseFloat((totalTransactionAmount - fee - value).toFixed(8));
		// const sendBack = parseFloat((addressData.data[address].utxo[0].value - fee - value).toFixed(8));

		transactionBuilder.addOutput(address, sendBack);

		const privateKeyWIF = splitedData[1];

		const keyPair = bitcoin.ECPair.fromWIF(privateKeyWIF, TESTNET);

		transactionBuilder.sign(0, keyPair);

		const transaction = transactionBuilder.build();

		const tHex = transaction.toHex();

		console.log('tHex: ', tHex);

		return tHex;
	}

	async generateTronWallet(): Promise<any> {
		const { address, privateKey } = generateAccount();

		console.log(`Tron address is ${address}`);
		console.log(`Tron private key is ${privateKey}`);
	}

	async createUsdtTransactionFromTron(params: ICreateUsdtTransactionFromTron): Promise<any> {
		const { value, to } = params;
		const fileManager = new FileManager();
		const data = await fileManager.readFileUniversal({ fileName: `${process.env.COLD_WALLETS_PATH}ETH/tron.txt` });
		const splitedData = data.split('\n');
		const HttpProvider = TronWeb.providers.HttpProvider;
		const fullNode = new HttpProvider(process.env.TRON_PROVIDER);
		const solidityNode = new HttpProvider(process.env.TRON_PROVIDER);
		const eventServer = new HttpProvider(process.env.TRON_PROVIDER);
		// const fullNode = new HttpProvider('https://api.trongrid.io');
		// const solidityNode = new HttpProvider('https://api.trongrid.io');
		// const eventServer = new HttpProvider('https://api.trongrid.io');
		const privateKey = splitedData[1];
		const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
		const trc20ContractAddress = process.env.TRON_USDT_CONTRACT_ADDRESS; //contract address
		// TM7tM2UvoouMue7MHCPmHJQ9snGrdWwU6E usdt
		// TXXLsmZo5yzbwGZLoh7znccamTQyJx6Z74 any

		try {
			// const ownerAddress = tronWeb.address.fromPrivateKey(privateKey);
			const contractAddressHex = tronWeb.address.toHex(trc20ContractAddress);
			const contractInstance = await tronWeb.contract().at(contractAddressHex);

			const amount = (value * 1000000).toFixed(0);
			const response = await contractInstance.transfer(to, amount).send();

			console.log(response);

			return response;

		} catch (e) {
			console.error(e);
			throw new Error(JSON.stringify(e));
		}
	}

	async sendTestnetBtcTransaction(params: ISendTestBtcTransaction): Promise<any> {
		try {
			const { tHex } = params;
			const res = await axios.post(`https://api.blockchair.com/bitcoin/testnet/push/transaction`, {
				data: tHex
			});

			return res;
		} catch (e) {
			console.log(JSON.stringify(e));
			throw new Error(e);
		}
	}

	async calculateNumberOfNeededBtcTransactions(params: ICalculateNumberOfNeededBtcTransactions): Promise<IIncomingTransactions[]> {
		const { incomingTransactions, toWidthraw } = params;

		for (const incomingTransaction of incomingTransactions) {
			if (incomingTransaction.value >= toWidthraw) {
				return [incomingTransaction];
			}
		}

		const prepareIncomingTransactionPool = [];
		let summOfvalueInTransactions = 0;

		for (const incomingTransaction of incomingTransactions) {
			summOfvalueInTransactions =  parseFloat((Number(summOfvalueInTransactions) + Number(incomingTransaction.value)).toFixed(8));

			prepareIncomingTransactionPool.push(incomingTransaction);

			if (summOfvalueInTransactions >= toWidthraw) {
				return prepareIncomingTransactionPool;
			}
		}
	}

	async getBtcTestWalletBalance(params: IGetBtcWalletBalance): Promise<any> {
		const { wallet } = params;
		const url = `https://testnet-api.smartbit.com.au/v1/blockchain/address/${wallet}`;

		const res = await axios.get(url);
		const { data: { address: { total: { balance_int }} } } = res;

		return balance_int;
	}

	async getBtcTestWallet(params: IGetBtcTestWallet): Promise<any> {
		const { wallet } = params;
		const url = `https://api.blockchair.com/bitcoin/testnet/dashboards/address/${wallet}`;

		const res = await axios.get(url);
		const { data } = res;

		return data;
	}

	async generateBtcAddress(): Promise<any> {
		const keyPair = bitcoin.ECPair.makeRandom();
		const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
		const publicKey = keyPair.publicKey.toString('hex');
		const privateKey = keyPair.toWIF();

		return { address, privateKey, publicKey };
	}

	async generateBtcTestAddress(): Promise<any> {
		const TESTNET = bitcoin.networks.testnet;
		const keyPair = bitcoin.ECPair.makeRandom({ network: TESTNET });
		const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: TESTNET });
		const publicKey = keyPair.publicKey.toString('hex');
		const privateKey = keyPair.toWIF();

		return { address, privateKey, publicKey };
	}

	async generateEthAddress(): Promise<void | any> {
		// const mnemonic = process.env.MNEMONIC_ETH_PROVIDER_WORD;
		const mnemonic = generateMnemonic();
		const seed = await mnemonicToSeed(mnemonic);
		const hdwallet = hdkey.fromMasterSeed(seed);
		const path = "m/44'/60'/0'/0/0";
		const wallet = hdwallet.derivePath(path).getWallet();
		const address = `0x${wallet.getAddress().toString('hex')}`;
		const privateKey = wallet.getPrivateKey().toString('hex');
		const publicKey = wallet.getPublicKey().toString('hex');

		console.log(`Address: ${address}`);
		console.log(`privateKey: ${privateKey}`);
		console.log(`publicKey: ${publicKey}`);
		console.log(`mnemonic: ${mnemonic}`);
		console.log(`seed: ${seed}`);
		console.log(`wallet: ${JSON.stringify(wallet)}`);

		return { address, privateKey };
	}

	async decodeEthInput(input: string): Promise<any> {
		const decodedInput = this.USDT_ABI_DECODER.decodeData(input);

		return decodedInput;
	}

	async infuraRequest(data: IInfuraRequest): Promise<AxiosResponse> {
		try {
			const { params, method } = data;
			const response = await axios.post(this.infuraURL, {
				jsonrpc: '2.0',
				id: 1,
				method,
				params: [params],
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				}
			});

			return response;
		} catch (e) {
			throw new Error(e);
		}
	}

	async getEthNewBlockFilter(): Promise<any> {
		try {
			const response = await this.infuraRequest({ method: 'eth_newBlockFilter', params: '' });

			return response.data.result;
		} catch (e) {
			throw new Error(e);
		}
	}

	async getEthBlockFilterChanges(): Promise<any> {
		try {
			const ethBlockFilterService = new EthBlockFilterService();
			const ethblockFilter = await ethBlockFilterService.find();
			let filter: string;

			if (!ethblockFilter) {
				const newEthblockFilter = await this.getEthNewBlockFilter();

				filter = newEthblockFilter;

				await ethBlockFilterService.upsert({ filter: newEthblockFilter });
			} else {
				const ethFilterDoc = await ethBlockFilterService.find();

				filter = ethFilterDoc.filter;
			}

			let response = await this.infuraRequest({ method: 'eth_getFilterChanges', params: filter });

			if (response?.data?.error) {
				const newBlockFilter = await this.getEthNewBlockFilter();

				await ethBlockFilterService.upsert({ filter: newBlockFilter });
				response = await this.infuraRequest({ method: 'eth_getFilterChanges', params: newBlockFilter });
			}

			const isValidResponse = await Validator.isValidResponse(response);

			if (!isValidResponse) {
				return;
			}

			const blockHashes = response.data.result;

			for (const blockHash of blockHashes) {
				const { transactions: blockTransactions } = await this.getEthBlockByHash({ block: blockHash });

				const walletService = new WalletService();
				const usdtWallets = await walletService.listByCryptoCurrencies(
					{ cryptoCurrencies: [CryptoCurrency.USDT] });

				const ethWallets = await walletService.listByCryptoCurrencies(
					{ cryptoCurrencies: [CryptoCurrency.ETH] });

				for (const blockTransaction of blockTransactions) {

					const { to, input, value } = blockTransaction;

					const toStringedInput = input.toString(16);
					const inputStarts = toStringedInput.substring(0, 10);

					if (value === '0x0' && inputStarts === this.TRANSFER_INPUT && to === this.USDT_CONTRACT_ADDRESS) {

						const decodedInput = this.USDT_ABI_DECODER.decodeData(input);

						const valueToHex = '0x' + decodedInput.inputs[1].toString(16);
						const walletTo = '0x' + decodedInput.inputs[0].toString(16);

						const value = parseInt(valueToHex) / 1000000;

						// console.log('to: ', walletTo, 'value: ', value);

						for (const usdtWallet of usdtWallets) {
							if (usdtWallet.wallet === walletTo) {
								const { _id, userId } = await walletService.findByWalletAndCryptoCurrency(
									{ wallet: walletTo, cryptoCurrency: CryptoCurrency.USDT });

								await walletService.deposit({ id: _id, amount: value, userId, isInner: false });
							}
						}
					}

					if (value !== '0x0') {
						for (const ethWallet of ethWallets) {
							if (ethWallet.wallet === to) {
								const { _id, userId } = await walletService.findByWalletAndCryptoCurrency(
									{ wallet: to, cryptoCurrency: CryptoCurrency.ETH });
								const parsedValue = parseInt(value);
								const prepareValue = parsedValue / Number(this.WEI_IN_ETHEREUM);

								await walletService.deposit({ id: _id, amount: prepareValue, userId, isInner: false });
							}
						}
					}
				}
			}

			return response;
		} catch (e) {
			throw new Error(e);
		}
	}

	async skipZeroes(str: string): Promise<string> {
		let res = '';
		let lengthFrom: number;

		const arrFromString = [...str];

		for (const character of arrFromString) {
			if (character !== '0') {
				lengthFrom = arrFromString.indexOf(character);
				res = str.substring(Number(lengthFrom), Number(str.length));

				return res;
			}
		}
	}

	async getEthBlockByHash(params: IEthGetBlockByHash): Promise<any> {
		try {
			const { block } = params;
			const response = await axios.post(this.infuraURL, {
				jsonrpc: '2.0',
				id: + new Date(),
				method: 'eth_getBlockByHash',
				params: [block, true],
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				}
			});

			return response.data.result;
		} catch (e) {
			throw new Error(e);
		}
	}

	async getEthTransactionDetails(params: IGetEthTransactionDetails): Promise<any> {
		try {
			const { transactionHash } = params;
			const response = await axios.post(this.infuraURL, {
				jsonrpc: '2.0',
				id: + new Date(),
				method: 'eth_getTransactionByHash',
				params: [transactionHash],
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				}
			});

			return response.data.result;
		} catch (e) {
			throw new Error(e);
		}
	}

	async blockChairRequest(params: IBlockChairRequest): Promise<any> {
		try {
			const { url, wallets } = params;

			// console.log(`${url}?addresses=${wallets.map((n) => `${n}`).join(',')}`);

			// axios.interceptors.request.use((request) => {
			// 	console.log('Starting Request', JSON.stringify(request, null, 2));
			// 	return request;
			// });

			// axios.interceptors.response.use((response) => {
			// 	console.log('Response:', JSON.stringify(response, null, 2));
			// 	return response;
			// });

			const response = await axios.post(`${url}?addresses=${wallets.map((n) => `${n}`).join(',')}`);

			return response;
		} catch (e) {
			throw new Error(e);
		}
	}

	async updateBTCWalletBalance(): Promise<any> {
		const walletService = new WalletService();
		const walletDocs = await walletService.listByCryptoCurrencies({ cryptoCurrencies: [CryptoCurrency.BTC] });

		const wallets = walletDocs
			.map((walletDoc) => {
				return walletDoc.wallet;
			});

		const { data: { data } } = await this.blockChairRequest({ url: process.env.BLOCKCHAIR_REQUEST_URL, wallets });

		console.log('wallets ', wallets);

		const walletsData: { wallet: string, amount: number }[] = [...Object.entries(data)]
			.map(([wallet, amount]: [string, number]) => { return { wallet, amount };});

		const cryptoTransactionService = new CryptoTransactionService();

		for (const walletData of walletsData) {
			for (const walletDoc of walletDocs) {
				const parsedBTCValue = parseFloat((Number(walletData.amount) / Number(this.SATOSHI_INO_BTC)).toFixed(8));

				const summOfTransactions: number = await cryptoTransactionService.getUserSummOfSuccessTransactions(
					{ userId: walletDoc.userId, cryptoCurrency: CryptoCurrency.BTC });

				if (walletData.wallet === walletDoc.wallet &&
					parsedBTCValue > summOfTransactions) {

					const newAmount = parseFloat((Number(parsedBTCValue) - Number(summOfTransactions)).toFixed(8));

					console.log('newAmount: ', newAmount);

					await walletService.deposit({ userId: walletDoc.userId, id: walletDoc._id, amount: newAmount });
				}
			}
		}
	}
}
