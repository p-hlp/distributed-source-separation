import React from "react";
import ReactDOM from "react-dom/client";

import { Auth0Provider } from "@auth0/auth0-react";
import { ThemeProvider } from "@emotion/react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { CssBaseline, createTheme } from "@mui/material";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AppRoutes } from "./AppRoutes";
import "./global.css";
import { AxiosProvider } from "./lib";
import { SSEProvider } from "./providers/SSEProvider";
import { queryClient } from "./lib/queryClient";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
  typography: {
    fontFamily: "monospace",
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
              <AppRoutes />
              <ReactQueryDevtools initialIsOpen={false} />
            </SSEProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </AxiosProvider>
    </Auth0Provider>
  </React.StrictMode>
);
