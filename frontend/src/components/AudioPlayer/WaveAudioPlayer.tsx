import { Divider, Stack } from "@mui/material";
import { useWavesurfer } from "@wavesurfer/react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline.esm.js";
import { axiosInstance } from "../../lib";
import { queryClient } from "../../lib/queryClient";
import { waveFormContainerHeight } from "../../sections/PlayerContainer";
import { useActiveLibraryStore } from "../../store/activeLibraryStore";
import { AudioFileResponse } from "../../types";
import { AddRegionDialog, RegionType } from "./AddRegionDialog";
import { AudioControls } from "./AudioControls";
import { addMarker, addRegion } from "./regionUtils";
import { durationToMaxZoom, mapToExportedRegions } from "./utils";

const initVolume = 25;

interface Props {
  file: AudioFileResponse;
}

interface RegionDialogState {
  open: boolean;
  regionType: RegionType;
}

export const WaveAudioPlayer = memo(({ file }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentLibraryId = useActiveLibraryStore.use.libraryId();
  const [regionDialogState, setRegionDialogState] = useState<RegionDialogState>(
    { open: false, regionType: undefined }
  );

  const regionsPlugin = useMemo(() => RegionsPlugin.create(), []);
  const timelinePlugin = useMemo(() => TimelinePlugin.create(), []);
  const allPlugins = useMemo(
    () => [regionsPlugin, timelinePlugin],
    [regionsPlugin, timelinePlugin]
  );

  const peaks = useMemo(() => [file.waveform.data], [file.waveform.data]);

  const { wavesurfer, isPlaying } = useWavesurfer({
    container: containerRef,
    url: file.preSignedUrl,
    peaks: peaks,
    duration: file.duration,
    plugins: allPlugins,
    interact: true, // when interact is false, regions have correct start point on click
    normalize: true,
    // width: 1640,
  });

  // Main events
  useEffect(() => {
    if (!wavesurfer) return;
    wavesurfer.setVolume(initVolume / 100.0);

    return () => {
      console.log("Destroying wavesurfer and unsubscribing events");
      wavesurfer.destroy();
    };
  }, [wavesurfer]);

  const onPlayPause = useCallback(() => {
    wavesurfer && wavesurfer.playPause();
  }, [wavesurfer]);

  const onChangeVolume = useCallback(
    (volume: number) => {
      const newVolume = volume / 100.0;
      wavesurfer && wavesurfer.setVolume(newVolume);
    },
    [wavesurfer]
  );

  const onZoomChange = useCallback(
    (zoom: number) => {
      if (!wavesurfer) return;
      wavesurfer.zoom(zoom);
    },
    [wavesurfer]
  );

  const on5Forward = useCallback(() => {
    if (!wavesurfer) return;
    wavesurfer.skip(5);
  }, [wavesurfer]);

  const on5Backward = useCallback(() => {
    if (!wavesurfer) return;
    wavesurfer.skip(-5);
  }, [wavesurfer]);

  const onAddMarker = useCallback(() => {
    if (!wavesurfer) return;
    if (isPlaying) onPlayPause();
    setRegionDialogState({ open: true, regionType: "marker" });
  }, [isPlaying, onPlayPause, wavesurfer]);

  const onAddRegion = useCallback(() => {
    if (!wavesurfer) return;
    if (isPlaying) onPlayPause();
    setRegionDialogState({ open: true, regionType: "region" });
  }, [isPlaying, onPlayPause, wavesurfer]);

  const onClearRegions = useCallback(() => {
    if (!wavesurfer || !regionsPlugin) return;
    regionsPlugin.clearRegions();
  }, [regionsPlugin, wavesurfer]);

  const onExportRegions = useCallback(async () => {
    if (!regionsPlugin) return;
    const regions = regionsPlugin.getRegions();
    const exportedRegions = mapToExportedRegions(regions);
    if (!exportedRegions.length || !currentLibraryId) return;
    console.log("Exporting regions");
    const parentOrFileId = file.parentId || file.id;
    await axiosInstance.post(
      `/api/libraries/${currentLibraryId}/files/${file.id}/regions`,
      { parentId: parentOrFileId, regions: exportedRegions }
    );

    queryClient.invalidateQueries({ queryKey: ["childFiles", parentOrFileId] });
  }, [file, regionsPlugin, currentLibraryId]);

  return (
    <Stack direction="column" width={"100%"} height={"100%"}>
      <div
        ref={containerRef}
        style={{
          padding: "16px",
          height: waveFormContainerHeight,
        }}
      />
      <Divider />
      <AudioControls
        isPlaying={isPlaying}
        initVolume={initVolume}
        zoomConfig={{
          initZoom: 0,
          zoomRange: { max: durationToMaxZoom(file.duration) },
        }}
        on5Forward={on5Forward}
        on5Backward={on5Backward}
        onPlayPause={onPlayPause}
        onZoom={onZoomChange}
        onVolumeChange={onChangeVolume}
        onAddMarker={onAddMarker}
        onAddRegion={onAddRegion}
        onExportRegions={onExportRegions}
        onClearRegions={onClearRegions}
      />
      <AddRegionDialog
        open={regionDialogState.open}
        regionType={regionDialogState.regionType}
        handleClose={() => {
          setRegionDialogState({ open: false, regionType: undefined });
        }}
        onAddRegion={(type, name, length) => {
          if (!wavesurfer || !regionsPlugin) return;
          if (type && type === "marker")
            addMarker(name, wavesurfer, regionsPlugin);
          if (type && type === "region")
            addRegion(name, wavesurfer, regionsPlugin, length);
          setRegionDialogState({ open: false, regionType: undefined });
        }}
      />
    </Stack>
  );
});
