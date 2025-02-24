import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const MessageSchema = z.object({
    text: z.string(),
    date: z.date(),
});


export const GetAllMessagesSchema = z.object({
});

export const CreateMessageSchema = z.object({
    body: z.object({ text: z.string() }),
})