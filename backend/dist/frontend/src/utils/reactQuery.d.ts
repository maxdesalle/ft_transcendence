import { QueryFunctionContext } from "react-query/types/core/types";
import { UseQueryOptions } from "react-query";
import { AxiosError, AxiosResponse } from "axios";
declare type QueryKeyT = [string, string | undefined | number];
declare type usePostConfig<T, S> = {
    updater?: ((oldData: T, newData: S) => T) | undefined;
    param?: string;
    invalidQueries?: string[];
};
export declare const fetcher: <T>({ queryKey, }: QueryFunctionContext<QueryKeyT>) => Promise<T>;
export declare const usePost: <T, S>(url: string, config: usePostConfig<T, S>) => import("react-query").UseMutationResult<AxiosResponse<any, any>, AxiosError<unknown, any>, T | S, unknown>;
export declare const useFetch: <T>(url: string | null, params?: string, config?: UseQueryOptions<T, Error, T, QueryKeyT>) => import("react-query").UseQueryResult<T, Error>;
export declare const useFetchById: <T>(url: string | null, params?: number, config?: UseQueryOptions<T, Error, T, QueryKeyT>) => import("react-query").UseQueryResult<T, Error>;
export declare const useUpdate: <T, S>(url: string, param?: string, updater?: (oldData: T, newData: S) => T) => import("react-query").UseMutationResult<AxiosResponse<any, any>, AxiosError<unknown, any>, T | S, unknown>;
export declare const useDelete: <T>(url: string, param?: string, updater?: (oldData: T, id: string | number) => T) => import("react-query").UseMutationResult<AxiosResponse<any, any>, AxiosError<unknown, any>, string | number | T, unknown>;
export {};
