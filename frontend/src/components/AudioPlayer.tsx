import { PlayCircleOutline, StopCircleOutlined } from "@mui/icons-material";
import { IconButton, Stack } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useWavesurfer } from "@wavesurfer/react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import RegionsPlugin, {
  Region,
  RegionParams,
} from "wavesurfer.js/dist/plugins/regions.esm.js";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline.esm.js";
import ZoomPlugin from "wavesurfer.js/dist/plugins/zoom.esm.js";
import { axiosInstance } from "../lib";
import { queryClient } from "../main";
import { AudioPlayerMenu } from "./AudioPlayerMenu";
import { TextInputForm } from "./TextInputForm";

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

export const AudioPlayer = memo(
  ({
    audioFileId,
    filePath,
    peaks,
    duration,
    existingRegions,
  }: AudioPlayerProps) => {
    const url = useSignedUrl(filePath);
    const [regions, setRegions] = useState<Region[]>([]);
    const regionsPlugin = useMemo(() => RegionsPlugin.create(), []);
    const timelinePlugin = useMemo(() => TimelinePlugin.create(), []);
    const zoomPlugin = useMemo(() => ZoomPlugin.create({}), []);
    const plugins = useMemo(
      () => [regionsPlugin, zoomPlugin, timelinePlugin],
      [regionsPlugin, zoomPlugin, timelinePlugin]
    );
    const containerRef = useRef<HTMLDivElement>(null);

    // Menu state
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(menuAnchorEl);

    const { wavesurfer, isPlaying } = useWavesurfer({
      container: containerRef,
      height: 64,
      // width: 1280,
      url: url,
      peaks: peaks,
      // autoCenter: false,
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
        // wavesurfer.play();
      });
      const unsubDecode = wavesurfer.on("decode", () => {
        console.log("decode");
      });

      const unsubRedrawComplete = wavesurfer.on("redrawcomplete", () => {
        console.log("redrawcomplete");
        console.log("RegionPlugin exists:", Boolean(regionsPlugin));
        console.log("Existing regions:", existingRegions.length);
        if (regionsPlugin && existingRegions.length > 0) {
          console.log("Setting existing regions");
          regionsPlugin.clearRegions();
          const newRegions: Region[] = [];
          existingRegions.forEach((region) => {
            const reg = regionsPlugin.addRegion(region);
            newRegions.push(reg);
          });
          setRegions(newRegions);
        }
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
        setRegions((prev) => {
          const index = prev.findIndex((r) => r.id === region.id);
          if (index === -1) return prev;
          prev[index] = region;
          return prev;
        });
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

    const handleAddRegion = useCallback(
      (content: string) => {
        if (!regionsPlugin || !wavesurfer) return;
        console.log("Trying to add region");
        const newRegion = regionsPlugin.addRegion({
          content: content,
          start: wavesurfer.getCurrentTime(),
          end: wavesurfer.getCurrentTime() + 30,
          color: randomColor(),
        });
        setRegions((prev) => [...prev, newRegion]);
      },
      [regionsPlugin, wavesurfer]
    );

    const handleAddMarker = useCallback(
      (content: string) => {
        if (!regionsPlugin || !wavesurfer) return;
        console.log("Trying to add marker");
        const newMarker = regionsPlugin.addRegion({
          content: content,
          start: wavesurfer.getCurrentTime(),
          color: randomColor(),
        });
        setRegions((prev) => [...prev, newMarker]);
      },
      [regionsPlugin, wavesurfer]
    );

    const handleSaveRegions = useCallback(async () => {
      await saveRegions(audioFileId, regions);
      console.log("Current state regions", regions);
    }, [regions, audioFileId]);

    const handleRemoveAllRegions = useCallback(async () => {
      await removeAllRegions(audioFileId);
      console.log("Current state regions", regions);
    }, [regions, audioFileId]);

    // Menu handlers
    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
      setMenuAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
      setMenuAnchorEl(null);
    };

    const menuItems = useMemo(() => {
      return [
        {
          label: "Export Regions",
          action: handleSaveRegions,
        },
        {
          label: "Remove Regions",
          action: handleRemoveAllRegions,
        },
        {
          label: "Delete File",
          action: () => deleteFile(audioFileId),
        },
      ];
    }, [handleSaveRegions, handleRemoveAllRegions, audioFileId]);

    return (
      <>
        <Stack
          spacing={2}
          sx={{
            width: "100%",
          }}
          direction="row"
          alignItems="center"
          py={2}
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
          <AudioPlayerMenu
            anchorEl={menuAnchorEl}
            isOpen={isMenuOpen}
            onOpen={handleMenuOpen}
            onClose={handleMenuClose}
            menuItems={menuItems}
          />
        </Stack>
        <TextInputForm
          buttonText="Add Region"
          label="Region Name"
          onClick={handleAddRegion}
        />
        <TextInputForm
          buttonText="Add Marker"
          label="Marker Name"
          onClick={handleAddMarker}
        />
      </>
    );
  }
);
