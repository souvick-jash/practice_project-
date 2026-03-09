import supabase from '@/configs/supabse';
import useAuthStore from '@/store/authStore';
import { getManufacturerDuscountedPrice, getMarkedupPrice } from '@/utils/markup';
import { timeConverter } from '@/utils/time';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isCurrentUserActive } from './enforceUserHooks';
import { validStoreLocation } from './generalHooks';
import { useProductFiltersStore } from '@/store/productFilterStore';

type CreateProductInput = {
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
};

type UpdateProductInput = {
  id: string;
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
  discontinued: boolean;
};

type AddMarkupInput = {
  productIds: string[];
  has_manufacturer_discount: string;
  manufacturer_discount: number;
  formula: string;
  markup: number;
};

interface UseFetchAllProductsOptions {
  limit?: number;
  storeLocationId?: string;
  enabled?: boolean;
}
interface UseFetchAllProductsForEmployeeOptions {
  limit?: number;
  storeLocationId?: string;
  enabled?: boolean;
}

// * ====================== Fetch All Products ====================== *
const fetchAllProducts = async (options?: UseFetchAllProductsOptions) => {
  const { limit, storeLocationId } = options || {};

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
    .select(
      `
    id, name, status
   `
    )
    .eq('status', 'active')
    .eq('store_owner_id', storeOwnerId)
    .order('created_at', { ascending: false });

  if (storeLocationsDataError) throw storeLocationsDataError;

  let storeLocationIds = storeLocationsData?.map((storeLocation) => storeLocation.id) || [];

  if (storeLocationId) {
    storeLocationIds = [storeLocationId];
  }

  let query = supabase
    .from('products')
    .select(
      `
      *,
      store_location:store_locations (
        id, name, status, subdomain,
        landing_page_configuration:landing_page_configurations (
          id, store_location_id
        )
      ),
      product_category:product_categories (
        id, name, status
      ),
      product_vendor:product_vendors (
        id, name, status
      ),
      product_product_tag (
       *,
       product_tags (
          id, name, status
        )
      ),
      qr_code:qr_codes (
       id, product_id, qr_code_image_url
      )
    `
    )
    .in('store_location_id', storeLocationIds)
    .order('created_at', { ascending: false });

  // Apply limit if passed
  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  const result =
    (data as any[])?.map((row) => {
      const {
        product_product_tag,
        store_location,
        product_category,
        product_vendor,
        qr_code,
        ...productData
      } = row;

      const product_tags =
        (product_product_tag as any[])
          ?.map((product_tag) => {
            const tag = product_tag?.product_tags;
            return tag
              ? {
                  id: tag.id,
                  name: tag.name,
                }
              : null;
          })
          .filter(Boolean) || [];

      return {
        ...productData,
        qr_code: qr_code?.[0],
        product_category,
        product_vendor,
        store_location,
        product_tags,
      };
    }) || [];

  if (error) throw error;
  return result;
};

export const useFetchAllProducts = (options?: UseFetchAllProductsOptions) => {
  return useQuery({
    queryKey: ['products', options?.limit, options?.storeLocationId],
    queryFn: () => fetchAllProducts(options),
    staleTime: timeConverter(20, 'minute'),
    enabled: options?.enabled ?? true,
  });
};

