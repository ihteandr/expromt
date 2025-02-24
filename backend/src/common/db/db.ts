import { MongoClient } from "mongodb";
import { env } from "../utils/envConfig";

export const mongoClient = new MongoClient(env.DB_URL, {});
export async function connectDB() {
    await mongoClient.connect();
    console.log('Connected to MongoDB');
}
export const mongoDB = mongoClient.db(env.DB_NAME);