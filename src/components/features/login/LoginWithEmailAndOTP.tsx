import { useEffect, useRef, useState } from 'react';
import { Formik, Form, type FormikHelpers, type FormikProps } from 'formik';
import { toast } from 'react-toastify';
import FormikInput from '@/components/reusables/formik/FormikInput';
import { Button } from '@/components/ui/button';
import { useLoginWithEmailOTP, useVerifyEmailOTP } from '@/hooks/userAuthHooks';
import { errorTransformer } from '@/utils/error';
import {
  loginWithEmailOTPValidationSchema,
  verifyEmailOTPValidationSchema,
} from '@/validations/schemas';
import FormikInputOTP from '@/components/reusables/formik/FormikInputOTP';

interface FormValues {
  email: string;
  otp: string;
}

type Props = {
  handleLoginWithChange: (value: string) => void;
};

const LoginWithEmailAndOTP = ({ handleLoginWithChange }: Props) => {
  const formikRef = useRef<FormikProps<FormValues>>(null);

  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { mutate: sendOtp, isPending: sendingOtp } = useLoginWithEmailOTP();
  const { mutate: verifyOtp, isPending: verifyingOtp } = useVerifyEmailOTP();

  const initialValues: FormValues = {
    email: '',
    otp: '',
  };

  const handleSendOtp = (email: string) => {
    setResendCooldown(60);

    sendOtp(
      { email },
      {
        onSuccess: () => {
          toast.success('OTP sent successfully');
          setOtpSent(true);
        },
        onError: (error) => {
          let errorMessage = errorTransformer(error);
          if (errorMessage === 'Signups not allowed for otp') {
            errorMessage = 'The Email is not registered';
          }
          toast.error(errorMessage);
        },
      }
    );
  };

  const handleResendOtp = () => {
    const email = formikRef.current?.values.email;

    if (!email) {
      toast.error('Email is required');
      return;
    }

    handleSendOtp(email);
  };

  useEffect(() => {
    if (resendCooldown === 0) return;

    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev === 1) clearInterval(interval);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resendCooldown]);

  const onSubmit = async (values: FormValues, formik: FormikHelpers<FormValues>) => {
    const { email, otp } = values;

    verifyOtp(
      { email, token: otp },
      {
        onSuccess: () => {
          toast.success('Login successful');
          formik.resetForm();
        },
        onError: (error) => {
          formik.setSubmitting(false);
          let errorMessage = errorTransformer(error);
          if (errorMessage === 'Token has expired or is invalid') {
            errorMessage = 'OTP has expired or is invalid';
          }
          toast.error(errorMessage);
        },
      }
    );
  };

  return (
    <>
      <Formik
        innerRef={formikRef}
        initialValues={initialValues}
        validationSchema={
          otpSent ? verifyEmailOTPValidationSchema : loginWithEmailOTPValidationSchema
        }
        onSubmit={onSubmit}
        validateOnChange={false}
      >
        {(formik) => {
          const { values, isSubmitting, isValid } = formik;

          return (
            <Form className="auth-form">
              {!otpSent ? (
                <>
                  <div className="mb-5 text-center">
                    <h1 className="mb-3 text-5xl">Login to QR Floor Genie.</h1>
                    <p>Welcome back! Sign in to access your account securely. </p>
                  </div>

                  <FormikInput
                    type="text"
                    name="email"
                    label="Email"
                    placeholder="Enter your Email"
                    disabled={otpSent}
                    autoComplete="email"
                  />

                  <Button
                    type="button"
                    className="mt-3 block w-full"
                    disabled={!values.email || sendingOtp}
                    onClick={() => handleSendOtp(values.email)}
                  >
                    {sendingOtp ? 'Sending OTP...' : 'Send OTP'}
                  </Button>
                </>
              ) : (
                <>
                  <div className="mb-5 text-center">
                    <h1 className="mb-3 text-5xl">Enter verification code</h1>
                    <p>Enter the code sent to your email to login.</p>
                  </div>

                  <FormikInputOTP name="otp" required />

                  <div className="mr-4 flex justify-center">
                    {resendCooldown > 0 ? (
                      <p className="text-muted-foreground text-sm">
                        Resend OTP in {resendCooldown}s
                      </p>
                    ) : (
                      <Button
                        type="button"
                        variant="link"
                        onClick={handleResendOtp}
                        disabled={isSubmitting || verifyingOtp}
                      >
                        Resend OTP
                      </Button>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="mt-3 block w-full"
                    disabled={!isValid || isSubmitting || verifyingOtp}
                  >
                    {verifyingOtp ? 'Verifying...' : 'Verify & Login'}
                  </Button>
                </>
              )}
            </Form>
          );
        }}
      </Formik>

      {!otpSent && (
        <p className="mt-5 text-center">
          or,{' '}
          <span
            className="text-primary cursor-pointer underline"
            onClick={() => handleLoginWithChange('phone')}
          >
            Login with Phone & OTP
          </span>
        </p>
      )}
    </>
  );
};

export default LoginWithEmailAndOTP;
