import { UserModel } from '@popflash/database';

export const findUserById = (userId: string) => UserModel.findById(userId).lean().exec();
