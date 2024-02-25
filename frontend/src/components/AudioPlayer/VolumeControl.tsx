import { VolumeDownRounded, VolumeUpRounded } from "@mui/icons-material";
import { Stack } from "@mui/material";
import { useState } from "react";
import { useIconColors } from "../Icons";
import { VolumeSlider } from "./VolumeSlider";

interface VolumeControlProps {
  initVolume: number;
  onVolumeChange: (volume: number) => void;
}

export const VolumeControl = ({
  initVolume,
  onVolumeChange,
}: VolumeControlProps) => {
  const { mainIconColor } = useIconColors();
  const [volume, setVolume] = useState<number>(initVolume);
  const handleVolumeChange = (_: Event, newValue: number | number[]) => {
    setVolume(newValue as number);
    onVolumeChange(newValue as number);
  };

  return (
    <Stack spacing={1} direction="row" alignItems="center" width={180}>
      <VolumeDownRounded htmlColor={mainIconColor} />
      <VolumeSlider value={volume} onChange={handleVolumeChange} />
      <VolumeUpRounded htmlColor={mainIconColor} />
    </Stack>
  );
};
