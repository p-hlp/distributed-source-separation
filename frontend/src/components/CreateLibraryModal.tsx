import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import React from "react";
import { axiosInstance } from "../lib";
import { queryClient } from "../main";

interface CreateLibraryModalProps {
  open: boolean;
  handleClose: () => void;
}

export const CreateLibraryModal = ({
  open,
  handleClose,
}: CreateLibraryModalProps) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        component: "form",
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
          console.log("res", res.data);
          handleClose();
        },
      }}
    >
      <DialogTitle>Create a Library</DialogTitle>
      <DialogContent>
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
