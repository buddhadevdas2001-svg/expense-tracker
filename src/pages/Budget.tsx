import { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  MenuItem,
  LinearProgress,
  Grid,
  Alert,
  Snackbar,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { upsertBudget, fetchBudgets, deleteBudget } from '../redux/slices/budgetSlice';
import { fetchCategories } from '../redux/slices/categorySlice';
import { fetchTransactions } from '../redux/slices/transactionSlice';
import type { RootState, AppDispatch } from '../redux/store';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { renderCategoryIcon } from '../utils/categoryIcons';

export default function Budget() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const budgets = useSelector((state: RootState) => state.budgets.budgets);
  const categories = useSelector((state: RootState) => state.categories.categories);
  const transactions = useSelector((state: RootState) => state.transactions.transactions);

  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const currentMonth = new Date().toISOString().substring(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  useEffect(() => {
    if (user) {
      dispatch(fetchBudgets({ userId: user.id, month: selectedMonth }));
      dispatch(fetchTransactions(user.id));
      if (categories.length === 0) dispatch(fetchCategories(user.id));
    }
  }, [dispatch, user, selectedMonth, categories.length]);

  const handleSetBudget = async () => {
    if (!amount || !user || !categoryId) {
      setError('Please fill all fields');
      return;
    }

    try {
      await dispatch(
        upsertBudget({
          user_id: user.id,
          category_id: categoryId,
          amount: Number(amount),
          month: selectedMonth,
        })
      ).unwrap();

      setAmount('');
      setCategoryId('');
      setSuccess('Budget set successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to set budget');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!user) return;

    try {
      await dispatch(deleteBudget({ id, user_id: user.id })).unwrap();
      setSuccess('Budget deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete budget');
      setTimeout(() => setError(''), 3000);
    }
  };

  const budgetData = useMemo(() => {
    return budgets.map((budget) => ({
      ...budget,
      spent: transactions
        .filter(
          (tx) =>
            tx.type === 'expense' &&
            tx.category_id === budget.category_id &&
            tx.date.startsWith(selectedMonth),
        )
        .reduce((acc, tx) => acc + tx.amount, 0),
    }));
  }, [budgets, transactions, selectedMonth]);

  const expenseCategories = categories.filter((c) => c.type === 'expense' || c.type === 'both');

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Budget Management
      </Typography>

      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')}>
        <Alert severity="success">{success}</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError('')}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Set Monthly Budget</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            type="month"
            label="Month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            sx={{ minWidth: 200 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            select
            label="Category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Select Category</MenuItem>
            {expenseCategories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {renderCategoryIcon(cat.icon, { fontSize: 'small' }, cat.name)} {cat.name}
                </Box>
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Budget Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            sx={{ minWidth: 150 }}
            inputProps={{ min: '0', step: '0.01' }}
          />
          <Button variant="contained" onClick={handleSetBudget}>
            Set Budget
          </Button>
        </Box>
      </Card>

      {budgetData.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            No budgets set for this month. Create your first budget above!
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {budgetData.map((budget) => {
            const category = categories.find((c) => c.id === budget.category_id);
            const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
            const isOverBudget = budget.spent > budget.amount;

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={budget.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {category ? renderCategoryIcon(category.icon, { fontSize: 'small' }, category.name) : null}
                        <Typography variant="h6">
                          {category ? category.name : 'Unknown Category'}
                        </Typography>
                      </Box>
                      <IconButton size="small" onClick={() => handleDeleteBudget(budget.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <Typography color="textSecondary">Budget: ₹{budget.amount.toLocaleString('en-IN')}</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Spent: ₹{budget.spent.toLocaleString('en-IN')}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(percentage, 100)}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: isOverBudget ? '#ef4444' : '#10b981',
                          },
                        }}
                      />
                    </Box>
                    {isOverBudget && (
                      <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                        Over budget by ₹{(budget.spent - budget.amount).toLocaleString('en-IN')}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
}
