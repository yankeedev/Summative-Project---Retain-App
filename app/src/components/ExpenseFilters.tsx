import { useEffect, useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  TextField,
} from "@mui/material";
import { listCategories } from "../services/mockApi";
import { useAppDispatch, useAppSelector } from "../store";
import {
  resetFilters,
  setCategory,
  setDateFrom,
  setDateTo,
  setMaxAmount,
  setMinAmount,
  setOrder,
  setPaymentMethod,
  setSearch,
  setSortBy,
} from "../store/expensesSlice";
import type { Category, ExpenseSortKey, PaymentMethod, SortOrder } from "../types";

// payment-list dropdown 
const PAYMENT_METHODS: (PaymentMethod | "all")[] = [
  "all",
  "cash",
  "card",
  "bank_transfer",
  "other",
];
const SORT_KEYS: { value: string; label: string }[] = [
  { value: "date", label: "Date" },
  { value: "amount", label: "Amount" },
  { value: "title", label: "Title" },
];
export default function ExpenseFilters() {
  const filters = useAppSelector((state) => state.expenses.filters);
  const dispatch = useAppDispatch();

// category-list 
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);
return (
    <Box
      component="form"
      onSubmit={(e) => e.preventDefault()} // don't reload the page on Enter
      sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}
    >
      <TextField
        label="Search"
        size="small"
        value={filters.search}
        onChange={(e) => dispatch(setSearch(e.target.value))}
      />

      <TextField
        select
        label="Category"
        size="small"
        sx={{ minWidth: 170 }}
        value={filters.category}
        onChange={(e) => dispatch(setCategory(e.target.value))}
      >
        <MenuItem value="all">All categories</MenuItem>
        {categories.map((c) => (
          <MenuItem key={c._id} value={c._id}>
            {c.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Payment method"
        size="small"
        sx={{ minWidth: 170 }}
        value={filters.paymentMethod}
        onChange={(e) => dispatch(setPaymentMethod(e.target.value as PaymentMethod | "all"))}
      >
        {PAYMENT_METHODS.map((method) => (
          <MenuItem key={method} value={method}>
            {method.replace("_", " ")}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="From"
        type="date"
        size="small"
        value={filters.dateFrom}
        onChange={(e) => dispatch(setDateFrom(e.target.value))}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="To"
        type="date"
        size="small"
        value={filters.dateTo}
        onChange={(e) => dispatch(setDateTo(e.target.value))}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Min amount"
        type="number"
        size="small"
        value={filters.minAmount}
        onChange={(e) => dispatch(setMinAmount(e.target.value))}
      />
      <TextField
        label="Max amount"
        type="number"
        size="small"
        value={filters.maxAmount}
        onChange={(e) => dispatch(setMaxAmount(e.target.value))}
      />
      <TextField
        select
        label="Sort by"
        size="small"
        sx={{ minWidth: 130 }}
        value={filters.sortBy}
        onChange={(e) => dispatch(setSortBy(e.target.value as ExpenseSortKey))}
      >
        {SORT_KEYS.map((o) => (
          <MenuItem key={o.value} value={o.value}>
            {o.label}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Order"
        size="small"
        sx={{ minWidth: 130 }}
        value={filters.order}
        onChange={(e) => dispatch(setOrder(e.target.value as SortOrder))}
      >
        <MenuItem value="desc">Newest first</MenuItem>
        <MenuItem value="asc">Oldest first</MenuItem>
      </TextField>

      <Button variant="outlined" onClick={() => dispatch(resetFilters())}>
        Reset
      </Button>
    </Box>
  );
}