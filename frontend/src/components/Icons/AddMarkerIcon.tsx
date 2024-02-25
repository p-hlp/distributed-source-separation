import { BookmarkAddRounded } from "@mui/icons-material";
import { useIconColors } from ".";

export const AddMarkerIcon = () => {
  const { mainIconColor } = useIconColors();
  return <BookmarkAddRounded htmlColor={mainIconColor} />;
};
