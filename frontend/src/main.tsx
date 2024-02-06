import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";

import { Auth0Provider, withAuthenticationRequired } from "@auth0/auth0-react";
import { ThemeProvider } from "@emotion/react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { CssBaseline, createTheme } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ToastContainer } from "react-toastify";
import { App } from "./App";
import "./global.css";
import { AxiosProvider } from "./lib";
import { SSEProvider } from "./providers/SSEProvider";

const rootRoute = createRootRoute();

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: withAuthenticationRequired(App),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  // ...otherRoutes
]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultStaleTime: 5000,
});

export const queryClient = new QueryClient();

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      }}
    >
      <AxiosProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={darkTheme}>
            <SSEProvider>
              <CssBaseline />
              <RouterProvider router={router} />
              <ToastContainer
                theme="dark"
                position="top-center"
                closeOnClick
                autoClose={3000}
                hideProgressBar
              />
              <ReactQueryDevtools initialIsOpen={false} />
            </SSEProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </AxiosProvider>
    </Auth0Provider>
  </React.StrictMode>
);
