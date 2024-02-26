import { Divider, Stack } from "@mui/material";
import { useWavesurfer } from "@wavesurfer/react";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline.esm.js";
import { waveFormContainerHeight } from "../../pages/PlayerContainer";
import { AudioFileResponse } from "../../types";
import { AudioControls } from "./AudioControls";

const initVolume = 50;

interface Props {
  file: AudioFileResponse;
}

export const WaveAudioPlayer = memo(({ file }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);

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
    width: 1640,
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
      wavesurfer && wavesurfer.setVolume(volume / 100.0);
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

  console.log("container width", containerRef.current?.clientWidth);

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
        initVolume={50}
        initZoom={0}
        on5Forward={on5Forward}
        on5Backward={on5Backward}
        onPlayPause={onPlayPause}
        onZoom={onZoomChange}
        onVolumeChange={onChangeVolume}
        isPlaying={isPlaying}
      />
    </Stack>
  );
});
