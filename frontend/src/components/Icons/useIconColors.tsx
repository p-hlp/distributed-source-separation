import { useTheme } from "@mui/material";

export const useIconColors = () => {
  const theme = useTheme();
  const mainIconColor = theme.palette.mode === "dark" ? "#fff" : "#000";
  const lightIconColor =
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";
  const sliderColor =
    theme.palette.mode === "dark" ? "#fff" : "rgba(0,0,0,0.87)";

  return {
    mainIconColor,
    lightIconColor,
    sliderColor,
  };
};
