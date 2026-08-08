import 'dotenv/config';
import mongoose from 'mongoose';

export const connectTestDB = async () => {
  await mongoose.connect(process.env.TEST_MONGO_URI);
};

export const closeTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};

export const clearCollections = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};