import { Slider, SliderProps } from "@mui/material";
import { useIconColors } from "../Icons";

export const VolumeSlider = (props: SliderProps) => {
  const { sliderColor } = useIconColors();
  return (
    <Slider
      {...props}
      sx={{
        color: sliderColor,
        "& .MuiSlider-track": {
          border: "none",
        },
        "& .MuiSlider-thumb": {
          width: 16,
          height: 16,
          backgroundColor: "#fff",
          "&::before": {
            boxShadow: "0 4px 8px rgba(0,0,0,0.4)",
          },
          "&:hover, &.Mui-focusVisible, &.Mui-active": {
            boxShadow: "none",
          },
        },
      }}
    />
  );
};
