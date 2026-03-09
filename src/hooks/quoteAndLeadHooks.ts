import supabase from '@/configs/supabse';
import useAuthStore from '@/store/authStore';
import { timeConverter } from '@/utils/time';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isCurrentUserActive } from './enforceUserHooks';
import countryCurrency from '@/configs/countryCurrency.json';

type QuoteAndLeadInput = {
  product_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone_number: string;
  consent: boolean;
};

type UpdateLeadNotesInput = {
  notes: string;
  quote_id: string;
};

// * ====================== Fetch All Quotes [Store Owner] ====================== *
const fetchAllQuotes = async () => {
  const userId = useAuthStore.getState().userProfile?.id;

  const { data: storeOwnerData, error: storeOwneError } = await supabase
    .from('store_owners')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (storeOwneError) throw storeOwneError;

  const storeOwnerId = storeOwnerData?.id;

  const { data: storeLocationsData, error: storeLocationsDataError } = await supabase
    .from('store_locations')
    .select(`id, name, status`)
    .eq('status', 'active')
    .eq('store_owner_id', storeOwnerId)
    .order('created_at', { ascending: false });

  if (storeLocationsDataError) throw storeLocationsDataError;

  const storeLocationIds = storeLocationsData?.map((storeLocation) => storeLocation.id) || [];

  const { data, error } = await supabase
    .from('quote_and_leads')
    .select(
      `
      *,
      product:products (
        id, name,
        store_location:store_locations (
          id, name
        )
      )
     `
    )
    .order('created_at', { ascending: false });

  const filteredData = data?.filter((item) =>
    storeLocationIds.includes(item.product?.store_location?.id)
  );

  if (error) throw error;

  const allData = filteredData?.map((quote: any) => {
    const { product, ...quoteData } = quote as any;
    return {
      product: {
        id: product?.id,
        name: product?.name,
      },
      store_location: {
        id: product?.store_location?.id,
        name: product?.store_location?.name,
      },
      ...quoteData,
    };
  });

  const result = allData;

  return result;
};

export const useFetchAllQuotes = () => {
  return useQuery({
    queryKey: ['quotes'],
    queryFn: fetchAllQuotes,
    staleTime: timeConverter(20, 'minute'),
  });
};

// * ====================== Fetch All Quotes [Store Manager/Employee] ====================== *
const fetchAllQuotesForEmployee = async () => {
  const userId = useAuthStore.getState().userProfile?.id;

  const { data: employeeData, error: employeeError } = await supabase
    .from('store_employees')
    .select(
      `
      id, user_id, store_location_id
     `
    )
    .eq('user_id', userId)
    .maybeSingle();

  if (employeeError) throw employeeError;

  const storeLocationId = employeeData?.store_location_id;

  const storeLocationIds = [storeLocationId];

  const { data, error } = await supabase
    .from('quote_and_leads')
    .select(
      `
      *,
      product:products (
        id, name,
        store_location:store_locations (
          id, name
        )
      )
     `
    )
    .order('created_at', { ascending: false });

  const filteredData = data?.filter((item) =>
    storeLocationIds.includes(item.product?.store_location?.id)
  );

  if (error) throw error;

  const allData = filteredData?.map((quote: any) => {
    const { product, ...quoteData } = quote as any;
    return {
      product: {
        id: product?.id,
        name: product?.name,
      },
      store_location: {
        id: product?.store_location?.id,
        name: product?.store_location?.name,
      },
      ...quoteData,
    };
  });

  const result = allData;

  return result;
};

export const useFetchAllQuotesForEmployee = () => {
  return useQuery({
    queryKey: ['quotes-for-employee'],
    queryFn: fetchAllQuotesForEmployee,
    staleTime: timeConverter(20, 'minute'),
  });
};

// * ====================== Fetch Single Quote ====================== *
const fetchSingleQuote = async (quote_id: string) => {
  const { data, error } = await supabase
    .from('quote_and_leads')
    .select(
      `
      *,
      product:products (
        id, name,
        store_location:store_locations (
          id, name
        )
      )
     `
    )
    .eq('id', quote_id)
    .maybeSingle();

  const { product, ...quoteData } = data as any;
  const result = {
    product: {
      id: product?.id,
      name: product?.name,
    },
    store_location: {
      id: product?.store_location?.id,
      name: product?.store_location?.name,
    },
    ...quoteData,
  };

  if (error) throw error;
  return result;
};

export const useFetchSingleQuote = (quote_id: string, open?: boolean) => {
  return useQuery({
    queryKey: ['quote', quote_id],
    queryFn: () => fetchSingleQuote(quote_id),
    enabled: open,
    staleTime: timeConverter(20, 'minute'),
  });
};

