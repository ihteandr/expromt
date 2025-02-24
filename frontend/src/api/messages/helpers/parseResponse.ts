
export type ApiResponse = {
    success: boolean;
    messagE: string;
    responseObject: any
}
export function parseResponse (res: ApiResponse) {
    return res.responseObject;
}