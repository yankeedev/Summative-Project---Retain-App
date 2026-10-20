import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import App from "./App";
import { store } from "./store";
import { AuthProvider } from "./context/AuthContext";
import { ColorModeProvider } from "./context/ColorModeContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <ColorModeProvider>
          <CssBaseline />
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ColorModeProvider>
      </AuthProvider>
    </Provider>
  </StrictMode>
);