import parsePhoneNumberFromString from "libphonenumber-js";
import * as Yup from "yup";

// ? =============== Login Related [Email & Password] =============== ?
export const loginWithEmailPasswordValidationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address")
    .required("The Email field is required"),
  password: Yup.string()
    .required("The Password field is required")
    .min(6, "The Password field must be at least 6 characters"),
});

// ? =============== Login Related [Send OTP to Email] =============== ?
export const loginWithEmailOTPValidationSchema = Yup.object({
  email: Yup.string()
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address")
    .required("Email is required"),
});

// ? =============== Login Related [Verify Email OTP] =============== ?
export const verifyEmailOTPValidationSchema = Yup.object({
  email: Yup.string()
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address")
    .required("Email is required"),
  otp: Yup.string()
    .length(6, "OTP must be 6 digits")
    .required("OTP is required"),
});

// ? =============== Login Related [Send OTP to PHone] =============== ?
export const loginWithPhoneOTPValidationSchema = Yup.object({
  phone: Yup.string()
    .required("The Phone Number field is required")
    .test("is-valid-phone", "The Phone Number is invalid", (value) => {
      if (!value) return false;

      const parsed = parsePhoneNumberFromString(value);
      const digitsOnly = value.replace(/\D/g, "");

      return parsed?.isValid() && digitsOnly.length <= 15;
    }),
});

// ? =============== Login Related [Verify Phone OTP] =============== ?
export const verifyPhoneOTPValidationSchema = Yup.object({
  phone: Yup.string().required(),
  otp: Yup.string()
    .length(6, "OTP must be 6 digits")
    .required("OTP is required"),
});

// ? =============== Superadmin: Profile Related =============== ?
export const verifySuperAdminProfileValidationSchema = Yup.object({
  name: Yup.string().required("The Name field is required"),
  email: Yup.string()
    .required("The Email field is required")
    .email("Enter a valid email address")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email is Invalid"),
  phone: Yup.string()
    .required("The Phone Number field is required")
    .test("is-valid-phone", "The Phone Number is invalid", (value) => {
      if (!value) return false;

      const parsed = parsePhoneNumberFromString(value);
      const digitsOnly = value.replace(/\D/g, "");

      return parsed?.isValid() && digitsOnly.length <= 15;
    }),
});

// ? =============== Superadmin: Store Owner Related =============== ?
export const createStoreOwnerValidationSchema = Yup.object({
  name: Yup.string().required("The Name field is required"),
  email: Yup.string()
    .required("The Email field is required")
    .email("Enter a valid email address")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email is Invalid"),
  phone: Yup.string()
    .required("The Phone Number field is required")
    .test("is-valid-phone", "The Phone Number is invalid", (value) => {
      if (!value) return false;

      const parsed = parsePhoneNumberFromString(value);
      const digitsOnly = value.replace(/\D/g, "");

      return parsed?.isValid() && digitsOnly.length <= 15;
    }),
  address: Yup.string().required("The Address field is required"),
});

export const updateStoreOwnerValidationSchema = Yup.object({
  name: Yup.string().required("The Name field is required"),
  email: Yup.string()
    .required("The Email field is required")
    .email("Enter a valid email address")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email is Invalid"),
  phone: Yup.string()
    .required("The Phone Number field is required")
    .test("is-valid-phone", "The Phone Number is invalid", (value) => {
      if (!value) return false;

      const parsed = parsePhoneNumberFromString(value);
      const digitsOnly = value.replace(/\D/g, "");

      return parsed?.isValid() && digitsOnly.length <= 15;
    }),
  status: Yup.string()
    .required("The Status field is required")
    .oneOf(["active", "inactive"], "Status can be either Active or Inactive"),
  address: Yup.string().required("The Address field is required"),
});

export const assignManufacturerValidationSchema = Yup.object({
  manufacturerId: Yup.string().required("The Manufacturer field is required"),
});