// * ====================== Fetch All Products For Employee ====================== *
const fetchAllProductsForEmployee = async (options?: UseFetchAllProductsForEmployeeOptions) => {
  const { limit, storeLocationId } = options || {};
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

  let theStoreLocationId = employeeData?.store_location_id;

  if (storeLocationId) {
    theStoreLocationId = storeLocationId;
  }

  if (!theStoreLocationId) {
    return [];
  }

  if (employeeError) throw employeeError;

  let query = supabase
    .from('products')
    .select(
      `
      *,
      store_location:store_locations (
        id, name, status, subdomain
      ),
      product_category:product_categories (
        id, name, status
      ),
      product_vendor:product_vendors (
        id, name, status
      ),
      product_product_tag (
       *,
       product_tags (
          id, name, status
        )
      ),
      qr_code:qr_codes (
       id, product_id, qr_code_image_url
      )
    `
    )
    .eq('store_location_id', theStoreLocationId)
    .order('created_at', { ascending: false });

  // Apply limit if passed
  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  const result =
    (data as any[])?.map((row) => {
      const {
        product_product_tag,
        store_location,
        product_category,
        product_vendor,
        qr_code,
        ...productData
      } = row;

      const product_tags =
        (product_product_tag as any[])
          ?.map((product_tag) => {
            const tag = product_tag?.product_tags;
            return tag
              ? {
                  id: tag.id,
                  name: tag.name,
                }
              : null;
          })
          .filter(Boolean) || [];

      return {
        ...productData,
        qr_code: qr_code?.[0],
        product_category,
        product_vendor,
        store_location,
        product_tags,
      };
    }) || [];

  if (error) throw error;

  return result;
};

export const useFetchAllProductsForEmployee = (options?: UseFetchAllProductsForEmployeeOptions) => {
  return useQuery({
    queryKey: ['products', options?.limit, options?.storeLocationId],
    queryFn: () => fetchAllProductsForEmployee(options),
    staleTime: timeConverter(20, 'minute'),
    enabled: options?.enabled ?? true,
  });
};

// * ====================== Fetch Single Product ====================== *
const fetchSingleProduct = async (productId: string) => {
  const { data, error } = await supabase
    .from('products')
    .select(
      `
      *,
      store_location:store_locations (
        id, name, status, country_code,
        landing_page_configuration:landing_page_configurations (
          *
        )
      ),
      product_category:product_categories (
        id, name, status
      ),
      product_vendor:product_vendors (
        id, name, status
      ),
      product_product_tag (
       *,
       product_tags (
          id, name, status
        )
      )
    `
    )
    .eq('id', productId)
    .maybeSingle();

  const { product_product_tag, store_location, product_category, product_vendor, ...productData } =
    data || {};

  const landing_page_configuration = store_location?.landing_page_configuration?.[0];

  const store_location_data = {
    id: store_location?.id,
    name: store_location?.name,
    status: store_location?.status,
    country_code: store_location?.country_code,
  };

  const product_tags =
    product_product_tag?.map((product_tag: { product_tags: { id: string; name: string } }) => {
      return {
        id: product_tag?.product_tags?.id,
        name: product_tag?.product_tags?.name,
      };
    }) || [];

  const result = {
    ...productData,
    product_category,
    product_vendor,
    store_location: store_location_data,
    landing_page_configuration,
    product_tags,
  };

  if (error) throw error;
  return result;
};

export const useFetchSingleProduct = (productId: string, open?: boolean) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchSingleProduct(productId),
    enabled: open,
    staleTime: timeConverter(20, 'minute'),
  });
};

