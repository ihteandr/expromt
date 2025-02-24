import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { CreateMessageSchema, GetAllMessagesSchema, MessageSchema } from "./messagesValidators";
import { validateRequest } from "@/common/utils/httpHandlers";
import { messagesController } from "./messagesController";

export const messagesRegistry = new OpenAPIRegistry();
export const messagesRouter: Router = express.Router();

messagesRegistry.register("Message", MessageSchema);

messagesRegistry.registerPath({
    method: "get",
    path: "/messages",
    tags: ["Message"],
    responses: createApiResponse(z.array(MessageSchema), "Success"),
});

messagesRouter.get("/", messagesController.getAllMessages);

messagesRegistry.registerPath({
    method: "post",
    path: "/messages",
    tags: ["Message"],
    request: { 
        body: { 
            content: {
                "application/json": {
                    schema: CreateMessageSchema
                }    
            },
            description: "Message to be created"
        }
    },
    responses: createApiResponse(MessageSchema, "Success"),
});

messagesRouter.post("/", validateRequest(CreateMessageSchema), messagesController.createMessage);
