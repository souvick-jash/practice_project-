import type { AuthSession, User } from "@supabase/supabase-js";
import type { LucideIcon } from "lucide-react";
import type React from "react";
import type { ComponentType } from "react";

// ? ======================================================= ?
// ? Theme Related
// ? ======================================================= ?

export type Theme = "dark" | "light" | "system";

export type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

export type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

// ? ======================================================= ?
// ? Action Menu Related
// ? ======================================================= ?

type CreationOptions = {
  title: string;
  description?: string;
  component?: ComponentType;
};

type UpdateOptions = {
  title: string;
  description?: string;
};

type ViewOptions = {
  title: string;
  description?: string;
};

export type ActionMenuConfig = {
  tableTitle?: string;
  titleIcon?: LucideIcon;
  willCellWrap?: boolean;
  isVisibilityTogglable?: boolean;
  isSearchable?: boolean;
  showFilter?: boolean;
  searchPlaceholder?: string;
  searchColumns: string[];
  showCreateButton?: boolean;
  creationOptions?: CreationOptions;
  showDeleteButton?: boolean;
  deleteConfirmationOptions?: {
    title?: string;
    description?: string;
    confirmLabel?: string;
  };
  showEditButton?: boolean;
  updateOptions?: UpdateOptions;
  showViewButton?: boolean;
  viewOptions?: ViewOptions;
  extraOptions?: any;
};

// ? ======================================================= ?
// ? Authentication Related
// ? ======================================================= ?

export type UserProfile = {
  id: string;
  auth_user_id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string | null;
  role: "superadmin" | "owner" | "manager" | "employee";
  status: "active" | "inactive";
  address?: string;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  created_by_user_id?: string;
  updated_by_user_id?: string;
  deleted_by_user_id?: string;
};

