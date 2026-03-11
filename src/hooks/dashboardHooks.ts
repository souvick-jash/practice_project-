import supabase from '@/configs/supabse';
import useAuthStore from '@/store/authStore';
import { timeConverter } from '@/utils/time';
import { useQuery } from '@tanstack/react-query';

// * ====================== Fetch All Store Owners For Map ====================== *
const fetchAllOwnersForMap = async () => {
  // Step 1: Fetch store owners + related user data
  const { data: storeOwners, error } = await supabase
    .from('users')
    .select(
      `
      *
      `
    )
    .not('lat', 'is', null)
    .not('lng', 'is', null)
    .eq('role', 'owner')
    .eq('status', 'active');

  if (error) throw error;

  const result = storeOwners;

  return result;
};

export const useFetchAllOwnersForMap = () => {
  return useQuery({
    queryKey: ['owners-for-map'],
    queryFn: fetchAllOwnersForMap,
    staleTime: timeConverter(20, 'minute'),
  });
};

// * ====================== Fetch Subscription Counts [By current year] ====================== *
const fetchSubscriptionCounts = async () => {
  const { data, error } = await supabase.rpc('get_monthly_subscription_count');

  if (error) throw new Error(error.message);

  const allMonths = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const result = allMonths.map((month) => {
    const found = data.find((d: any) => d.month === month);
    return {
      month,
      count: found?.count ?? 0,
    };
  });

  return result;
};

export const useSubscriptionCounts = () => {
  return useQuery({
    queryKey: ['subscription-counts'],
    queryFn: fetchSubscriptionCounts,
  });
};

// * ====================== Fetch Total Subscribers Count ====================== *
const fetchTotalSubscribersCount = async () => {
  const { count, error } = await supabase
    .from('stax_subscriptions')
    .select('*', { count: 'exact', head: true }); // head: true means don't return rows, just count

  if (error) throw error;

  const result = count;
  return result;
};

export const useFetchTotalSubscribersCount = () => {
  return useQuery({
    queryKey: ['total-subscription-count'],
    queryFn: fetchTotalSubscribersCount,
  });
};

// * ====================== Fetch Total Onnboarded Count [Current Month] ====================== *
const fetchTotalOnboardedCount = async () => {
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  const startOfNextMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
  ).toISOString();

  const { count, error } = await supabase
    .from('users')
    .select('*', { count: 'exact' })
    .eq('role', 'owner')
    .gte('created_at', startOfMonth)
    .lt('created_at', startOfNextMonth);

  if (error) throw error;

  const result = count;
  return result;
};

export const useFetchTotalOnboardedCount = () => {
  return useQuery({
    queryKey: ['total-onboarded-count'],
    queryFn: fetchTotalOnboardedCount,
  });
};

// * ====================== Fetch Total Revenue [Current Month] ====================== *
const fetchTotalRevenue = async () => {
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  const startOfNextMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
  ).toISOString();

  const { data, error } = await supabase
    .from('stax_invoices')
    .select('total_paid')
    .eq('status', 'PAID')
    .gte('created_at', startOfMonth)
    .lt('created_at', startOfNextMonth);
  if (error) throw error;

  const result = data && data?.reduce((sum, invoice) => sum + (invoice.total_paid ?? 0), 0);

  return result;
};

export const useFetchTotalRevenue = () => {
  return useQuery({
    queryKey: ['total-revenue-per-month'],
    queryFn: fetchTotalRevenue,
  });
};

// * ====================== Fetch Total Failed Imports [Current Month] ====================== *
const fetchFailedImportCount = async () => {
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  const startOfNextMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
  ).toISOString();

  const { count, error } = await supabase
    .from('sftp_logs')
    .select('*', { count: 'exact', head: true })
    .eq('status', false)
    .gte('created_at', startOfMonth)
    .lt('created_at', startOfNextMonth);

  if (error) throw error;

  const result = count;
  return result;
};

export const useFetchFailedImportCount = () => {
  return useQuery({
    queryKey: ['total-failed-import-count'],
    queryFn: fetchFailedImportCount,
  });
};

// * ====================== Fetch Total Active Vendor Count [Owner/Employee] ====================== *
// const fetchTotalActiveVendorCount = async ({ forEmpoyee }: { forEmpoyee?: boolean }) => {
//   let storeOwnerUserId = null;

//   if (forEmpoyee) {
//     const emp_user_id = useAuthStore.getState().userProfile?.id;
//     const { data: empData, error: empError } = await supabase
//       .from('store_employees')
//       .select(
//         `
//         *,
//         store_location:store_locations(
//           id, store_owner_id,
//             store_owner:store_owners(
//               *
//             )
//           )
//         )
//         `
//       )
//       .eq('user_id', emp_user_id)
//       .maybeSingle();