// * ====================== Fetch Categories of this Owner ====================== *
const fetchAllCategories = async (store_location_id?: string) => {
  let storeLocationIds = [];
  if (!store_location_id) {
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
      .select(
        `
    id, name, status
   `
      )
      .eq('status', 'active')
      .eq('store_owner_id', storeOwnerId)
      .order('created_at', { ascending: false });

    if (storeLocationsDataError) throw storeLocationsDataError;

    storeLocationIds = storeLocationsData?.map((storeLocation) => storeLocation.id) || [];
  }

  if (storeLocationIds.length === 0 && !store_location_id) {
    return [];
  }

  const query = supabase
    .from('product_categories')
    .select('id, name, status, created_by_user_id')
    .eq('status', 'active')
    .order('name', { ascending: true });

  if (store_location_id) {
    query.eq('store_location_id', store_location_id);
  } else if (storeLocationIds.length > 0) {
    query.in('store_location_id', storeLocationIds);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

export const useFetchAllCategories = (store_location_id?: string, options = {}) => {
  return useQuery({
    queryKey: ['product-categories'],
    queryFn: () => fetchAllCategories(store_location_id),
    staleTime: timeConverter(20, 'minute'),
    ...options,
  });
};

// * ====================== Fetch Vendors of this Owner ====================== *
const fetchAlVendors = async (store_location_id?: string) => {
  let storeLocationIds = [];

  if (!store_location_id) {
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
      .select(
        `
          id, name, status
        `
      )
      .eq('status', 'active')
      .eq('store_owner_id', storeOwnerId)
      .order('created_at', { ascending: false });

    if (storeLocationsDataError) throw storeLocationsDataError;

    storeLocationIds = storeLocationsData?.map((storeLocation) => storeLocation.id) || [];
  }

  if (storeLocationIds.length === 0 && !store_location_id) {
    return [];
  }

  const query = supabase
    .from('product_vendors')
    .select(`id, name, status, created_by_user_id`)
    .eq('status', 'active')
    .order('name', { ascending: true });

  if (store_location_id) {
    query.eq('store_location_id', store_location_id);
  } else if (storeLocationIds.length > 0) {
    query.in('store_location_id', storeLocationIds);
  }
  const { data, error } = await query;

  const result = data;

  if (error) throw error;
  return result;
};

export const useFetchAllVendors = (store_location_id?: string, options = {}) => {
  return useQuery({
    queryKey: ['product-vendors'],
    queryFn: () => fetchAlVendors(store_location_id),
    staleTime: timeConverter(20, 'minute'),
    ...options,
  });
};

// * ====================== Fetch Product Tags of this Owner ====================== *
const fetchAllTags = async (store_location_id?: string) => {
  let storeLocationIds = [];

  if (!store_location_id) {
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
      .select(
        `
    id, name, status
   `
      )
      .eq('status', 'active')
      .eq('store_owner_id', storeOwnerId)
      .order('created_at', { ascending: false });

    if (storeLocationsDataError) throw storeLocationsDataError;

    storeLocationIds = storeLocationsData?.map((storeLocation) => storeLocation.id) || [];
  }

  if (storeLocationIds.length === 0 && !store_location_id) {
    return [];
  }

  const query = supabase
    .from('product_tags')
    .select('id, name, status, created_by_user_id')
    .eq('status', 'active')
    .order('name', { ascending: true });

  if (store_location_id) {
    query.eq('store_location_id', store_location_id);
  } else if (storeLocationIds.length > 0) {
    query.in('store_location_id', storeLocationIds);
  }

  const { data, error } = await query;

  const result = data;

  if (error) throw error;
  return result;
};

export const useFetchAllTags = (store_location_id?: string, options = {}) => {
  return useQuery({
    queryKey: ['product-tags'],
    queryFn: () => fetchAllTags(store_location_id),
    staleTime: timeConverter(20, 'minute'),
    ...options,
  });
};

// * ====================== Create Product ====================== *
const createProduct = async (productData: CreateProductInput) => {
  const userProfile = useAuthStore.getState().userProfile;
  const {
    name,
    inclusive_price,
    sku,
    internal_sku,
    product_vendor_id,
    description,
    style,
    color,
    uom,
    coverage,
    status,
    store_location_id,
  } = productData;

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

  // Check if there is no duplocate SKU for the same store location
  const { data: existingData, error: fetchError } = await supabase
    .from('products')
    .select('id')
    .eq('store_location_id', store_location_id)
    .eq('sku', sku);

  if (fetchError) throw fetchError;
  if (existingData && existingData.length > 0) {
    throw new Error('SKU already exists for this store location');
  }

  const { error, data: insertedProduct } = await supabase
    .from('products')
    .insert({
      store_location_id: store_location_id ? store_location_id : null,
      name: name ? name : null,
      inclusive_price: inclusive_price ? inclusive_price : null,
      sku: sku ? sku : null,
      internal_sku: internal_sku ? internal_sku : null,
      product_vendor_id: product_vendor_id ? product_vendor_id : null,
      description: description ? description : null,
      style: style ? style : null,
      color: color ? color : null,
      uom: uom ? uom : null,
      coverage: coverage ? coverage : null,
      status: status ? status : null,
      created_by_user_id: userProfile?.id,
      created_at: new Date().toISOString(),
    })
    .select();

  if (error) throw error;

  // Insert tags
  // const insertedProductId = insertedProduct[0].id;
  // const { error: tagError } = await supabase
  //   .from('product_product_tag')
  //   .insert(tags.map((tag: any) => ({ product_id: insertedProductId, product_tag_id: tag.value })));
  // if (tagError) throw tagError;

  return { succss: true, data: insertedProduct };
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['product-vendors-for-filter'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['product-styles-for-filter'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['product-colors-for-filter'], exact: false });
    },
  });
};