export interface AuthState {
  session: AuthSession | null;
  user: User | null;
  userProfile: UserProfile | null;
  isAuthInitialized: boolean;
  _hasHydrated: boolean;
  setSession: (session: AuthSession | null) => void;
  setUser: (user: User | null) => void;
  setUserProfile: (userProfile: UserProfile | null) => void;
  setIsAuthInitialized: (isAuthInitialized: boolean) => void;
  clearAuth: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export interface LoginFormWithEmailPasswordInitialValues {
  email: string;
  password: string;
}

export interface LoginFormWithPhoneOTPInitialValues {
  phone: string;
  otp: string;
}

// ? ======================================================= ?
// ? Profile Related
// ? ======================================================= ?

export interface SuperAdminProfileFormInitialValues {
  name: string;
  email: string;
  phone: string;
  avatar_image: File | null;
  avatar_url?: string;
}

export interface UserFieldsData {
  name?: string;
  email?: string;
  phone?: string;
}

export interface UpdateUserData {
  authData?: {
    email?: string;
    display_name?: string;
    phone?: string;
  };
  userTableData?: UserFieldsData;
}

// ? ======================================================= ?
// ? Store Owner Related
// ? ======================================================= ?

export interface StoreOwner {
  id: string;
  auth_user_id: string;
  unique_id: string;
  name: string;
  email: string;
  phone: string;
  role: "owner";
  status: "active" | "inactive";
  address?: string;
  street?: string;
  city?: string;
  state?: string;
  state_code?: string;
  country?: string;
  country_code?: string;
  zip?: string;
  lat?: string;
  lng?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  created_by_user_id?: string;
  updated_by_user_id?: string;
  deleted_by_user_id?: string;
}

export interface CreateStoreOwnerFormInitialValues {
  name: string;
  email: string;
  phone: string;
  address?: string;
  street?: string;
  city?: string;
  state?: string;
  state_code?: string;
  country?: string;
  country_code?: string;
  zip?: string;
  lat: string;
  lng: string;
}

export interface UpdateStoreOwnerFormInitialValues {
  name: string;
  email: string;
  phone: string;
  status?: "active" | "inactive";
  address?: string;
  street?: string;
  city?: string;
  state?: string;
  state_code?: string;
  country?: string;
  country_code?: string;
  zip?: string;
  lat: string;
  lng: string;
}

export interface AssignManufacturerFormInitialValues {
  manufacturerId: string;
}

// ? ======================================================= ?
// ? Manufacturer Related
// ? ======================================================= ?

export interface Manufacturer {
  id: string;
  name: string;
  sftp_host: string;
  sftp_port: number;
  sftp_location: string;
  sftp_username: string;
  sftp_auth_type: "password" | "ssh_key";
  sftp_password: string;
  sftp_password_iv?: string;
  sftp_ssh_key_file_url?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  created_by_user_id?: string;
  updated_by_user_id?: string;
  deleted_by_user_id?: string;
}

export interface CreateManufacturerFormInitialValues {
  connection_type: string;
  name: string;
  sftp_host: string;
  sftp_port: number | null;
  sftp_location: string;
  sftp_username: string;
  sftp_auth_type: "password" | "ssh_key";
  sftp_password: string;
  sftp_ssh_key_file: File | null;
  store_location_id: string;
}

export interface UpdateManufacturerFormInitialValues {
  connection_type: string;
  name: string;
  sftp_host: string;
  sftp_port: number;
  sftp_location: string;
  sftp_username: string;
  sftp_auth_type: "password" | "ssh_key";
  sftp_password: string;
  sftp_ssh_key_file: File | null;
  store_location_id: string;
}

// ? ======================================================= ?
// ? Store Management Related
// ? ======================================================= ?

export interface StoreManagement {
  id: string;
  store_owner_id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  store_location_count: number;
  subdomain: string;
  address?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
  lat: string;
  lng: string;
  state_code?: string;
  country_code?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  created_by_user_id?: string;
  updated_by_user_id?: string;
  deleted_by_user_id?: string;
}

export interface StoreLocation {
  id: string;
  store_id: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  created_by_user_id?: string;
  updated_by_user_id?: string;
  deleted_by_user_id?: string;
}

export interface CreateStoreFormInitialValues {
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  subdomain: string;
  store_owner_id: string;
  address?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
  lat: string;
  lng: string;
  state_code?: string;
  country_code?: string;
}

export interface UpdateStoreFormInitialValues {
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  subdomain: string;
  store_owner_id: string;
  address?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
  lat: string;
  lng: string;
  state_code?: string;
  country_code?: string;
}

// ? ======================================================= ?
// ? Employee Management Related
// ? ======================================================= ?

export interface EmployeeManagement {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "manager" | "employee";
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  created_by_user_id?: string;
  updated_by_user_id?: string;
  deleted_by_user_id?: string;
}

export interface StoreLocation {
  id: string;
  store_id: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  created_by_user_id?: string;
  updated_by_user_id?: string;
  deleted_by_user_id?: string;
}

export interface CreateEmployeeFormInitialValues {
  name: string;
  email: string;
  phone: string;
  role: "manager" | "employee";
  store_location_id: string;
}

export interface UpdateEmployeeFormInitialValues {
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  role: "manager" | "employee";
  store_location_id: string;
}

export interface AssignStoreLocationFormInitialValues {
  storeLocationId: string;
}

export interface CreateEmployeeFormByManagerInitialValues {
  name: string;
  email: string;
  phone: string;
}

export interface UpdateEmployeeFormByManagerInitialValues {
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
}

// ? ======================================================= ?
// ? Product Catalog Management Related
// ? ======================================================= ?

export interface ProductCatalog {
  id: string;
  name: string;
  inclusive_price: number;
  sku: string;
  internal_sku: string;
  category_id: string;
  vendor_id: string;
  description: string;
  style: string;
  color: string;
  uom: string;
  coverage: string;
  status: "active" | "inactive";
  markup: number | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  created_by_user_id?: string;
  updated_by_user_id?: string;
  deleted_by_user_id?: string;
}

export interface CreateProductCatalogIntialValues {
  name: string;
  inclusive_price: number | null;
  sku: string;
  internal_sku: string;
  product_vendor_id: string;
  description: string;
  style: string;
  color: string;
  uom: string;
  coverage: string;
  status: string | null;
  store_location_id: string;
}

export interface UpdateProductCatalogIntialValues {
  name: string;
  inclusive_price: number | null;
  sku: string;
  internal_sku: string;
  product_vendor_id: string;
  description: string;
  style: string;
  color: string;
  uom: string;
  coverage: string;
  status: string | null;
  store_location_id: string;
  discontinued: string;
}

export interface AddMarkupFormInitialValues {
  has_manufacturer_discount: string;
  manufacturer_discount: number | null;
  formula: string;
  markup: number | null;
}

// ? ======================================================= ?
// ? Product Category Management Related
// ? ======================================================= ?

export interface CreateProductCategoryFormInitialValues {
  name: string;
  store_location_id: string;
  status: "active" | "inactive";
}

export interface UpdateProductCategoryFormInitialValues {
  name: string;
  store_location_id: string;
  status: "active" | "inactive";
}

// ? ======================================================= ?
// ? Product Vendor Management Related
// ? ======================================================= ?

export interface CreateProductVendorFormInitialValues {
  name: string;
  store_location_id: string;
  status: "active" | "inactive";
}

export interface UpdateProductVendorFormInitialValues {
  name: string;
  store_location_id: string;
  status: "active" | "inactive";
}

// ? ======================================================= ?
// ? Product Tag Management Related
// ? ======================================================= ?

export interface CreateProductTagFormInitialValues {
  name: string;
  store_location_id: string;
  status: "active" | "inactive";
}

export interface UpdateProductTagFormInitialValues {
  name: string;
  store_location_id: string;
  status: "active" | "inactive";
}

// ? ======================================================= ?
// ? QR Management Related
// ? ======================================================= ?

export interface QRCodeGenertorSettingsFormInitialValues {
  store_location_id: string;
  margin_size: number;
  error_correction_level: "L" | "M" | "Q" | "H";
}

// ? ======================================================= ?
// ? Landing Page Configuration Related
// ? ======================================================= ?

export interface LandingPageConfigurationFormInitialValues {
  store_location_id: string;

