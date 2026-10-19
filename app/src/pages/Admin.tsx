import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import {
  createCategory,
  deleteCategory,
  getAdminInsights,
  listCategories,
  updateCategory,
} from "../services/mockApi";
import type { AdminInsights, Category, CategoryUsage } from "../types";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Admin() {
  const [insights, setInsights] = useState<AdminInsights | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // add/edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const [data, cats] = await Promise.all([getAdminInsights(), listCategories()]);
      setInsights(data);
      setCategories(cats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load admin data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function openCreate(): void {
    setEditing(null);
    setNameInput("");
    setDialogError(null);
    setDialogOpen(true);
  }

  function openEdit(category: Category): void {
    setEditing(category);
    setNameInput(category.name);
    setDialogError(null);
    setDialogOpen(true);
  }

  async function handleSaveCategory(): Promise<void> {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setDialogError("Name is required");
      return;
    }
    setSaving(true);
    setDialogError(null);
    try {
      if (editing) await updateCategory(editing._id, trimmed);
      else await createCategory(trimmed);
      await load();
      setDialogOpen(false);
    } catch (err) {
      setDialogError(err instanceof Error ? err.message : "Could not save category");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category: Category): Promise<void> {
    if (!window.confirm(`Delete "${category.name}"?`)) return;
    try {
      await deleteCategory(category._id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete category");
    }
  }

  const perCategory = insights?.perCategory ?? [];
  const richest = perCategory.reduce((max, c) => Math.max(max, c.total), 0);

  function usageRows(rows: CategoryUsage[]) {
    if (rows.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={3} align="center" sx={{ color: "text.secondary" }}>
            No data yet.
          </TableCell>
        </TableRow>
      );
    }
    return rows.map((c) => (
      <TableRow key={c.name}>
        <TableCell>{c.name}</TableCell>
        <TableCell align="right">{c.count}</TableCell>
        <TableCell align="right">{currency.format(c.total)}</TableCell>
      </TableRow>
    ));
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Admin panel
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add category
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {loading && <Alert severity="info" sx={{ mt: 2 }}>Loading...</Alert>}

      {/* platform KPIs */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 2,
          my: 3,
        }}
      >
        <Card variant="outlined">
          <CardContent>
            <Typography variant="body2" color="text.secondary">Registered users</Typography>
            <Typography variant="h6">{insights?.totalUsers ?? "—"}</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="body2" color="text.secondary">Expenses recorded</Typography>
            <Typography variant="h6">{insights?.totalExpenses ?? "—"}</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="body2" color="text.secondary">Total value</Typography>
            <Typography variant="h6">
              {insights ? currency.format(insights.totalValue) : "—"}
            </Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="body2" color="text.secondary">This month</Typography>
            <Typography variant="h6">{insights?.monthExpenses ?? "—"}</Typography>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { md: "1fr 1fr" }, gap: 3 }}>
        {/* spending by category */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>Spending by category</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {perCategory.map((c) => (
                    <TableRow key={c.name}>
                      <TableCell>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                          <span>{c.name}</span>
                          <LinearProgress
                            variant="determinate"
                            value={richest > 0 ? Math.round((c.total / richest) * 100) : 0}
                            sx={{ height: 6, borderRadius: 1 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="right">{c.count}</TableCell>
                      <TableCell align="right">{currency.format(c.total)}</TableCell>
                    </TableRow>
                  ))}
                  {perCategory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ color: "text.secondary" }}>
                        No expenses yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* category management */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>Categories</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category._id}>
                      <TableCell>
                        {category.name}
                        {category.isDefault && " (default)"}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(category)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip
                          title={category.isDefault ? "Default categories cannot be deleted" : "Delete"}
                        >
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              disabled={category.isDefault}
                              onClick={() => handleDelete(category)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* top / bottom categories */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>Top 5 categories</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>{usageRows(insights?.topCategories ?? [])}</TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>Bottom 5 categories</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>{usageRows(insights?.bottomCategories ?? [])}</TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* recent activity */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>Recent expenses</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell align="right">Date</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(insights?.recentExpenses ?? []).map((ex) => (
                    <TableRow key={ex._id}>
                      <TableCell>{ex.title}</TableCell>
                      <TableCell align="right">{shortDate(ex.date)}</TableCell>
                      <TableCell align="right">{currency.format(ex.amount)}</TableCell>
                    </TableRow>
                  ))}
                  {(insights?.recentExpenses.length ?? 0) === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ color: "text.secondary" }}>
                        No expenses yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>Recently registered users</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Email</TableCell>
                    <TableCell align="right">Joined</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(insights?.recentUsers ?? []).map((u) => (
                    <TableRow key={u._id}>
                      <TableCell>{u.name}</TableCell>
                      <TableCell align="right">{u.email}</TableCell>
                      <TableCell align="right">{shortDate(u.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                  {(insights?.recentUsers.length ?? 0) === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ color: "text.secondary" }}>
                        No users yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editing ? "Edit category" : "Add category"}</DialogTitle>
        <DialogContent>
          {dialogError && <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>}
          <TextField
            label="Name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            fullWidth
            autoFocus
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSaveCategory} variant="contained" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}