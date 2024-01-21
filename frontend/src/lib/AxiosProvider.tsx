import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { axiosInstance } from "./axios";

export const AxiosProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    if (isAuthenticated) {
      const setAuthToken = async () => {
        const token = await getAccessTokenSilently();
        axiosInstance.interceptors.request.use((config) => {
          config.headers.Authorization = `Bearer ${token}`;
          return config;
        });
      };
      setAuthToken();
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  return <>{children}</>;
};
