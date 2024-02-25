import { Box, Divider, Stack } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { HeaderComponent } from "../components/HeaderComponent";
import { DetailsContainer } from "../pages/DetailsContainer";
import { FileContainer } from "../pages/FileContainer";
import { PlayerContainer } from "../pages/PlayerContainer";
import { libraryApi } from "../pages/api/libraryApi";

export const LibraryComponent = () => {
  const routeApi = getRouteApi("/:libraryId");
  const { libraryId } = routeApi.useParams();
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
        <Box sx={{ height: "35%" }}>
          <PlayerContainer />
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

export const LibraryErrorComponent = () => {
  return <div>Error in LibraryRoute Components</div>;
};
