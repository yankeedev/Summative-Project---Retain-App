import { useEffect } from "react";
import {
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { fetchExpenses, useAppDispatch, useAppSelector } from "../store";
import type { Expense } from "../types";

// reusable formatter
const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
function categoryName(expense: Expense): string {
  return typeof expense.category === "string"
    ? expense.category
    : expense.category.name;
}
export default function Expenses() {
  const { expenses, loading, error, total, pages, filters } = useAppSelector(
    (state) => state.expenses
  );

  // useAppDispatch 
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchExpenses());
  }, [dispatch, filters]);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Expenses
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {total} record(s) · page {filters.page} of {pages}
      </Typography>
      {loading && <CircularProgress sx={{ my: 4, display: "block", mx: "auto" }} />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && expenses.length === 0 && (
        <Typography sx={{ py: 4 }} color="text.secondary">
          No expenses yet.
        </Typography>
      )}
      {!loading && !error && expenses.length > 0 && (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense._id}>
                  {/* ISO "YYYY-MM-DD"*/}
                  <TableCell>
                    {new Date(expense.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{expense.title}</TableCell>
                  <TableCell>{categoryName(expense)}</TableCell>
                  <TableCell>{expense.paymentMethod}</TableCell>
                  <TableCell align="right">
                    {currency.format(expense.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}