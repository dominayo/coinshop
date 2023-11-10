/* eslint-disable @typescript-eslint/no-var-requires */
import express, { Express } from 'express';
// import { createServer, Server } from 'http';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
// import { ISendMessage } from './interface';
import db from '../../db/connection';
import { errorHandler } from '../../gateway/middleware/errorHandler';
// import { WebSocketAuth } from './middleware/ws-auth';
import { DefaultService } from '../../utils/default';
import { logger } from '../../utils/logger';
import signInPage from './routes/signIn-page.route';
import signIn from './routes/signIn.route';
import dashboard from './routes/dashboard.route';
import createAdmin from './routes/create.admin.route';
import commissionCreate from './routes/commission/create.route';
import updateCommission from './routes/commission/update.route';
import chatMessageList from './routes/chat-dispute/message-list.route';
import chatDisputeList from './routes/chat-dispute/chat-dispute-list.route';
import getImage from './routes/chat-dispute/chat-dispute-download.route';
import notitficationList from './routes/notifications/notification-list.route';
import notificationUpdate from './routes/notifications/update.route';
import userList from './routes/users/user-list.route';
import usersCount from './routes/users/user-count.route';
import advertList from './routes/advert/advert-list.route';
import dealList from './routes/deals/deals-list.route';
import transactionList from './routes/transactions/transaction-list.route';
import uploadWallets from './routes/upload-wallets/upload-wallets.route';
import disputeVerdict from './routes/chat-dispute/verdict.route';
import transactionVerdict from './routes/transactions/verdict.route';
import widthrawList from './routes/transactions/processing-transaction-list.route';

dotenv.config();

export class DashboardService {
	constructor() {
		this.server = express();
		this.db = new db();
		this.startServer();
		// this.startWebSocketServer();
	}
	private server: Express;
	private db;
	private defaultService = new DefaultService();
	// private http: Server;
	// private io: Socket;
	// private webSocketAuth = new WebSocketAuth();
	private readonly corsOptions: {
		'origin': '*'
	}

	private async startServer(): Promise<void> {
		this.server.use(bodyParser());
		this.server.use(bodyParser.json());
		this.server.use(bodyParser.urlencoded({ extended: true }));
		this.server.use(cookieParser());
		this.server.use((req, res, next) => {
			res.header('Access-Control-Expose-Headers', '*');
			res.header('Access-Control-Allow-Origin', '*'); // TODO please, remove this while production
			res.header('Access-Control-Allow-Headers', '*');
			next();
		});
		// this.server.use(express.static(`${__dirname}/../static`));
		this.server.use(express.static(`${__dirname}/../../../views`));

		this.server.set('view engine', 'ejs');

		// this.server.use(cors(this.corsOptions));
		this.server.use(helmet.dnsPrefetchControl());
		this.server.use(helmet.expectCt());
		this.server.use(helmet.frameguard());
		this.server.use(helmet.hidePoweredBy());
		this.server.use(helmet.hsts());
		this.server.use(helmet.ieNoOpen());
		this.server.use(helmet.noSniff());
		this.server.use(helmet.permittedCrossDomainPolicies());
		this.server.use(helmet.referrerPolicy());
		this.server.use(helmet.xssFilter());
		this.server.use(compression());
		this.server.use(fileUpload());

		// this.http = createServer(this.server);

		await this.db.connect();
		await this.defaultService.setDefault();

		this.server.get('/dashboard/signin', signInPage);
		this.server.post('/sign', signIn);
		this.server.get('/', dashboard);
		this.server.post('/dashboard/admin', createAdmin);

		/** Users **/
		this.server.get('/users', userList);
		this.server.get('/users/count', usersCount);

		/** Adverts **/

		this.server.get('/adverts', advertList);

		/** Deals **/

		this.server.get('/deals', dealList);

		/** Transactions **/

		this.server.get('/transactions', transactionList);

		/** Widthraw List **/

		this.server.get('/widthraw-list', widthrawList);

		/** Commission **/
		this.server.post('/commissions/commission', commissionCreate);
		this.server.patch('/commissions/commission', updateCommission);

		/** Chats **/
		this.server.get('/chats/chat/:chatId/messages', chatMessageList);
		this.server.get('/chats/messages/:id', getImage);
		this.server.get('/chats/', chatDisputeList);

		/** Verdict */
		this.server.post('/transaction/verdict', transactionVerdict);
		this.server.post('/deals/verdict', disputeVerdict);

		/** Notifications **/
		this.server.get('/notifications', notitficationList);
		this.server.patch('/notifications/:chatId', notificationUpdate);

		/** Wallets **/
		this.server.post('/wallets/upload/btc', uploadWallets);
		this.server.post('/wallets/upload/eth', uploadWallets);

		/** Handlers **/
		this.server.get('*', async(req, res) => {
			res.json({ code: 404, message: 'Not Found'});
		});

		this.server.use(errorHandler);

		this.server.listen(process.env.DASHBOARD_SERVER_PORT, () => {
			logger.info(`Dashboard server is starting at ${process.env.DASHBOARD_SERVER_PORT} port`);
		});
	}

	// async startWebSocketServer(): Promise<void> {
	// 	this.http = createServer(this.server);

	// 	this.io = require('socket.io')(this.http, {
	// 		cors: '*' // TODO remove this line while production
	// 	});

	// 	this.http.listen(process.env.DASHBOARD_WEB_SOCKET_PORT);

	// 	this.io.once('connection', async (socket) => {
	// 		this.io.use(async (_, next) => {
	// 			await this.webSocketAuth.isHavePermissions({ socket });
	// 			next();
	// 		});
	// 		this.io.use(async (socket, next) => {
	// 			await this.connection(socket);
	// 			next();
	// 		});
	// 	});
	// }

	// async connection(socket): Promise<void> {
	// 	socket.onAny(async (eventName, payload) => {
	// 		socket.emit(eventName, payload);
	// 		// logger.info(`eventName ${eventName}`);
	// 		await this.sendMessage({ socket, message: payload, eventName });
	// 	});
	// }

	// async sendMessage(params: ISendMessage): Promise<void> {
	// 	const { socket, message, eventName } = params;

	// 	socket.emit(eventName, message);
	// }
}

new DashboardService();
