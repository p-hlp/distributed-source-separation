import { Box, Divider, Stack } from "@mui/material";
import { SectionBar } from "../../components/SectionBar";

export const FileDetails = () => {
  return (
    <Stack width={"100%"} height={"100%"} direction="column">
      <SectionBar sectionTitle="File Details" />
      <Divider />
      <Box width={"100%"} height={"100%"} p={1}>
        Some details about the file
      </Box>
    </Stack>
  );
};