//     if (!empData) return 0;
//     if (empError) throw empError;
//     storeOwnerUserId = (empData as any)?.store_location?.store_owner?.user_id;
//   } else {
//     storeOwnerUserId = useAuthStore.getState().userProfile?.id;
//   }

//   const { data: storeOwnerData, error: storeOwneError } = await supabase
//     .from('store_owners')
//     .select(
//       `
//       *,
//         store_locations(
//         id
//         )
//       `
//     )
//     .eq('user_id', storeOwnerUserId)
//     .maybeSingle();

//   if (!storeOwnerData) return 0;
//   if (storeOwneError) throw storeOwneError;

//   const storeLocationIds = storeOwnerData.store_locations?.map((loc: any) => loc.id) || [];
//   if (!storeLocationIds.length) return 0;

//   const { count, error } = await supabase
//     .from('vendor_product_map')
//     .select('*', { count: 'exact', head: true })
//     .in('store_location_id', storeLocationIds);

//   if (error) throw error;

//   const totalUniqueVendors = count || 0;

//   return totalUniqueVendors;
// };

// export const useFetchTotalActiveVendorCount = ({ forEmpoyee }: { forEmpoyee?: boolean }) => {
//   return useQuery({
//     queryKey: ['total-active-vendor-count', forEmpoyee],
//     queryFn: () => fetchTotalActiveVendorCount({ forEmpoyee }),
//   });
// };

// * ====================== Fetch Total Discontinued Product [Owner/Employee] ====================== *
// const fetchTotalDiscontinuedProductCount = async ({ forEmpoyee }: { forEmpoyee?: boolean }) => {
//   let storeOwnerUserId = null;

//   if (forEmpoyee) {
//     const emp_user_id = useAuthStore.getState().userProfile?.id;
//     const { data: empData, error: empError } = await supabase
//       .from('store_employees')
//       .select(
//         `
//         *,
//         store_location:store_locations(
//           id, store_owner_id,
//             store_owner:store_owners(
//               *
//             )
//           )
//         )
//         `
//       )
//       .eq('user_id', emp_user_id)
//       .maybeSingle();

//     if (!empData) return 0;
//     if (empError) throw empError;
//     storeOwnerUserId = (empData as any)?.store_location?.store_owner?.user_id;
//   } else {
//     storeOwnerUserId = useAuthStore.getState().userProfile?.id;
//   }

//   const { data: storeOwnerData, error: storeOwneError } = await supabase
//     .from('store_owners')
//     .select(
//       `
//       *,
//         store_locations(
//         id
//         )
//       `
//     )
//     .eq('user_id', storeOwnerUserId)
//     .maybeSingle();

//   if (!storeOwnerData) return 0;
//   if (storeOwneError) throw storeOwneError;

//   const storeLocationIds = storeOwnerData.store_locations?.map((loc: any) => loc.id) || [];

//   const { count, error } = await supabase
//     .from('products')
//     .select('*', { count: 'exact', head: true })
//     .in('store_location_id', storeLocationIds)
//     .eq('discontinued', true);

//   if (error) throw error;

//   const discontinuedCount = count || 0;

//   return discontinuedCount;
// };

// export const useFetchTotalDiscontinuedProduct = ({ forEmpoyee }: { forEmpoyee?: boolean }) => {
//   return useQuery({
//     queryKey: ['total-discontinued-product-count', forEmpoyee],
//     queryFn: () => fetchTotalDiscontinuedProductCount({ forEmpoyee }),
//   });
// };

// * ====================== Fetch Total Failed Imports [For Owner/Employee] ====================== *
// const fetchFailedImportCountForOwnerCount = async ({ forEmpoyee }: { forEmpoyee?: boolean }) => {
//   let storeOwnerUserId = null;

//   if (forEmpoyee) {
//     const emp_user_id = useAuthStore.getState().userProfile?.id;
//     const { data: empData, error: empError } = await supabase
//       .from('store_employees')
//       .select(
//         `
//         *,
//         store_location:store_locations(
//           id, store_owner_id,
//             store_owner:store_owners(
//               *
//             )
//           )
//         )
//         `
//       )
//       .eq('user_id', emp_user_id)
//       .maybeSingle();

//     if (!empData) return 0;
//     if (empError) throw empError;
//     storeOwnerUserId = (empData as any)?.store_location?.store_owner?.user_id;
//   } else {
//     storeOwnerUserId = useAuthStore.getState().userProfile?.id;
//   }

//   const { data: storeOwnerData, error: storeOwneError } = await supabase
//     .from('store_owners')
//     .select(
//       `
//       *,
//         store_locations(
//         id
//         )
//       `
//     )
//     .eq('user_id', storeOwnerUserId)
//     .maybeSingle();

//   if (!storeOwnerData) return 0;
//   if (storeOwneError) throw storeOwneError;

