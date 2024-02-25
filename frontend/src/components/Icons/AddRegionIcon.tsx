import { AddBoxRounded } from "@mui/icons-material";
import { useIconColors } from ".";

export const AddRegionIcon = () => {
  const { mainIconColor } = useIconColors();
  return <AddBoxRounded htmlColor={mainIconColor} />;
  //   return <Crop32Rounded fontSize="large" htmlColor={mainIconColor} />;
};
