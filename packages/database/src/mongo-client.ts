import mongoose from 'mongoose';

const defaultOptions: mongoose.ConnectOptions = {
  autoIndex: true,
  maxPoolSize: 10,
};

export const connectMongo = async (uri: string, options: mongoose.ConnectOptions = {}) => {
  if (!uri) {
    throw new Error('Mongo URI is required');
  }

  await mongoose.connect(uri, { ...defaultOptions, ...options });
  return mongoose.connection;
};

export const disconnectMongo = () => mongoose.disconnect();
