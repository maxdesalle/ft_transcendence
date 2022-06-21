"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDelete = exports.useUpdate = exports.useFetchById = exports.useFetch = exports.usePost = exports.fetcher = void 0;
const api_1 = require("./api");
const react_query_1 = require("react-query");
const fetcher = async ({ queryKey, }) => {
    const [url, params] = queryKey;
    let fullUrl;
    if (params) {
        fullUrl = `${url}/${params}`;
    }
    else {
        fullUrl = url;
    }
    const res = await api_1.api.get(fullUrl);
    return res.data;
};
exports.fetcher = fetcher;
const useGenericMutation = (func, url, config) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)(func, {
        onMutate: async (data) => {
            await queryClient.cancelQueries([url, config.param]);
            const previousData = queryClient.getQueryData([url, config.param]);
            queryClient.setQueryData([url, config.param], (oldData) => {
                return config.updater
                    ? config.updater(oldData, data)
                    : data;
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
const usePost = (url, config) => {
    return useGenericMutation((data) => {
        return api_1.api.post(url, data);
    }, url, {
        param: config.param,
        updater: config.updater,
        invalidQueries: config.invalidQueries,
    });
};
exports.usePost = usePost;
const useFetch = (url, params, config) => {
    const context = (0, react_query_1.useQuery)([url, params], ({ queryKey, meta }) => (0, exports.fetcher)({ queryKey, meta }), Object.assign(Object.assign({}, config), { enabled: !!url }));
    return context;
};
exports.useFetch = useFetch;
const useFetchById = (url, params, config) => {
    const context = (0, react_query_1.useQuery)([url, params], ({ queryKey, meta }) => (0, exports.fetcher)({ queryKey, meta }), Object.assign(Object.assign({}, config), { enabled: !!params }));
    return context;
};
exports.useFetchById = useFetchById;
const useUpdate = (url, param, updater) => {
    return useGenericMutation((data) => api_1.api.patch(url, data), url, {
        param,
        updater,
    });
};
exports.useUpdate = useUpdate;
const useDelete = (url, param, updater) => {
    return useGenericMutation((id) => api_1.api.delete(`${url}/${id}`), url, {
        param,
        updater,
    });
};
exports.useDelete = useDelete;
//# sourceMappingURL=reactQuery.js.map