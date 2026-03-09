import { memo, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Form, Formik, type FormikHelpers } from "formik";
import RowGrid from "@/components/reusables/dashboard/RowGrid";
import FormikTextarea from "@/components/reusables/formik/FormikTextarea";
import type { HelpButtonFormInitialValues } from "@/types/types";
import { toast } from "react-toastify";
import { errorTransformer } from "@/utils/error";
import { useCreateHelpTicket } from "@/hooks/helpTicketHooks";
import { helpTicketSchema } from "@/validations/schemas";
import confetti from "canvas-confetti";
import useAuthStore from "@/store/authStore";
import FormikSelect from "@/components/reusables/formik/FormikSelect";
import {
  useFetchOwnerStoreLocations,
  useFetchStoreLocationsForEmployee,
} from "@/hooks/employeeManagementHooks";
import Spinner from "@/components/reusables/Spinner";
import { useFetchAllStores } from "@/hooks/storeManagementHooks";

const ExpandingForm = () => {
  const userProfile = useAuthStore((state) => state.userProfile);
  const userRole = userProfile?.role;

  const superAdminLocationsQuery = useFetchAllStores();
  const ownerLocationsQuery = useFetchOwnerStoreLocations();
  const managerLocationsQuery = useFetchStoreLocationsForEmployee();
  const employeeLocationsQuery = useFetchStoreLocationsForEmployee();

  let locationsQuery: any;
  switch (userRole) {
    case "superadmin":
      locationsQuery = superAdminLocationsQuery;
      break;
    case "owner":
      locationsQuery = ownerLocationsQuery;
      break;
    case "manager":
      locationsQuery = managerLocationsQuery;
      break;
    case "employee":
      locationsQuery = employeeLocationsQuery;
      break;
    default:
      locationsQuery = {
        data: [],
        isError: false,
        isLoading: false,
        error: null,
      };
  }

  const isError = locationsQuery?.isError ?? false;
  const error = locationsQuery?.error ?? null;
  const isLoading = locationsQuery?.isLoading ?? false;

  // const locationOptions = allLocations?.map((location: any) => ({
  //   label: location.name,
  //   value: location.id,
  // }));

  const locationOptions = useMemo(() => {
    const safeLocations = locationsQuery?.data ?? [];
    return safeLocations.map((location: any) => ({
      label: location.name,
      value: location.id,
    }));
  }, [locationsQuery?.data]);

  const noLocation = !locationOptions || locationOptions.length === 0;

  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (!open) {
      setTimeout(() => setOpen(true), 200);
      // Fire sparkles
      confetti({
        particleCount: 100,
        spread: 60,
        startVelocity: 40,
        origin: { x: 1, y: 1 }, // bottom-right corner
        // colors: ['#FFD700', '#FFB700', '#FFC107', '#FFE55C'], // golden hues
        colors: ["#00C9A7", "#00BFA6", "#00D8B6", "#66E8DC"],
        scalar: 0.7,
        ticks: 100,
        shapes: ["star", "circle"],
      });
    } else {
      setOpen(false);
    }
  };

  const { mutate: createHelpTicketMutation, isPending } = useCreateHelpTicket();

  const initialValues: HelpButtonFormInitialValues = {
    message: null,
    store_location_id: null,
  };

  const onSubmit = async (
    values: HelpButtonFormInitialValues,
    formik: FormikHelpers<HelpButtonFormInitialValues>,
  ) => {
    const store_location_id = values.store_location_id
      ? values.store_location_id
      : null;
    const message = values.message ? values.message.trim() : "";

    createHelpTicketMutation(
      { store_location_id, message },
      {
        onSuccess: () => {
          formik.resetForm();
          formik.setSubmitting(false);
          setOpen(false);
          toast.success(
            "Genie has recieved your message. We will get back to you soon.",
          );
        },
        onError: (error) => {
          formik.resetForm();
          formik.setSubmitting(false);
          const message = errorTransformer(error);
          toast.error(message);
        },
      },
    );
  };

  return (
    <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {open && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
            className="mb-3 w-80 rounded-lg border-1 border-[#007a54] bg-white p-4 shadow-lg"
          >
            {isLoading ? (
              <div className="itemcenter flex justify-center">
                <Spinner />
              </div>
            ) : isError ? (
              <p>Error: {errorTransformer(error)}</p>
            ) : (
              <Formik
                initialValues={initialValues}
                validationSchema={helpTicketSchema}
                onSubmit={onSubmit}
                validateOnChange={false}
              >
                {(formik) => {
                  const { isSubmitting } = formik;

                  return (
                    <Form className="auth-form mt-0">
                      <p className="mb-3 bg-gradient-to-r from-[#038058] via-[#039e6d] to-[#1195bd] bg-clip-text text-center font-bold text-transparent">
                        Queue the Genie ✨
                      </p>

                      {!noLocation && (
                        <div className="col">
                          <FormikSelect
                            name="store_location_id"
                            label="Store Location"
                            placeholder="Select Store Location"
                            options={locationOptions}
                            required
                          />
                        </div>
                      )}

                      <RowGrid cols="grid-cols-2" className="gap-y-0">
                        <div className="col-span-2">
                          <FormikTextarea
                            name="message"
                            label="Message"
                            placeholder="Write your thoughts"
                            required
                          />
                        </div>
                      </RowGrid>

                      <div className="button-wrap mt-3 flex justify-center text-center">
                        <Button
                          type="submit"
                          variant={"iconButton"}
                          disabled={isSubmitting || isPending}
                          className="bg-gradient-to-r from-[#038058] via-[#039e6d] to-[#24a576] hover:text-white hover:brightness-110"
                          aria-label="Send"
                        >
                          {isSubmitting || isPending ? "Sending..." : "Send"}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            x="0px"
                            y="0px"
                            width="100"
                            height="100"
                            fill="#fff"
                            viewBox="0 0 50 50"
                          >
                            <path d="M 38.5 6 C 35.460938 6 33 8.460938 33 11.5 C 33 14.792969 35.445313 16.386719 37 17 C 40.109375 18.226563 41.9375 19.042969 42.652344 20 L 41 20 C 40.78125 20 40.566406 20.074219 40.390625 20.207031 C 37.996094 22.046875 33.011719 24 28.5 24 L 16 24 C 14.335938 24 12.894531 24.535156 11.839844 25.4375 C 11.796875 25.136719 11.761719 24.84375 11.691406 24.535156 C 11.457031 23.5 11.066406 22.417969 10.324219 21.53125 C 9.582031 20.644531 8.417969 20 7 20 C 5.230469 20 4.0625 21.066406 3.554688 22.03125 C 3.042969 23 3 23.945313 3 23.945313 L 3 24 C 3 25.707031 3.570313 27.097656 4.414063 28.179688 C 5.261719 29.261719 6.347656 30.054688 7.421875 30.816406 C 8.742188 31.746094 9.390625 32.605469 9.554688 32.921875 C 9.433594 32.957031 9.390625 33 9 33 C 8.640625 32.996094 8.304688 33.183594 8.121094 33.496094 C 7.941406 33.808594 7.941406 34.191406 8.121094 34.503906 C 8.304688 34.816406 8.640625 35.003906 9 35 C 9.816406 35 10.488281 34.910156 11.0625 34.46875 C 11.421875 34.191406 11.609375 33.742188 11.671875 33.289063 C 12.15625 33.820313 12.734375 34.332031 13.425781 34.816406 C 15.113281 36.003906 17.109375 36.675781 19.59375 36.902344 C 19.289063 37.265625 19.085938 37.714844 19.03125 38.210938 C 16.042969 38.730469 14 40.1875 14 42 L 14 43 L 29 43 L 29 42 C 29 40.1875 26.957031 38.730469 23.96875 38.210938 C 23.910156 37.699219 23.703125 37.238281 23.382813 36.871094 C 28.332031 36.375 31.851563 34.03125 36.667969 29.75 C 37.421875 29.074219 38.191406 28.351563 38.96875 27.625 C 41.488281 25.265625 44.089844 22.824219 46.367188 21.933594 C 46.8125 21.753906 47.074219 21.289063 46.984375 20.8125 C 46.894531 20.34375 46.480469 20 46 20 L 44.898438 20 C 44.640625 18.582031 43.789063 16.984375 41.699219 15.96875 C 41.027344 15.640625 40.359375 15.320313 39.75 14.988281 C 38.28125 14.191406 37.128906 13.339844 37.019531 12.199219 C 37.007813 12.140625 37 12.070313 37 12 C 37 11.449219 37.449219 11 38 11 C 38 11.679688 38.230469 12.300781 38.597656 12.800781 C 39.148438 13.53125 40.019531 14 41 14 C 41.910156 14 42.730469 13.589844 43.269531 12.949219 C 43.648438 12.378906 43.890625 11.710938 43.96875 11 C 43.980469 10.929688 44 10.601563 44 10.5 C 44 8.011719 41.988281 6 39.5 6 Z M 21.5 14 C 20.121094 14 19 15.121094 19 16.5 C 19 17.171875 19.273438 17.8125 19.75 18.28125 C 17.972656 18.847656 16.25 20.210938 14.882813 22 L 28.117188 22 C 26.75 20.210938 25.03125 18.847656 23.25 18.28125 C 23.730469 17.8125 24 17.171875 24 16.5 C 24 15.121094 22.878906 14 21.5 14 Z M 7 22 C 7.871094 22 8.355469 22.296875 8.789063 22.816406 C 9.226563 23.335938 9.550781 24.132813 9.742188 24.980469 C 10.128906 26.667969 10.003906 28.4375 10.003906 28.4375 C 9.988281 28.574219 10 28.714844 10.039063 28.84375 C 10.015625 29.058594 10 29.277344 10 29.5 C 10 29.796875 10.039063 30.089844 10.09375 30.378906 C 9.65625 29.988281 9.160156 29.597656 8.578125 29.183594 C 7.527344 28.445313 6.613281 27.738281 5.992188 26.945313 C 5.375 26.160156 5.011719 25.300781 5.007813 24.03125 C 5.007813 24.007813 5.046875 23.488281 5.320313 22.96875 C 5.601563 22.433594 5.9375 22 7 22 Z"></path>
                          </svg>
                        </Button>
                      </div>
                    </Form>
                  );
                }}
              </Formik>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleClick}
        initial={false}
        whileTap={{ y: 4, scale: 0.95 }}
        animate={{
          y: [0, 4, -20, 0], // dip → jump → land
        }}
        transition={{
          duration: 0.4,
          ease: "easeInOut",
        }}
        className="text-primary-foreground flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-[#038058] via-[#039e6d] to-[#24a576] shadow-lg"
        aria-label="Genie"
      >
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          width="30"
          height="30"
          viewBox="0 0 50 50"
          fill="#fff"
          animate={{
            rotate: [0, -20, 20, -15, 15, 0], // wiggle left & right
          }}
          transition={{
            duration: 0.8,
            ease: "easeInOut",
          }}
        >
          <path d="M 25 2 C 20.5 2 17 4.101563 17 6.898438 C 17 8.199219 17.800781 8.902344 19 9.300781 L 25 5.898438 L 31 9.300781 C 32.300781 8.902344 33 8.101563 33 6.800781 C 33 4.101563 29.5 2 25 2 Z M 25 7.800781 C 25 7.800781 22 9.5 21 10.097656 L 21 13.800781 L 21.402344 14 L 25 15.800781 L 28.597656 14 L 29 13.800781 L 29 10.097656 C 28 9.601563 25 7.902344 25 7.800781 Z M 17.699219 14.300781 C 10.097656 15.699219 5 19 5 22.699219 C 5 27 13.199219 27 13.199219 27 C 19.300781 27 22.800781 24.800781 25.800781 22.800781 C 26.199219 22.5 26.699219 22.199219 27.097656 22 L 16 22 L 16 20 L 33 20 L 33 22 C 30.800781 22 29.101563 23.101563 26.902344 24.5 C 26.601563 24.699219 26.398438 24.800781 26.097656 25 C 28.597656 26.398438 31.300781 27 35 27 C 35 27 45 26.898438 45 22.699219 C 45 19 39.902344 15.699219 32.300781 14.300781 L 25 18 Z M 24.097656 26.199219 C 21.398438 27.699219 18 29 13.097656 29 L 13 29 C 13.601563 32.800781 15.097656 38.398438 19.597656 43 L 22 43 C 25.101563 43 29.199219 42.199219 31.300781 40.300781 C 31.5 40.101563 31.800781 39.898438 32 39.597656 C 32 35.898438 34.800781 32 36 30.199219 L 36.097656 30 C 36.300781 29.601563 36.5 29.300781 36.699219 29 L 35 29 C 30.699219 29 27.199219 28.097656 24.097656 26.199219 Z M 32.402344 41.902344 C 29.800781 44.199219 25.199219 45 22 45 L 21.902344 45 C 24.5 46.800781 27.800781 48 32 48 C 35.5 48 38.699219 46.902344 40.5 45.902344 L 43.800781 44 L 38.097656 44 C 36.5 44 35 44.097656 33.5 43.199219 C 33 42.800781 32.699219 42.402344 32.402344 41.902344 Z"></path>
        </motion.svg>
      </motion.button>
    </div>
  );
};

export default memo(ExpandingForm);
