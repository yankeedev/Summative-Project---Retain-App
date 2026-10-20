import { useState, type FormEvent } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { changePassword, deleteAccount } from "../services/endpoints";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handlePasswordSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteAccount(): Promise<void> {
    const confirmed = window.confirm(
      "Delete your account? This permanently removes all of your expenses and budgets and cannot be undone."
    );
    if (!confirmed) return;

    setError(null);
    setDeleting(true);
    try {
      await deleteAccount();
      signOut();
      navigate("/signin", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete account");
      setDeleting(false);
    }
  }

  if (!user) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 720 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: "-0.03em" }}>
          Profile
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary", mt: 0.5 }}>
          Your account details and security settings.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {/* Account details */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Account
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, flexWrap: "wrap" }}>
          <Avatar
            alt={user.name}
            src="/user.svg"
            sx={{
              width: 64,
              height: 64,
              bgcolor: "background.default",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            {initials(user.name)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {user.name}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {user.email}
            </Typography>
            <Chip
              label={user.role}
              color={user.role === "admin" ? "primary" : "default"}
              size="small"
              sx={{ fontWeight: 700, textTransform: "capitalize", mt: 1 }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Change password */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          Change password
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          Choose a strong password of at least 6 characters.
        </Typography>

        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box
          component="form"
          onSubmit={handlePasswordSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 420 }}
        >
          <TextField
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            fullWidth
            size="small"
          />
          <TextField
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            fullWidth
            size="small"
          />
          <TextField
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            fullWidth
            size="small"
          />
          <Box>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{ fontWeight: 700, borderRadius: "10px" }}
            >
              {submitting ? "Updating..." : "Update password"}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Danger zone */}
      <Paper sx={{ p: 3, borderColor: "error.light" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: "error.main" }}>
          Delete account
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          Permanently remove your account along with all of your expenses and
          budgets. This cannot be undone.
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => void handleDeleteAccount()}
            disabled={deleting}
            sx={{ fontWeight: 700, borderRadius: "10px" }}
          >
            {deleting ? "Deleting..." : "Delete my account"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
