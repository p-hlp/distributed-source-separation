import { Delete } from "@mui/icons-material";
import { IconButton, Toolbar, Typography } from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { queryClient } from "../main";
import { libraryApi } from "../pages/api/libraryApi";
import { useActiveLibraryStore } from "../store/activeLibraryStore";
import { Library } from "../types";

const formatTitle = (name: string, description?: string) => {
  return description ? `${name} - ${description}` : name;
};

interface Props {
  library: Library;
}

export const HeaderComponent = ({
  library: { id, name, description },
}: Props) => {
  const api = libraryApi();
  // const resetFile = useActiveFileStore.use.resetFile();
  const resetLibrary = useActiveLibraryStore.use.resetLibrary();

  const navigate = useNavigate();

  const handleDeleteLibrary = async () => {
    await api.DELETE(id);
    // resetFile();
    resetLibrary();
    await queryClient.invalidateQueries({ queryKey: ["libraries"] });
    navigate({ to: "/" });
  };

  return (
    <Toolbar disableGutters sx={{ pl: 2, pr: 2 }}>
      <Typography variant="subtitle1" fontWeight={700} flexGrow={1}>
        {formatTitle(name, description)}
      </Typography>
      <IconButton
        edge="end"
        aria-label="delete"
        onClick={handleDeleteLibrary}
        size="large"
      >
        <Delete />
      </IconButton>
    </Toolbar>
  );
};