// ? =============== Superadmin: Manufacturer Related =============== ?
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const createManufacturerValidationSchema = Yup.object({
  connection_type: Yup.string().required(
    "The Connection Type field is required",
  ),
  name: Yup.string().trim().required("The Name field is required"),
  sftp_host: Yup.string().trim().required("The SFTP Host field is required"),
  sftp_port: Yup.number()
    .typeError("The SFTP Port must be a number")
    .required("The SFTP Port field is required"),
  sftp_location: Yup.string()
    .trim()
    .required("The SFTP Location field is required"),
  sftp_username: Yup.string()
    .trim()
    .required("The SFTP Username field is required"),
  sftp_auth_type: Yup.string()
    .oneOf(
      ["password", "ssh_key"],
      "Authentication Type can be either Password or SSH Key",
    )
    .required("The Authentication Type field is required"),
  sftp_password: Yup.string().when("sftp_auth_type", {
    is: "password",
    then: (schema) =>
      schema.trim().required("The SFTP Password field is required"),
    otherwise: (schema) => schema.strip(),
  }),
  sftp_ssh_key_file: Yup.mixed().when("sftp_auth_type", {
    is: "ssh_key",
    then: (schema) =>
      schema
        .required("The SFTP SSH Key File field is required")
        .test("fileSize", "File is too large. Max size is 5MB", (value) => {
          if (value instanceof File) {
            return value.size <= MAX_FILE_SIZE;
          }
          return true;
        }),
    otherwise: (schema) => schema.strip(),
  }),
});

export const updateManufacturerValidationSchema = Yup.object({
  connection_type: Yup.string().required(
    "The Connection Type field is required",
  ),
  name: Yup.string().trim().required("The Name field is required"),
  sftp_host: Yup.string().trim().required("The SFTP Host field is required"),
  sftp_port: Yup.number()
    .typeError("The SFTP Port must be a number")
    .required("The SFTP Port field is required"),
  sftp_location: Yup.string()
    .trim()
    .required("The SFTP Location field is required"),
  sftp_username: Yup.string()
    .trim()
    .required("The SFTP Username field is required"),
  sftp_auth_type: Yup.string()
    .oneOf(
      ["password", "ssh_key"],
      "Authentication Type can be either Password or SSH Key",
    )
    .required("The Authentication Type field is required"),
  sftp_password: Yup.string()
    .nullable()
    .when("sftp_auth_type", {
      is: "password",
      then: (schema) => schema.trim().nullable(),
      otherwise: (schema) => schema.strip(),
    }),
  sftp_ssh_key_file: Yup.mixed()
    .nullable()
    .when("sftp_auth_type", {
      is: "ssh_key",
      then: (schema) =>
        schema
          .nullable()
          .test("fileSize", "File is too large. Max size is 5MB", (value) => {
            if (value instanceof File) {
              return value.size <= MAX_FILE_SIZE;
            }
            return true;
          }),
      otherwise: (schema) => schema.strip(),
    }),
});

// ? =============== Superadmin: Store Management Related =============== ?
export const createStorValidationSchema = Yup.object().shape({
  name: Yup.string().required("Store name is required"),
  email: Yup.string()
    .required("The Email field is required")
    .email("Enter a valid email address")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email is Invalid"),
  phone: Yup.string()
    .required("The Phone Number field is required")
    .test("is-valid-phone", "Phone number is invalid", (value) => {
      if (!value) return false;

      const parsed = parsePhoneNumberFromString(value);
      const digitsOnly = value.replace(/\D/g, "");

      return parsed?.isValid() && digitsOnly.length <= 15;
    }),
  subdomain: Yup.string()
    .required("Subdomain is required")
    .matches(/^[a-z]+$/, "Only lowercase alphabets are allowed")
    .test(
      "not-admin",
      "This subdomain is not allowed",
      (value) => value?.toLowerCase() !== "admin",
    ),
  address: Yup.string().required("The Address field is required"),
  status: Yup.string()
    .required("The Status field is required")
    .oneOf(["active", "inactive"], "Status can be either Active or Inactive"),
  store_owner_id: Yup.string().required("The Store Owner field is required"),
});

