import { Toolbar, Typography } from "@mui/material";

interface Props {
  title: string;
}

export const SubHeaderComponent = ({ title }: Props) => {
  return (
    <Toolbar disableGutters sx={{ pl: 2, pr: 2 }}>
      <Typography variant="subtitle1" flexGrow={1}>
        {title}
      </Typography>
    </Toolbar>
  );
};
