import { useAuth0 } from "@auth0/auth0-react";
import { CircularProgress } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { axiosInstance } from ".";
import { TokenContext } from "./TokenContext";

export const AxiosProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, getAccessTokenSilently, isLoading } = useAuth0();
  const [token, setToken] = useState<string | undefined>(undefined);
  const [isInterceptorSet, setIsInterceptorSet] = useState(false);

  const setAuthToken = useCallback(async () => {
    if (isAuthenticated && !isLoading) {
      try {
        const newToken = await getAccessTokenSilently();
        setToken(newToken); // Set the token in state
        const interceptorId = axiosInstance.interceptors.request.use(
          (config) => {
            config.headers.Authorization = `Bearer ${newToken}`;
            return config;
          }
        );
        setIsInterceptorSet(true);
        return interceptorId;
      } catch (error) {
        console.error("Error setting auth token", error);
      }
    }
  }, [isAuthenticated, isLoading, getAccessTokenSilently]);

  useEffect(() => {
    let interceptorId: number | undefined;
    (async () => {
      interceptorId = await setAuthToken();
    })();

    return () => {
      if (interceptorId) {
        axiosInstance.interceptors.request.eject(interceptorId);
      }
    };
  }, [setAuthToken]);

  if (!isInterceptorSet && isAuthenticated && !isLoading) {
    return <CircularProgress />;
  }

  return (
    <TokenContext.Provider value={{ accessToken: token }}>
      {children}
    </TokenContext.Provider>
  );
};
