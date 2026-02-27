import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { RootState } from '../redux/store';

interface ExpenseItem {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export default function ExpenseChart() {
  const transactions = useSelector((state: RootState) => state.transactions.transactions);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const rawData = useMemo(
    () =>
      transactions
        .filter((tx) => tx.type === 'expense')
        .reduce<Omit<ExpenseItem, 'percentage'>[]>((acc, tx) => {
          const categoryName = tx.category?.name || 'Uncategorized';
          const categoryColor = tx.category?.color || '#8884d8';
          const existing = acc.find((item) => item.name === categoryName);

          if (existing) {
            existing.value += tx.amount;
          } else {
            acc.push({ name: categoryName, value: tx.amount, color: categoryColor });
          }

          return acc;
        }, []),
    [transactions]
  );

  const totalExpense = useMemo(
    () => rawData.reduce((sum, item) => sum + item.value, 0),
    [rawData]
  );

  const expenseData = useMemo(
    () =>
      rawData.map((item) => ({
        ...item,
        percentage: totalExpense > 0 ? (item.value / totalExpense) * 100 : 0,
      })).sort((a, b) => b.value - a.value),
    [rawData, totalExpense]
  );

  const chartSize = isMobile ? 260 : 360;
  const innerRadius = isMobile ? 70 : 96;
  const outerRadius = isMobile ? 110 : 145;

  const formatCurrency = (value: number) => `\u20B9 ${value.toLocaleString('en-IN')}`;

  return (
    <Box
      width="100%"
      sx={{
        p: { xs: 1.75, sm: 2.5 },
        bgcolor: 'background.paper',
        borderRadius: 3,
        minWidth: 0,
        minHeight: { xs: 360, sm: 430 },
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
        backgroundImage:
          'radial-gradient(circle at 50% 0%, rgba(99,102,241,0.08), transparent 45%), radial-gradient(circle at 100% 100%, rgba(236,72,153,0.06), transparent 35%)',
        '& .recharts-wrapper:focus, & .recharts-surface:focus, & .recharts-sector:focus': {
          outline: 'none',
        },
      }}
    >
      {expenseData.length === 0 ? (
        <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="text.secondary">No expense data to display.</Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 1 }}>
            <PieChart width={chartSize} height={chartSize}>
              <Pie
                data={expenseData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={outerRadius}
                innerRadius={innerRadius}
                paddingAngle={2}
                stroke="none"
                labelLine={false}
                label={false}
              >
                {expenseData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="none" />
                ))}
              </Pie>

              <text
                x="50%"
                y="47%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill={theme.palette.text.secondary}
                style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: 500 }}
              >
                Total Expense
              </text>
              <text
                x="50%"
                y="56%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill={theme.palette.text.primary}
                style={{ fontSize: isMobile ? '30px' : '38px', fontWeight: 800 }}
              >
                {formatCurrency(totalExpense)}
              </text>

              <Tooltip
                formatter={(value, _name, item) => [
                  formatCurrency(Number(value ?? 0)),
                  item?.payload?.name || 'Category',
                ]}
                contentStyle={{
                  borderRadius: 10,
                  border: 'none',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                }}
              />
            </PieChart>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, justifyContent: 'center' }}>
            {expenseData.map((item) => (
              <Box
                key={item.name}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.25,
                  py: 0.5,
                  borderRadius: 999,
                  bgcolor: 'rgba(148,163,184,0.12)',
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: item.color,
                  }}
                />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {item.name} ({item.percentage.toFixed(0)}%)
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}
