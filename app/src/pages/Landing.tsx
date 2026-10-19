import { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import { Link as RouterLink, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ON_THIS_PAGE = [
  { href: "#what-retain-does", label: "What Retain does" },
  { href: "#planner-preview", label: "Budget planner preview" },
  { href: "#further-information", label: "Further information" },
  { href: "#faqs", label: "Frequently asked questions" },
  { href: "#up-next", label: "Up next" },
];

const BENEFITS = [
  "record and categorise your expenses with a title, amount, category, payment method, date and notes",
  "set a monthly spending budget and see whether you are within, approaching, or over budget",
  "search and filter spending by category, payment method, date range and amount",
  "see summaries of your spending — totals, highest expense, spending by category and recent activity",
];

const PREVIEW_ROWS = [
  { title: "Groceries", category: "Groceries", method: "Debit card", amount: 142.5 },
  { title: "Weekly train pass", category: "Transport", method: "Debit card", amount: 48.0 },
  { title: "Dinner with friends", category: "Dining out", method: "Credit card", amount: 63.2 },
  { title: "Electricity bill", category: "Utilities", method: "Direct debit", amount: 95.0 },
  { title: "Cinema ticket", category: "Entertainment", method: "Credit card", amount: 30.0 },
];

const FURTHER_INFORMATION = [
  {
    title: "Payment frequency",
    text: "Each expense is recorded on the date it happened, and your budget status is calculated for the calendar month (1st to last day). Weekly, fortnightly and monthly habits all roll up into the same monthly view.",
  },
  {
    title: "Categories",
    text: "Retain ships with default categories such as Groceries, Transport, Dining out, Utilities, Entertainment and Other. Admins can add, rename and remove categories — expenses tied to a deleted category are moved to the default category so nothing is lost.",
  },
  {
    title: "Your data",
    text: "Your expenses and budgets are stored against your account. You can only see and modify your own records — other users never see your data. Sign out at any time from the top navigation.",
  },
  {
    title: "Budget status",
    text: "Your budget is marked 'within budget' below 75% spent, 'approaching budget' from 75% used, and 'over budget' once spending exceeds the amount you set for the month.",
  },
];

const FAQS = [
  {
    q: "Is Retain free to use?",
    a: "Yes. Retain is free to sign up to and use — there are no paid plans or hidden costs.",
  },
  {
    q: "Do I need an account?",
    a: "Yes. Create an account with your name, email and password, then sign in to reach your dashboard, expenses, budgets and admin tools.",
  },
  {
    q: "Is my financial data private?",
    a: "Yes. Every expense and budget is stored against your user account. The API authorises each request, so you can only read and edit your own records.",
  },
  {
    q: "How does the monthly budget work?",
    a: "Set an amount for the current month on the Budget page. Retain shows your total spent, your remaining budget, and whether you are within, approaching, or over your budget — updated as you add expenses.",
  },
  {
    q: "Can I edit or delete an expense later?",
    a: "Absolutely. Open the Expenses page to create, view, update and delete any of your records, and filter or sort the list to find exactly what you need.",
  },
];

const UP_NEXT = [
  {
    to: "/signup",
    title: "Create your account",
    text: "Sign up in seconds and start recording expenses",
    readTime: "1 min read",
  },
  {
    to: "/signin",
    title: "Sign in",
    text: "Access your dashboard, expenses and budgets",
    readTime: "1 min read",
  },
  {
    to: "/signup",
    title: "Set your first budget",
    text: "Choose a monthly limit and track it in real time",
    readTime: "2 min read",
  },
];

function money(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function Landing() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<"yes" | "no" | null>(null);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const totalSpent = PREVIEW_ROWS.reduce((sum, row) => sum + row.amount, 0);
  const budget = 600;
  const remaining = budget - totalSpent;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Top bar */}
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          bgcolor: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            py: 1.5,
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Box component="img" src="/wallet.svg" alt="" sx={{ width: 28, height: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Retain
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button component={RouterLink} to="/signin" variant="outlined" sx={{ fontWeight: 700 }}>
              Sign in
            </Button>
            <Button component={RouterLink} to="/signup" variant="contained" sx={{ fontWeight: 700 }}>
              Get started
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Content over hero image — image sits behind, strongest under the top bar, fades into the page */}
      <Box
        sx={{
          position: "relative",
          backgroundImage:
            "linear-gradient(180deg, rgba(248,250,252,0.72) 0%, rgba(248,250,252,0.88) 320px, rgba(248,250,252,0.97) 640px, #f8fafc 100%), url('/hero.png')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: { xs: "scroll", md: "fixed" },
        }}
      >
        <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 }, position: "relative", zIndex: 1 }}>
        {/* Breadcrumb */}
        <Breadcrumbs sx={{ mb: 2, color: "text.secondary" }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Retain
          </Typography>
          <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600 }}>
            Budget planner
          </Typography>
        </Breadcrumbs>

        {/* Title block */}
        <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.02em", fontSize: { xs: "2rem", md: "2.5rem" } }}>
          Budget planner
        </Typography>
        <Typography variant="h6" sx={{ color: "text.secondary", fontWeight: 400, mt: 1 }}>
          Work out where your money is going
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 1.5 }}>
          Page reading time: 2 minutes · Last updated: October 2026
        </Typography>

        {/* On this page */}
        <Paper sx={{ p: 2.5, mt: 4, bgcolor: "#f8fafc" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
            On this page
          </Typography>
          <Stack component="ul" spacing={0.75} sx={{ m: 0, pl: 2.5 }}>
            {ON_THIS_PAGE.map((item) => (
              <Box component="li" key={item.href}>
                <Typography
                  component="a"
                  href={item.href}
                  variant="body2"
                  sx={{ color: "primary.main", fontWeight: 600, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                >
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Paper>

        {/* Intro */}
        <Box id="what-retain-does" sx={{ scrollMarginTop: 80, mt: 5 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
            What Retain does
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", mb: 1.5 }}>
            Retain is a personal expense and budget manager. It helps you work out where your
            money is going and whether your spending matches the budget you set. This budget
            planner enables you to:
          </Typography>
          <Box component="ul" sx={{ pl: 3, m: 0, color: "text.secondary" }}>
            {BENEFITS.map((benefit) => (
              <Box component="li" key={benefit} sx={{ mb: 0.75 }}>
                <Typography variant="body1" component="span" sx={{ color: "text.secondary" }}>
                  {benefit}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Planner preview (styled like the embedded MoneySmart calculator) */}
        <Box id="planner-preview" sx={{ scrollMarginTop: 80, mt: 5 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Budget planner preview
          </Typography>
          <Paper sx={{ overflow: "hidden" }}>
            <Box
              sx={{
                px: 2.5,
                py: 1.75,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <AccountBalanceWalletRoundedIcon fontSize="small" />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  October 2026
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ fontWeight: 600, opacity: 0.9 }}>
                Sample budget
              </Typography>
            </Box>

            <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
              <Box component="thead">
                <Box component="tr" sx={{ bgcolor: "#f8fafc" }}>
                  <Box component="th" sx={headerCell}>Expense</Box>
                  <Box component="th" sx={{ ...headerCell, display: { xs: "none", sm: "table-cell" } }}>Category</Box>
                  <Box component="th" sx={{ ...headerCell, display: { xs: "none", md: "table-cell" } }}>Payment method</Box>
                  <Box component="th" sx={{ ...headerCell, textAlign: "right" }}>Amount</Box>
                </Box>
              </Box>
              <Box component="tbody">
                {PREVIEW_ROWS.map((row) => (
                  <Box component="tr" key={row.title}>
                    <Box component="td" sx={bodyCell}>{row.title}</Box>
                    <Box component="td" sx={{ ...bodyCell, display: { xs: "none", sm: "table-cell" } }}>
                      <Chip label={row.category} size="small" sx={{ fontWeight: 600 }} />
                    </Box>
                    <Box component="td" sx={{ ...bodyCell, display: { xs: "none", md: "table-cell" }, color: "text.secondary" }}>
                      {row.method}
                    </Box>
                    <Box component="td" sx={{ ...bodyCell, textAlign: "right", fontWeight: 700 }}>
                      {money(row.amount)}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            <Divider />
            <Box
              sx={{
                px: 2.5,
                py: 2,
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: "#f8fafc",
              }}
            >
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
                <Chip label={`Total spent: ${money(totalSpent)}`} color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
                <Chip label={`Budget: ${money(budget)}`} variant="outlined" sx={{ fontWeight: 700 }} />
                <Chip label={`Remaining: ${money(remaining)}`} color="success" variant="outlined" sx={{ fontWeight: 700 }} />
              </Stack>
              <Chip label="Within budget" color="success" sx={{ fontWeight: 700 }} />
            </Box>
          </Paper>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 1.5 }}>
            This is an example of the monthly view you get inside Retain. Sign up to track your
            own spending.
          </Typography>
        </Box>

        {/* Further information */}
        <Box id="further-information" sx={{ scrollMarginTop: 80, mt: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Further information
          </Typography>
          <Box sx={{ bgcolor: "#fff", border: "1px solid", borderColor: "divider", borderRadius: "14px", overflow: "hidden" }}>
            {FURTHER_INFORMATION.map((item, index) => (
              <Accordion key={item.title} disableGutters elevation={0} defaultExpanded={index === 0}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2.5, "&:before": { display: "none" } }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {item.title}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 2.5, pt: 0, color: "text.secondary" }}>
                  <Typography variant="body2">{item.text}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>

        {/* FAQs */}
        <Box id="faqs" sx={{ scrollMarginTop: 80, mt: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Frequently asked questions
          </Typography>
          <Box sx={{ bgcolor: "#fff", border: "1px solid", borderColor: "divider", borderRadius: "14px", overflow: "hidden" }}>
            {FAQS.map((item) => (
              <Accordion key={item.q} disableGutters elevation={0}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2.5, "&:before": { display: "none" } }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {item.q}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 2.5, pt: 0, color: "text.secondary" }}>
                  <Typography variant="body2">{item.a}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>

        {/* Feedback */}
        <Paper sx={{ p: 3, mt: 6, textAlign: "center", bgcolor: "#f8fafc" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Do you find this page useful?
          </Typography>
          {feedback === null ? (
            <Stack direction="row" spacing={1.5} sx={{ mt: 2, justifyContent: "center" }}>
              <Button variant="outlined" onClick={() => setFeedback("yes")}>
                Yes
              </Button>
              <Button variant="outlined" onClick={() => setFeedback("no")}>
                No
              </Button>
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 1.5 }}>
              Thanks for your feedback!
            </Typography>
          )}
        </Paper>

        {/* Up next */}
        <Box id="up-next" sx={{ scrollMarginTop: 80, mt: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Up next in Retain
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
              gap: 2,
            }}
          >
            {UP_NEXT.map((card) => (
              <Paper
                key={card.title}
                component={RouterLink}
                to={card.to}
                sx={{
                  p: 2.5,
                  textDecoration: "none",
                  color: "inherit",
                  display: "block",
                  "&:hover": { borderColor: "primary.main", boxShadow: "0 4px 12px -4px rgba(79, 70, 229, 0.25)" },
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
                  {card.title}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.75, mb: 1.5 }}>
                  {card.text}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                  {card.readTime}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ borderTop: "1px solid", borderColor: "divider", bgcolor: "#fff", mt: 4 }}>
        <Container maxWidth="lg" sx={{ py: 5 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(4, 1fr)" },
              gap: 3,
            }}
          >
            <Box>
              <Stack direction="row" spacing={1} sx={{ mb: 1.5, alignItems: "center" }}>
                <Box component="img" src="/wallet.svg" alt="" sx={{ width: 22, height: 22 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  Retain
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                A personal expense and budget manager that helps you work out where your money
                is going.
              </Typography>
            </Box>

            <FooterColumn
              title="Product"
              links={[
                { label: "Dashboard", to: "/dashboard" },
                { label: "Expenses", to: "/expenses" },
                { label: "Budget", to: "/budget" },
              ]}
            />
            <FooterColumn
              title="Account"
              links={[
                { label: "Sign in", to: "/signin" },
                { label: "Create an account", to: "/signup" },
              ]}
            />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                About
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Built with React, TypeScript, Redux and Express. Source code and setup
                instructions are in the GitHub repository.
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            © 2026 Retain. Personal Expense & Budget Manager.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

const headerCell = {
  px: 2.5,
  py: 1.25,
  fontSize: "0.8125rem",
  fontWeight: 700,
  color: "#475569",
  borderBottom: "1px solid #e2e8f0",
} as const;

const bodyCell = {
  px: 2.5,
  py: 1.5,
  fontSize: "0.9375rem",
  borderBottom: "1px solid #f1f5f9",
} as const;

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; to: string }[];
}) {
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
        {title}
      </Typography>
      <Stack spacing={1}>
        {links.map((link) => (
          <Typography
            key={link.to + link.label}
            component={RouterLink}
            to={link.to}
            variant="body2"
            sx={{ color: "text.secondary", textDecoration: "none", "&:hover": { color: "primary.main" } }}
          >
            {link.label}
          </Typography>
        ))}
      </Stack>
    </Box>
  );
}
