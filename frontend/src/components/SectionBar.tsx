import { AppBar, Stack, Typography } from "@mui/material";

interface SectionBarProps {
  sectionTitle: string;
  endAdornment?: React.ReactNode;
}

export const SectionBar = ({ sectionTitle, endAdornment }: SectionBarProps) => {
  return (
    <AppBar position="sticky" color="transparent" elevation={0}>
      <Stack direction="row">
        <Typography variant="subtitle1" fontWeight={600} flexGrow={1} p={1}>
          {sectionTitle}
        </Typography>
        {endAdornment}
      </Stack>
    </AppBar>
  );
};
