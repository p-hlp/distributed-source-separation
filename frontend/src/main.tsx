import { Auth0Provider, withAuthenticationRequired } from "@auth0/auth0-react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RootRoute, Router, RouterProvider } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { AxiosProvider } from "./lib/AxiosProvider";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const rootRoute = new RootRoute({
  component: withAuthenticationRequired(App),
});

const routeTree = rootRoute;

const router = new Router({
  routeTree,
  defaultPreload: "intent",
  defaultStaleTime: 5000,
});

export const queryClient = new QueryClient();

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
          <RouterProvider router={router} />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </AxiosProvider>
    </Auth0Provider>
  </React.StrictMode>
);
