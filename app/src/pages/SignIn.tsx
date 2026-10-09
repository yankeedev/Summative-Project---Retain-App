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
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // If the page was redirected here from a protected route, go back there.
  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault(); // stop the browser's default form reload
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password); // Context calls the mock API internally
      navigate(from, { replace: true });
    } catch (err) {
      
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>Sign in to Retain</Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}
             sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField label="Email" type="email" value={email}
                     onChange={(e) => setEmail(e.target.value)} required fullWidth />
          <TextField label="Password" type="password" value={password}
                     onChange={(e) => setPassword(e.target.value)} required fullWidth />
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 2 }}>
          No account? <Link component={RouterLink} to="/signup">Sign up</Link>
        </Typography>
      </Paper>
    </Box>
  );
}