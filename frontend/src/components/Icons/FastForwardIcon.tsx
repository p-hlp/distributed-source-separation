import { FastForwardRounded } from "@mui/icons-material";
import { useIconColors } from "./useIconColors";

export const FastForwardIcon = () => {
  const { mainIconColor } = useIconColors();
  return <FastForwardRounded fontSize="large" htmlColor={mainIconColor} />;
};
