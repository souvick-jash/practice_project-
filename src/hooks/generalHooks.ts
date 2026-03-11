import supabase from '@/configs/supabse';
import useAuthStore from '@/store/authStore';

export const getStoreLocations = async () => {
  const userProfile = useAuthStore.getState().userProfile;
  const user_id = userProfile?.id;
  const role = userProfile?.role;

  if (!user_id || !role) return [];

  switch (role) {
    case 'superadmin': {
      const data = await superAdminStoreLocations();
      return data || [];
    }
    case 'owner': {
      const ownerData = await getOwnerStoreLocation(user_id);
      const store_locations = ownerData?.store_locations || [];
      return store_locations;
    }
    case 'manager': {
      const employeeData = await getManagerStoreLocations(user_id);
      const store_locations = employeeData?.store_location ? [employeeData.store_location] : [];
      return store_locations;
    }
    case 'employee': {
      const employeeData = await getEmployeeStoreLocations(user_id);
      const store_locations = employeeData?.store_location ? [employeeData.store_location] : [];
      return store_locations;
    }
    default:
      return [];
  }
};

const superAdminStoreLocations = async () => {
  const { data, error } = await supabase.from('store_locations').select('*').eq('status', 'active');

  if (error) throw error;
  return data;
};

const getOwnerStoreLocation = async (user_id: string) => {
  const { data, error } = await supabase
    .from('store_owners')
    .select(
      `
        id, user_id,
        store_locations:store_locations(
          id, name, status
        )
      `
    )
    .eq('user_id', user_id) // Adjust if your column is different
    .maybeSingle();

  if (error) throw error;
  return data;
};

const getManagerStoreLocations = async (user_id: string) => {
  const { data, error } = await supabase
    .from('store_employees')
    .select(
      `
        id, user_id,
       store_location:store_locations(
          id, name, status
       )
      `
    )
    .eq('user_id', user_id) // Adjust if your column is different
    .maybeSingle();

  if (error) throw error;
  return data;
};

const getEmployeeStoreLocations = async (user_id: string) => {
  const { data, error } = await supabase
    .from('store_employees')
    .select(
      `
        id, user_id,
       store_location:store_locations(
          id, name, status
       )
      `
    )
    .eq('user_id', user_id) // Adjust if your column is different
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const validStoreLocation = async (store_location_id: any) => {
  let isValid = true;
  const storeLocations: any = await getStoreLocations();
  const findStoreLocation = storeLocations.find(
    (location: any) => location.id === store_location_id
  );

  if (!findStoreLocation || findStoreLocation.status !== 'active') {
    isValid = false;
  }
  return isValid;
};