export const updateStoreValidationSchema = Yup.object({
  name: Yup.string().required("Store name is required"),
  email: Yup.string()
    .required("The Email field is required")
    .email("Enter a valid email address")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email is Invalid"),
  phone: Yup.string()
    .required("The Phone Number field is required")
    .test("is-valid-phone", "Phone number is invalid", (value) => {
      if (!value) return false;

      const parsed = parsePhoneNumberFromString(value);
      const digitsOnly = value.replace(/\D/g, "");

      return parsed?.isValid() && digitsOnly.length <= 15;
    }),
  subdomain: Yup.string()
    .required("Subdomain is required")
    .matches(/^[a-z]+$/, "Only lowercase alphabets are allowed"),
  address: Yup.string().required("The Address field is required"),
  status: Yup.string()
    .required("The Status field is required")
    .oneOf(["active", "inactive"], "Status can be either Active or Inactive"),
  store_owner_id: Yup.string().required("The Store Owner field is required"),
});

export const assignStoreOwnerValidationSchema = Yup.object({
  storeOwnerId: Yup.string().required("The Store Owner field is required"),
});

// ? =============== Store Owner: Employee Management Related =============== ?
export const createEmployeeValidationSchema = Yup.object().shape({
  name: Yup.string().required("Store name is required"),
  email: Yup.string()
    .required("The Email field is required")
    .email("Enter a valid email address")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email is Invalid"),
  phone: Yup.string()
    .required("The Phone Number field is required")
    .test("is-valid-phone", "The Phone Number is invalid", (value) => {
      if (!value) return false;

      const parsed = parsePhoneNumberFromString(value);
      const digitsOnly = value.replace(/\D/g, "");

      return parsed?.isValid() && digitsOnly.length <= 15;
    }),
  store_location_id: Yup.string().required(
    "The Store Location field is required",
  ),
});

export const updateEmployeeValidationSchema = Yup.object({
  name: Yup.string().required("Store name is required"),
  email: Yup.string()
    .required("The Email field is required")
    .email("Enter a valid email address")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email is Invalid"),
  phone: Yup.string()
    .required("The Phone Number field is required")
    .test("is-valid-phone", "The Phone Number is invalid", (value) => {
      if (!value) return false;

      const parsed = parsePhoneNumberFromString(value);
      const digitsOnly = value.replace(/\D/g, "");

      return parsed?.isValid() && digitsOnly.length <= 15;
    }),
  status: Yup.string()
    .required("The Status field is required")
    .oneOf(["active", "inactive"], "Status can be either Active or Inactive"),
  role: Yup.string().required("The Role field is required"),
  store_location_id: Yup.string().required(
    "The Store Location field is required",
  ),
});

export const assignStoreLocationValidationSchema = Yup.object({
  storeLocationId: Yup.string().required(
    "The Store Location field is required",
  ),
});

// ? =============== Store Manager: Employee Management Related =============== ?
export const createEmployeeByManagerValidationSchema = Yup.object().shape({
  name: Yup.string().required("Store name is required"),
  email: Yup.string()
    .required("The Email field is required")
    .email("Enter a valid email address")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email is Invalid"),
  phone: Yup.string()
    .required("The Phone Number field is required")
    .test("is-valid-phone", "The Phone Number is invalid", (value) => {
      if (!value) return false;

      const parsed = parsePhoneNumberFromString(value);
      const digitsOnly = value.replace(/\D/g, "");

      return parsed?.isValid() && digitsOnly.length <= 15;
    }),
});

export const updateEmployeeByManagerValidationSchema = Yup.object({
  name: Yup.string().required("Store name is required"),
  email: Yup.string()
    .required("The Email field is required")
    .email("Enter a valid email address")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email is Invalid"),
  phone: Yup.string()
    .required("The Phone Number field is required")
    .test("is-valid-phone", "The Phone Number is invalid", (value) => {
      if (!value) return false;

      const parsed = parsePhoneNumberFromString(value);
      const digitsOnly = value.replace(/\D/g, "");

      return parsed?.isValid() && digitsOnly.length <= 15;
    }),
  status: Yup.string()
    .required("The Status field is required")
    .oneOf(["active", "inactive"], "Status can be either Active or Inactive"),
});

