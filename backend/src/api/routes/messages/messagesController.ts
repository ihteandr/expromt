import { text, type Request, type RequestHandler, type Response } from "express";

import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { messagesService } from "@/api/services/messages/messages.service";

class MessagesController {
  public getAllMessages: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await messagesService.getAllMessages();
    return handleServiceResponse(serviceResponse, res);
  };

  public createMessage: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await messagesService.createMessage({ text: req.body.text });
    return handleServiceResponse(serviceResponse, res);
  };
}

export const messagesController = new MessagesController();
