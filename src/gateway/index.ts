import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import db from '../db/connection';
import { errorHandler } from './middleware/errorHandler';
import { ScheduleService } from '../utils/scheduler';
import { DefaultService } from '../utils/default';
import signUp from './routes/user/signUp';
import signIn from './routes/user/signIn';
import isEmailExists from './routes/user/isExists';
import isNameExists from './routes/user/isNameExists.route';
import createAdvert from './routes/advert/create.route';
import getAdvert from './routes/advert/get.route';
import getPersonalAdverts from './routes/advert/user-list.route';
import getMarketAdverts from './routes/advert/list.route';
import updateAdvert from './routes/advert/update.route';
import deleteAdvert from './routes/advert/delete.route';
import diactivateAdvert from './routes/advert/deactivate.route';
import activateAdvert from './routes/advert/activate.route';
import binanceList from './routes/binance/list.route';
import createDeal from './routes/deal/create.route';
import getDeal from './routes/deal/get.route';
import getDealList from './routes/deal/get-list.route';
import confirmDeal from './routes/deal/confirm.route';
import cancelDeal from './routes/deal/cancel.route';
import moneySentDeal from './routes/deal/money-sent.route';
import moneyReceivedDeal from './routes/deal/money-recieved.route';
import dispute from './routes/deal/dispute';
import chatMessageList from './routes/chat/get.message-list.route';
import uploadFileInChat from './routes/chat/upload.route';
import downloadFileInChat from './routes/chat/download.route';
import downloadFileInDisputeChat from './routes/chat-dispute/download.route';
import chatDisputeMessageList from './routes/chat-dispute/get.dispute-message-list.route';
import uploadChatDisputeFile from './routes/chat-dispute/upload.route';
import getWallets from './routes/wallet/get-wallets.route';
import withdrawCrypto from './routes/wallet/withdraw.route';
import advertCount from './routes/advert/count.route';
import userAdvertListCount from './routes/advert/user-list-count.route';
import updateUser from './routes/user/update.route';
import getUserTransactions from './routes/inner-crypto-transactions/user-list.route';
import userProfile from './routes/user/profile.route';
import emailVerify from './routes/user/email-verify';
import getCommission from './routes/commission/get-commissions.route';
import generateQrCode from './routes/user/generate-qr-code.route';
import enableGoogle2fa from './routes/user/enable-google-2fa.route';
import isGoogle2fa from './routes/user/is-two-fa-enabled.route';
import { RPCTransportService } from '../transports/rpc/service';
import fs from 'fs';

dotenv.config();
// const corsWhiteList = [
// 	'http://localhost:3000', 'http://ws.localhost:3000', 'http://coinshop.dev-page.site/',
// 	'http://ws.coinshop.dev-page.site/', 'localhost:3000'
// ];

const corsOptions = {
	'origin': '*'
};

const server = express();
const DB = new db();

