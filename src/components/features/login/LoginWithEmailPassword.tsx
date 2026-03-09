import FormikInput from '@/components/reusables/formik/FormikInput';
import { Button } from '@/components/ui/button';
import { useLoginWithEmailPassword } from '@/hooks/userAuthHooks';
import type { LoginFormWithEmailPasswordInitialValues } from '@/types/types';
import { errorTransformer } from '@/utils/error';
import logger from '@/utils/logger';
import { loginWithEmailPasswordValidationSchema } from '@/validations/schemas';
import { Form, Formik, type FormikHelpers } from 'formik';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';

const LoginWithEmailPassword = () => {
  const { mutate: loginMutation, isPending } = useLoginWithEmailPassword();
  const navigate = useNavigate();

  const initialValues: LoginFormWithEmailPasswordInitialValues = {
    email: '',
    password: '',
  };

  const onSubmit = async (
    values: LoginFormWithEmailPasswordInitialValues,
    formik: FormikHelpers<LoginFormWithEmailPasswordInitialValues>
  ) => {
    const { email, password } = values;
    loginMutation(
      { email, password },
      {
        onSuccess: () => {
          formik.resetForm();
          formik.setSubmitting(false);
          logger.log(values);
          navigate('/superadmin/dashboard');
        },
        onError: (error) => {
          formik.resetForm();
          formik.setSubmitting(false);
          const message = errorTransformer(error);
          toast.error(message);
        },
      }
    );
  };

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={loginWithEmailPasswordValidationSchema}
        onSubmit={onSubmit}
        validateOnChange={false}
      >
        {(formik) => {
          const { isSubmitting, isValid } = formik;

          return (
            <Form className="auth-form mt-7">
              <FormikInput type="text" name="email" label="Email" placeholder="Enter your email" />

              <FormikInput
                type="password"
                name="password"
                label="Password"
                placeholder="Enter your password"
                hasEyeIcon
              />

              <Button
                type="submit"
                disabled={!isValid || isSubmitting || isPending}
                className="block w-full"
                variant="light"
              >
                {isSubmitting || isPending ? 'Logging in...' : 'Login'}
              </Button>
            </Form>
          );
        }}
      </Formik>
    </>
  );
};

export default LoginWithEmailPassword;
