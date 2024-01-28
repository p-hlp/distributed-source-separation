import { createContext, useContext } from "react";

interface TokenContextProps {
  accessToken: string | undefined;
}

export const TokenContext = createContext<TokenContextProps>({
  accessToken: undefined,
});

export const useAccessToken = () => useContext(TokenContext);
