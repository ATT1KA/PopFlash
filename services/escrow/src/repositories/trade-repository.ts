import { TradeModel } from '@popflash/database';

export const findTradeById = (tradeId: string) => TradeModel.findById(tradeId).lean().exec();
