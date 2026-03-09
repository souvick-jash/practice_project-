import { Button } from "@/components/ui/button";

const SomethingWentWrong = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center text-center">
      <h1 className="mb-4 text-3xl font-bold">Something went wrong</h1>
      <p className="mb-6 text-gray-600">
        An unexpected error occurred. Please try again or go back home.
      </p>
      <Button onClick={() => window.location.reload()}>Reload Page</Button>
    </div>
  );
};

export default SomethingWentWrong;
