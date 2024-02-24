import { Box, Divider, Stack } from "@mui/material";

export const DetailsContainer = () => {
  return (
    <Stack direction="column" p={0} width={"50%"}>
      <Stack direction="row" spacing={0} height={"60%"}>
        <Box width={"50%"}>File Details</Box>
        <Divider orientation="vertical" flexItem />
        <Box width={"50%"}>File Actions</Box>
      </Stack>
      <Divider />
      <Box height={"40%"}>Transcription</Box>
    </Stack>
  );
};