// * ====================== Update Product ====================== *
const updateProduct = async (productData: UpdateProductInput) => {
  const {
    id,
    name,
    inclusive_price,
    sku,
    internal_sku,
    product_vendor_id,
    description,
    style,
    color,
    uom,
    coverage,
    status,
    store_location_id,
    discontinued,
  } = productData;

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

  // Check if there is no duplocate SKU for the same store location
  const { data: existingData, error: fetchError } = await supabase
    .from('products')
    .select('id')
    .eq('store_location_id', store_location_id)
    .eq('sku', sku)
    .neq('id', id);

  if (fetchError) throw fetchError;
  if (existingData && existingData.length > 0) {
    throw new Error('SKU already exists for this store location');
  }

  const { data: productInfo, error: productInfoError } = await supabase
    .from('products')
    .select('id, name, markup, formula, has_manufacturer_discount, manufacturer_discount')
    .eq('id', id)
    .maybeSingle();

  if (!productData) throw new Error('Product not found');
  if (productInfoError) throw productInfoError;

  let discounted_price = 0;

  if (productInfo?.has_manufacturer_discount === 'yes') {
    discounted_price = getManufacturerDuscountedPrice(
      inclusive_price || 0,
      productInfo?.manufacturer_discount
    );
  }
  const retail_price = discounted_price
    ? getMarkedupPrice(discounted_price, productInfo?.markup, productInfo?.formula)
    : getMarkedupPrice(inclusive_price || 0, productInfo?.markup, productInfo?.formula);

  const { error } = await supabase
    .from('products')
    .update({
      store_location_id: store_location_id ? store_location_id : null,
      name: name ? name : null,
      inclusive_price: inclusive_price ? inclusive_price : null,
      sku: sku ? sku : null,
      internal_sku: internal_sku ? internal_sku : null,
      product_vendor_id: product_vendor_id ? product_vendor_id : null,
      description: description ? description : null,
      style: style ? style : null,
      color: color ? color : null,
      uom: uom ? uom : null,
      coverage: coverage ? coverage : null,
      status,
      retail_price,
      discontinued,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;

  // const { error: tagError } = await supabase
  //   .from('product_product_tag')
  //   .delete()
  //   .eq('product_id', id);
  // if (tagError) throw tagError;
  // const { error: tagInsertError } = await supabase
  //   .from('product_product_tag')
  //   .insert(tags.map((tag: any) => ({ product_id: id, product_tag_id: tag.value })));
  // if (tagInsertError) throw tagInsertError;

  return { succss: true };
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['product'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['product-vendors-for-filter'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['product-styles-for-filter'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['product-colors-for-filter'], exact: false });
    },
  });
};

// * ====================== Delete Product ====================== *
const deleteProduct = async ({ productId }: { productId: string }) => {
  // ? ----------- Prevent Inactive User Actions -----------
  const isUserActive = await isCurrentUserActive();
  const clearAuth = useAuthStore.getState().clearAuth;

  if (!isUserActive) {
    clearAuth();
    useAuthStore.persist.clearStorage();
    throw new Error('Your account has been suspended by Super Admin');
  }

  // Delete the associated product tags
  const { error: tagDeleteError } = await supabase
    .from('product_product_tag')
    .delete()
    .eq('product_id', productId);

  if (tagDeleteError) throw tagDeleteError;

  // Delete the product
  const { error } = await supabase.from('products').delete().eq('id', productId);

  if (error) throw error;
  return { success: true };
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId }: { productId: string }) => deleteProduct({ productId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'], exact: false });
    },
  });
};

