import { IDocument, ICreateParams, IUpdateParams, IFindByUserId, calculateDealsRating, UserRating,
	ICalculateSummInTransactionRating, ICalculateDisputeLostRating, ICalculateCanceledDealsRating,
	ICalculateReactionSpeed, ReactionSpeed } from './interface';
import { UserProfile } from './model';

export class UserProfileService {
	private readonly ratingMethodsMap = {
		deals: this.calculateDealsRating,
		summInTransactions: this.calculateSummInTransactionRating,
		disputeLost: this.calculateDisputeLostRating,
		canceledDeals: this.calculateCanceledDealsRating
	}

	async create(params: ICreateParams): Promise<IDocument> {
		return await UserProfile.create(params);
	}

	async update(params: IUpdateParams): Promise<IDocument> {
		const { userId, reactionSpeed, deals: incomingDeals, summInTransactions: IncomingSumm,
			disputeLost: incomingDisputeLost, canceledDeals: incomingCanceledDeals,
			disputeOpenedCount: incomingDisputeOpenedCount } = params;

		if (reactionSpeed) {
			await UserProfile.findOneAndUpdate({ userId }, { $push: { reactionSpeed : reactionSpeed  }}, { new: true }).exec();
		}

		if (incomingDeals) {
			const { deals } = await UserProfile.findOne({ userId }).exec();
			const newDealsCount = Number(incomingDeals) + Number(deals);

			await UserProfile.findOneAndUpdate(
				{ userId }, { deals: newDealsCount }, { new: true }).exec();
			await this.calculateDealsRating({ userId });
		}

		if (IncomingSumm) {
			const { summInTransactions } = await UserProfile.findOne({ userId }).exec();
			const newSummInTransactions = Number(summInTransactions) + Number(IncomingSumm);

			await UserProfile.findOneAndUpdate(
				{ userId }, { $set: { summInTransactions: newSummInTransactions } }, { new: true }).exec();
			await this.calculateSummInTransactionRating({ userId });
		}

		if (incomingDisputeLost) {
			const { disputeLost } = await UserProfile.findOne({ userId }).exec();
			const newDisputeLost = Number(disputeLost) + Number(incomingDisputeLost);

			await UserProfile.findOneAndUpdate(
				{ userId }, { $set: { disputeLost: newDisputeLost } }, { new: true }).exec();
			await this.calculateDisputeLostRating({ userId });
		}

		if (incomingCanceledDeals) {
			const { canceledDeals } = await UserProfile.findOne({ userId }).exec();
			const newCanceledDeals = Number(canceledDeals) + Number(incomingCanceledDeals);

			await UserProfile.findOneAndUpdate(
				{ userId }, { $set: { canceledDeals: newCanceledDeals } }, { new: true }).exec();
			await this.calculateCanceledDealsRating({ userId });
		}

		if (incomingDisputeOpenedCount) {
			const { disputeOpenedCount } = await UserProfile.findOne({ userId }).exec();
			const newDisputeOpenedCount = Number(disputeOpenedCount) + Number(incomingDisputeOpenedCount);

			await UserProfile.findOneAndUpdate(
				{ userId }, { $set: { disputeOpenedCount: newDisputeOpenedCount } }, { new: true }).exec();
		}

		return await UserProfile.findOne({ userId }).exec();

	}

	async findByUserId(params: IFindByUserId): Promise<IDocument> {
		return await UserProfile.findOne(params).exec();
	}

	async calculateDealsRating(params: calculateDealsRating): Promise<IDocument> {
		const { userId } = params;

		const oldDoc = await UserProfile.findOne({ userId }).exec();

		const dealsRating = parseFloat((Number(oldDoc.rating) + Number(oldDoc.deals) * Number(UserRating.DEAL_AMOUNT)).toFixed(2));
		const doc = await UserProfile.findOneAndUpdate(
			{ userId }, { $set: { rating: dealsRating } }).exec();

		return doc;
	}

	async calculateSummInTransactionRating(params: ICalculateSummInTransactionRating): Promise<IDocument> {
		const { userId } = params;

		const oldDoc = await UserProfile.findOne({ userId });

		const ratingFromSummInTransactions =
		(parseFloat((oldDoc.summInTransactions / 10000).toFixed(2)) * Number(UserRating.SUMM_IN_DEAL)) + oldDoc.rating;

		const doc = await UserProfile.findOneAndUpdate(
			{ userId }, { $set: { rating: ratingFromSummInTransactions } }).exec();

		return doc;
	}

	async calculateDisputeLostRating(params: ICalculateDisputeLostRating): Promise<IDocument> {
		const { userId } = params;

		const { rating, disputeLost} = await UserProfile.findOne({ userId }).exec();

		const ratingFromDisputeLost = parseFloat((Number(rating) + Number(disputeLost) * Number(UserRating.DISPUTE_LOSE)).toFixed(2));

		const doc = await UserProfile.findOneAndUpdate(
			{ userId }, { $set: { rating: ratingFromDisputeLost } }).exec();

		return doc;
	}

	async calculateCanceledDealsRating(params: ICalculateCanceledDealsRating): Promise<IDocument> {
		const { userId } = params;

		const { rating, canceledDeals } = await UserProfile.findOne({ userId }).exec();

		const ratingFromCanceledDeals = Number(rating) + parseFloat((Number(canceledDeals) * Number(UserRating.DEAL_CANCEL)).toFixed(2));

		const doc = await UserProfile.findOneAndUpdate(
			{ userId }, { $set: { rating: ratingFromCanceledDeals } }).exec();

		return doc;
	}

	async calculateReactionSpeedRaiting(params: ICalculateReactionSpeed): Promise<any> {
		const { userId } = params;

		const { reactionSpeed } = await UserProfile.findOne({ userId }).exec();

		if (reactionSpeed.length === 0) {
			return {
				rating: 0,
				reactionSpeedDto: 'FAST'
			};
		}

		let summOfReactionSpeed = 0;

		for (const reaction of reactionSpeed) {
			summOfReactionSpeed = summOfReactionSpeed + Number(reaction);
		}

		const averageReactionSpeed = summOfReactionSpeed / Number(reactionSpeed.length);

		if (averageReactionSpeed <= ReactionSpeed.REACTION_FAST_SPEED ) {
			return {
				rating: UserRating.REACTION_FAST_SPEED,
				reactionSpeedDto: 'FAST'
			};
		}

		if (averageReactionSpeed > ReactionSpeed.REACTION_FAST_SPEED && averageReactionSpeed <= ReactionSpeed.REACTION_STANDART_SPEED) {
			return {
				rating: UserRating.REACTION_STANDART_SPEED,
				reactionSpeedDto: 'STANDART'
			};
		}

		if (averageReactionSpeed > ReactionSpeed.REACTION_STANDART_SPEED) {
			return {
				rating: UserRating.REACTION_LOW_SPEED,
				reactionSpeedDto: 'SLOW'
			};
		}
	}
}
