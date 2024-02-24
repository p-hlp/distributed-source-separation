import { Box, Divider, Stack } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { HeaderComponent } from "../components/HeaderComponent";
import { useActiveFileStore } from "../store/activeFileStore";
import { DetailsContainer } from "./DetailsContainer";
import { FileContainer } from "./FileContainer";
import { PlayerContainer } from "./PlayerContainer";
import { libraryApi } from "./api/libraryApi";

export const LibraryContainer = () => {
  const routeApi = getRouteApi("/:libraryId");
  const { libraryId } = routeApi.useParams();
  const api = libraryApi();
  const fileId = useActiveFileStore.use.fileId();

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
        <Box sx={{ height: "35%" }}>
          <PlayerContainerWrapper fileId={fileId} libraryId={library.id} />
        </Box>
        <Divider />
        <Stack direction="row" spacing={0} sx={{ height: "65%" }}>
          <Stack direction="row" sx={{ width: "100%", height: "100%" }}>
            <FileContainer libraryId={library.id} />
            <Divider orientation="vertical" flexItem />
            <DetailsContainer />
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};

interface PlayerContainerWrapperProps {
  libraryId: string;
  fileId: string | undefined;
}

const PlayerContainerWrapper = ({
  fileId,
  libraryId,
}: PlayerContainerWrapperProps) => {
  return fileId ? (
    <PlayerContainer libraryId={libraryId} fileId={fileId} />
  ) : (
    <Box p={2}>No file selected.</Box>
  );
};
