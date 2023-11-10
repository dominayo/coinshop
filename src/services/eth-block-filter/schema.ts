import { Schema } from 'mongoose';

export const EthBlockFilterSchema : Schema = new Schema({
	filter: String
}, { timestamps: true });

EthBlockFilterSchema.index({ createdAt: 1 });
EthBlockFilterSchema.index({ updatedAt: 1 });

export default EthBlockFilterSchema;
