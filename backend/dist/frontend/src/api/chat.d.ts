import { Message, RoomInfoShort } from "../types/chat";
export declare const useCreateRoom: () => import("react-query").UseMutationResult<import("axios").AxiosResponse<any, any>, import("axios").AxiosError<unknown, any>, unknown, unknown>;
export declare const useGetRooms: () => import("react-query").UseQueryResult<RoomInfoShort[], Error>;
export declare const useAddUserToRoom: () => import("react-query").UseMutationResult<import("axios").AxiosResponse<any, any>, import("axios").AxiosError<unknown, any>, unknown, unknown>;
export declare const useGetMessagesByRoomId: (id: number | undefined) => {
    messages: Message[];
    data: undefined;
    error: null;
    isError: false;
    isIdle: true;
    isLoading: false;
    isLoadingError: false;
    isRefetchError: false;
    isSuccess: false;
    status: "idle";
    dataUpdatedAt: number;
    errorUpdatedAt: number;
    failureCount: number;
    errorUpdateCount: number;
    isFetched: boolean;
    isFetchedAfterMount: boolean;
    isFetching: boolean;
    isPlaceholderData: boolean;
    isPreviousData: boolean;
    isRefetching: boolean;
    isStale: boolean;
    refetch: <TPageData>(options?: import("react-query").RefetchOptions & import("react-query").RefetchQueryFilters<TPageData>) => Promise<import("react-query").QueryObserverResult<Message[], Error>>;
    remove: () => void;
} | {
    messages: Message[];
    data: undefined;
    error: Error;
    isError: true;
    isIdle: false;
    isLoading: false;
    isLoadingError: true;
    isRefetchError: false;
    isSuccess: false;
    status: "error";
    dataUpdatedAt: number;
    errorUpdatedAt: number;
    failureCount: number;
    errorUpdateCount: number;
    isFetched: boolean;
    isFetchedAfterMount: boolean;
    isFetching: boolean;
    isPlaceholderData: boolean;
    isPreviousData: boolean;
    isRefetching: boolean;
    isStale: boolean;
    refetch: <TPageData>(options?: import("react-query").RefetchOptions & import("react-query").RefetchQueryFilters<TPageData>) => Promise<import("react-query").QueryObserverResult<Message[], Error>>;
    remove: () => void;
} | {
    messages: Message[];
    data: undefined;
    error: null;
    isError: false;
    isIdle: false;
    isLoading: true;
    isLoadingError: false;
    isRefetchError: false;
    isSuccess: false;
    status: "loading";
    dataUpdatedAt: number;
    errorUpdatedAt: number;
    failureCount: number;
    errorUpdateCount: number;
    isFetched: boolean;
    isFetchedAfterMount: boolean;
    isFetching: boolean;
    isPlaceholderData: boolean;
    isPreviousData: boolean;
    isRefetching: boolean;
    isStale: boolean;
    refetch: <TPageData>(options?: import("react-query").RefetchOptions & import("react-query").RefetchQueryFilters<TPageData>) => Promise<import("react-query").QueryObserverResult<Message[], Error>>;
    remove: () => void;
} | {
    messages: Message[];
    data: Message[];
    error: Error;
    isError: true;
    isIdle: false;
    isLoading: false;
    isLoadingError: false;
    isRefetchError: true;
    isSuccess: false;
    status: "error";
    dataUpdatedAt: number;
    errorUpdatedAt: number;
    failureCount: number;
    errorUpdateCount: number;
    isFetched: boolean;
    isFetchedAfterMount: boolean;
    isFetching: boolean;
    isPlaceholderData: boolean;
    isPreviousData: boolean;
    isRefetching: boolean;
    isStale: boolean;
    refetch: <TPageData>(options?: import("react-query").RefetchOptions & import("react-query").RefetchQueryFilters<TPageData>) => Promise<import("react-query").QueryObserverResult<Message[], Error>>;
    remove: () => void;
} | {
    messages: Message[];
    data: Message[];
    error: null;
    isError: false;
    isIdle: false;
    isLoading: false;
    isLoadingError: false;
    isRefetchError: false;
    isSuccess: true;
    status: "success";
    dataUpdatedAt: number;
    errorUpdatedAt: number;
    failureCount: number;
    errorUpdateCount: number;
    isFetched: boolean;
    isFetchedAfterMount: boolean;
    isFetching: boolean;
    isPlaceholderData: boolean;
    isPreviousData: boolean;
    isRefetching: boolean;
    isStale: boolean;
    refetch: <TPageData>(options?: import("react-query").RefetchOptions & import("react-query").RefetchQueryFilters<TPageData>) => Promise<import("react-query").QueryObserverResult<Message[], Error>>;
    remove: () => void;
};
export declare const usePostDm: () => import("react-query").UseMutationResult<import("axios").AxiosResponse<any, any>, import("axios").AxiosError<unknown, any>, unknown, unknown>;
