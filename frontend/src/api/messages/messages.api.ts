import { useMutation, useQuery } from "@tanstack/react-query";
import { Message } from "../../shared/types/Message";
import { env } from "../../shared/env/env";
import { parseResponse } from "./helpers/parseResponse";

export function useMessages() {
    return useQuery<Message[]>({
        queryKey: ['messages'],
        queryFn: async () => {
            return fetch(`${env.API_URL}/messages`, {
                mode: 'cors'
            }).then(res => res.json()).then(parseResponse)
        }
    })
}
export type TCreateMessage = {
    text: string
}
export function useCreateMessage () {
    return useMutation({
        mutationKey: ['create-message'],
        mutationFn: async (message: TCreateMessage) => {
            return fetch(`${env.API_URL}/messages`, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(message)
            }).then(res => res.json()).then(parseResponse)
        }
    })
}
