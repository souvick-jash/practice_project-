import Spinner from "./Spinner";

const FullPageSpinner = () => {
  return (
    <div className="bg-background absolute inset-0 z-50 flex items-center justify-center">
      <Spinner />
    </div>
  );
};

export default FullPageSpinner;
