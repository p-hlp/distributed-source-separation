import { Box, IconButton, Stack } from "@mui/material";
import { FastForwardIcon, FastRewindIcon, PlayPauseIcon } from "../Icons";
import { AddMarkerIcon } from "../Icons/AddMarkerIcon";
import { AddRegionIcon } from "../Icons/AddRegionIcon";
import { VolumeControl } from "./VolumeControl";
import { ZoomControl } from "./ZoomControl";

interface AudioControlsProps {
  isPlaying: boolean;
  initVolume: number;
  initZoom: number;
  onPlayPause: () => void;
  onZoom?: (value: number) => void;
  onAddRegion?: () => void;
  onAddMarker?: () => void;
  onVolumeChange?: (volume: number) => void;
  on5Forward?: () => void;
  on5Backward?: () => void;
}

export const AudioControls = (props: AudioControlsProps) => {
  return (
    <Stack
      direction="row"
      width={"100%"}
      height={64}
      px={4}
      alignItems="center"
    >
      <Stack direction="row" width={360}>
        <ZoomControl initZoom={props.initZoom} onZoomChange={props.onZoom} />
        <IconButton onClick={props.onAddMarker}>
          <AddMarkerIcon />
        </IconButton>
        <IconButton onClick={props.onAddRegion}>
          <AddRegionIcon />
        </IconButton>
      </Stack>
      <Box flexGrow={1} />
      <IconButton onClick={props.on5Backward}>
        <FastRewindIcon />
      </IconButton>
      <IconButton onClick={props.onPlayPause}>
        <PlayPauseIcon isPlaying={props.isPlaying} />
      </IconButton>
      <IconButton onClick={props.on5Forward}>
        <FastForwardIcon />
      </IconButton>
      <Box flexGrow={1} />
      <Box width={180} />
      <VolumeControl
        initVolume={props.initVolume}
        onVolumeChange={props?.onVolumeChange}
      />
    </Stack>
  );
};
