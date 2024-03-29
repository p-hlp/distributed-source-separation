import { Stack } from "@mui/material";
import { useState } from "react";
import { useIconColors } from "../../Icons";
import { ImpSlider } from "./ImpSlider";
import { TinyText } from "./TinyText";

interface ZoomControlProps {
  initZoom: number;
  onZoomChange?: (value: number) => void;
  zoomRange?: { min?: number; max?: number };
}

const defaultZoomRange = { min: 0, max: 200 };

export const ZoomControl = ({
  initZoom,
  zoomRange,
  onZoomChange,
}: ZoomControlProps) => {
  const { mainIconColor } = useIconColors();
  const [value, setValue] = useState<number>(initZoom);
  const range = { ...defaultZoomRange, ...zoomRange };

  const handleChange = (_: Event, newValue: number | number[]) => {
    setValue(newValue as number);
    if (!onZoomChange) return;
    onZoomChange(newValue as number);
  };

  return (
    <Stack spacing={2} pr={2} direction="row" alignItems="center" width={180}>
      <TinyText color={mainIconColor}>Zoom</TinyText>
      <ImpSlider
        value={value}
        onChange={handleChange}
        min={range.min}
        max={range.max}
      />
    </Stack>
  );
};
