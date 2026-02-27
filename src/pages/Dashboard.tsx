import { useEffect } from 'react';
import { Container, Box, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import SummaryCards from '../components/SummaryCards';
import ExpenseChart from '../components/ExpenseChart';
import { fetchTransactions } from '../redux/slices/transactionSlice';
import { fetchCategories } from '../redux/slices/categorySlice';
import type { RootState, AppDispatch } from '../redux/store';

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const transactions = useSelector((state: RootState) => state.transactions.transactions);

  const income = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((acc, tx) => acc + tx.amount, 0);
  const expense = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((acc, tx) => acc + tx.amount, 0);

  useEffect(() => {
    if (user) {
      dispatch(fetchTransactions(user.id));
      dispatch(fetchCategories(user.id));
    }
  }, [dispatch, user]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Dashboard
      </Typography>
      <SummaryCards income={income} expense={expense} />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3, mt: 3 }}>
        <Box sx={{ minWidth: 0 }}>
          <TransactionForm />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <ExpenseChart />
        </Box>
      </Box>
      <TransactionList />
    </Container>
  );
}