// ? =============== Store Owner: Product Management Related =============== ?
export const CreateProductCatalogSchema = Yup.object({
  name: Yup.string().required("The Product Name field is required"),
  inclusive_price: Yup.number().required("The Product Cost field is required"),
  // sku: Yup.string().required('The SKU field is required'),
  internal_sku: Yup.string().nullable(),
  product_category_id: Yup.string().nullable(),
  product_vendor_id: Yup.string().required("The Vendor field is required"),
  description: Yup.string().nullable(),
  style: Yup.string().nullable(),
  color: Yup.string().nullable(),
  uom: Yup.string().nullable(),
  coverage: Yup.string().nullable(),
  store_location_id: Yup.string().required(
    "The Assigned Location field is required",
  ),
  status: Yup.string().nullable(),
});

export const UpdateProductCatalogSchema = Yup.object({
  name: Yup.string().required("The Product Name field is required"),
  inclusive_price: Yup.number().required("The Product Cost field is required"),
  sku: Yup.string().required("The SKU field is required"),
  internal_sku: Yup.string().nullable(),
  product_category_id: Yup.string().nullable(),
  product_vendor_id: Yup.string().required("The Vendor field is required"),
  description: Yup.string().nullable(),
  style: Yup.string().nullable(),
  color: Yup.string().nullable(),
  uom: Yup.string().nullable(),
  coverage: Yup.string().nullable(),
  markup: Yup.number().nullable(),
  store_location_id: Yup.string().required(
    "The Assigned Location field is required",
  ),
  status: Yup.string().nullable(),
});

// ? =============== Store Owner: Product Category Management Related =============== ?
export const createProductCategoryValidationSchema = Yup.object().shape({
  name: Yup.string().required("Store name is required"),
  store_location_id: Yup.string().required(
    "The Store Location field is required",
  ),
  status: Yup.string()
    .required("The Status field is required")
    .oneOf(["active", "inactive"], "Status can be either Active or Inactive"),
});

export const updateProductCategoryValidationSchema = Yup.object({
  name: Yup.string().required("Store name is required"),
  store_location_id: Yup.string().required(
    "The Store Location field is required",
  ),
  status: Yup.string()
    .required("The Status field is required")
    .oneOf(["active", "inactive"], "Status can be either Active or Inactive"),
});

// ? =============== Store Owner: Product Vendor Management Related =============== ?
export const createProductVendorValidationSchema = Yup.object().shape({
  name: Yup.string().required("Store name is required"),
  store_location_id: Yup.string().required(
    "The Store Location field is required",
  ),
  status: Yup.string()
    .required("The Status field is required")
    .oneOf(["active", "inactive"], "Status can be either Active or Inactive"),
});

export const updateProductVendorValidationSchema = Yup.object({
  name: Yup.string().required("Store name is required"),
  store_location_id: Yup.string().required(
    "The Store Location field is required",
  ),
  status: Yup.string()
    .required("The Status field is required")
    .oneOf(["active", "inactive"], "Status can be either Active or Inactive"),
});

// ? =============== Store Owner: Product Tag Management Related =============== ?
export const createProductTagValidationSchema = Yup.object().shape({
  name: Yup.string().required("Store name is required"),
  store_location_id: Yup.string().required(
    "The Store Location field is required",
  ),
  status: Yup.string()
    .required("The Status field is required")
    .oneOf(["active", "inactive"], "Status can be either Active or Inactive"),
});

export const updateProductTagValidationSchema = Yup.object({
  name: Yup.string().required("Store name is required"),
  store_location_id: Yup.string().required(
    "The Store Location field is required",
  ),
  status: Yup.string()
    .required("The Status field is required")
    .oneOf(["active", "inactive"], "Status can be either Active or Inactive"),
});

// ? =============== QR Related =============== ?
export const saveQRSettingsValidationSchema = Yup.object().shape({
  store_location_id: Yup.string().required(
    "The Store Location field is required",
  ),
  margin_size: Yup.number()
    .required("The Margin Size is required")
    .min(0, "Margin size must be at least 0")
    .max(250, "Margin size must not exceed 250"),
  error_correction_level: Yup.string().required(
    "The Error Correction Level is required",
  ),
});

