import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { Edit as EditIcon } from "@mui/icons-material";
import ExpenseFilters from "../components/ExpenseFilters";
import ExpenseForm from "../components/ExpenseForm";
import { useAppDispatch, useAppSelector } from "../store";
import { fetchExpenses, setLimit, setPage } from "../store/expensesSlice";
import { deleteExpense } from "../services/endpoints";
import type { Expense } from "../types";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function categoryName(expense: Expense): string {
  const category = expense.category;
  if (!category) return "Uncategorized";
  return typeof category === "string" ? category : category.name;
}

export default function Expenses() {
  const { expenses, loading, error, total, pages, filters } = useAppSelector(
    (state) => state.expenses
  );
  const dispatch = useAppDispatch();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  useEffect(() => {
    dispatch(fetchExpenses());
  }, [dispatch, filters]);

  const refresh = () => dispatch(fetchExpenses());

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(expense: Expense) {
    setEditing(expense);
    setFormOpen(true);
  }

  async function handleDelete(id: string) {
    // window.confirm is the zero-dependency way; swap for a MUI Dialog later.
    if (!window.confirm("Delete this expense?")) return;
    await deleteExpense(id);
    refresh();
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>Expenses</Typography>
        <Button variant="contained" onClick={openCreate}>Add expense</Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
        {total} record(s) · page {filters.page} of {pages}
      </Typography>

      <ExpenseFilters />

      {loading && <CircularProgress sx={{ my: 4, display: "block", mx: "auto" }} />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && expenses.length === 0 && (
        <Typography sx={{ py: 4 }} color="text.secondary">
          No expenses match these filters.
        </Typography>
      )}

      {!loading && !error && expenses.length > 0 && (
        <>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense._id}>
                    <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                    <TableCell>{expense.title}</TableCell>
                    <TableCell>{categoryName(expense)}</TableCell>
                    <TableCell>{expense.paymentMethod}</TableCell>
                    <TableCell align="right">{currency.format(expense.amount)}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEdit(expense)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(expense._id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: "flex", flexDirection: "row", gap: 2, alignItems: "center", mt: 2 }}>
            <Pagination
              count={pages}
              page={filters.page}
              onChange={(_, value) => dispatch(setPage(value))}
              color="primary"
            />
            <select
              value={filters.limit}
              onChange={(e) => dispatch(setLimit(Number(e.target.value)))}
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </Box>
        </>
      )}
      
      <ExpenseForm
        open={formOpen}
        initial={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => { setFormOpen(false); refresh(); }}
      />
    </Paper>
  );
}