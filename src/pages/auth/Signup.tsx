import { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Paper,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { signUpUser } from "../../redux/slices/authSlice";
import type { AppDispatch } from "../../redux/store";
import { useNavigate, Link } from "react-router-dom";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

export default function Signup() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      setErrorMsg("Please fill in all fields.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      return false;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return false;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    setErrorMsg("");

    if (!validateForm()) return;

    try {
      await dispatch(signUpUser({ email, password })).unwrap();
      navigate("/dashboard");
    } catch (error: unknown) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "Signup failed. Please try again.",
      );
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper sx={{ p: 4, width: "100%" }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <AccountBalanceWalletIcon
              sx={{ fontSize: 48, color: "primary.main" }}
            />
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 600 }}>
              Create Account
            </Typography>
            <Typography color="text.secondary">
              Start tracking your expenses
            </Typography>
          </Box>

          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMsg}
            </Alert>
          )}

          <TextField
            id="signup-email"
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputLabelProps={{ htmlFor: "signup-email" }}
          />

          <TextField
            id="signup-password"
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="Minimum 6 characters"
            InputLabelProps={{ htmlFor: "signup-password" }}
          />

          <TextField
            id="signup-confirm-password"
            fullWidth
            label="Confirm Password"
            type="password"
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSignup()}
            InputLabelProps={{ htmlFor: "signup-confirm-password" }}
          />

          <Button
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3 }}
            onClick={handleSignup}
          >
            Create Account
          </Button>

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Link
              to="/login"
              style={{ textDecoration: "none", color: "#4F46E5" }}
            >
              Already have an account? Sign in
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
