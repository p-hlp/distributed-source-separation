import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  styled,
} from "@mui/material";
import { useState } from "react";

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

// T0DO Validation of required fields
export const AddRegionDialog = ({
  open,
  handleClose,
  onAddRegion,
  regionType,
}: AddRegionDialogProps) => {
  const [regionName, setRegionName] = useState<string>("");
  const [regionLength, setRegionLength] = useState<number | undefined>(
    undefined
  );

  const title = regionType === "marker" ? "Add Marker" : "Add Region";

  const handleCloseDialog = () => {
    // clear the form
    setRegionName("");
    setRegionLength(undefined);
    handleClose();
  };

  if (!regionType) return null;
  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
      PaperProps={{ sx: { minWidth: "20%" } }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers sx={{ pb: 4 }}>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Name"
          type="text"
          variant="standard"
          fullWidth
          required
          value={regionName}
          onChange={(e) => setRegionName(e.target.value)}
        />
        {regionType === "region" && (
          <NumberInput
            margin="dense"
            id="length"
            label="Length in seconds"
            type="decimal"
            variant="standard"
            fullWidth
            value={regionLength}
            onChange={(e) => setRegionLength(Number(e.target.value))}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={() => onAddRegion(regionType, regionName, regionLength)}
          variant="contained"
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};
