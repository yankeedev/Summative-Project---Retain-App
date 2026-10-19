
import { Paper, Typography } from "@mui/material";

export default function Placeholder({ title }: { title: string }) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5">{title}</Typography>
      <Typography variant="body2" color="text.secondary">
        Wired into the router — the real screen comes in a later step.
      </Typography>
    </Paper>
  );
}