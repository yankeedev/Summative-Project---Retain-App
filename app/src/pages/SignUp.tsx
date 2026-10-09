// SignUp.tsx — registration. New users are ALWAYS role "user" (the mock
// API sets that). After signing up they're logged in immediately.

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

    // Client-side check before calling the API:
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      await signUp(name, email, password);
      navigate("/dashboard", { replace: true }); // straight into the app
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>Create your account</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}
             sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField label="Name" value={name}
                     onChange={(e) => setName(e.target.value)} required fullWidth />
          <TextField label="Email" type="email" value={email}
                     onChange={(e) => setEmail(e.target.value)} required fullWidth />
          <TextField label="Password" type="password" value={password}
                     onChange={(e) => setPassword(e.target.value)} required fullWidth />
          <TextField label="Confirm password" type="password" value={confirm}
                     onChange={(e) => setConfirm(e.target.value)} required fullWidth />
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? "Creating account..." : "Sign up"}
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 2 }}>
          Already have an account? <Link component={RouterLink} to="/signin">Sign in</Link>
        </Typography>
      </Paper>
    </Box>
  );
}