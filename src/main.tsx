// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import "./index.css";
// import App from './App.tsx'

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import App from "./App.tsx";
import "./index.css";
// import { ThemeProvider } from './providers/ThemeProvider.tsx';
import AuthProvider from "./providers/AuthProvider.tsx";
import { ToastContainer } from "react-toastify";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* <ThemeProvider defaultTheme="light"> */}
      <AuthProvider>
        <App />
      </AuthProvider>
      {/* </ThemeProvider> */}
      <ReactQueryDevtools initialIsOpen={false} />
      <ToastContainer />
    </QueryClientProvider>
  </StrictMode>,
);
