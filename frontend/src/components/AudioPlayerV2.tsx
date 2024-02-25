import {
  Forward5Outlined,
  PlayCircleOutlined,
  Replay5Outlined,
  StopCircleOutlined,
} from "@mui/icons-material";
import { Divider, IconButton, Stack } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useWavesurfer } from "@wavesurfer/react";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import RegionsPlugin, {
  Region,
  RegionParams,
} from "wavesurfer.js/dist/plugins/regions.esm.js";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline.esm.js";
import ZoomPlugin from "wavesurfer.js/dist/plugins/zoom.esm.js";
import { axiosInstance } from "../lib";
import { SubHeaderComponent } from "./SubHeaderComponent";
import { queryClient } from "../lib/queryClient";

interface AudioPlayerProps {
  audioFileId: string;
  filePath: string;
  peaks: (Float32Array | number[])[];
  duration: number;
  existingRegions: RegionParams[];
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

const deleteFile = async (audioFileId: string) => {
  console.log("Deleting file", audioFileId);
  try {
    await axiosInstance.delete("files/" + audioFileId);
    queryClient.invalidateQueries({ queryKey: ["files"] });
  } catch (e) {
    console.log("Error deleting file", e);
  }
};

const extractTextFromContent = (element: HTMLElement | undefined) => {
  if (!element) return "NO_CONTENT";
  return element.textContent ?? "NO_CONTENT";
};

const saveRegions = async (audioFileId: string, regions: Region[]) => {
  const regs = regions.map((region: Region) => {
    const contentText = extractTextFromContent(region.content);
    // if start and end are equal, then its a marker
    const end = region.end === region.start ? undefined : region.end;
    return {
      id: region.id,
      name: contentText,
      start: region.start,
      end: end,
      color: region.color,
    };
  });

  try {
    await axiosInstance.post("slices", {
      audioFileId,
      regions: regs,
    });
    queryClient.invalidateQueries({ queryKey: ["files"] });
  } catch (e) {
    console.log("Error saving regions", e);
  }
};

const removeAllRegions = async (audioFileId: string) => {
  try {
    await axiosInstance.delete("slices/" + audioFileId);
    queryClient.invalidateQueries({ queryKey: ["files"] });
  } catch (e) {
    console.log("Error removing regions", e);
  }
};

const removeRegion = async (audioFileId: string, regionId: string) => {
  try {
    const res = await axiosInstance.delete(
      "slices/" + audioFileId + "/" + regionId
    );
    const { sliceId } = res.data;
    return sliceId;
  } catch (e) {
    console.log("Error removing region", e);
  }
};

// Give regions a random color when they are created
const random = (min: number, max: number) => Math.random() * (max - min) + min;
const randomColor = () =>
  `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`;

export const AudioPlayerV2 = memo(
  ({
    audioFileId,
    filePath,
    peaks,
    duration,
    existingRegions,
  }: AudioPlayerProps) => {
    const url = useSignedUrl(filePath);
    const regionsPlugin = useMemo(() => RegionsPlugin.create(), []);
    const timelinePlugin = useMemo(() => TimelinePlugin.create(), []);
    const zoomPlugin = useMemo(() => ZoomPlugin.create({}), []);
    const plugins = useMemo(
      () => [regionsPlugin, zoomPlugin, timelinePlugin],
      [regionsPlugin, zoomPlugin, timelinePlugin]
    );
    const containerRef = useRef<HTMLDivElement>(null);

    const { wavesurfer, isPlaying } = useWavesurfer({
      container: containerRef,
      url: url,
      peaks: peaks,
      duration: duration, // Zoom not working with pre-decoded peaks
      plugins: plugins,
      interact: true, // when interact is false, regions have correct start point on click
    });

    useEffect(() => {
      if (!wavesurfer) return;
      console.log("Main useEffect running.");
      wavesurfer.setVolume(0.2);

      const unsubInteraction = wavesurfer.on("interaction", () => {
        console.log("interaction");
      });
      const unsubDecode = wavesurfer.on("decode", () => {
        console.log("decode");
      });

      const unsubRedrawComplete = wavesurfer.on("redrawcomplete", () => {
        console.log("redrawcomplete");
      });

      const unsubReady = wavesurfer.on("ready", () => {
        console.log("ready");
      });

      wavesurfer.on("dblclick", (event) => {
        console.log("dblclick", event);
      });

      return () => {
        console.log("Destroying wavesurfer and unsubscribing events");
        unsubInteraction();
        unsubRedrawComplete();
        unsubDecode();
        unsubReady();
        wavesurfer.destroy();
      };
    }, [existingRegions, regionsPlugin, wavesurfer]);

    useEffect(() => {
      if (!regionsPlugin) return;
      regionsPlugin.on("region-updated", (region: Region) => {
        console.log("Region updated", region);
      });

      regionsPlugin.on("region-clicked", (region: Region) => {
        console.log("Region clicked", region.id, region.start);
        region.play();
      });

      regionsPlugin.on("region-double-clicked", async (region: Region) => {
        console.log("Region double clicked", region.id, region.start);
      });
      regionsPlugin.on("region-in", (region: Region) => {
        console.log("Region in", region.id);
      });

      regionsPlugin.on("region-out", (region: Region) => {
        console.log("Region out", region.id);
      });
      return () => {
        regionsPlugin.destroy();
      };
    }, [audioFileId, duration, regionsPlugin]);

    const onPlayPause = useCallback(() => {
      wavesurfer && wavesurfer.playPause();
    }, [wavesurfer]);

    return (
      <Stack direction="column" width={"100%"} height={"100%"}>
        <SubHeaderComponent title="Some Random File Title" />
        <Divider />
        <div ref={containerRef} style={{ width: "100%", padding: "16px" }} />
        <Divider />
        <AudioControls onPlayPause={onPlayPause} isPlaying={isPlaying} />
      </Stack>
    );
  }
);

interface AudioControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onAddRegion?: (content: string) => void;
  onAddMarker?: (content: string) => void;
  onSaveRegions?: () => void;
  onRemoveAllRegions?: () => void;
}

const AudioControls = (props: AudioControlsProps) => {
  return (
    <Stack direction="row" width={"100%"} justifyContent="center">
      <IconButton>
        <Replay5Outlined />
      </IconButton>
      <IconButton onClick={props.onPlayPause}>
        <PlayPauseIcon isPlaying={props.isPlaying} />
      </IconButton>
      <IconButton>
        <Forward5Outlined />
      </IconButton>
    </Stack>
  );
};

const PlayPauseIcon = ({ isPlaying }: { isPlaying: boolean }) => {
  return isPlaying ? (
    <StopCircleOutlined fontSize="large" />
  ) : (
    <PlayCircleOutlined fontSize="large" />
  );
};