// ? =============== Landing Page Configuration Related =============== ?
export const saveLandingPageConfigurationValidationSchema = Yup.object().shape({
  store_location_id: Yup.string().required(
    "The Store Location field is required",
  ),

  is_cover_image_active: Yup.boolean(),
  cover_image: Yup.mixed()
    .nullable()
    .test("fileType", "Only image files are allowed", (value) => {
      if (!value) return true; // skip if null
      if (value instanceof File) {
        return ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(
          value.type,
        );
      }
      return true;
    })
    .test("fileSize", "File size should be less than 5MB", (value) => {
      if (!value) return true; // skip if null
      if (value instanceof File) {
        return value.size <= 10 * 1024 * 1024;
      }
    }),

  is_store_logo_active: Yup.boolean(),
  store_logo: Yup.mixed()
    .nullable()
    .test("fileType", "Only image files are allowed", (value) => {
      if (!value) return true; // skip if null
      if (value instanceof File) {
        return ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(
          value.type,
        );
      }
      return true;
    })
    .test("fileSize", "File size should be less than 5MB", (value) => {
      if (!value) return true; // skip if null
      if (value instanceof File) {
        return value.size <= 10 * 1024 * 1024;
      }
    }),

  is_contact_no_active: Yup.boolean(),
  contact_no: Yup.string().when("is_contact_no_active", {
    is: true,
    then: (schema) => schema.required("The Contact Number field is required"),
    otherwise: (schema) => schema.nullable(),
  }),

  is_contact_address_active: Yup.boolean(),
  contact_address: Yup.string().when("is_contact_address_active", {
    is: true,
    then: (schema) => schema.required("The Contact Address field is required"),
    otherwise: (schema) => schema.nullable(),
  }),

  is_company_website_active: Yup.boolean(),
  company_website_link: Yup.string().when("is_company_website_active", {
    is: true,
    then: (schema) =>
      schema
        .required("The Company Website Link field is required")
        .url("Please enter a valid URL"),
    otherwise: (schema) => schema.nullable(),
  }),

  is_calculator_disclaimer_active: Yup.boolean(),
  calculator_disclaimer: Yup.string().when("is_calculator_disclaimer_active", {
    is: true,
    then: (schema) =>
      schema.required("The Calculator Disclaimer field is required"),
    otherwise: (schema) => schema.nullable(),
  }),
});

// ? =============== Quote Related =============== ?
export const quoteSubmitValidationSchema = Yup.object({
  customer_name: Yup.string().required("Name is required"),
  customer_email: Yup.string()
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address")
    .required("Email is required"),
  // customer_phone_number: Yup.string().required('The Phone Number field is required'),
  consent: Yup.boolean().oneOf([true], "The Consent field must be checked"),
});

export const updateQuoteValidationSchema = Yup.object({
  notes: Yup.string().required("The Notes field is required"),
});

// ? =============== Calculator Related =============== ?
export const calculatorValidationSchema = Yup.object({
  quantity: Yup.number()
    .typeError("Quantity must be a number")
    .positive("Quantity must be greater than 0")
    .required("Quantity is required"),
});

// ? =============== Avery Template Related =============== ?
export const createCustomAveryTemplateValidationSchema = Yup.object().shape({
  title: Yup.string().required("Avery Title is required"),
  description: Yup.string().required("Avery Description is required"),
  label_width: Yup.string().required("Avery Label Width is required"),
  label_height: Yup.string().required("Avery Label Height is required"),
  labels_per_row: Yup.number()
    .required("Avery Labels per Row is required")
    .moreThan(0, "Value must be greater than 0"),
  rows: Yup.number()
    .required("Avery Rows is required")
    .moreThan(0, "Value must be greater than 0"),

  page_width: Yup.number().required("Avery Page Width is required"),
  page_height: Yup.number().required("Avery Page Height is required"),
  margin_top: Yup.number().required("Avery Margin Top is required"),
  margin_left: Yup.number().required("Avery Margin Left is required"),
  horizontal_pitch: Yup.number().required("Avery Horizontal Pitch is required"),
  vertical_pitch: Yup.number().required("Avery Vertical Pitch is required"),
});

