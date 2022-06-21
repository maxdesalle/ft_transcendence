export declare const api: {
    get: <T>(url: string, params?: object) => Promise<import("axios").AxiosResponse<T, any>>;
    post: <T_1>(url: string, data: any) => Promise<import("axios").AxiosResponse<T_1, any>>;
    delete: <T_2>(url: string) => Promise<import("axios").AxiosResponse<T_2, any>>;
    patch: <T_3>(url: string, data: any) => Promise<import("axios").AxiosResponse<T_3, any>>;
};
