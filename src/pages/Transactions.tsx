import { useEffect } from 'react';
import { Container, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import TransactionList from '../components/TransactionList';
import { fetchTransactions } from '../redux/slices/transactionSlice';
import { fetchCategories } from '../redux/slices/categorySlice';
import type { RootState, AppDispatch } from '../redux/store';

export default function Transactions() {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.auth.user);

    useEffect(() => {
        if (user) {
            dispatch(fetchTransactions(user.id));
            dispatch(fetchCategories(user.id));
        }
    }, [dispatch, user]);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                Transactions
            </Typography>
            <TransactionList />
        </Container>
    );
}