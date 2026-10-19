import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";
import {
  createExpense,
  listCategories,
  updateExpense,
} from "../services/mockApi";
import type { Category, Expense, PaymentMethod } from "../types";
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

interface ExpenseFormProps {
  open: boolean;
  initial: Expense | null; 
  onClose: () => void;
  onSaved: () => void;     
}

export default function ExpenseForm({
  open,
  initial,
  onClose,
  onSaved,
}: ExpenseFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayIso());
  const [categoryId, setCategoryId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // category list 
  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);
  useEffect(() => {
    if (!open) return;
    if (initial) {
      setTitle(initial.title);
      setAmount(String(initial.amount));
      setDate(initial.date);
      setCategoryId(
        typeof initial.category === "string" ? initial.category : initial.category._id
      );
      setPaymentMethod(initial.paymentMethod);
      setNotes(initial.notes ?? "");
    } else {
      setTitle("");
      setAmount("");
      setDate(todayIso());
      setCategoryId(categories[0]?._id ?? "");
      setPaymentMethod("card");
      setNotes("");
    }
    setError(null);
    setCategoryId((current) => current || (categories[0]?._id ?? ""));
  }, [open, initial]);

  async function handleSave(): Promise<void> {
    const numericAmount = Number(amount);
    if (!title.trim()) return setError("Title is required");
    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0)
      return setError("Enter a valid amount greater than 0");
    if (!categoryId) return setError("Choose a category");
    setSaving(true);
    setError(null);
    try {

      // shared fields
      const payload = {
        title: title.trim(),
        amount: numericAmount,
        category: categoryId,
        date,
        paymentMethod,
        notes: notes.trim() || undefined,
      };
      if (initial) {
        await updateExpense(initial._id, payload);
      } else {
        await createExpense(payload);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save expense");
    } finally {
      setSaving(false);
    }
  }
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initial ? "Edit expense" : "Add expense"}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}

        <TextField label="Title" value={title}
                   onChange={(e) => setTitle(e.target.value)} fullWidth required />
        <TextField label="Amount" type="number" slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                   value={amount} onChange={(e) => setAmount(e.target.value)} fullWidth required />
        <TextField label="Date" type="date" value={date}
                   onChange={(e) => setDate(e.target.value)}
                   slotProps={{ inputLabel: { shrink: true } }} fullWidth required />
        <TextField select label="Category" value={categoryId}
                   onChange={(e) => setCategoryId(e.target.value)} fullWidth required>
          {categories.map((c) => (
            <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
          ))}
        </TextField>
        <TextField select label="Payment method" value={paymentMethod}
                   onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                   fullWidth>
          <MenuItem value="cash">Cash</MenuItem>
          <MenuItem value="card">Card</MenuItem>
          <MenuItem value="bank_transfer">Bank transfer</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </TextField>
        <TextField label="Notes (optional)" value={notes} multiline minRows={2}
                   onChange={(e) => setNotes(e.target.value)} fullWidth />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}>
          {saving ? "Saving..." : initial ? "Save changes" : "Add expense"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}