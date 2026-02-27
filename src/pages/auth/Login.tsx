import { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Paper,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../redux/slices/authSlice';
import type { AppDispatch } from '../../redux/store';
import { useNavigate, Link } from 'react-router-dom';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Please fill all fields');
      return;
    }

    try {
      await dispatch(loginUser({ email, password })).unwrap();
      navigate('/dashboard');
    } catch (error: unknown) {
      setErrorMsg(error instanceof Error ? error.message : 'Login failed');
    }
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
              Welcome Back
            </Typography>
            <Typography color="text.secondary">Sign in to Trackly</Typography>
          </Box>

          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMsg}
            </Alert>
          )}

          <TextField
            id="login-email"
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputLabelProps={{ htmlFor: 'login-email' }}
          />

          <TextField
            id="login-password"
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            InputLabelProps={{ htmlFor: 'login-password' }}
          />

          <Button
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3 }}
            onClick={handleLogin}
          >
            Sign In
          </Button>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link to="/signup" style={{ textDecoration: 'none', color: '#4F46E5' }}>
              Don't have an account? Sign up
            </Link>
            <br />
            <Link to="/forgot-password" style={{ textDecoration: 'none', color: '#6B7280' }}>
              Forgot password?
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
