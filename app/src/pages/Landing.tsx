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
  IconButton,
  Paper,
  Stack,
  SvgIcon,
  Tooltip,
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
      <Box sx={{ borderTop: "1px solid", borderColor: "divider", bgcolor: "#fff", mt: 3 }}>
        <Container
          maxWidth="lg"
          sx={{
            py: 1.5,
            minHeight: 72,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Box component="img" src="/wallet.svg" alt="" sx={{ width: 20, height: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              Retain
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <FooterSocial href="https://instagram.com/retain" label="Instagram">
              <InstagramIcon />
            </FooterSocial>
            <FooterSocial href="mailto:hello@retain.app" label="Email">
              <EmailIcon />
            </FooterSocial>
            <FooterSocial href="https://tiktok.com/@retain" label="TikTok">
              <TikTokIcon />
            </FooterSocial>
            <FooterSocial href="https://wa.me/10000000000" label="WhatsApp">
              <WhatsAppIcon />
            </FooterSocial>
          </Stack>

          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            © 2026 Retain
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

function FooterSocial({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip title={label}>
      <IconButton
        component="a"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        size="small"
        sx={{
          color: "text.secondary",
          "&:hover": { color: "primary.main", bgcolor: "action.hover" },
        }}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
}

function InstagramIcon() {
  return (
    <SvgIcon fontSize="small">
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.43.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.43.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.43-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 1.62c-3.15 0-3.52.01-4.76.07-1.15.05-1.77.24-2.19.4-.55.21-.94.47-1.35.88-.41.41-.67.8-.88 1.35-.16.42-.35 1.04-.4 2.19-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.05 1.15.24 1.77.4 2.19.21.55.47.94.88 1.35.41.41.8.67 1.35.88.42.16 1.04.35 2.19.4 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c1.15-.05 1.77-.24 2.19-.4.55-.21.94-.47 1.35-.88.41-.41.67-.8.88-1.35.16-.42.35-1.04.4-2.19.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.05-1.15-.24-1.77-.4-2.19a3.6 3.6 0 0 0-.88-1.35 3.6 3.6 0 0 0-1.35-.88c-.42-.16-1.04-.35-2.19-.4-1.24-.06-1.61-.07-4.76-.07Zm0 2.76a5.46 5.46 0 1 1 0 10.92 5.46 5.46 0 0 1 0-10.92Zm0 1.62a3.84 3.84 0 1 0 0 7.68 3.84 3.84 0 0 0 0-7.68Zm5.68-2.88a1.28 1.28 0 1 1 0 2.56 1.28 1.28 0 0 1 0-2.56Z" />
    </SvgIcon>
  );
}

function EmailIcon() {
  return (
    <SvgIcon fontSize="small">
      <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 2v.51l-8 4.99-8-4.99V6h16ZM4 18V8.03l7.4 4.62a1.2 1.2 0 0 0 1.2 0L20 8.03V18H4Z" />
    </SvgIcon>
  );
}

function TikTokIcon() {
  return (
    <SvgIcon fontSize="small">
      <path d="M16.5 3c.3 1.8 1.4 3.2 3 3.9.5.2 1 .3 1.5.35v3.1a8.3 8.3 0 0 1-4.5-1.4v5.9a5.9 5.9 0 1 1-5.9-5.9c.2 0 .35 0 .5.03v3.2a2.7 2.7 0 1 0 2.3 2.66V3h3.1Z" />
    </SvgIcon>
  );
}

function WhatsAppIcon() {
  return (
    <SvgIcon fontSize="small">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.9c0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.9-4.45 9.9-9.9C21.94 6.45 17.5 2 12.04 2Zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 4.54 0 8.23 3.69 8.23 8.23 0 4.55-3.69 8.24-8.23 8.24Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.4-.12-.56.12-.17.25-.64.81-.79.98-.14.16-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42-.14 0-.31-.02-.47-.02-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
    </SvgIcon>
  );
}
