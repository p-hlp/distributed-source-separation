import { FastRewindRounded } from "@mui/icons-material";
import { useIconColors } from "./useIconColors";

export const FastRewindIcon = () => {
  const { mainIconColor } = useIconColors();
  return <FastRewindRounded fontSize="large" htmlColor={mainIconColor} />;
};
