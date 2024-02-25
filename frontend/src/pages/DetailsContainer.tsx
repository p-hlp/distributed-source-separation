import { Box, Divider, Stack } from "@mui/material";
import { FileActions } from "./FileActions/FileActions";
import { FileDetails } from "./FileDetails/FileDetails";
import { FileTranscription } from "./FileTranscription/FileTranscription";

export const DetailsContainer = () => {
  return (
    <Stack direction="column" p={0} width={"50%"}>
      <Stack direction="row" spacing={0} height={"60%"}>
        <Box width={"50%"}>
          <FileDetails />
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box width={"50%"}>
          <FileActions />
        </Box>
      </Stack>
      <Divider />
      <Box height={"40%"}>
        <FileTranscription />
      </Box>
    </Stack>
  );
};