// ? =============== Superadmin: Billing Related =============== ?
export const createCustomerValidationSchema = Yup.object({
  user_id: Yup.string().required("The Store Owner field is required"),
  firstname: Yup.string().required("The First Name field is required"),
  lastname: Yup.string().required("The Last Name field is required"),
  email: Yup.string()
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address")
    .required("Email is required"),
  phone: Yup.string()
    .required("The Phone Number field is required")
    .test("is-valid-phone", "The Phone Number is invalid", (value) => {
      if (!value) return false;

      const parsed = parsePhoneNumberFromString(value);
      const digitsOnly = value.replace(/\D/g, "");

      return parsed?.isValid() && digitsOnly.length <= 15;
    }),
  address_1: Yup.string().required("The Address Line 1 field is required"),
});

export const udpateCustomerValidationSchema = Yup.object({
  firstname: Yup.string().required("The First Name field is required"),
  lastname: Yup.string().required("The Last Name field is required"),
  email: Yup.string()
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address")
    .required("Email is required"),
  phone: Yup.string()
    .required("The Phone Number field is required")
    .test("is-valid-phone", "The Phone Number is invalid", (value) => {
      if (!value) return false;

      const parsed = parsePhoneNumberFromString(value);
      const digitsOnly = value.replace(/\D/g, "");

      return parsed?.isValid() && digitsOnly.length <= 15;
    }),
  address_1: Yup.string().required("The Address Line 1 field is required"),
});

const currentYear = new Date().getFullYear();
export const CreatePaymentMethodSchema = Yup.object({
  firstname: Yup.string().required("First name is required"),
  lastname: Yup.string().required("Last name is required"),
  month: Yup.number()
    .typeError("Month must be a number")
    .required("Month is required")
    .min(1, "Month must be between 1 and 12")
    .max(12, "Month must be between 1 and 12"),
  year: Yup.number()
    .typeError("Year must be a number")
    .required("Year is required")
    .min(currentYear, `Year must be at least ${currentYear}`)
    .max(currentYear + 10, `Year must not be more than ${currentYear + 10}`),
});

export const createSubscriptionValidationSchema = Yup.object({
  stax_item_id: Yup.string().required("Please select a subscription plan"),
  payment_method_id: Yup.string().required("Please select a payment method"),
  frequency: Yup.string().required("The Frequency field is required"),
  interval: Yup.number()
    .required("The Interval field is required")
    .min(1, "Interval must be at least 1"),
  startDate: Yup.string().required("The Start Date field is required"),
  amount: Yup.number()
    .required("The Amount field is required")
    .min(1, "The Amount must be at least 1"),
  setup_fee: Yup.number().nullable().min(0, "Setup Fee cannot be negative"),
});

export const updateSubscriptionValidationSchema = Yup.object({
  active: Yup.string().required("The Status field is required"),
  next_run_at: Yup.string().when("active", {
    is: (val: string) => val === "active",
    then: (schema) => schema.required("The Start Date field is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

// ? =============== Markup Related =============== ?
export const AddMarkupSchema = Yup.object({
  has_manufacturer_discount: Yup.string().required("Please select an option"),
  manufacturer_discount: Yup.number()
    .nullable()
    .when("has_manufacturer_discount", {
      is: (val: string) => val === "yes",
      then: (schema) =>
        schema
          .typeError("Please enter a valid discount")
          .required("Manufacturer discount is required")
          .moreThan(0, "Discount must be greater than zero"),
      otherwise: (schema) => schema.nullable().notRequired(),
    }),
  formula: Yup.string().required("Please select a formula"),
  markup: Yup.number()
    .typeError("Please enter a valid number")
    .required("Please enter markup")
    .moreThan(0, "Markup must be greater than zero"),
});

// ? =============== Help Ticket Related =============== ?
export const helpTicketSchema = Yup.object({
  message: Yup.string().required("Please write your thoughts"),
  store_location_id: Yup.string().required("Please select a store location"),
});

// ? =============== Generate ALl QR Codes Related =============== ?
export const generateAllValidationSchema = Yup.object({
  store_location_id: Yup.string().required(
    "The Store Location field is required",
  ),
});
