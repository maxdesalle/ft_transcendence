import { QueryFunctionContext } from "react-query/types/core/types";
import { api } from "./api";
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "react-query";
import { AxiosError, AxiosResponse } from "axios";

type QueryKeyT = [string, string | undefined | number];

type usePostConfig<T, S> = {
  updater?: ((oldData: T, newData: S) => T) | undefined;
  param?: string;
  invalidQueries?: string[];
};

export const fetcher = async <T>({
  queryKey,
}: QueryFunctionContext<QueryKeyT>): Promise<T> => {
  const [url, params] = queryKey;
  let fullUrl;
  if (params) {
    fullUrl = `${url}/${params}`;
  } else {
    fullUrl = url;
  }
  const res = await api.get<T>(fullUrl);
  return res.data;
};

//give an array on queries to invalidate
const useGenericMutation = <T, S>(
  func: (data: T | S) => Promise<AxiosResponse<S>>,
  url: string,
  config: usePostConfig<T, S>
) => {
  const queryClient = useQueryClient();
  return useMutation<AxiosResponse, AxiosError, T | S>(func, {
    onMutate: async (data) => {
      await queryClient.cancelQueries([url, config.param]);
      const previousData = queryClient.getQueryData([url, config.param]);
      queryClient.setQueryData<T>([url, config.param], (oldData) => {
        return config.updater
          ? config.updater(oldData!, data as S)
          : (data as T);
      });
      return previousData;
    },
    onError: (_, __, context) => {
      queryClient.setQueryData([url, config.param], context);
    },
    onSettled: () => {
      if (config.invalidQueries) {
        for (let querie of config.invalidQueries) {
          queryClient.invalidateQueries({
            predicate: (q) => q.queryKey[0] == querie,
          });
        }
      }
    },
  });
};

export const usePost = <T, S>(url: string, config: usePostConfig<T, S>) => {
  return useGenericMutation<T, S>(
    (data) => {
      return api.post<S>(url, data);
    },
    url,
    {
      param: config.param,
      updater: config.updater,
      invalidQueries: config.invalidQueries,
    }
  );
};

export const useFetch = <T>(
  url: string | null,
  params?: string,
  config?: UseQueryOptions<T, Error, T, QueryKeyT>
) => {
  const context = useQuery<T, Error, T, QueryKeyT>(
    [url!, params],
    ({ queryKey, meta }) => fetcher({ queryKey, meta }),
    {
      ...config,
      enabled: !!url,
    }
  );
  return context;
};

export const useFetchById = <T>(
  url: string | null,
  params?: number,
  config?: UseQueryOptions<T, Error, T, QueryKeyT>
) => {
  const context = useQuery<T, Error, T, QueryKeyT>(
    [url!, params],
    ({ queryKey, meta }) => fetcher({ queryKey, meta }),
    {
      ...config,
      enabled: !!params,
    }
  );
  return context;
};

// param looks a bit useless

export const useUpdate = <T, S>(
  url: string,
  param?: string,
  updater?: (oldData: T, newData: S) => T
) => {
  return useGenericMutation<T, S>((data) => api.patch(url, data), url, {
    param,
    updater,
  });
};

export const useDelete = <T>(
  url: string,
  param?: string,
  updater?: (oldData: T, id: string | number) => T
) => {
  return useGenericMutation((id) => api.delete(`${url}/${id}`), url, {
    param,
    updater,
  });
};