const app = async () => {
	server.use(bodyParser());
	server.use(bodyParser.json());
	server.use(bodyParser.urlencoded({ extended: true }));
	server.use(express.static(`${__dirname}/../views`));
	// server.set('view engine', 'ejs');
	server.use(cors(corsOptions));
	server.use(compression());
	// server.use(helmet());
	server.use(helmet.dnsPrefetchControl());
	server.use(helmet.expectCt());
	server.use(helmet.frameguard());
	server.use(helmet.hidePoweredBy());
	server.use(helmet.hsts());
	server.use(helmet.ieNoOpen());
	server.use(helmet.noSniff());
	server.use(helmet.permittedCrossDomainPolicies());
	server.use(helmet.referrerPolicy());
	server.use(helmet.xssFilter());

	server.use((req, res, next) => {
		res.header('Access-Control-Expose-Headers', '*');
		res.header('Access-Control-Allow-Origin', '*'); // TODO please, remove this while production
		res.header('Access-Control-Allow-Headers', '*');
		next();
	});

	server.set('view engine', 'ejs');

	server.listen(process.env.SERVER_PORT, () => {
		console.log(`Example app listening on port ${process.env.SERVER_PORT}`)
	});

	await DB.connect();
	const scheduleService = new ScheduleService();

	await scheduleService.updateBinance();
	// await scheduleService.getNewEthBlock();
	await scheduleService.updateUsersWallets();
	await scheduleService.updateExpiredDeals();
	await scheduleService.getBTCWalletValue();
	const defaultService = new DefaultService();

	await defaultService.setDefault();
	await defaultService.setDefaultFiatPrices();
	await defaultService.setDefaultCommissions();

	const rPCTransportService = new RPCTransportService();

	// const keyPairs = [];
	// const addresses = [];

	// for (let i = 0; i < 1000; i++) {
	// 	const keyPair = await rPCTransportService.generateEthAddress();

	// 	keyPairs.push(keyPair);
	// 	addresses.push(keyPair.address);
	// }

	// fs.writeFileSync(__dirname + '/keyPairs.json', JSON.stringify(keyPairs));
	// fs.writeFileSync(__dirname + '/addresses.txt', JSON.stringify(addresses));

	// console.log(__dirname);


	// const tronTransaction = await rPCTransportService.generateTronWallet();
	// const tronTransaction = await rPCTransportService.createUsdtTransactionFromTron({ to: '123', value: 123 });

	// console.log('tronTransaction: ', tronTransaction);
	// const transaction = await rPCTransportService.transactionBuilder({ value: 1000, to: 'miGS7qQZDxtgj4c5EuLRDnwJcxTyjssZqg' });

	// console.log(transaction);
	// await rPCTransportService.transactionBuilder({ value: 1000, to: 'miGS7qQZDxtgj4c5EuLRDnwJcxTyjssZqg'});
	// const res = await rPCTransportService.generateBtcTestAddress();
	// console.log(res);

	// await rPCTransportService.sendUsdtTransaction({ to: '0xf8F6A8AdC9aC25b7b5a86559A6c169A93C469196', value: 1 });

	// const ethaddress = await rPCTransportService.generateEthAddress();
	// console.log(ethaddress);
	// const btcadress = await rPCTransportService.generateBtcAddress();
	// console.log(btcadress);
	// await defaultService.createUSDTfileABI();

	/** User **/
	
	server.post('/signup', signUp);
	server.post('/signin', signIn);
	server.post('/email/existence', isEmailExists);
	server.post('/name/existence', isNameExists);
	server.patch('/profile/', updateUser);
	server.post('/personal/announcement', createAdvert);
	server.patch('/personal/announcement', updateAdvert);
	server.delete('/personal/announcement', deleteAdvert);
	server.get('/personal/announcements', getPersonalAdverts);
	server.get('/personal/announcements/count', userAdvertListCount);
	server.get('/user/profile', userProfile);
	server.post('/user/email/verify', emailVerify);

	/** Google 2fa auth **/
	server.patch('/google-2fa-auth', enableGoogle2fa);
	server.get('/google-2fa-auth', generateQrCode);
	server.get('/is-google-2fa-auth', isGoogle2fa);

	/** Adverts **/
	server.get('/announcements/:id', getAdvert);
	server.post('/announcements/:id/diactivate', diactivateAdvert);
	server.post('/announcements/:id/activate', activateAdvert);
	server.get('/market/announcements/', getMarketAdverts);
	server.get('/prices', binanceList);
	server.get('/market/announcements/count', advertCount);

	/** User Wallet **/
	server.get('/personal/wallets', getWallets);
	server.post('/personal/wallet/withdraw', withdrawCrypto);

	/** Deals **/
	server.post('/announcements/:advertId/deals/create', createDeal);
	server.post('/deals/:id/confirm', confirmDeal);
	server.post('/deals/:id/cancel', cancelDeal); //TODO remove deal cancel service
	server.post('/deals/:id/sent', moneySentDeal);
	server.post('/deals/:id/recieved', moneyReceivedDeal);
	server.post('/deals/:id/dispute', dispute);
	server.get('/deals/:id/', getDeal);
	server.get('/deals', getDealList);

	/** Chat **/
	server.get('/example', async (req, res) => {
		res.render('./ws/example.ejs');
	});
	server.post('/deals/chat/:chatId', chatMessageList);
	server.post('/chats/dispute/:chatId', chatDisputeMessageList);
	server.put('/chat/:chatId', uploadFileInChat);
	server.get('/chats/messages/:id', downloadFileInChat);
	server.get('/chats/dispute/messages/:id', downloadFileInDisputeChat);
	server.put('/chats/dispute/:chatId', uploadChatDisputeFile);

	/** Inner Transactions **/
	server.get('/personal/transactions', getUserTransactions);

	/** Commissions **/

	server.get('/commissions', getCommission);

	/** Handlers **/
	server.get('*', async(req, res) => {
		res.json({ code: 404, message: 'Not Found'});
	});

	server.post('*', async(req, res) => {
		res.json({ code: 404, message: 'Not Found'});
	});

	server.patch('*', async(req, res) => {
		res.json({ code: 404, message: 'Not Found'});
	});

	server.put('*', async(req, res) => {
		res.json({ code: 404, message: 'Not Found'});
	});

	server.delete('*', async(req, res) => {
		res.json({ code: 404, message: 'Not Found'});
	});

	server.options('*', async(req, res) => {
		res.json({ code: 404, message: 'Not Found'});
	});

	server.use(errorHandler);
};

app();

