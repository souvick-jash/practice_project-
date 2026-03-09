import { RouterProvider } from "react-router";
import router from "./routes/router";
import AppHydrationWrapper from "./components/partials/AppHydrationWrapper";
import ErrorBoundary from "./components/reusables/error/ErrorBoundary";

function App() {
  return (
    <AppHydrationWrapper>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </AppHydrationWrapper>
  );
}

export default App;
