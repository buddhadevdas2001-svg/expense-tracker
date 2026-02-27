import { useState, useEffect, useMemo } from 'react';
import {
  TextField,
  Button,
  MenuItem,
  Paper,
  Box,
  Stack,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { addTransaction } from '../redux/slices/transactionSlice';
import { fetchCategories } from '../redux/slices/categorySlice';
import type { RootState, AppDispatch } from '../redux/store';
import { renderCategoryIcon } from '../utils/categoryIcons';

export default function TransactionForm() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const categories = useSelector((state: RootState) => state.categories.categories);

  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense' | ''>('');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      dispatch(fetchCategories(user.id));
    }
  }, [dispatch, user]);

  const filteredCategories = useMemo(() => {
    if (!type) return [];

    return categories.filter((c) => c.type === type || c.type === 'both');
  }, [categories, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !date || !user || !type || !categoryId) {
      setError('Please fill all required fields');
      return;
    }

    try {
      await dispatch(
        addTransaction({
          user_id: user.id,
          amount: Number(amount),
          type,
          category_id: categoryId,
          note: note,
          date,
        })
      ).unwrap();

      // Reset all fields
      setAmount('');
      setNote('');
      setType('');
      setDate('');
      setCategoryId('');
      setSuccess('Transaction added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }} elevation={0}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Add Transaction
      </Typography>
      
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')}>
        <Alert severity="success">{success}</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError('')}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>

      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              id="amount-field"
              label="Amount"
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputProps={{ min: '0', step: '0.01' }}
              InputLabelProps={{ htmlFor: 'amount-field' }}
            />

            <TextField
              id="type-field"
              select
              label="Type"
              required
              value={type}
              onChange={(e) => {
                setType(e.target.value as 'income' | 'expense');
                setCategoryId(''); // Clear category when type changes
              }}
              InputLabelProps={{ htmlFor: 'type-field' }}
            >
              <MenuItem value="">Select type</MenuItem>
              <MenuItem value="income">Income</MenuItem>
              <MenuItem value="expense">Expense</MenuItem>
            </TextField>

            <TextField
              id="category-field"
              select
              label="Category"
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={!type || filteredCategories.length === 0}
              InputLabelProps={{ htmlFor: 'category-field' }}
              SelectProps={{
                renderValue: (selected) => {
                  const category = categories.find((c) => c.id === selected);
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                        {renderCategoryIcon(category?.icon, { fontSize: 'small' }, category?.name)}
                      </Box>
                      {category?.name}
                    </Box>
                  );
                }
              }}
            >
              {!type ? (
                <MenuItem value="">First select a type</MenuItem>
              ) : filteredCategories.length === 0 ? (
                <MenuItem value="">No categories available</MenuItem>
              ) : (
                filteredCategories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                        {renderCategoryIcon(c.icon, { fontSize: 'small' }, c.name)}
                      </Box>
                      <span>{c.name}</span>
                    </Box>
                  </MenuItem>
                ))
              )}
            </TextField>

            <TextField
              id="date-field"
              label="Date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true, htmlFor: 'date-field' }}
            />
          </Box>

          <TextField
            id="note-field"
            label="Note (Optional)"
            fullWidth
            value={note}
            onChange={(e) => setNote(e.target.value)}
            multiline
            rows={2}
            InputLabelProps={{ htmlFor: 'note-field' }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={!amount || !type || !categoryId || !date}
          >
            Add {type ? (type === 'income' ? 'Income' : 'Expense') : 'Transaction'}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
