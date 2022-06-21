"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
require("./index.css");
const client_1 = require("react-dom/client");
const App_1 = require("./App");
const react_query_1 = require("react-query");
const devtools_1 = require("react-query/devtools");
const react_router_dom_1 = require("react-router-dom");
const queryClient = new react_query_1.QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
        },
    },
});
client_1.default.createRoot(document.getElementById("root")).render(<react_1.default.StrictMode>
    <react_router_dom_1.BrowserRouter>
      <react_query_1.QueryClientProvider client={queryClient}>
        <App_1.default />
        <devtools_1.ReactQueryDevtools initialIsOpen={false}/>
      </react_query_1.QueryClientProvider>
    </react_router_dom_1.BrowserRouter>
  </react_1.default.StrictMode>);
//# sourceMappingURL=main.js.map