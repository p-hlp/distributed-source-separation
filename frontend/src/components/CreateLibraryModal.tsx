import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import React from "react";
import { axiosInstance } from "../lib";
import { queryClient } from "../lib/queryClient";
import { useActiveLibraryStore } from "../store/activeLibraryStore";

interface CreateLibraryModalProps {
  open: boolean;
  handleClose: () => void;
}

export const CreateLibraryModal = ({
  open,
  handleClose,
}: CreateLibraryModalProps) => {
  const setLibrary = useActiveLibraryStore.use.setLibrary();
  const navigate = useNavigate();
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        component: "form",
        sx: { minWidth: "20%" },
        onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const formJson = Object.fromEntries((formData as any).entries());
          const name = formJson.name;
          const description = formJson.description;
          const res = await axiosInstance.post("/api/libraries", {
            name,
            description,
          });
          await queryClient.invalidateQueries({ queryKey: ["libraries"] });
          setLibrary(res.data.id);
          navigate({ to: `/${res.data.id}` });
          handleClose();
        },
      }}
    >
      <DialogTitle>Create Library</DialogTitle>
      <DialogContent dividers sx={{ pb: 4 }}>
        <TextField
          autoFocus
          required
          margin="dense"
          id="name"
          name="name"
          label="Name"
          type="text"
          fullWidth
          variant="standard"
        />
        <TextField
          autoFocus
          margin="dense"
          id="name"
          name="description"
          label="Description"
          type="text"
          fullWidth
          variant="standard"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button type="submit" variant="contained">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};
