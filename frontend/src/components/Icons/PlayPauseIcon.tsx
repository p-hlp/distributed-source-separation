import { PauseRounded, PlayArrowRounded } from "@mui/icons-material";
import { useIconColors } from "./useIconColors";

export const PlayPauseIcon = ({ isPlaying }: { isPlaying: boolean }) => {
  const { mainIconColor } = useIconColors();
  return !isPlaying ? (
    <PlayArrowRounded sx={{ fontSize: "2.5rem" }} htmlColor={mainIconColor} />
  ) : (
    <PauseRounded sx={{ fontSize: "2.5rem" }} htmlColor={mainIconColor} />
  );
};