// * ====================== Add Markup ====================== *
const addMarkup = async (productData: AddMarkupInput) => {
  // ? ----------- Prevent Inactive User Actions -----------
  const isUserActive = await isCurrentUserActive();
  const clearAuth = useAuthStore.getState().clearAuth;

  if (!isUserActive) {
    clearAuth();
    useAuthStore.persist.clearStorage();
    throw new Error('Your account has been suspended by Super Admin');
  }

  const { productIds, formula, markup, has_manufacturer_discount, manufacturer_discount } =
    productData;

  const { data: productsData, error } = await supabase
    .from('products')
    .select('id, name, inclusive_price')
    .in('id', productIds);

  if (!productsData) throw new Error('Products not found');
  if (error) throw error;

  const newProducts = productsData.map((product: any) => {
    let discounted_price = 0;

    if (has_manufacturer_discount === 'yes') {
      discounted_price = getManufacturerDuscountedPrice(
        product.inclusive_price,
        manufacturer_discount
      );
    }

    const retail_price = discounted_price
      ? getMarkedupPrice(discounted_price, markup, formula)
      : getMarkedupPrice(product.inclusive_price, markup, formula);

    return {
      id: product.id,
      has_manufacturer_discount,
      manufacturer_discount,
      discounted_price,
      markup,
      formula,
      retail_price: retail_price ? retail_price.toFixed(2) : 0,
    };
  });

  const { error: updateError } = await supabase
    .from('products')
    .upsert(newProducts, { onConflict: 'id' });

  if (updateError) throw updateError;

  return { success: true };
};

export const useAddMarkup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addMarkup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['product'], exact: false });
    },
  });
};

// * ====================== Fetch Vendors for Filter ====================== *
// const fetchAllVendorsForFilter = async (store_location_id?: string) => {
//   let storeLocationIds = [];

//   if (!store_location_id) {
//     const userId = useAuthStore.getState().userProfile?.id;

//     const { data: storeOwnerData, error: storeOwneError } = await supabase
//       .from('store_owners')
//       .select('id')
//       .eq('user_id', userId)
//       .maybeSingle();

//     if (storeOwneError) throw storeOwneError;

//     const storeOwnerId = storeOwnerData?.id;

//     const { data: storeLocationsData, error: storeLocationsDataError } = await supabase
//       .from('store_locations')
//       .select(
//         `
//           id, name, status
//         `
//       )
//       .eq('status', 'active')
//       .eq('store_owner_id', storeOwnerId)
//       .order('created_at', { ascending: false });

//     if (storeLocationsDataError) throw storeLocationsDataError;

//     storeLocationIds = storeLocationsData?.map((storeLocation) => storeLocation.id) || [];
//   }

//   if (storeLocationIds.length === 0 && !store_location_id) {
//     return [];
//   }

//   const query = supabase.from('vendor_product_map').select('vendor_id, vendor_name, status');

//   if (store_location_id) {
//     query.eq('store_location_id', store_location_id);
//   } else if (storeLocationIds.length > 0) {
//     query.in('store_location_id', storeLocationIds);
//   }
//   const { data, error } = await query;

//   if (!data || data.length === 0) return [];

//   const result = data.map((item: any) => ({
//     vendor_name: item.vendor_name,
//     vendor_id: item.vendor_id,
//   }));

//   if (error) throw error;
//   return result;
// };

