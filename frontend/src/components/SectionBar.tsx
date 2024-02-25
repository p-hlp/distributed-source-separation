import { AppBar, Typography } from "@mui/material";

interface SectionBarProps {
  sectionTitle: string;
}

export const SectionBar = ({ sectionTitle }: SectionBarProps) => {
  return (
    <AppBar position="sticky" color="transparent" elevation={0}>
      <Typography variant="subtitle1" fontWeight={600} flexGrow={1} p={1}>
        {sectionTitle}
      </Typography>
    </AppBar>
  );
};
