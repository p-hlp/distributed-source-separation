import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { axiosInstance } from "../lib";
import { queryClient } from "../lib/queryClient";
import { useActiveLibraryStore } from "../store/activeLibraryStore";

interface CreateLibraryModalProps {
  open: boolean;
  handleClose: () => void;
}

const validationSchema = z.object({
  name: z
    .string()
    .transform((str) => str.trim())
    .refine((val) => val.length > 0, { message: "Name is required" }),
  description: z.string().optional(),
});

type Inputs = {
  name: string;
  description: string;
};

export const CreateLibraryModal = ({
  open,
  handleClose,
}: CreateLibraryModalProps) => {
  const { setLibrary } = useActiveLibraryStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Inputs>({
    defaultValues: { name: "", description: "" },
    resolver: zodResolver(validationSchema),
  });

  const onClose = () => {
    reset();
    handleClose();
  };

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    data.name = data.name.trim();
    data.description = data.description.trim();
    const res = await axiosInstance.post("/api/libraries", data);
    await queryClient.invalidateQueries({ queryKey: ["libraries"] });
    reset();
    setLibrary(res.data.id);
    navigate({ to: `/${res.data.id}` });
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Create Library</DialogTitle>
        <DialogContent dividers sx={{ pb: 4 }}>
          <TextField
            {...register("name", { required: true })}
            required
            margin="dense"
            id="name"
            name="name"
            label="Name"
            type="text"
            fullWidth
            variant="standard"
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
          />
          <TextField
            {...register("description")}
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
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
