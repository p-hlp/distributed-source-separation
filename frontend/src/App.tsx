import { useAuth0 } from "@auth0/auth0-react";
import { Button, ButtonGroup } from "@mui/material";
import { LogoutButton } from "./components/LogoutButton";
import { axiosInstance } from "./lib/axios";

export const App = () => {
  const { isAuthenticated } = useAuth0();

  const handleTestRequest = async () => {
    const response = await axiosInstance.get("/");
    console.log(response);
  };
  return (
    <>
      <h1>Hello World</h1>
      <ButtonGroup variant="outlined" aria-label="outlined button group">
        <Button onClick={handleTestRequest}>GET Test</Button>
        {isAuthenticated && <LogoutButton />}
      </ButtonGroup>
    </>
  );
};
