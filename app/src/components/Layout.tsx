import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  LinearProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  AddOutlined as AddIcon,
  AdminPanelSettingsOutlined as AdminIcon,
  ArrowForward as ArrowIcon,
  BarChartOutlined as AnalyticsIcon,
  CheckCircleOutlined as CheckIcon,
  DashboardOutlined as DashboardIcon,
  HelpOutlined as HelpIcon,
  LogoutOutlined as LogoutIcon,
  MenuOutlined as MenuIcon,
  ReceiptLongOutlined as ExpensesIcon,
  SavingsOutlined as BudgetIcon,
  SettingsOutlined as SettingsIcon,
} from "@mui/icons-material";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getBudget } from "../services/endpoints";
import type { Budget } from "../types";

const DRAWER_WIDTH = 264;
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "My finances",
  "/expenses": "Transactions",
  "/budget": "Budgets",
  "/analytics": "Analytics",
  "/admin": "Admin",
  "/profile": "Settings",
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [budget, setBudget] = useState<Budget | null>(null);

  const month = new Date().toISOString().slice(0, 7);
  const monthLabel = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  useEffect(() => {
    if (!user) return;
    let active = true;
    getBudget(user._id, month)
      .then((result) => {
        if (active) setBudget(result);
      })
      .catch(() => {
        if (active) setBudget(null);
      });
    return () => {
      active = false;
    };
  }, [user, month]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  function handleSignOut() {
    signOut();
    navigate("/signin");
  }

  const navItems = [
    { label: "Overview", to: "/dashboard", icon: <DashboardIcon fontSize="small" /> },
    { label: "Transactions", to: "/expenses", icon: <ExpensesIcon fontSize="small" /> },
    { label: "Budgets", to: "/budget", icon: <BudgetIcon fontSize="small" /> },
    { label: "Analytics", to: "/analytics", icon: <AnalyticsIcon fontSize="small" /> },
    ...(user?.role === "admin"
      ? [{ label: "Admin", to: "/admin", icon: <AdminIcon fontSize="small" /> }]
      : []),
  ];

  const usedPercent =
    budget && budget.amount > 0 ? Math.min(100, Math.round((budget.spent / budget.amount) * 100)) : 0;
  const pageTitle = PAGE_TITLES[location.pathname] ?? "Overview";

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", p: 2 }}>
      {/* Brand */}
      <Box
        component={Link}
        to="/dashboard"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          textDecoration: "none",
          color: "inherit",
          px: 1,
          py: 1.5,
        }}
      >
        <Box component="img" src="/wallet.svg" alt="Retain logo" sx={{ width: 32, height: 32 }} />
        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: "-0.03em" }}>
          retain
        </Typography>
      </Box>

      {/* Menu */}
      <Typography
        variant="caption"
        sx={{ px: 1, mt: 2, mb: 1, fontWeight: 700, letterSpacing: "0.1em", color: "text.secondary" }}
      >
        MENU
      </Typography>
      <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to);
          return (
            <ListItemButton
              key={item.to}
              component={Link}
              to={item.to}
              sx={{
                borderRadius: "10px",
                py: 0.9,
                color: isActive ? "primary.main" : "text.secondary",
                bgcolor: isActive ? "rgba(79, 70, 229, 0.08)" : "transparent",
                fontWeight: isActive ? 700 : 500,
                "&:hover": { bgcolor: isActive ? "rgba(79, 70, 229, 0.12)" : "action.hover" },
                "& .MuiListItemIcon-root": { color: isActive ? "primary.main" : "text.secondary", minWidth: 36 },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{ primary: { sx: { fontSize: "0.9rem", fontWeight: isActive ? 700 : 500 } } }}
              />
            </ListItemButton>
          );
        })}
      </List>

      {/* Monthly budget widget */}
      <Box
        sx={{
          mt: 2.5,
          p: 2,
          borderRadius: "14px",
          bgcolor: "background.default",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
          Monthly budget
        </Typography>
        {budget ? (
          <>
            <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5, letterSpacing: "-0.02em" }}>
              {currency.format(budget.amount)}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
              {currency.format(budget.spent)} of {currency.format(budget.amount)} used
            </Typography>
            <LinearProgress
              variant="determinate"
              value={usedPercent}
              color={budget.remaining < 0 ? "error" : usedPercent > 75 ? "warning" : "success"}
              sx={{ mt: 1.5, height: 6, borderRadius: 3 }}
            />
          </>
        ) : (
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            No budget set for {monthLabel}.
          </Typography>
        )}
        <Button
          component={Link}
          to="/budget"
          size="small"
          endIcon={<ArrowIcon sx={{ fontSize: 15 }} />}
          sx={{ mt: 1.5, px: 0, fontWeight: 700, minWidth: 0 }}
        >
          Manage budget
        </Button>
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      {/* Secondary links */}
      <List disablePadding sx={{ mb: 1 }}>
        <ListItemButton
          component="a"
          href="mailto:support@retain.app"
          sx={{ borderRadius: "10px", "& .MuiListItemIcon-root": { minWidth: 36, color: "text.secondary" } }}
        >
          <ListItemIcon>
            <HelpIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Help & support" slotProps={{ primary: { sx: { fontSize: "0.9rem" } } }} />
        </ListItemButton>
        <ListItemButton
          component={Link}
          to="/profile"
          sx={{
            borderRadius: "10px",
            color: location.pathname.startsWith("/profile") ? "primary.main" : "text.secondary",
            bgcolor: location.pathname.startsWith("/profile") ? "rgba(79, 70, 229, 0.08)" : "transparent",
            "& .MuiListItemIcon-root": {
              minWidth: 36,
              color: location.pathname.startsWith("/profile") ? "primary.main" : "text.secondary",
            },
          }}
        >
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Settings" slotProps={{ primary: { sx: { fontSize: "0.9rem" } } }} />
        </ListItemButton>
      </List>

      <Divider sx={{ my: 1.5 }} />

      {/* User chip */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 0.5 }}>
        <Avatar sx={{ width: 38, height: 38, bgcolor: "primary.main", fontWeight: 700, fontSize: "0.85rem" }}>
          {initials(user?.name ?? "U")}
        </Avatar>
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
            {user?.name ?? "User"}
          </Typography>
          <Typography variant="caption" noWrap sx={{ color: "text.secondary", display: "block" }}>
            {user?.email}
          </Typography>
          <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 700, fontSize: "0.68rem" }}>
            Personal space
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleSignOut} title="Sign out">
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );

  const paperSx = {
    width: DRAWER_WIDTH,
    boxSizing: "border-box" as const,
    borderRight: "1px solid",
    borderColor: "divider",
    bgcolor: "background.paper",
    height: "100vh",
    overflowY: "auto",
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{ "& .MuiDrawer-paper": paperSx }}
          >
            {drawerContent}
          </Drawer>
        ) : (
          <Drawer variant="permanent" open sx={{ "& .MuiDrawer-paper": paperSx }}>
            {drawerContent}
          </Drawer>
        )}
      </Box>

      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top header */}
        <Box
          component="header"
          sx={{
            position: "sticky",
            top: 0,
            zIndex: (t) => t.zIndex.appBar,
            bgcolor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid",
            borderColor: "divider",
            px: { xs: 2, md: 4 },
          }}
        >
          <Toolbar disableGutters sx={{ minHeight: { xs: 60, md: 68 }, gap: 2 }}>
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)} edge="start" size="small">
                <MenuIcon />
              </IconButton>
            )}

            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.2 }}>
                {pageTitle}
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}
              >
                {monthLabel}
              </Typography>
            </Box>

            <Chip
              icon={<CheckIcon />}
              label="All caught up"
              size="small"
              sx={{
                bgcolor: "rgba(16, 185, 129, 0.12)",
                color: "success.dark",
                fontWeight: 600,
                display: { xs: "none", sm: "inline-flex" },
                "& .MuiChip-icon": { color: "success.main" },
              }}
            />

            <Button
              variant="contained"
              component={Link}
              to="/expenses"
              startIcon={<AddIcon />}
              sx={{ borderRadius: "10px", whiteSpace: "nowrap" }}
            >
              Add expense
            </Button>
          </Toolbar>
        </Box>

        {/* Main content */}
        <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, width: "100%", maxWidth: 1400, mx: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