//   const storeLocationIds = storeOwnerData.store_locations?.map((loc: any) => loc.id) || [];

//   const { count, error } = await supabase
//     .from('sftp_logs')
//     .select('*', { count: 'exact', head: true })
//     .in('store_location_id', storeLocationIds)
//     .eq('status', false);

//   if (error) throw error;

//   const failedCount = count || 0;

//   return failedCount;
// };

// export const useFetchFailedImportCountForOwnerCount = ({
//   forEmpoyee,
// }: {
//   forEmpoyee?: boolean;
// }) => {
//   return useQuery({
//     queryKey: ['total-failed-import-for-owner-count', forEmpoyee],
//     queryFn: () => fetchFailedImportCountForOwnerCount({ forEmpoyee }),
//   });
// };

// * ====================== Fetch Total Scanned Products [For Owner] ====================== *
// const fetchTotalScannedProductCount = async () => {
//   const userId = useAuthStore.getState().userProfile?.id;

//   // Get store location IDs for the store owner
//   const { data: locations, error: locError } = await supabase
//     .from('store_locations')
//     .select('id')
//     .eq('store_owner_id', userId);

//   if (locError) throw locError;
//   if (!locations?.length) return 0;

//   const locationIds = locations.map((l) => l.id);

//   // Get total scanned product count via an exact count query
//   const { count, error: countError } = await supabase
//     .from('qr_scans')
//     .select('*', { count: 'exact', head: true })
//     .filter(
//       'product_id',
//       'in',
//       `(select id from products where store_location_id in (${locationIds.map((id) => `'${id}'`).join(',')}))`
//     );

//   if (countError) throw countError;

//   return count ?? 0;
// };

// export const useFetchTotalScannedProductCount = () => {
//   return useQuery({
//     queryKey: ['total-scanned-product-count'],
//     queryFn: fetchTotalScannedProductCount,
//   });
// };

// * ====================== Recent QR Scan Activity [For Owner] ====================== *
// const fetchRecentQRScanActivity = async ({ limit }: { limit?: number }) => {
//   const userId = useAuthStore.getState().userProfile?.id;

//   // Get store location IDs for the store owner
//   const { data: locations, error: locError } = await supabase
//     .from('store_locations')
//     .select('id')
//     .eq('store_owner_id', userId);

//   if (locError) throw locError;
//   if (!locations?.length) return [];

//   const locationIds = locations.map((l) => l.id);

//   // Get recent QR scan activity for products belonging to these locations
//   const { data, error } = await supabase
//     .from('qr_scans')
//     .select(
//       `
//       *,
//       product:products (
//         id, name, style, color, uom, sku,
//         store_location:store_locations (
//           id, name
//         )
//       ),
//       qr_code:qr_codes (
//         id, product_id, qr_code_image_url
//       )
//       `
//     )
//     .filter(
//       'product_id',
//       'in',
//       `(select id from products where store_location_id in (${locationIds
//         .map((id) => `'${id}'`)
//         .join(',')}))`
//     )
//     .order('created_at', { ascending: false })
//     .limit(limit ?? 10);

//   if (error) throw error;

//   return data ?? [];
// };

// export const useFetchRecentQRScanActivity = ({ limit }: { limit?: number }) => {
//   return useQuery({
//     queryKey: ['recent-qr-scan-activity', limit],
//     queryFn: () => fetchRecentQRScanActivity({ limit }),
//   });
// };

// * ====================== Top Scanned Products [For Owner] ====================== *
// const fetchMostScannedProducts = async ({ limit = 10 }: { limit?: number }) => {
//   const userId = useAuthStore.getState().userProfile?.id;

//   // Get all store location IDs for this owner
//   const { data: locations, error: locError } = await supabase
//     .from('store_locations')
//     .select('id')
//     .eq('store_owner_id', userId);

//   if (locError) throw locError;
//   if (!locations?.length) return [];

//   const locationIds = locations.map((l) => l.id);

//   // Fetch top products by scan count directly using a subquery
//   const { data, error } = await supabase
//     .from('products')
//     .select(
//       `
//       id,
//       name,
//       style,
//       color,
//       uom,
//       sku,
//       qr_code:qr_codes (id, qr_code_image_url),
//       store_location:store_locations (id, name)
//       `
//     )
//     .filter(
//       'id',
//       'in',
//       `(select product_id from qr_scans where product_id in (
//          select id from products where store_location_id in (${locationIds
//            .map((id) => `'${id}'`)
//            .join(',')})
//        ) group by product_id order by count(*) desc limit ${limit})`
//     );

//   if (error) throw error;

//   return data ?? [];
// };

// export const useFetchMostScannedProducts = ({ limit }: { limit?: number }) => {
//   return useQuery({
//     queryKey: ['most-scanned-products', limit],
//     queryFn: () => fetchMostScannedProducts({ limit }),
//   });
// };
