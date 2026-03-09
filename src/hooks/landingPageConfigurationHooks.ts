import supabase from '@/configs/supabse';
import useAuthStore from '@/store/authStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { nanoid } from 'nanoid';
import { isCurrentUserActive } from './enforceUserHooks';
import { validStoreLocation } from './generalHooks';

type LandingPageConfigurationInput = {
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
};

interface QRScanInput {
  product_id: string;
  ip_address: string;
  user_agent: string;
}

// * ====================== Fetch Landing Page Configuration ====================== *
const fetchLandingPageConfiguration = async (store_location_id: string) => {
  if (!store_location_id) throw new Error('Store Location not found');

  const { data, error } = await supabase
    .from('landing_page_configurations')
    .select(
      `
        *,
        store_location:store_locations (
          id, name
        )
      `
    )
    .eq('store_location_id', store_location_id)
    .maybeSingle();

  if (error) return [];

  return data;
};

export const useFetchLandingPageConfiguration = (store_location_id: string, option?: any) => {
  return useQuery({
    queryKey: ['landing-page-configuration', store_location_id],
    queryFn: () => fetchLandingPageConfiguration(store_location_id),
    enabled: option?.enabled ?? true,
  });
};

// * ====================== Save Landing Page Configuration ====================== *
const saveLandingPageConfiguration = async (
  landingPageConfigurationData: LandingPageConfigurationInput
) => {
  const {
    store_location_id,

    is_cover_image_active,
    cover_image,

    is_store_logo_active,
    store_logo,

    is_contact_no_active,
    contact_no,

    is_contact_address_active,
    contact_address,

    is_company_website_active,
    company_website_link,

    is_calculator_disclaimer_active,
    calculator_disclaimer,

    is_product_name_active,
    is_inclusive_price_active,
    is_sku_active,
    is_internal_sku_active,
    is_vendor_active,
    is_description_active,
    is_style_active,
    is_color_active,
    is_uom_active,
    is_coverage_active,
    is_markup_active,
    is_store_location_active,
    is_status_active,

    custom_fields,
  } = landingPageConfigurationData;

  // ? ----------- Prevent Inactive User Actions -----------
  const isUserActive = await isCurrentUserActive();
  const clearAuth = useAuthStore.getState().clearAuth;

  if (!isUserActive) {
    clearAuth();
    useAuthStore.persist.clearStorage();
    throw new Error('Your account has been suspended by Super Admin');
  }

  // ? ---------- Store Location Check -----------
  const isValid = await validStoreLocation(store_location_id);
  if (!isValid) {
    throw new Error('Store location is not valid');
  }

  const userProfile = useAuthStore.getState().userProfile;

  // Step 1: Check if a row already exists for this store location
  const { data: existingData, error: fetchError } = await supabase
    .from('landing_page_configurations')
    .select('id')
    .eq('store_location_id', store_location_id)
    .maybeSingle();

  if (fetchError && fetchError.code !== 'PGRST116') {
    // Not a "No rows found" error, so throw it
    throw fetchError;
  }

  // Save Cover Image
  let cover_image_url = null;
  if (cover_image) {
    const uniqueId = nanoid();
    const fileName = `landing_page_cover_images/${uniqueId}-${cover_image.name}`;
    const { error: uploadCoverImageError } = await supabase.storage
      .from('store-bucket')
      .upload(fileName, cover_image, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadCoverImageError) throw uploadCoverImageError;

    const { data: imageData } = supabase.storage.from('store-bucket').getPublicUrl(fileName);
    cover_image_url = imageData.publicUrl;
  }

  // Save Store Logo
  let store_logo_url = null;
  if (store_logo) {
    const uniqueId = nanoid();
    const fileName = `landing_page_store_logos/${uniqueId}-${store_logo.name}`;
    const { error: uploadStoreLogoError } = await supabase.storage
      .from('store-bucket')
      .upload(fileName, store_logo, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadStoreLogoError) throw uploadStoreLogoError;

    const { data: imageData } = supabase.storage.from('store-bucket').getPublicUrl(fileName);
    store_logo_url = imageData.publicUrl;
  }

  const allData: {
    store_location_id?: string;
    is_cover_image_active: boolean;
    is_store_logo_active: boolean;
    is_contact_no_active: boolean;
    contact_no: string;
    is_contact_address_active: boolean;
    contact_address: string;
    is_company_website_active: boolean;
    company_website_link: string;
    is_calculator_disclaimer_active: boolean;
    calculator_disclaimer: string;
    cover_image_url?: string | null;
    store_logo_url?: string | null;
    updated_by_user_id?: string;
    created_by_user_id?: string;
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
  } = {
    is_cover_image_active,

    is_store_logo_active,

    is_contact_no_active,
    contact_no,

    is_contact_address_active,
    contact_address,

    is_company_website_active,
    company_website_link,

    is_calculator_disclaimer_active,
    calculator_disclaimer,
    is_product_name_active,
    is_inclusive_price_active,
    is_sku_active,
    is_internal_sku_active,
    is_vendor_active,
    is_description_active,
    is_style_active,
    is_color_active,
    is_uom_active,
    is_coverage_active,
    is_markup_active,
    is_store_location_active,
    is_status_active,
    custom_fields,
  };

  if (cover_image_url) allData.cover_image_url = cover_image_url;
  if (store_logo_url) allData.store_logo_url = store_logo_url;
  if (existingData) {
    allData.updated_by_user_id = userProfile?.id;
  } else {
    allData.store_location_id = store_location_id;
    allData.created_by_user_id = userProfile?.id;
  }

  let result = null;

  if (existingData) {
    // Step 2: Update if exists
    const { data, error } = await supabase
      .from('landing_page_configurations')
      .update(allData)
      .eq('store_location_id', store_location_id);

    if (error) throw error;
    result = data;
  } else {
    // Step 3: Insert if not exists
    const { data, error } = await supabase.from('landing_page_configurations').insert(allData);

    if (error) throw error;
    result = data;
  }

  return { success: true, data: result };
};

export const useSaveLandingPageConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      landingPageConfigurationData,
    }: {
      landingPageConfigurationData: LandingPageConfigurationInput;
    }) => saveLandingPageConfiguration(landingPageConfigurationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-page-configuration'], exact: false });
    },
  });
};

// * ====================== QR Scan activity generator ====================== *
const trackProductView = async ({ product_id, ip_address, user_agent }: QRScanInput) => {
  if (!product_id || !ip_address || !user_agent) return;

  const { data: product } = await supabase
    .from('products')
    .select(
      `
        *,
        qr_code:qr_codes(
          id, product_id, qr_code_image_url
        )
      `
    )
    .eq('id', product_id)
    .maybeSingle();

  if (!product) return;

  const qr_code_id = product.qr_code?.[0]?.id;
  if (!qr_code_id) return;

  const { data: existing } = await supabase
    .from('qr_scans')
    .select('id')
    .eq('product_id', product_id)
    .eq('ip_address', ip_address)
    .maybeSingle();

  if (!existing) {
    const { error } = await supabase.from('qr_scans').insert({
      qr_code_id,
      product_id,
      ip_address,
      user_agent,
    });

    if (error) throw error;
  }

  return { success: true };
};

export const useTrackProductViewMutation = () => {
  return useMutation({
    mutationFn: trackProductView,
  });
};
