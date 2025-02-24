import { useQueryClient } from "@tanstack/react-query";
import { env } from "../shared/env/env";
import { Message } from "../shared/types/Message";
import { useEffect } from "react";
console.log('env', env)

class ChatMessagesManager {
    url: string;
    maxRetries: number;
    retryDelay: number;
    retries: number;
    socket: WebSocket | null;
    callback: ((message: Message) => void) | undefined = undefined;
    constructor(url: string, maxRetries = 5, retryDelay = 1000) {
        this.url = url;
        this.maxRetries = maxRetries; 
        this.retryDelay = retryDelay; 
        this.retries = 0; 
        this.socket = null;
        this.connect();
    }

    connect() {
        console.log("Connecting to WebSocket...");
        this.socket?.removeEventListener("message", this.listener);
        this.socket = new WebSocket(this.url);

        this.socket.addEventListener("open", () => {
            console.log("WebSocket connected");
            this.retries = 0;
        });

        this.socket.addEventListener("message", this.listener);

        this.socket.addEventListener("close", (event) => {
            console.log("WebSocket closed");
            this.reconnect();
        });

        this.socket.addEventListener("error", (error) => {
            console.error("WebSocket error:", error);
            this.socket?.close(); 
        });
    }

    reconnect() {
        let delay = this.retryDelay * Math.pow(2, this.retries); 
        console.log(`Reconnecting in ${delay / 1000} seconds...`);
        setTimeout(() => this.connect(), delay);
        this.retries++;
    }

    close() {
        console.log("Manually closing WebSocket...");
        this.socket?.close();
    }
    listener = (event: MessageEvent) => {
        console.log('event', event)
        if (this.callback)  {
            this.callback(JSON.parse(event.data));
        }
    }
    listen(callback: (data: Message) => void) {
        this.callback = callback;
    }
}

export const chatManager = new ChatMessagesManager(env.WS_URL!);

export function useWebSocketQuery(queryKey: string[]) {
    const queryClient = useQueryClient();
    useEffect(() => {
        chatManager.listen((newData) => {
            queryClient.setQueryData(queryKey, (oldData: any[]) => {
                return oldData ? [...oldData, newData] : [newData];
            });
        });
    })
}