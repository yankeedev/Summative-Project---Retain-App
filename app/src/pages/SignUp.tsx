import { useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SignUp() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      await signUp(name, email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ maxWidth: 420, mx: "auto", mt: { xs: 4, sm: 8 }, px: 2 }}>
      {/* Brand header */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
          Retain
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Personal Expense & Budget Manager
        </Typography>
      </Box>

      <Paper
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: "18px",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          Create your account
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2.5 }}>
          Get started tracking your finances in seconds.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: "10px" }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Confirm password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            fullWidth
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={submitting}
            sx={{ py: 1.25, mt: 1, borderRadius: "10px", fontWeight: 700 }}
          >
            {submitting ? "Creating account..." : "Sign up"}
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 3, textAlign: "center", color: "text.secondary" }}>
          Already have an account?{" "}
          <Link component={RouterLink} to="/signin" sx={{ fontWeight: 600, color: "primary.main" }}>
            Sign in
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
