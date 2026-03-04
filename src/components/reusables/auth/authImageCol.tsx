const AuthImageCol = () => {
  return (
    <div className="auth-img-col w-1/2">
      <div className="auth-img-wrap relative flex h-[calc(100dvh-56px)] flex-col overflow-hidden rounded-3xl">
        <div className="auth-logo relative z-1 p-15 pb-0">
          <img
            src="/assets/images/logo.webp"
            alt="Logo"
            className="mx-auto"
            fetchPriority="high"
          />
        </div>
        <div className="auth-screenshot relative z-1 mt-15 flex-grow pl-[4.5vw]">
          <img
            src="assets/images/auth-screen-img.jpg"
            alt="image"
            className="ml-auto h-full w-full object-cover object-top-left"
          />
        </div>
        <div className="auth-bg absolute top-0 left-0 h-full w-full overflow-hidden rounded-3xl border-4 border-[#8B9D79]">
          <img
            src="assets/images/login-bg.jpg"
            alt="auth"
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default AuthImageCol;