const fetchAllVendorsForFilter = async (store_location_id?: string) => {
  let storeLocationIds: string[] = [];

  if (!store_location_id) {
    const userId = useAuthStore.getState().userProfile?.id;

    const { data: storeOwnerData, error: storeOwnerError } = await supabase
      .from('store_owners')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (storeOwnerError) throw storeOwnerError;
    const storeOwnerId = storeOwnerData?.id;

    const { data: storeLocationsData, error: storeLocationsError } = await supabase
      .from('store_locations')
      .select('id')
      .eq('status', 'active')
      .eq('store_owner_id', storeOwnerId);

    if (storeLocationsError) throw storeLocationsError;

    storeLocationIds = storeLocationsData?.map((loc) => loc.id) || [];
  }

  if (!store_location_id && storeLocationIds.length === 0) return [];

  // ⚡ Simplified query: grab distinct vendor_name values only
  const query = supabase
    .from('vendor_product_map')
    .select('vendor_name')
    .not('vendor_name', 'is', null);

  if (store_location_id) {
    query.eq('store_location_id', store_location_id);
  } else {
    query.in('store_location_id', storeLocationIds);
  }

  const { data, error } = await query.order('vendor_name', { ascending: true });
  if (error) throw error;

  // 🧠 Deduplicate vendor names
  const uniqueVendors = [...new Set(data.map((v: any) => v.vendor_name))];

  return uniqueVendors.map((vendor_name) => ({ vendor_name }));
};

export const useFetchAllVendorsForFilter = (store_location_id?: string, options = {}) => {
  return useQuery({
    queryKey: ['product-vendors-for-filter'],
    queryFn: () => fetchAllVendorsForFilter(store_location_id),
    staleTime: timeConverter(20, 'minute'),
    ...options,
  });
};

// * ====================== Fetch Styles for Filter ====================== *
const fetchAlStylesForFilter = async (store_location_id?: string) => {
  let storeLocationIds = [];

  if (!store_location_id) {
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
      .select(
        `
          id, name, status
        `
      )
      .eq('status', 'active')
      .eq('store_owner_id', storeOwnerId)
      .order('created_at', { ascending: false });

    if (storeLocationsDataError) throw storeLocationsDataError;

    storeLocationIds = storeLocationsData?.map((storeLocation) => storeLocation.id) || [];
  }

  if (storeLocationIds.length === 0 && !store_location_id) {
    return [];
  }

  const query = supabase.from('product_style_map').select('*').order('style', { ascending: true });

  if (store_location_id) {
    query.eq('store_location_id', store_location_id);
  } else if (storeLocationIds.length > 0) {
    query.in('store_location_id', storeLocationIds);
  }

  const { data, error } = await query;

  if (!data || data.length === 0) return [];

  const result = data.map((item: any) => item.style);

  if (error) throw error;
  return result;
};

export const useFetchAllStylesForFilter = (store_location_id?: string, options = {}) => {
  return useQuery({
    queryKey: ['product-styles-for-filter'],
    queryFn: () => fetchAlStylesForFilter(store_location_id),
    staleTime: timeConverter(20, 'minute'),
    ...options,
  });
};

// * ====================== Fetch Colors for Filter ====================== *
const fetchAlColorsForFilter = async (store_location_id?: string) => {
  let storeLocationIds = [];

  if (!store_location_id) {
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
      .select(
        `
          id, name, status
        `
      )
      .eq('status', 'active')
      .eq('store_owner_id', storeOwnerId)
      .order('created_at', { ascending: false });

    if (storeLocationsDataError) throw storeLocationsDataError;

    storeLocationIds = storeLocationsData?.map((storeLocation) => storeLocation.id) || [];
  }

  if (storeLocationIds.length === 0 && !store_location_id) {
    return [];
  }

  const query = supabase.from('product_color_map').select('*').order('color', { ascending: true });

  if (store_location_id) {
    query.eq('store_location_id', store_location_id);
  } else if (storeLocationIds.length > 0) {
    query.in('store_location_id', storeLocationIds);
  }
  const { data, error } = await query;

  if (!data || data.length === 0) return [];

  const uniqueColorNames = [...new Set(data.map((item: any) => item.color).filter(Boolean))];

  const result = uniqueColorNames;

  if (error) throw error;
  return result;
};

