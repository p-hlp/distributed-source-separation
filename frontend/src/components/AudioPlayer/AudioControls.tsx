import {
  DisabledByDefault,
  Repeat,
  RepeatOn,
  SimCardDownload,
} from "@mui/icons-material";
import { Box, Checkbox, IconButton, Stack } from "@mui/material";
import { FastForwardIcon, FastRewindIcon, PlayPauseIcon } from "../Icons";
import { AddRegionIcon } from "../Icons/AddRegionIcon";
import { VolumeControl } from "./VolumeControl";
import { ZoomControl } from "./ZoomControl";

interface ZoomConfig {
  initZoom: number;
  zoomRange?: { min?: number; max?: number };
}

interface AudioControlsProps {
  isPlaying: boolean;
  initVolume: number;
  zoomConfig: ZoomConfig;
  onPlayPause: () => void;
  onZoom?: (value: number) => void;
  onAddRegion?: () => void;
  onAddMarker?: () => void;
  onExportRegions?: () => void;
  onClearRegions?: () => void;
  onVolumeChange?: (volume: number) => void;
  on5Forward?: () => void;
  on5Backward?: () => void;
}

export const AudioControls = (props: AudioControlsProps) => {
  const { initZoom, zoomRange } = props.zoomConfig;
  return (
    <Stack
      direction="row"
      width={"100%"}
      height={64}
      px={4}
      alignItems="center"
    >
      <Stack direction="row" width={360}>
        <ZoomControl
          initZoom={initZoom}
          zoomRange={zoomRange}
          onZoomChange={props.onZoom}
        />
        {/* <IconButton onClick={props.onAddMarker}>
          <AddMarkerIcon />
        </IconButton> */}
        <IconButton onClick={props.onAddRegion}>
          <AddRegionIcon />
        </IconButton>
        <IconButton onClick={props.onClearRegions}>
          <DisabledByDefault />
        </IconButton>
        <IconButton onClick={props.onExportRegions}>
          <SimCardDownload />
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
      <Box
        width={180}
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        pr={1}
      >
        <LoopCheckBox />
      </Box>
      <VolumeControl
        initVolume={props.initVolume}
        onVolumeChange={props?.onVolumeChange}
      />
    </Stack>
  );
};

interface LoopCheckBoxProps {
  isLooping: boolean;
  onLoopChange: (isLooping: boolean) => void;
}

const LoopCheckBox = () => {
  return (
    <Checkbox color="default" icon={<Repeat />} checkedIcon={<RepeatOn />} />
  );
};
