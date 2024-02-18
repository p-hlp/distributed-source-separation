import { PlayCircleOutline, StopCircleOutlined } from "@mui/icons-material";
import { IconButton, Stack } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useWavesurfer } from "@wavesurfer/react";
import { memo, useCallback, useEffect, useRef } from "react";
import { axiosInstance } from "../lib";

interface AudioPlayerProps {
  filePath: string;
  peaks: (Float32Array | number[])[];
  duration: number;
}

const useSignedUrl = (filePath: string) => {
  const { data } = useQuery({
    queryKey: ["signedFileUrl", filePath],
    queryFn: async () => {
      const response = await axiosInstance.get<{ url: string }>(
        "signed/" + filePath
      );
      return response.data.url;
    },
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
  return data;
};

export const AudioPlayer = memo(
  ({ filePath, peaks, duration }: AudioPlayerProps) => {
    const url = useSignedUrl(filePath);

    const containerRef = useRef<HTMLDivElement>(null);

    const { wavesurfer, isPlaying } = useWavesurfer({
      container: containerRef,
      height: 64,
      url: url,
      peaks: peaks,
      duration: duration,
      // plugins: useMemo(() => [Timeline.create(), Regions.create()], []),
    });

    useEffect(() => {
      if (!wavesurfer) return;
      wavesurfer.setVolume(0.2);

      const unsubInteraction = wavesurfer.on("interaction", () => {
        wavesurfer.play();
      });

      return () => {
        unsubInteraction();
        wavesurfer.destroy();
      };
    }, [wavesurfer]);

    const onPlayPause = useCallback(() => {
      wavesurfer && wavesurfer.playPause();
    }, [wavesurfer]);

    return (
      <Stack
        spacing={2}
        sx={{
          width: "100%",
        }}
        direction="row"
        alignItems="center"
        pb={2}
      >
        <IconButton
          onClick={onPlayPause}
          sx={{ width: "48px", height: "48px" }}
        >
          {isPlaying ? (
            <StopCircleOutlined fontSize="large" />
          ) : (
            <PlayCircleOutline fontSize="large" />
          )}
        </IconButton>
        <div ref={containerRef} style={{ flexGrow: 1 }} />
      </Stack>
    );
  }
);
