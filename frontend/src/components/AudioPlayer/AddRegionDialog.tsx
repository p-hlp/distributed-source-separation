import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  styled,
} from "@mui/material";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

interface AddRegionDialogProps {
  open: boolean;
  handleClose: () => void;
  regionType: RegionType;
  onAddRegion: (
    regionType: RegionType,
    regionName: string,
    regionLength?: number
  ) => void;
}

export type RegionType = "marker" | "region" | undefined;

const NumberInput = styled(TextField)(() => ({
  "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
    display: "none",
  },
  "& input[type=number]": {
    MozAppearance: "textfield",
  },
}));

const validationSchema = z.object({
  name: z
    .string()
    .transform((str) => str.trim())
    .refine((val) => val.length > 0, { message: "Name is required" }),
  length: z.number().gt(0.0, { message: "Length must be greater than 0" }),
});

type Inputs = {
  name: string;
  length: number | undefined;
};

export const AddRegionDialog = ({
  open,
  handleClose,
  onAddRegion,
  regionType,
}: AddRegionDialogProps) => {
  const title = regionType === "marker" ? "Add Marker" : "Add Region";

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Inputs>({
    defaultValues: { name: "", length: undefined },
    resolver: zodResolver(validationSchema),
  });

  const onClose = () => {
    reset();
    handleClose();
  };

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    onAddRegion(regionType, data.name.trim(), data.length);
    onClose();
  };

  if (!regionType) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { minWidth: "20%" } }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent dividers sx={{ pb: 4 }}>
          <TextField
            {...register("name", { required: true })}
            margin="dense"
            id="name"
            label="Name"
            type="text"
            variant="standard"
            fullWidth
            required
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
          />
          {regionType === "region" && (
            <NumberInput
              {...register("length", { required: true, valueAsNumber: true })}
              margin="dense"
              id="length"
              label="Duration in seconds"
              type="decimal"
              variant="standard"
              fullWidth
              required
              error={Boolean(errors.length)}
              helperText={errors.length?.message}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Add
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
