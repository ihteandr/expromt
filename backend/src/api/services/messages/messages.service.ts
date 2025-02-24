import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import { Message, MessagesRepository } from "@/api/repositories/messages/messages.repository";
import fs from 'fs'
import { error } from "console";
import { broadcastMessage } from "@/api/socket/socket";
import { env } from "@/common/utils/envConfig";
const FILE_PATH = __dirname + '/messages.json'
class MessagesService {
    private messagesRepository: MessagesRepository;
    public isWatchingMessages = false;
    constructor(repository: MessagesRepository = new MessagesRepository()) {
        this.messagesRepository = repository;
        setInterval(() => {
            this.saveExistingMessage()
        }, 1000)
    }
    public watchMessages() {
        this.isWatchingMessages = true;
        this.messagesRepository.watchMessages((message) => {
            broadcastMessage(message)
        })
    }
    unwatchMessages() {
        this.isWatchingMessages = false;
        this.messagesRepository.unwatchMessages()
    }
    private async saveExistingMessage() {
        fs.readFile(FILE_PATH, (error, data) => {
            if (error) {
                throw error
            } else {
                const messages = JSON.parse(data.toString())
                if (messages.length > 0) {
                    this.messagesRepository.createMessages(messages)
                    fs.writeFileSync(FILE_PATH, JSON.stringify([]))
                } 
            }
        })
    }
    private async saveMessage(message: Message): Promise<Message[]>  {
        if (!fs.existsSync(FILE_PATH)) {
            fs.writeFileSync(FILE_PATH, JSON.stringify([]))
        }
        return new Promise((resolve, reject) => {
            fs.readFile(FILE_PATH, (error, data) => {
                if (error) {
                    reject(error)
                } else {
                    const messages = JSON.parse(data.toString())
                    messages.push(message)
                    fs.writeFile(FILE_PATH, JSON.stringify(messages), (error) => {
                        if (error) {
                            reject(error)
                        } else {
                            resolve(messages)
                        }
                    })
                }
            })
        })
    }

    async getAllMessages(): Promise<ServiceResponse<Message[] | null>> {
        try {
            const messages = await this.messagesRepository.getAllMessages();
            return ServiceResponse.success<Message[]>("Messages found", messages);
        } catch (ex) {
            const errorMessage = `Error finding all messages: $${(ex as Error).message}`;
            logger.error(errorMessage);
            return ServiceResponse.failure(
                "An error occurred while retrieving messages.",
                null,
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async createMessage({ text }: { text: string }): Promise<ServiceResponse<Message | null>> {
        try {
            const message = {
                text,
                date: new Date(),
                server: env.SERVER_NAME
            };
            const messages = await this.saveMessage(message)
            if (messages.length >= 10) {
                await this.messagesRepository.createMessages(messages);   
            }
            return ServiceResponse.success<Message>("Message created", message);
        } catch (ex) {
            const errorMessage = `Error creating message:, ${(ex as Error).message}`;
            logger.error(errorMessage);
            return ServiceResponse.failure("An error occurred while creating message.", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

export const messagesService = new MessagesService();
