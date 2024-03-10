import { Divider, Stack } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { memo } from "react";
import { WaveAudioPlayer } from "../components/AudioPlayer/WaveAudioPlayer";
import { SubHeaderComponent } from "../components/SubHeaderComponent";
import { useActiveFileStore } from "../store/activeFileStore";
import { getAudioFile } from "./FileActions/api";

export const waveFormContainerHeight = 180;
const containerHeight = 64 + 64 + waveFormContainerHeight;

const NoFilePlaceholder = () => {
  return (
    <Stack direction="column" width={"100%"} height={containerHeight} p={2}>
      No file selected.
    </Stack>
  );
};

export const AudioPlayerContainer = memo(() => {
  const { fileId: mainFileId, childFileId } = useActiveFileStore();
  const fileId = childFileId ?? mainFileId;

  const { data: file } = useQuery({
    queryKey: ["audioFile", fileId],
    queryFn: () => getAudioFile(fileId!),
    enabled: Boolean(fileId),
  });

  if (!file) return <NoFilePlaceholder />;
  return (
    <Stack direction="column" height={containerHeight} width={"100%"}>
      <SubHeaderComponent
        title={file.name}
        fileId={file.id}
        isChildFile={!file.stems?.length}
      />
      <Divider />
      <WaveAudioPlayer file={file} />
    </Stack>
  );
});
