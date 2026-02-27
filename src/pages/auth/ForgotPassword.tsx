import { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Alert, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }


    setMessage(`Password reset link would be sent to ${email} (Demo mode)`);
    setError('');
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper sx={{ p: 4, width: '100%' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <AccountBalanceWalletIcon sx={{ fontSize: 48, color: 'primary.main' }} />
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 600 }}>
              Reset Password
            </Typography>
            <Typography color="text.secondary">
              Enter your email to reset your password
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {message && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          <TextField
            id="forgot-email"
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleReset()}
            InputLabelProps={{ htmlFor: 'forgot-email' }}
          />

          <Button
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3 }}
            onClick={handleReset}
          >
            Send Reset Link
          </Button>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link to="/login" style={{ textDecoration: 'none', color: '#4F46E5' }}>
              Back to Login
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}