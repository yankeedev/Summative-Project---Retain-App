import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  AdminPanelSettingsOutlined as AdminIcon,
  BarChartOutlined as AnalyticsIcon,
  DashboardOutlined as DashboardIcon,
  LogoutOutlined as LogoutIcon,
  ReceiptLongOutlined as ExpensesIcon,
  SavingsOutlined as BudgetIcon,
} from "@mui/icons-material";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleSignOut() {
    signOut();
    navigate("/signin");
  }

  const navItems = [
    { label: "Dashboard", to: "/dashboard", icon: <DashboardIcon fontSize="small" /> },
    { label: "Expenses", to: "/expenses", icon: <ExpensesIcon fontSize="small" /> },
    { label: "Budget", to: "/budget", icon: <BudgetIcon fontSize="small" /> },
    { label: "Analytics", to: "/analytics", icon: <AnalyticsIcon fontSize="small" /> },
    ...(user?.role === "admin"
      ? [{ label: "Admin", to: "/admin", icon: <AdminIcon fontSize="small" /> }]
      : []),
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", flexDirection: "column" }}>
      <AppBar
        position="sticky"
        sx={{
          bgcolor: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid",
          borderColor: "divider",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.03)",
          color: "text.primary",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: { xs: 60, md: 68 } }}>
            {/* Brand Logo */}
            <Box
              component={Link}
              to="/dashboard"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                textDecoration: "none",
                color: "inherit",
                mr: 4,
              }}
            >
              <Box
                component="img"
                src="/wallet.svg"
                alt="Retain logo"
                sx={{
                  width: 36,
                  height: 36,
                  mr: 1.25,
                }}
              />
            </Box>

            {/* Navigation links */}
            <Box sx={{ display: "flex", gap: 0.75, flexGrow: 1 }}>
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.to);
                return (
                  <Button
                    key={item.to}
                    component={Link}
                    to={item.to}
                    startIcon={item.icon}
                    sx={{
                      px: 2,
                      py: 0.9,
                      borderRadius: "10px",
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "primary.main" : "text.secondary",
                      bgcolor: isActive ? "rgba(79, 70, 229, 0.08)" : "transparent",
                      border: "1px solid",
                      borderColor: isActive ? "rgba(79, 70, 229, 0.2)" : "transparent",
                      "&:hover": {
                        bgcolor: isActive ? "rgba(79, 70, 229, 0.12)" : "rgba(241, 245, 249, 0.8)",
                        color: isActive ? "primary.main" : "text.primary",
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Box>

            {/* User profile & actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                component={Link}
                to="/profile"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  textDecoration: "none",
                  color: "inherit",
                  p: 0.75,
                  mr: 0.5,
                  borderRadius: "10px",
                  "&:hover": { bgcolor: "rgba(241, 245, 249, 0.9)" },
                }}
              >
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: user?.role === "admin" ? "secondary.main" : "primary.main",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                  }}
                >
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </Avatar>
                <Box sx={{ textAlign: "left", display: { xs: "none", sm: "block" } }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.1 }}>
                    {user?.name ?? "User"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.72rem" }}>
                    {user?.email}
                  </Typography>
                </Box>
                {user?.role === "admin" && (
                  <Chip
                    label="Admin"
                    size="small"
                    color="secondary"
                    sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700 }}
                  />
                )}
              </Box>

              <Button
                variant="outlined"
                color="inherit"
                size="small"
                onClick={handleSignOut}
                startIcon={<LogoutIcon fontSize="small" />}
                sx={{
                  borderColor: "divider",
                  color: "text.secondary",
                  borderRadius: "9px",
                  "&:hover": {
                    borderColor: "error.main",
                    color: "error.main",
                    bgcolor: "rgba(244, 63, 94, 0.05)",
                  },
                }}
              >
                Sign out
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main content */}
      <Container maxWidth="xl" sx={{ py: 4, flexGrow: 1 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
