import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Snackbar,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, addCategory, deleteCategory } from '../redux/slices/categorySlice';
import type { RootState, AppDispatch } from '../redux/store';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import { PREDEFINED_ICON_OPTIONS, renderCategoryIcon } from '../utils/categoryIcons';

const PREDEFINED_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
  '#98D8C8', '#4CAF50', '#FF9800', '#9C27B0', '#2196F3', '#F44336',
];

export default function Categories() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const categories = useSelector((state: RootState) => state.categories.categories);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(PREDEFINED_ICON_OPTIONS[0].key);
  const [color, setColor] = useState('#4F46E5');
  const [categoryType, setCategoryType] = useState<'income' | 'expense' | 'both'>('expense');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      dispatch(fetchCategories(user.id));
    }
  }, [dispatch, user]);

  const handleAddCategory = async () => {
    if (!name || !user) {
      setError('Please enter a category name');
      return;
    }

    const existingCategory = categories.find(
      (cat) => cat.name.toLowerCase() === name.toLowerCase() && !cat.is_default,
    );

    if (existingCategory) {
      setError('A category with this name already exists');
      return;
    }

    try {
      await dispatch(
        addCategory({
          user_id: user.id,
          name,
          icon,
          color,
          type: categoryType,
          is_default: false,
        }),
      ).unwrap();

      setName('');
      setIcon(PREDEFINED_ICON_OPTIONS[0].key);
      setColor('#4F46E5');
      setCategoryType('expense');
      setOpen(false);
      setSuccess('Category added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!user) return;

    try {
      await dispatch(deleteCategory({ id, user_id: user.id })).unwrap();
      setSuccess('Category deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Cannot delete this category');
    }
  };

  const sortedCategories = [...categories].sort((a, b) => {
    if (a.is_default && !b.is_default) return -1;
    if (!a.is_default && b.is_default) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>Categories</Typography>
        <Button
          variant="contained"
          onClick={() => setOpen(true)}
          startIcon={<AddIcon />}
        >
          Add Category
        </Button>
      </Box>

      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')}>
        <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
      </Snackbar>

      <Grid container spacing={2}>
        {sortedCategories.map((cat) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cat.id}>
            <Card>
              <CardContent sx={{ borderTop: `4px solid ${cat.color}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box>
                      <Typography variant="h6">{cat.name}</Typography>
                      {cat.is_default && (
                        <Typography variant="caption" color="text.secondary">
                          Default
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  {!cat.is_default && (
                    <IconButton size="small" onClick={() => handleDeleteCategory(cat.id)}>
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <TextField
            id="category-name-field"
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
            InputLabelProps={{ htmlFor: 'category-name-field' }}
          />

          <TextField
            id="category-type-field"
            select
            label="Category Type"
            value={categoryType}
            onChange={(e) => setCategoryType(e.target.value as 'income' | 'expense' | 'both')}
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ htmlFor: 'category-type-field' }}
          >
            <MenuItem value="income">Income Only</MenuItem>
            <MenuItem value="expense">Expense Only</MenuItem>
            <MenuItem value="both">Both</MenuItem>
          </TextField>

          <Typography variant="subtitle2" sx={{ mb: 1 }}>Select Icon</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {PREDEFINED_ICON_OPTIONS.map((option) => (
              <Button
                key={option.key}
                variant={icon === option.key ? 'contained' : 'outlined'}
                onClick={() => setIcon(option.key)}
                sx={{ minWidth: 'auto', p: 1 }}
              >
                {renderCategoryIcon(option.key, { fontSize: 'medium' })}
              </Button>
            ))}
          </Box>

          <Typography variant="subtitle2" sx={{ mb: 1 }}>Select Color</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {PREDEFINED_COLORS.map((col) => (
              <Box
                key={col}
                onClick={() => setColor(col)}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  backgroundColor: col,
                  cursor: 'pointer',
                  border: color === col ? '3px solid #000' : '1px solid #ccc',
                  '&:hover': { opacity: 0.8 },
                }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddCategory} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
