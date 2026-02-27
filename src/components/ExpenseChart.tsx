import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { Box, Typography } from '@mui/material';

interface ExpenseItem {
  name: string;
  value: number;
  color: string;
}

export default function ExpenseChart() {
  const transactions = useSelector((state: RootState) => state.transactions.transactions);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [chartWidth, setChartWidth] = useState(0);
  const chartHeight = 320;

  const expenseData = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce<ExpenseItem[]>((acc, tx) => {
      const categoryName = tx.category?.name || 'Uncategorized';
      const categoryColor = tx.category?.color || '#8884d8';

      const existing = acc.find((item) => item.name === categoryName);
      if (existing) {
        existing.value += tx.amount;
      } else {
        acc.push({ name: categoryName, value: tx.amount, color: categoryColor });
      }
      return acc;
    }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      const next = Math.floor(el.getBoundingClientRect().width);
      setChartWidth(next > 0 ? next : 0);
    };

    updateWidth();

    const observer = new ResizeObserver(() => updateWidth());
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <Box
      width="100%"
      sx={{
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
        minWidth: 0,
        minHeight: 350,
        overflow: 'hidden',
        '& .recharts-wrapper:focus, & .recharts-wrapper:focus-visible, & .recharts-surface:focus, & .recharts-surface:focus-visible': {
          outline: 'none',
        },
      }}
    >
      {expenseData.length === 0 ? (
        <Box
          sx={{
            minHeight: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography color="text.secondary">No expense data to display.</Typography>
        </Box>
      ) : (
        <Box ref={containerRef} sx={{ width: '100%', height: chartHeight, minWidth: 0 }}>
          {chartWidth > 0 && (
            <PieChart width={chartWidth} height={chartHeight}>
              <Pie
                data={expenseData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="44%"
                outerRadius="70%"
                innerRadius="45%"
                paddingAngle={2}
                stroke="none"
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number | undefined, name: string | undefined) => [`₹ ${(value || 0).toLocaleString()}`, name ?? 'Amount']}
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={34} />
            </PieChart>
          )}
        </Box>
      )}
    </Box>
  );
}