export const useFetchAllColorsForFilter = (store_location_id?: string, options = {}) => {
  return useQuery({
    queryKey: ['product-colors-for-filter'],
    queryFn: () => fetchAlColorsForFilter(store_location_id),
    staleTime: timeConverter(20, 'minute'),
    ...options,
  });
};

// ? ===========================================================================================================
// ? ===========================================================================================================

interface UseFetchProductsPaginatedOptions {
  pageIndex: number;
  pageSize: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  search?: string;
  storeLocationFilter?: string;
  vendorFilter?: string | null;
  colorFilter?: string[] | null;
  styleFilter?: string[] | null;
}

// * ====================== Fetch All Products For Owner [Paginated] ====================== *
const fetchProductsPaginated = async ({
  pageIndex,
  pageSize,
  sortBy = 'created_at',
  sortDir = 'desc',
  search = '',
  storeLocationFilter = 'All',
  vendorFilter = null,
  colorFilter = null,
  styleFilter = null,
}: UseFetchProductsPaginatedOptions & { storeLocationFilter?: string }) => {
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
    .select(
      `
    id, name, status
   `
    )
    .eq('status', 'active')
    .eq('store_owner_id', storeOwnerId)
    .order('created_at', { ascending: false });

  if (storeLocationsDataError) throw storeLocationsDataError;

  const storeLocationIds = storeLocationsData?.map((storeLocation) => storeLocation.id) || [];

  if (!storeLocationIds?.length) throw new Error('No Store Location Found');

  const from = pageIndex * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from('products').select(
    `
        *,
        store_location:store_locations (
          id, name, status, subdomain,
          landing_page_configuration:landing_page_configurations (
            id, store_location_id
          )
        ),
        product_vendor:product_vendors (id, name),
        qr_code:qr_codes (id, product_id, qr_code_image_url)
      `,
    { count: 'exact' }
  );

  // ✨ Apply search filter
  if (search.trim()) {
    query = query.or(`name.ilike.%${search}%,style.ilike.%${search}%,color.ilike.%${search}%`);
  }

  // ✨ Apply store location filter if not 'All'
  if (storeLocationFilter && storeLocationFilter !== 'all') {
    query = query.eq('store_location_id', storeLocationFilter);
  } else {
    query = query.in('store_location_id', storeLocationIds);
  }

  // ✨ Vendor filter
  if (vendorFilter) {
    const { data: vendorData, error: vendorError } = await supabase
      .from('product_vendors')
      .select('id')
      .eq('name', vendorFilter);

    if (vendorError) throw vendorError;

    const vendorIds = vendorData?.map((vendor) => vendor.id) || [];

    if (vendorIds.length > 0) {
      query = query.in('product_vendor_id', vendorIds);
    }
  }

  // ✨ Color filter
  if (colorFilter?.length) {
    query = query.in('color', colorFilter);
  }

  // ✨ Style filter
  if (styleFilter?.length) {
    query = query.in('style', styleFilter);
  }

  // ✨ Sorting & Pagination
  query = query.order(sortBy, { ascending: sortDir === 'asc' }).range(from, to);

  const { data, count, error } = await query;
  if (error) throw error;

  const result =
    (data as any[])?.map((row) => {
      const { store_location, product_vendor, qr_code, ...productData } = row;

      return {
        ...productData,
        qr_code: qr_code?.[0],
        product_vendor,
        store_location,
      };
    }) || [];

  return { data: result ?? [], total: count ?? 0 };
};

export const useFetchProductsPaginated = (options: UseFetchProductsPaginatedOptions) => {
  const { storeLocationFilter, vendorFilter, colorFilter, styleFilter } = useProductFiltersStore();

  return useQuery({
    queryKey: [
      'products',
      options.pageIndex,
      options.pageSize,
      options.sortBy,
      options.sortDir,
      options.search,
      storeLocationFilter,
      vendorFilter,
      colorFilter,
      styleFilter,
    ],
    queryFn: () =>
      fetchProductsPaginated({
        ...options,
        storeLocationFilter,
        vendorFilter,
        colorFilter,
        styleFilter,
      }),
    placeholderData: (previousData) => previousData,
    staleTime: timeConverter(1, 'hour'),
    refetchOnWindowFocus: false,
  });
};

