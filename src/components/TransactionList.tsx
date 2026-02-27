import { useState, useMemo } from 'react';
import { deleteTransaction, updateTransaction } from '../redux/slices/transactionSlice';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../redux/store';
import EditIcon from '@mui/icons-material/Edit';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  MenuItem,
  Box,
  Typography,
  Chip,
  Paper,
  InputAdornment,
  Alert,
  Snackbar,
} from '@mui/material';
import { Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

type TransactionWithCategory = RootState['transactions']['transactions'][number] & {
  category?: {
    id: string;
    name: string;
    icon: string;
    color: string;
    is_default: boolean;
    type?: 'income' | 'expense' | 'both';
  } | null;
};

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export default function TransactionList() {
  const transactions = useSelector((state: RootState) => state.transactions.transactions);
  const categories = useSelector((state: RootState) => state.categories.categories);
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch<AppDispatch>();

  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<TransactionWithCategory | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const note = tx.note || '';
      const matchesSearch = note.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter ? tx.category_id === categoryFilter : true;
      const matchesType = typeFilter ? tx.type === typeFilter : true;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [transactions, search, categoryFilter, typeFilter]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await dispatch(deleteTransaction({ id, user_id: user.id })).unwrap();
      setSuccess('Transaction deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to delete transaction');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUpdate = async () => {
    if (!editData || !user) return;

    try {
      await dispatch(updateTransaction({
        id: editData.id,
        amount: editData.amount,
        type: editData.type,
        note: editData.note,
        category_id: editData.category_id,
        date: editData.date,
        user_id: user.id,
      })).unwrap();

      setOpen(false);
      setEditData(null);
      setSuccess('Transaction updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to update transaction');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleExport = () => {
    try {
      const headers = ['Date', 'Category', 'Type', 'Amount', 'Note'];
      const csvContent = [
        headers.join(','),
        ...filteredTransactions.map((tx) =>
          [
            tx.date,
            tx.category?.name || 'Uncategorized',
            tx.type,
            tx.amount,
            `"${(tx.note || '').replace(/"/g, '""')}"`,
          ].join(',')
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setSuccess('Export successful!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Error exporting CSV');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 3, borderRadius: 3 }} elevation={0}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Transaction History
      </Typography>

      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')}>
        <Alert severity="success">{success}</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError('')}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>

      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          id="search-field"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          InputLabelProps={{ htmlFor: 'search-field' }}
        />

        <TextField
          id="category-filter-field"
          select
          label="Category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          sx={{ minWidth: 150 }}
          size="small"
          InputLabelProps={{ htmlFor: 'category-filter-field' }}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map((cat: Category) => (
            <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
          ))}
        </TextField>

        <TextField
          id="type-filter-field"
          select
          label="Type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          sx={{ minWidth: 120 }}
          size="small"
          InputLabelProps={{ htmlFor: 'type-filter-field' }}
        >
          <MenuItem value="">All Types</MenuItem>
          <MenuItem value="income">Income</MenuItem>
          <MenuItem value="expense">Expense</MenuItem>
        </TextField>

        <Button variant="outlined" onClick={handleExport} sx={{ ml: 'auto' }}>
          Export CSV
        </Button>
      </Box>

      {filteredTransactions.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            No transactions found. Add your first transaction above!
          </Typography>
        </Box>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Note</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredTransactions.map((tx) => (
                <TableRow key={tx.id} hover>
                  <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {tx.category ? (
                      <Chip
                        label={tx.category.name || 'Unknown'}
                        size="small"
                        sx={{
                          bgcolor: tx.category.color || '#8884d8',
                          color: '#fff',
                          fontWeight: 500,
                          '& .MuiChip-label': { display: 'flex', alignItems: 'center', gap: 0.5 }
                        }}
                      />
                    ) : (
                      <Chip
                        label="Unknown Category"
                        size="small"
                        sx={{
                          bgcolor: '#8884d8',
                          color: '#fff',
                          fontWeight: 500,
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography
                      color={tx.type === 'income' ? 'success.main' : 'error.main'}
                      sx={{ fontWeight: 500, textTransform: 'capitalize' }}
                    >
                      {tx.type}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    ₹ {tx.amount.toLocaleString()}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {tx.note}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.currentTarget.blur();
                        setEditData(tx);
                        setOpen(true);
                      }}
                    >
                      <EditIcon color="primary" fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(tx.id)}>
                      <DeleteIcon color="error" fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Transaction</DialogTitle>
        <DialogContent>
          <TextField
            id="edit-amount-field"
            fullWidth
            type="number"
            label="Amount"
            value={editData?.amount || ''}
            onChange={(e) =>
              setEditData(editData ? { ...editData, amount: Number(e.target.value) } : null)
            }
            sx={{ mt: 2 }}
            inputProps={{ min: "0", step: "0.01" }}
            InputLabelProps={{ htmlFor: 'edit-amount-field' }}
          />

          <TextField
            id="edit-type-field"
            fullWidth
            select
            label="Type"
            value={editData?.type || ''}
            onChange={(e) =>
              setEditData(editData ? { ...editData, type: e.target.value as 'income' | 'expense' } : null)
            }
            sx={{ mt: 2 }}
            InputLabelProps={{ htmlFor: 'edit-type-field' }}
          >
            <MenuItem value="income">Income</MenuItem>
            <MenuItem value="expense">Expense</MenuItem>
          </TextField>

          <TextField
            id="edit-category-field"
            fullWidth
            select
            label="Category"
            value={editData?.category_id || ''}
            onChange={(e) =>
              setEditData(editData ? { ...editData, category_id: e.target.value } : null)
            }
            sx={{ mt: 2 }}
            InputLabelProps={{ htmlFor: 'edit-category-field' }}
            SelectProps={{
              renderValue: (selected) => {
                const category = categories.find((c: Category) => c.id === selected);
                return category?.name ?? '';
              }
            }}
          >
            {categories.map((cat: Category) => (
              <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
            ))}
          </TextField>

          <TextField
            id="edit-note-field"
            fullWidth
            label="Note"
            value={editData?.note || ''}
            onChange={(e) =>
              setEditData(editData ? { ...editData, note: e.target.value } : null)
            }
            sx={{ mt: 2 }}
            multiline
            rows={2}
            InputLabelProps={{ htmlFor: 'edit-note-field' }}
          />

          <TextField
            id="edit-date-field"
            fullWidth
            type="date"
            label="Date"
            value={editData?.date || ''}
            onChange={(e) =>
              setEditData(editData ? { ...editData, date: e.target.value } : null)
            }
            sx={{ mt: 2 }}
            InputLabelProps={{ shrink: true, htmlFor: 'edit-date-field' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
