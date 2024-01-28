// AxiosProvider.tsx

import { useAuth0 } from "@auth0/auth0-react";
import { CircularProgress } from "@mui/material";
import { useState, useEffect } from "react";
import { axiosInstance } from ".";

export const AxiosProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, getAccessTokenSilently, isLoading } = useAuth0();
  const [isInterceptorSet, setIsInterceptorSet] = useState(false);

  useEffect(() => {
    const setAuthToken = async () => {
      if (isAuthenticated && !isLoading) {
        const token = await getAccessTokenSilently();
        axiosInstance.interceptors.request.use((config) => {
          config.headers.Authorization = `Bearer ${token}`;
          return config;
        });
        setIsInterceptorSet(true);
      }
    };

    setAuthToken();
  }, [isAuthenticated, isLoading, getAccessTokenSilently]);

  if (!isInterceptorSet && isAuthenticated && !isLoading) {
    return <CircularProgress />; // Or any other loading indicator
  }

  return <>{children}</>;
};