interface UseFetchProductsForEmployeePaginatedOptions {
  pageIndex: number;
  pageSize: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  search?: string;
  vendorFilter?: string | null;
  colorFilter?: string[] | null;
  styleFilter?: string[] | null;
  limit?: number;
}
// * ====================== Fetch All Products For Employee [Paginated] ====================== *
const fetchAllProductsForEmployeePaginated = async ({
  pageIndex,
  pageSize,
  sortBy = 'created_at',
  sortDir = 'desc',
  search = '',
  vendorFilter = null,
  colorFilter = null,
  styleFilter = null,
  limit,
}: UseFetchProductsForEmployeePaginatedOptions) => {
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

  const theStoreLocationId = employeeData?.store_location_id;

  if (!theStoreLocationId) {
    return [];
  }

  const from = pageIndex * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('products')
    .select(
      `
        *,
        store_location:store_locations (
          id, name, status, subdomain,
          landing_page_configuration:landing_page_configurations (
            id, store_location_id
          )
        ),
        product_vendor:product_vendors (id, name),
        qr_code:qr_codes (id, product_id, qr_code_image_url)
      `,
      { count: 'exact' }
    )
    .eq('store_location_id', theStoreLocationId);

  // .eq('store_location_id', theStoreLocationId)
  // .order('created_at', { ascending: false });

  // Apply limit if passed
  // if (limit) {
  //   query = query.limit(limit);
  // }

  // ✨ Apply search filter
  if (search.trim()) {
    query = query.or(`name.ilike.%${search}%,style.ilike.%${search}%,color.ilike.%${search}%`);
  }

  // ✨ Vendor filter
  if (vendorFilter) {
    const { data: vendorData, error: vendorError } = await supabase
      .from('product_vendors')
      .select('id')
      .eq('name', vendorFilter);

    if (vendorError) throw vendorError;

    const vendorIds = vendorData?.map((vendor) => vendor.id) || [];

    if (vendorIds.length > 0) {
      query = query.in('product_vendor_id', vendorIds);
    }
  }

  // ✨ Color filter
  if (colorFilter?.length) {
    query = query.in('color', colorFilter);
  }

  // ✨ Style filter
  if (styleFilter?.length) {
    query = query.in('style', styleFilter);
  }

  // ✨ Apply limit if passed
  if (limit) {
    query = query.limit(limit);
  }

  // ✨ Sorting & Pagination
  query = query.order(sortBy, { ascending: sortDir === 'asc' }).range(from, to);

  const { data, count, error } = await query;
  if (error) throw error;

  const result =
    (data as any[])?.map((row) => {
      const { store_location, product_vendor, qr_code, ...productData } = row;

      return {
        ...productData,
        qr_code: qr_code?.[0],
        product_vendor,
        store_location,
      };
    }) || [];

  return { data: result ?? [], total: count ?? 0 };
};

export const useFetchAllProductsForEmployeePaginated = (
  options: UseFetchProductsForEmployeePaginatedOptions
) => {
  const { vendorFilter, colorFilter, styleFilter } = useProductFiltersStore();

  return useQuery({
    queryKey: [
      'products',
      options.pageIndex,
      options.pageSize,
      options.sortBy,
      options.sortDir,
      options.search,
      vendorFilter,
      colorFilter,
      styleFilter,
    ],
    queryFn: () =>
      fetchAllProductsForEmployeePaginated({
        ...options,
        vendorFilter,
        colorFilter,
        styleFilter,
      }),
    placeholderData: (previousData) => previousData,
    staleTime: timeConverter(1, 'hour'),
    refetchOnWindowFocus: false,
  });
};
