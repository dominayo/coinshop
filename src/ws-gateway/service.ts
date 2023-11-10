/* eslint-disable @typescript-eslint/no-var-requires */
import { createServer, Server } from 'http';
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import db from '../db/connection';
import _ from 'lodash';
import dotenv from 'dotenv';
import { Authorization } from './middleware/authorization';
import { ISendChatMessageParams, ISendChatDisputeMessage, ISendChatMessage, ISendChatDisputeMessageByAdmin } from './interface';
import { Validator } from './validator';
import { Status } from '../services/deal/interface';
import { UserService } from '../services/user/service';
import { ChatMessageService } from '../services/chat/messages/service';
import { logger } from '../utils/logger';
import { ChatDisputeService } from '../services/chat-dispute/service';
import DealValidator from '../services/deal/validator';
import ChatValidator from '../services/chat/validator';
import { ChatDisputeMessageService } from '../services/chat-dispute/messages/service';
import { UserWebSocketConnections } from '../services/user-ws-connections/service';
import { ChatService } from '../services/chat/service';
import { Validator as UserValidator } from '../services/user/validator';

dotenv.config();

export class WebSocketService {
	private server: Server;
	private app: Express;
	private io;
	private readonly corsOptions: {
		'origin': '*'
	};
	async start(): Promise<void> {
		const DB = new db();

		await DB.connect();
		this.app = express();
		this.server = createServer(this.app);

		this.io = require('socket.io')(this.server, {
			cors: {
				origin: '*'
			}
		});

		// this.app.use(cors(this.corsOptions)); // TODO uncomment this line while production
		this.app.use(helmet()); // TODO uncomment this line while production
		this.app.use((req, res, next) => {
			res.header('Access-Control-Expose-Headers', '*');
			res.header('Access-Control-Allow-Origin', '*'); // TODO please, remove this while production
			res.header('Access-Control-Allow-Headers', '*');
			next();
		});
		this.app.set('view engine', 'ejs');
		this.app.get('/example', async (req, res) => {
			res.render('./ws/example.ejs');
		});

		this.server.listen(process.env.WEB_SOCKET_PORT, () => {
			logger.info(`WS server is starting at ${process.env.WEB_SOCKET_PORT} port`);
		});

		await this.connection();
	}

	async connection(): Promise<void> {
		this.io.on('connection', async (socket) => {
			try {
				const authorization = new Authorization();
				const token = socket.handshake.auth.token;

				await authorization.isTokenExists(token);
				const payload = await authorization.decodeToken(token);
				const { userId } = payload;

				const { role } = await UserValidator.isUserExists({ userId });

				const userWebSocketConnections = new UserWebSocketConnections();

				await userWebSocketConnections.upsert({ userId, connection: socket.id });
				await this.disconnect(socket);
				await this.sendChatMessage({ socket, userId });
				await this.sendChatDisputeMessage({ socket, userId, role });
				await this.sendChatDisputeMessageByAdmin({ socket, userId, role });
			} catch (e) {
				logger.error(e);
				socket.disconnect();
			}
		});
	}

	async disconnect(socket): Promise<void> {
		socket.on('disconnect', async () => {
			try {
				const authorization = new Authorization();
				const token = socket.handshake.auth.token;

				const payload = await authorization.decodeToken(token);
				const { userId } = payload;

				const userWebSocketConnections = new UserWebSocketConnections();

				await userWebSocketConnections.deleteConnection({ userId, connection: socket.id });
			} catch (e) {
				logger.error(e);
			}
		});
	}

