import { useMemo, useState } from 'react';
import { Container, Typography, Box, Card, CardContent, TextField, MenuItem } from '@mui/material';
import { useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { RootState } from '../redux/store';

export default function MonthlySummary() {
  const transactions = useSelector((state: RootState) => state.transactions.transactions);

  const years = useMemo(() => {
    const yearly = new Set(transactions.map((tx) => tx.date.substring(0, 4)));
    return Array.from(yearly).sort().reverse();
  }, [transactions]);

  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(years.includes(currentYear) ? currentYear : years[0] || currentYear);

  const chartData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
      income: 0,
      expense: 0,
    }));

    transactions.forEach((tx) => {
      if (tx.date.startsWith(selectedYear)) {
        const monthIndex = parseInt(tx.date.substring(5, 7)) - 1;
        if (tx.type === 'income') {
          months[monthIndex].income += tx.amount;
        } else {
          months[monthIndex].expense += tx.amount;
        }
      }
    });

    return months.map((m) => ({
      ...m,
      savings: m.income - m.expense,
    }));
  }, [transactions, selectedYear]);

  const totalIncome = chartData.reduce((acc, m) => acc + m.income, 0);
  const totalExpense = chartData.reduce((acc, m) => acc + m.expense, 0);
  const totalSavings = totalIncome - totalExpense;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Monthly Summary
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          id="year-field"
          select
          label="Year"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          sx={{ minWidth: 120 }}
          InputLabelProps={{ htmlFor: 'year-field' }}
        >
          {years.map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
        <Card>
          <CardContent>
            <Typography color="textSecondary">Total Income</Typography>
            <Typography variant="h5" sx={{ color: 'success.main', fontWeight: 600 }}>
              ₹{totalIncome.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary">Total Expense</Typography>
            <Typography variant="h5" sx={{ color: 'error.main', fontWeight: 600 }}>
              ₹{totalExpense.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary">Total Savings</Typography>
            <Typography variant="h5" sx={{ color: totalSavings >= 0 ? 'success.main' : 'error.main', fontWeight: 600 }}>
              ₹{totalSavings.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Monthly Breakdown</Typography>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number | undefined) => `₹${(value ?? 0).toLocaleString()}`} />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="Income" />
              <Bar dataKey="expense" fill="#ef4444" name="Expense" />
              <Bar dataKey="savings" fill="#3b82f6" name="Savings" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Container>
  );
}


