import FormikImageInput from '@/components/reusables/formik/FormikImageInput';
import FormikInput from '@/components/reusables/formik/FormikInput';
import FormikPhoneInput from '@/components/reusables/formik/FormikPhoneInput';
import Spinner from '@/components/reusables/Spinner';
import { Button } from '@/components/ui/button';
import { getStoreLocations } from '@/hooks/generalHooks';
import { useFetchUserProfile, useUpdateUser } from '@/hooks/profileHooks';
import type { SuperAdminProfileFormInitialValues } from '@/types/types';
import { errorTransformer } from '@/utils/error';
import { verifySuperAdminProfileValidationSchema } from '@/validations/schemas';
import { Form, Formik, type FormikHelpers } from 'formik';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const Profile = () => {
  const [storeLocations, setStorelocations] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getStoreLocations();
      setStorelocations(res.map((location: any) => location.name).join(', '));
    };

    fetchData();
  }, []);

  // ? User Details Fetching
  const {
    isError: isSingleFetchError,
    error: singleFetchError,
    data: userProfileData,
    isLoading: isSingleFetchLoading,
  } = useFetchUserProfile();

  const canSee = userProfileData?.role !== 'superadmin';

  const { mutate: updateProfileMutation, isPending } = useUpdateUser();

  const initialValues: SuperAdminProfileFormInitialValues = {
    name: userProfileData?.name ?? '',
    email: userProfileData?.email ?? '',
    phone: userProfileData?.phone ?? '',
    avatar_image: null,
    avatar_url: userProfileData?.avatar_url ?? '',
  };

  const onSubmit = async (
    values: SuperAdminProfileFormInitialValues,
    formik: FormikHelpers<SuperAdminProfileFormInitialValues>
  ) => {
    const name = values.name ? values.name.trim() : '';
    const email = values.email ? values.email.trim() : '';
    const phone = values.phone ? values.phone.trim() : '';
    const avatar_image = values.avatar_image;

    updateProfileMutation(
      {
        userUpdateData: {
          authData: { email, display_name: name, phone },
          userTableData: { name, email, phone },
        },
        imageFile: avatar_image,
      },
      {
        onSuccess: () => {
          formik.resetForm();
          formik.setSubmitting(false);
          toast.success('Profile Updated Successfully');
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
    <div className="mx-auto max-w-lg">
      <div className="d-full-card-wrap">
        {isSingleFetchLoading ? (
          <div className="itemcenter flex justify-center">
            <Spinner />
          </div>
        ) : isSingleFetchError ? (
          <p>Error: {errorTransformer(singleFetchError)}</p>
        ) : (
          <Formik
            initialValues={initialValues}
            validationSchema={verifySuperAdminProfileValidationSchema}
            onSubmit={onSubmit}
            validateOnChange={false}
            enableReinitialize={true}
          >
            {(formik) => {
              const { isSubmitting, isValid } = formik;

              return (
                <Form className="auth-form mt-7">
                  <FormikInput type="text" name="name" label="Name" placeholder="Enter your Name" />

                  <FormikInput
                    type="text"
                    name="email"
                    label="Email"
                    placeholder="Enter your Email"
                  />

                  <FormikPhoneInput
                    name="phone"
                    label="Phone Number"
                    placeholder="Enter the Phone Number"
                    required
                  />

                  <FormikImageInput
                    name="avatar_image"
                    label="Profile Picture"
                    className="text-foreground file:text-foreground"
                    previewUrl={initialValues.avatar_url}
                    accept="image/png, image/jpeg, image/jpg"
                  />

                  {canSee && (
                    <>
                      <div className="my-2 flex flex-col gap-2">
                        <p>
                          <span className="font-semibold">Address</span>:{' '}
                          {userProfileData?.address || '----'}
                        </p>
                        <p>
                          <span className="font-semibold">Store Location</span>:{' '}
                          {storeLocations || '----'}
                        </p>
                      </div>
                    </>
                  )}

                  <Button
                    type="submit"
                    disabled={!isValid || isSubmitting || isPending}
                    className="block w-full"
                    variant="light"
                  >
                    {isSubmitting || isPending ? 'Updating...' : 'Update Profile'}
                  </Button>
                </Form>
              );
            }}
          </Formik>
        )}
      </div>
    </div>
  );
};

export default Profile;