	async sendChatMessage(params: ISendChatMessageParams): Promise<void> {
		const { userId, socket } = params;

		socket.on('chat', async (payload) => {
			try {
				await Validator.sendChatMessage(payload);
				const { message, chatId, messageType, contentType } = payload;
				const { dealId } = await Validator.isChatExists({ id: chatId });

				await ChatValidator.isChatParticipant({ id: chatId, userId });
				const { id } = await Validator.isDealExists({ id: dealId });

				//TODO add advert validator
				await DealValidator.isStatusMatch(
					{ id: dealId, statuses: [Status.Created, Status.Confirmed, Status.MoneySent, Status.DisputeOpened] });
				await Validator.isNotStatusMatch({ id, statuses: [Status.Canceled, Status.Closed, Status.Сompleted] });

				const userService = new UserService();
				const userDoc = await userService.findById(userId);
				const chatMessageService = new ChatMessageService();

				const messageDoc =
					await chatMessageService.create({ chatId, userId, message, messageType, contentType });
				const userDTO = _.pick(userDoc, ['email', 'name']);

				const prepareMessage = _.pick(messageDoc, ['id', 'messageType', 'contentType', 'createdAt']);

				const chatService = new ChatService();
				const { owner, customerId } = await chatService.findById({ id: chatId });

				if (userId === owner) {
					const userWebSocketConnections = new UserWebSocketConnections();
					const { connections } = await userWebSocketConnections.getUserConnectionList({ userId: customerId });

					for (const connection of connections) {
						this.io.to(connection).emit({ chatId, message, ...userDTO, ...prepareMessage });
					}
				} else {
					const userWebSocketConnections = new UserWebSocketConnections();
					const { connections } = await userWebSocketConnections.getUserConnectionList({ userId: owner });

					for (const connection of connections) {
						this.io.to(connection).emit({ chatId, message, ...userDTO, ...prepareMessage });
					}
				}

			} catch (e) {
				logger.error(e);
				socket.to(socket.id).emit({ error: e });
			}
		});
	}

	async sendChatDisputeMessage(params: ISendChatDisputeMessage): Promise<void> {
		const { userId, role, socket } = params;

		socket.on('dispute-chat', async (payload: ISendChatMessage) => {
			try {
				await Validator.sendChatDisputeMessage(payload);
				const { chatId, message, messageType } = payload;
				const { dealId } = await Validator.isChatDisputeExists({ id: chatId });

				// await ChatDisputeValidator.isChatDisputeParticipant({ id: chatId, userId });
				await Validator.isDealExists({ id: dealId });
				await DealValidator.isStatusMatch({ id: dealId, statuses: [Status.DisputeOpened] });
				const chatDisputeMessageService = new ChatDisputeMessageService();
				const { createdAt, _id } = await chatDisputeMessageService.create(
					{ chatId, message, userId, messageType, role, contentType: payload.contentType });
				const userService = new UserService();
				const userDoc = await userService.findById(userId);
				const userDTO = _.pick(userDoc, ['email', 'name', 'role']);

				const userWebSocketConnections = new UserWebSocketConnections();

				const adminSupportConnections = await (await userWebSocketConnections.getAdminConnectionList())
					.map((adminSocketConnectionDoc) => {
						return adminSocketConnectionDoc.connections;
					});

				logger.info({ chatId, message, userDTO, messageType, contentType: payload.contentType, createdAt, id: _id });

				for (const adminSupportConnection of adminSupportConnections) {
					this.io.to(adminSupportConnection).emit(
						{ chatId, message, ...userDTO, messageType, contentType: payload.contentType, createdAt, id: _id });
				}
			} catch (e) {
				logger.error(e);
				socket.to(socket.id).emit({ error: e });
			}
		});
	}

	async sendChatDisputeMessageByAdmin(params: ISendChatDisputeMessageByAdmin): Promise<void> {
		const { userId, socket, role } = params;

		socket.on('dispute-chat-admin', async (payload: ISendChatMessage) => {
			try {
				await UserValidator.isAdmin(userId);
				await Validator.sendChatDisputeMessage(payload);
				const { chatId, message, messageType } = payload;
				const { dealId } = await Validator.isChatDisputeExists({ id: chatId });

				await Validator.isDealExists({ id: dealId });

				const chatDisputeMessageService = new ChatDisputeMessageService();
				const chatDisputeMessageDoc = await chatDisputeMessageService.create({ chatId, message, userId, role, messageType });

				const prepareMessage = _.pick(chatDisputeMessageDoc, ['contentType', 'createdAt']);
				const userService = new UserService();
				const userDoc = await userService.findById(userId);
				const userDTO = _.pick(userDoc, ['email', 'name', 'secondName', 'role']);

				const chatDisputeService = new ChatDisputeService();
				const { participants } = await chatDisputeService.findById({ id: chatId });
				const participantsIds = participants
					.map((participant) => {
						return participant.userId;
					})
					.filter((participantId) => {
						return participantId !== userId;
					});

				const userWebSocketConnections = new UserWebSocketConnections();

				for (const participantsId of participantsIds) {
					const { connections } = await userWebSocketConnections.getUserConnectionList({ userId: participantsId });

					for (const connection of connections) {
						this.io.to(connection).emit({ chatId, message, messageType, email: userDTO.email , ...prepareMessage });
					}
				}
			} catch (e) {
				logger.error(e);
				socket.to(socket.id).emit({ error: e });
			}
		});
	}
}
