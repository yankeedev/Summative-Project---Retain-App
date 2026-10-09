import { createAsyncThunk, createSlice }

import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { listExpenses } from "../services/mockApi";
import type {
  Expense,
  ExpenseFilters,
  ExpenseSortKey,
  Paginated,
  PaymentMethod,
  SortOrder,
} from "../types";
import type { RootState } from "./index"; 

interface ExpensesState {
  filters: ExpenseFilters;  
  expenses: Expense[];      
  total: number;             
  pages: number;            
  loading: boolean;         
  error: string | null;      
}

//  filter  value. 
const DEFAULT_FILTERS: ExpenseFilters = {
  search: "",
  category: "all",    
  paymentMethod: "all",  
  dateFrom: "",
  dateTo: "",
  minAmount: "",
  maxAmount: "",
  sortBy: "date",
  order: "desc",         
  page: 1,
  limit: 10,             
};

const initialState: ExpensesState = {
  filters: DEFAULT_FILTERS,
  expenses: [],
  total: 0,
  pages: 1,
  loading: false,
  error: null,
};

// async function 
export const fetchExpenses = createAsyncThunk<
  Paginated<Expense>,
  void,
  { state: RootState }
>("expenses/fetch", async (_arg, { getState }) => {
  return await listExpenses(getState().expenses.filters);
});

//  the slice 
const expensesSlice = createSlice({
  name: "expenses",
  initialState,

  
  reducers: {
    setSearch(state, { payload }: PayloadAction<string>) {
      state.filters.search = payload;
      state.filters.page = 1; // any change jumps back to page 1 — better UX
    },
    setCategory(state, { payload }: PayloadAction<string>) {
      state.filters.category = payload;
      state.filters.page = 1;
    },
    setPaymentMethod(state, { payload }: PayloadAction<PaymentMethod | "all">) {
      state.filters.paymentMethod = payload;
      state.filters.page = 1;
    },
    setDateFrom(state, { payload }: PayloadAction<string>) {
      state.filters.dateFrom = payload;
      state.filters.page = 1;
    },
    setDateTo(state, { payload }: PayloadAction<string>) {
      state.filters.dateTo = payload;
      state.filters.page = 1;
    },
    setMinAmount(state, { payload }: PayloadAction<string>) {
      state.filters.minAmount = payload;
      state.filters.page = 1;
    },
    setMaxAmount(state, { payload }: PayloadAction<string>) {
      state.filters.maxAmount = payload;
      state.filters.page = 1;
    },
    setSortBy(state, { payload }: PayloadAction<ExpenseSortKey>) {
      state.filters.sortBy = payload;
      state.filters.page = 1;
    },
    setOrder(state, { payload }: PayloadAction<SortOrder>) {
      state.filters.order = payload;
      state.filters.page = 1;
    },
    setPage(state, { payload }: PayloadAction<number>) {
      state.filters.page = payload;
    },
    setLimit(state, { payload }: PayloadAction<number>) {
      state.filters.limit = payload;
      state.filters.page = 1;
    },
    resetFilters(state) {
      state.filters = { ...DEFAULT_FILTERS };
    },
  },

  //  thunk pending
  extraReducers: (builder) => {
    builder.addCase(fetchExpenses.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchExpenses.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.expenses = payload.data;
      state.total = payload.total;
      state.pages = payload.pages;
    });
    builder.addCase(fetchExpenses.rejected, (state, { error }) => {
      state.loading = false;
      state.error = error.message ?? "Failed to load expenses";
    });
  },
});

export const {
  setSearch,
  setCategory,
  setPaymentMethod,
  setDateFrom,
  setDateTo,
  setMinAmount,
  setMaxAmount,
  setSortBy,
  setOrder,
  setPage,
  setLimit,
  resetFilters,
} = expensesSlice.actions;

export default expensesSlice.reducer;