// * ====================== Submit Quote ====================== *
export const submitQuote = async (quoteData: QuoteAndLeadInput) => {
  const userProfile = useAuthStore.getState().userProfile;
  const { product_id, customer_name, customer_email, customer_phone_number, consent } = quoteData;
  const quote_id = '#quote' + Date.now().toString();

  // Fetch the product details
  const { data: productData, error: productError } = await supabase
    .from('products')
    .select(
      `
        *,
        product_vendor:product_vendors (
          id, name
        ),
        store_location:store_locations (
          id, name, country_code,
          landing_page_configuration:landing_page_configurations (
            *
          )
        )
      `
    )
    .eq('id', product_id)
    .maybeSingle();

  if (productError) throw productError;

  // Insert into quote_and_leads table
  const { error: dbError, data: insertedUserData } = await supabase
    .from('quote_and_leads')
    .insert({
      quote_id,
      product_id,
      customer_name,
      customer_email,
      customer_phone_number,
      consent,
      created_by_user_id: userProfile?.id,
      updated_by_user_id: userProfile?.id,
    })
    .select();

  if (dbError || !insertedUserData?.length) {
    throw dbError || new Error('Failed to insert record');
  }
  const countryCode = productData?.store_location?.country_code?.substring(0, 2);
  const currencySymbol =
    countryCurrency.find((item) => item.country_code === countryCode)?.currency_symbol || '$';

  let productStatus = productData?.status;
  if (productStatus === null) {
    productStatus = '';
  } else if (productStatus === 'in_stock') {
    productStatus = 'In Stock';
  } else if (productStatus === 'on_sale') {
    productStatus = 'On Sale';
  }
  const config = productData?.store_location?.landing_page_configuration?.[0];
  const productInformation: any = {};

  if (config?.is_product_name_active) {
    productInformation['Product Name'] = productData?.name || '----';
  }

  if (config?.is_inclusive_price_active) {
    productInformation['Retail Price'] = productData?.retail_price
      ? currencySymbol + productData?.retail_price?.toFixed(2)
      : '----';
  }

  if (config?.is_sku_active) {
    productInformation['SKU'] = productData?.sku || '----';
  }

  if (config?.is_internal_sku_active) {
    productInformation['Internal SKU'] = productData?.internal_sku || '----';
  }

  if (config?.is_vendor_active) {
    productInformation['Vendor'] = productData?.product_vendor?.name || '----';
  }

  if (config?.is_description_active) {
    productInformation['Description'] = productData?.description || '----';
  }

  if (config?.is_style_active) {
    productInformation['Style'] = productData?.style || '----';
  }

  if (config?.is_color_active) {
    productInformation['Color'] = productData?.color || '----';
  }

  if (config?.is_uom_active) {
    productInformation['UOM'] = productData?.uom || '----';
  }

  if (config?.is_coverage_active) {
    productInformation['Coverage'] = productData?.coverage || '----';
  }
  if (config?.is_markup_active) {
    productInformation['Markup'] = productData?.markup ? productData?.markup + '%' : '----';
  }

  if (config?.is_store_location_active) {
    productInformation['Store Location'] = productData?.store_location?.name || '----';
  }

  if (config?.is_status_active) {
    productInformation['Status'] = productStatus || '----';
  }

  const allData = {
    customer_name,
    customer_email,
    customer_phone_number,
    productInformation,
  };

  // Invoke Edge Function
  const { data: fnData, error: fnError } = await supabase.functions.invoke(
    'send-quote-request-mail-and-sms',
    {
      body: JSON.stringify(allData),
    }
  );

  if (fnError) {
    // console.error('Help ticket mail function failed:', fnError);
    throw new Error('Failed to send quote request mail');
  }

  // Optionally check function's returned payload
  if (!fnData?.success) {
    // console.error('Help ticket mail function did not return success:', fnData);
    throw new Error('Quote request failed');
  }

  const insertedUserId = insertedUserData[0].id;

  return { success: true, userId: insertedUserId };
};

export const useSubmitQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'], exact: false });
    },
  });
};

// * ====================== Generate Quote Export Log ====================== *
export const generateExportLog = async () => {
  // ? ----------- Prevent Inactive User Actions -----------
  const isUserActive = await isCurrentUserActive();
  const clearAuth = useAuthStore.getState().clearAuth;

  if (!isUserActive) {
    clearAuth();
    useAuthStore.persist.clearStorage();
    throw new Error('Your account has been suspended by Super Admin');
  }

  const userProfile = useAuthStore.getState().userProfile;

  // Insert into quote_export_logs table
  const { error: dbError, data: insertedData } = await supabase
    .from('quote_export_logs')
    .insert({
      exported_at: new Date().toISOString(),
      exported_by_user_id: userProfile?.id,
    })
    .select();

  if (dbError || !insertedData?.length) {
    throw dbError || new Error('Failed to insert record');
  }

  return { success: true, data: insertedData };
};

export const useGenerateQuoteExportLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateExportLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-log'], exact: false });
    },
  });
};

// * ====================== Get the latest export log ====================== *
export const getLatestQuoteExport = async () => {
  const { data, error } = await supabase
    .from('quote_export_logs')
    .select('*')
    .order('exported_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const useGetLatestQuoteExport = () => {
  return useQuery({
    queryKey: ['quote-log'],
    queryFn: getLatestQuoteExport,
    staleTime: timeConverter(20, 'minute'),
  });
};

// * ====================== Update Quote Note ====================== *
export const updateQuoteNote = async (quoteData: UpdateLeadNotesInput) => {
  // ? ----------- Prevent Inactive User Actions -----------
  const isUserActive = await isCurrentUserActive();
  const clearAuth = useAuthStore.getState().clearAuth;

  if (!isUserActive) {
    clearAuth();
    useAuthStore.persist.clearStorage();
    throw new Error('Your account has been suspended by Super Admin');
  }

  const { notes, quote_id } = quoteData;
  if (!quote_id) throw new Error('Quote not found');

  // check the existence in supabase
  const { data, error } = await supabase
    .from('quote_and_leads')
    .select('id')
    .eq('id', quote_id)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Quote not found');

  // Update into quote_and_leads table
  const { error: dbError, data: updatedData } = await supabase
    .from('quote_and_leads')
    .update({
      notes: notes ? notes : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', quote_id)
    .select();

  if (dbError || !updatedData?.length) {
    throw dbError || new Error('Failed to update record');
  }

  const updatedId = updatedData[0].id;

  return { success: true, userId: updatedId };
};

export const useUpdateQuoteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateQuoteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['quote'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['quotes-for-employee'], exact: false });
    },
  });
};
