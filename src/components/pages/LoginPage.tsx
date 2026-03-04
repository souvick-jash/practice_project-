import AuthImageCol from "../reusables/auth/authImageCol";
// import LoginWithEmailAndOTP from "../features/login/LoginWithEmailAndOTP";
// import LoginWithPhoneAndOTP from "../features/login/LoginWithPhoneAndOTP";
import { Link } from "react-router";
import { useState } from "react";
import LoginWithEmailPassword from "../features/login/LoginWithEmailPassword";

const LoginPage = () => {
  const [loginWith, setLoginWith] = useState("phone");

  const handleLoginWithChange = (value: string) => {
    setLoginWith(value);
  };

  return (
    <section className="auth-section flex min-h-screen gap-4 p-7">
      <AuthImageCol />

      <div className="auth-form-col w-1/2">
        <div className="auth-form-col-inner flex h-[calc(100dvh-56px)] flex-col overflow-auto rounded-3xl bg-white p-15 pb-6">
          <div className="m-auto w-full max-w-127">
            {/* {loginWith === "phone" && (
              <LoginWithPhoneAndOTP
                handleLoginWithChange={handleLoginWithChange}
              />
            )}

            {loginWith === "email" && (
              <LoginWithEmailAndOTP
                handleLoginWithChange={handleLoginWithChange}
              />
            )} */}

            <LoginWithEmailPassword />

            <div className="mt-3 text-sm">
              <p className="text-gray-600">
                By logging into your{" "}
                <span className="font-semibold">QR Floor Genie software,</span>{" "}
                you accept our{" "}
                <Link
                  to={import.meta.env.VITE_TERMS_AND_CONDITIONS_URL}
                  target="_blank"
                  className="text-primary font-semibold underline"
                >
                  Terms of Service
                </Link>{" "}
                and acknowledge our{" "}
                <Link
                  to={import.meta.env.VITE_PRIVACY_POLICY_URL}
                  className="text-primary font-semibold underline"
                  target="_blank"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
          {/* <AuthFooter /> */}
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
