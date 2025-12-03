import { UserModel } from '@popflash/database';
import { userSchema, type User } from '@popflash/shared';

interface UpsertUserInput {
  steamId: string;
  email?: string;
  displayName: string;
  avatarUrl?: string;
  countryCode: string;
}

export const findUserBySteamId = (steamId: string) => UserModel.findOne({ steamId }).exec();

type UserRecord = Omit<User, 'id'> & { _id: string; id?: string };

type UserRecordWithPersona = UserRecord & { personaInquiryId?: string };

const mapToDomain = (doc: UserRecordWithPersona): User =>
  userSchema.parse({
    id: doc._id.toString(),
    steamId: doc.steamId,
    email: doc.email ?? undefined,
    displayName: doc.displayName,
    avatarUrl: doc.avatarUrl ?? undefined,
    role: doc.role,
    kycStatus: doc.kycStatus,
    personaInquiryId: doc.personaInquiryId ?? undefined,
    countryCode: doc.countryCode,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });

export const upsertUserBySteamId = async (input: UpsertUserInput): Promise<User> => {
  const user = await UserModel.findOneAndUpdate(
    { steamId: input.steamId },
    {
      $set: {
        displayName: input.displayName,
        avatarUrl: input.avatarUrl,
        email: input.email,
        countryCode: input.countryCode,
      },
      $setOnInsert: {
        steamId: input.steamId,
      },
    },
    { upsert: true, new: true, lean: true },
  ).exec();

  if (!user) {
    throw new Error('Failed to upsert user');
  }

  return mapToDomain(user);
};

export const findUserById = async (id: string): Promise<User | null> => {
  const doc = await UserModel.findById(id).exec();

  return doc ? mapToDomain(doc) : null;
};

export const updateUserKycStatus = async (
  userId: string,
  kycStatus: 'unverified' | 'pending' | 'verified' | 'rejected',
  personaInquiryId?: string
): Promise<User | null> => {
  const updateFields: Record<string, unknown> = { kycStatus };

  if (personaInquiryId) {
    updateFields.personaInquiryId = personaInquiryId;
  }

  const doc = await UserModel.findByIdAndUpdate(
    userId,
    { $set: updateFields },
    { new: true, lean: true }
  ).exec();

  return doc ? mapToDomain(doc) : null;
};
