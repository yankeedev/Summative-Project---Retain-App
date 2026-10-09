
import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  function handleSignOut() {
    signOut();
    navigate("/signin"); 
  }

  // Admin-only links
  const navItems = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Expenses", to: "/expenses" },
    { label: "Budget", to: "/budget" },
    ...(user?.role === "admin" ? [{ label: "Admin", to: "/admin" }] : []),
  ];

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ mr: 3 }}>Retain</Typography>
          {navItems.map((item) => (
            <Button key={item.to} color="inherit" component={Link} to={item.to}>
              {item.label}
            </Button>
          ))}
          <Box sx={{ flexGrow: 1 }} /> {/* pushes the rest to the right */}
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.email}
          </Typography>
          <Button color="inherit" onClick={handleSignOut}>Sign out</Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
}