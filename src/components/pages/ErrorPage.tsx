import { Button } from "../ui/button";
import { useNavigate } from "react-router";

const ErrorPage = ({ hideBackButton }: { hideBackButton?: boolean }) => {
  const navigate = useNavigate();

  return (
    <section className="bg-background flex min-h-screen items-center justify-center px-5">
      <div className="error-page-content flex flex-col items-center gap-4 rounded-3xl bg-white p-10 px-15 text-center">
        <h1 className="text-primary text-5xl">404 - Page not found</h1>
        <h2 className="text-2xl">This is not the page you're looking for.</h2>
        <p>It appears the page you seek doesn't exist.</p>
        {!hideBackButton && (
          <Button className="mt-3 px-6" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        )}
      </div>
    </section>
  );
};

export default ErrorPage;
