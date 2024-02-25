import { Stack, Typography } from "@mui/material";

export const IndexComponent = () => {
  return (
    <Stack direction="column" spacing={2} p={2}>
      <h3>Welcome to NeuraLib</h3>
      <Typography variant="body1">Create a library to get started!</Typography>
    </Stack>
  );
};
