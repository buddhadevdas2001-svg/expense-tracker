import { Card, CardContent, Typography, Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

interface Props {
  income: number;
  expense: number;
}

export default function SummaryCards({ income, expense }: Props) {
  const balance = income - expense;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
        gap: 2,
        mt: 2,
      }}
    >
      <Card>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ p: 1.5, bgcolor: 'success.light', borderRadius: 2, color: 'white' }}>
            <TrendingUpIcon />
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Total Income</Typography>
            <Typography variant="h5" sx={{ color: 'success.main', fontWeight: 600 }}>
              ₹ {income.toLocaleString()}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ p: 1.5, bgcolor: 'error.light', borderRadius: 2, color: 'white' }}>
            <TrendingDownIcon />
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Total Expense</Typography>
            <Typography variant="h5" sx={{ color: 'error.main', fontWeight: 600 }}>
              ₹ {expense.toLocaleString()}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ p: 1.5, bgcolor: 'primary.light', borderRadius: 2, color: 'white' }}>
            <AccountBalanceIcon />
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Balance</Typography>
            <Typography variant="h5" sx={{ color: balance >= 0 ? 'primary.main' : 'error.main', fontWeight: 600 }}>
              ₹ {balance.toLocaleString()}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