  is_cover_image_active: boolean;
  cover_image: File | null;

  is_store_logo_active: boolean;
  store_logo: File | null;

  is_contact_no_active: boolean;
  contact_no: string;

  is_contact_address_active: boolean;
  contact_address: string;

  is_company_website_active: boolean;
  company_website_link: string;

  is_calculator_disclaimer_active: boolean;
  calculator_disclaimer: string;

  is_product_name_active: boolean;
  is_inclusive_price_active: boolean;
  is_sku_active: boolean;
  is_internal_sku_active: boolean;
  is_vendor_active: boolean;
  is_description_active: boolean;
  is_style_active: boolean;
  is_color_active: boolean;
  is_uom_active: boolean;
  is_coverage_active: boolean;
  is_markup_active: boolean;
  is_store_location_active: boolean;
  is_status_active: boolean;

  custom_fields: {
    label: string;
    value: string;
    active: boolean;
  }[];
}

// ? ======================================================= ?
// ? Quote and Lead Related
// ? ======================================================= ?

export interface QuoteFormInitialValues {
  customer_name: string;
  customer_email: string;
  customer_phone_number: string;
  consent: boolean;
}

export interface UpdateLeadNotes {
  notes: string;
}

export interface LabelSheetConfig {
  pageWidth: number;
  pageHeight: number;
  labelWidth: number;
  labelHeight: number;
  labelsPerRow: number;
  rows: number;
  horizontalGap: number;
  verticalGap: number;
}

export interface Margins {
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
}

// ? ======================================================= ?
// ? Avery Template Related
// ? ======================================================= ?

export interface CreateAveryTemplateFormInitialValues {
  title: string;
  description: string;
  label_width: string;
  label_height: string;
  labels_per_row: number;
  rows: number;

  page_width: number;
  page_height: number;
  margin_top: number;
  margin_left: number;
  horizontal_pitch: number;
  vertical_pitch: number;
}

// ? ======================================================= ?
// ? Billing Related
// ? ======================================================= ?
export interface CreateCustomerFormInitialValues {
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  company: string;
  address_1: string;
  address_2: string;
  address_city: string;
  address_state: string;
  address_country: string;
  address_zip: string;
}

export interface UpdateCustomerFormInitialValues {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  company: string;
  address_1: string;
  address_2: string;
  address_city: string;
  address_state: string;
  address_country: string;
  address_zip: string;
}

export interface CreateSubscriptionFormInitialValues {
  stax_item_id: string;
  payment_method_id: string;
  frequency: string;
  interval: number;
  startDate: string;
  amount: number | null;
  setup_fee?: number | null;
}

export interface StaxCustomer {
  id: string;
  user_id: string;
  customer_id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  company: string;
  address_1: string;
  address_2: string;
  address_city: string;
  address_state: string;
  address_country: string;
  address_zip: string;
  created_by_user_id: string;
  updated_by_user_id: string;
  created_at: string;
  updated_at: string;
  stax_payment_methods: any;
}
export interface UpdateSubscriptionFormInitialValues {
  active: string;
  next_run_at?: string;
}

// ? ======================================================= ?
// ? Help Button Related
// ? ======================================================= ?

export interface HelpButtonFormInitialValues {
  message: string | null;
  store_location_id: string | null;
}
