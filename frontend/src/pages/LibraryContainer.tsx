import { Box, Divider, Stack } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { libraryRoute } from "../AppRoutes";
import { HeaderComponent } from "../components/HeaderComponent";
import { libraryApi } from "./api/libraryApi";

export const LibraryContainer = () => {
  const { libraryId } = libraryRoute.useParams();
  const api = libraryApi();

  const { data: library } = useQuery({
    queryKey: ["library", libraryId],
    queryFn: () => api.GET(libraryId),
  });

  if (!library) return null;
  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <HeaderComponent library={library} />
      <Stack
        spacing={0}
        direction="column"
        sx={{ width: "100%", height: "100%" }}
      >
        <Divider />
        <Box flexGrow={1}>AudioPlayer</Box>
        <Divider />
        <Stack direction="row" spacing={0} flexGrow={2}>
          <Stack direction="row" flexGrow={1}>
            <FileContainer />
            <Divider orientation="vertical" flexItem />
            <DetailsContainer />
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};

const FileContainer = () => {
  return (
    <Stack direction="row" p={0} flexGrow={1}>
      <Box flexGrow={1}>Files</Box>
      <Divider orientation="vertical" flexItem />
      <Box flexGrow={1}>Files 2 </Box>
    </Stack>
  );
};

const DetailsContainer = () => {
  return (
    <Stack direction="column" p={0} flexGrow={1}>
      <Stack direction="row" spacing={0} flexGrow={1}>
        <Box flexGrow={1}>File Details</Box>
        <Divider orientation="vertical" flexItem />
        <Box flexGrow={1}>File Actions</Box>
      </Stack>
      <Divider />
      <Box flexGrow={1}>Transcription</Box>
    </Stack>
  );
};
