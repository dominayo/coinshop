import { UserRoles } from '../common/interface';
import { ContentType, MessageType } from '../services/chat-dispute/messages/interface';

export interface IChatMessage {
	message: string;
}

export interface IIsChatDisputeExists {
	id: string;
}

export interface ISendChatMessageParams {
	userId: string;
	socket: any;
}

export interface ISendChatMessage {
	chatId: string;
	message: string;
	messageType: MessageType;
	contentType?: ContentType;
}

export interface ISendChatDisputeMessage {
	userId: string;
	role: UserRoles;
	socket: any;
}

export interface ISendAdminNotifications {
	chatDisputeId: string;
}

export interface ISendChatDisputeMessageByAdmin {
	userId: string;
	role: UserRoles;
	socket: any;
}
