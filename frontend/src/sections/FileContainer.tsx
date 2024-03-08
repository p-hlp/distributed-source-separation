import { Box, Divider, Stack } from "@mui/material";
import { ChildrenFileList } from "./FileLists/ChildrenFileList";
import { MainFileList } from "./FileLists/MainFileList";

interface Props {
  libraryId: string;
}

export const FileContainer = ({ libraryId }: Props) => {
  return (
    <Stack direction="row" p={0} sx={{ width: "50%", height: "100%" }}>
      <Box sx={{ width: "50%" }}>
        <MainFileList libraryId={libraryId} />
      </Box>
      <Divider orientation="vertical" flexItem />
      <Box sx={{ width: "50%" }}>
        <ChildrenFileList />
      </Box>
    </Stack>
  );
};
