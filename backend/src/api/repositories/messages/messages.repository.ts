import { mongoClient, mongoDB } from "@/common/db/db";
import { ObjectId } from "mongodb";
import { objectToArray } from "../helpers/helpers";
import { env } from "@/common/utils/envConfig";
import { sortBy } from "lodash";

export type Message = {
    text: string;
    date: Date;
    id?: string;
    server?: string;
}


const MessageCollection = mongoDB.collection<Message>("messages");

const MessageServerPosition = mongoDB.collection<{ server: string, position: number }>("messages-server-position");
MessageServerPosition.createIndex({ server: 1 }, { unique: true });
export class MessagesRepository {
    stream: any;
    unwatchMessages() {
        this.stream.close();
    }
    async watchMessages(callback: (message: Message) => void) {
        await mongoClient.connect();
        let position = 0;
        const currentMessagesServerPosition = await MessageServerPosition.findOne({ server: env.SERVER_NAME });
        if (!currentMessagesServerPosition) {
            await MessageServerPosition.insertOne({ server: env.SERVER_NAME, position: 0 });
        } else {
            position = currentMessagesServerPosition.position;
        }
        const missedMessages = await MessageCollection.find({}).sort({ date: 1 }).skip(position).toArray();
        let allMessagesCount = await MessageCollection.countDocuments({});
        missedMessages.forEach((message: Message) => {
            callback(message);
        })
        await MessageServerPosition.updateOne({ server: env.SERVER_NAME }, { $set: { position: allMessagesCount } });
        this.stream =  MessageCollection.watch([{ $match: { operationType: "insert" } }]);
        this.stream.on("change", (change: { fullDocument: Message }) => {
            callback(change.fullDocument);
        })
    }
    async createMessages(messages: Message[]): Promise<ObjectId[]> {
        const result = await MessageCollection.insertMany(messages);
        const position = await MessageServerPosition.find({ server: messages[0].server }).sort({ position: -1 }).limit(1).toArray();
        const newPosition = position.length > 0 ? position[0].position + messages.length : messages.length;
        await MessageServerPosition.updateOne({ server: env.SERVER_NAME }, { $set: { position: newPosition } });
        return objectToArray<ObjectId>(result.insertedIds);
    }
    async getAllMessages(): Promise<Message[]> {
        return await MessageCollection.find({}).sort({ date: 1 }).toArray();
    }
}

