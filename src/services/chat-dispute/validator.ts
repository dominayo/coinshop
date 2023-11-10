import { IIsChatParticipant, IIsExists } from './interface';
import { ChatDisputeService } from './service';
import { ERRORS } from '../../common/errors';

export class Validator {
	public static async isChatDisputeParticipant(params: IIsChatParticipant): Promise<void> {
		const { id, userId } = params;
		const chatDisputeService = new ChatDisputeService();
		const { participants } = await chatDisputeService.findById({ id });

		const isParticipant = participants.filter((participant) => participant.userId === userId);

		if (isParticipant.length <= 0) {
			throw new Error(ERRORS.CHAT_DISPUTE_NOT_PARTICIPANT);
		}
	}

	public static async isExists(params: IIsExists): Promise<void> {
		const { id } = params;
		const chatDisputeService = new ChatDisputeService();
		const doc = await chatDisputeService.findById({ id });

		if (!doc) {
			throw new Error(ERRORS.CHAT_DISPUTE_NOT_FOUND);
		}
	}
}

export default Validator;
