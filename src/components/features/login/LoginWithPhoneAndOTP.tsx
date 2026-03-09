import { useState } from 'react';
import { Formik, Form, type FormikHelpers } from 'formik';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';

import { errorTransformer } from '@/utils/error';

import FormikInputOTP from '@/components/reusables/formik/FormikInputOTP';
import { useLoginWithPhoneOTP, useVerifyPhoneOTP } from '@/hooks/userAuthHooks';
import {
  loginWithPhoneOTPValidationSchema,
  verifyPhoneOTPValidationSchema,
} from '@/validations/schemas';
import FormikPhoneInput from '@/components/reusables/formik/FormikPhoneInput';

interface FormValues {
  phone: string;
  otp: string;
}

type Props = {
  handleLoginWithChange: (value: string) => void;
};

const LoginWithPhoneAndOTP = ({ handleLoginWithChange }: Props) => {
  const [otpSent, setOtpSent] = useState(false);

  const { mutate: sendOtp, isPending: sendingOtp } = useLoginWithPhoneOTP();
  const { mutate: verifyOtp, isPending: verifyingOtp } = useVerifyPhoneOTP();

  const initialValues: FormValues = {
    phone: '',
    otp: '',
  };

  const handleSendOtp = (phone: string) => {
    sendOtp(
      { phone },
      {
        onSuccess: () => {
          toast.success('OTP sent successfully');
          setOtpSent(true);
        },
        onError: (error) => {
          toast.error(errorTransformer(error));
        },
      }
    );
  };

  const onSubmit = async (values: FormValues, formik: FormikHelpers<FormValues>) => {
    const { phone, otp } = values;

    verifyOtp(
      { phone, token: otp },
      {
        onSuccess: () => {
          toast.success('Login successful');
          formik.resetForm();
        },
        onError: (error) => {
          formik.setSubmitting(false);
          toast.error(errorTransformer(error));
        },
      }
    );
  };

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={
          otpSent ? verifyPhoneOTPValidationSchema : loginWithPhoneOTPValidationSchema
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

                  <FormikPhoneInput
                    name="phone"
                    label="Phone Number"
                    placeholder="Enter your Phone Number"
                    disabled={otpSent}
                  />

                  <Button
                    type="button"
                    className="mt-3 block w-full"
                    disabled={!values.phone || sendingOtp}
                    onClick={() => handleSendOtp(values.phone)}
                  >
                    {sendingOtp ? 'Sending OTP...' : 'Send OTP'}
                  </Button>
                </>
              ) : (
                <>
                  <div className="mb-5 text-center">
                    <h1 className="mb-3 text-5xl">Enter verification code</h1>
                    <p>Enter the code sent to your phone number to login.</p>
                  </div>

                  <FormikInputOTP name="otp" required />

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
            onClick={() => handleLoginWithChange('email')}
          >
            Login with Email & OTP
          </span>
        </p>
      )}
    </>
  );
};

export default LoginWithPhoneAndOTP;
