import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { timeConverter } from '@/utils/time';
import supabase from '@/configs/supabse';
import useAuthStore from '@/store/authStore';
import { isCurrentUserActive } from './enforceUserHooks';
import { validStoreLocation } from './generalHooks';
import { generateRandomId } from '@/utils/strings';

interface CreateEmployeeInput {
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  role: 'manager' | 'employee';
  store_location_id: string;
}

interface UpdateEmployeeInput {
  userId: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  role: 'manager' | 'employee';
  store_location_id: string;
}

interface CreateEmployeeByManagerInput {
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  role: 'employee';
}

interface UpdateEmployeeByManagerInput {
  userId: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
}

// * ====================== Fetch All Employees ====================== *
const fetchAllEmployees = async () => {
  const userId = useAuthStore.getState().userProfile?.id;

  const { data: userData, error: userDataError } = await supabase
    .from('users')
    .select(
      `
       id, name, unique_id,
       store_owner:store_owners (
         id, user_id,
         store_location:store_locations (
          id, name, store_owner_id,
          store_employees (
            id, user_id, store_location_id,
            user:users (
              id, name, email, phone, role, status, unique_id
            ),
            store_location:store_locations (
              id, name
            )
          )
         )
       )
      `
    )
    .eq('id', userId)
    .maybeSingle();

  if (!userData) throw new Error('User not found');
  if (userDataError) throw userDataError;

  const storeEmployees =
    (userData &&
      userData.store_owner?.flatMap(
        (owner) => owner.store_location?.flatMap((location) => location.store_employees ?? []) ?? []
      )) ??
    [];

  const result = storeEmployees;

  return result;
};

export const useFetchAllEmployees = () => {
  return useQuery({
    queryKey: ['employees'],
    queryFn: fetchAllEmployees,
    staleTime: timeConverter(20, 'minute'),
  });
};

// * ====================== Fetch Single Employee ====================== *
const fetchSingleEmployee = async (employeeId: string) => {
  const { data, error } = await supabase
    .from('store_employees')
    .select(
      `
        id, user_id, store_location_id,
        user:users (
          id, name, email, phone, role, status, unique_id
        ),
        store_location:store_locations (
          id, name
        )
    `
    )
    .eq('id', employeeId)
    .maybeSingle();

  const result = data;

  if (error) throw error;
  return result;
};

export const useFetchSingleEmployee = (employeeId?: string, open?: boolean) => {
  return useQuery({
    queryKey: ['employee', employeeId],
    queryFn: () => fetchSingleEmployee(employeeId!),
    enabled: open,
    staleTime: timeConverter(10, 'minute'),
  });
};

// * ====================== Create Employee ====================== *
export const createEmployee = async (employeeData: CreateEmployeeInput) => {
  const userProfile = useAuthStore.getState().userProfile;
  const { name, email, phone, role, status } = employeeData;
  const store_location_id = employeeData.store_location_id || null;
  const password = `Password@${new Date().getFullYear()}`;
  const unique_id = generateRandomId();

  const clearAuth = useAuthStore.getState().clearAuth;

  // ? ----------- Prevent Inactive User Actions -----------
  const isUserActive = await isCurrentUserActive();
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

  // ? ---------- Duplicate User Check ----------
  const { data: existingUsers, error: fetchError } = await supabase
    .from('users')
    .select('id')
    .or(`email.eq.${email},phone.eq.${phone}`);

  if (fetchError) throw fetchError;

  if (existingUsers?.length > 0) {
    throw new Error('Employee with the same email or phone number already exists');
  }

  // ? ---------- Create Auth User ----------
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    phone,
    password,
    email_confirm: true,
    user_metadata: { display_name: name },
  });

  if (authError || !authData?.user) throw authError || new Error('User creation failed');
  const authUserId = authData.user.id;

  // ? ---------- Insert into Users Table ----------
  const { error: dbError, data: insertedUserData } = await supabase
    .from('users')
    .insert({
      auth_user_id: authUserId,
      unique_id,
      name,
      email,
      phone,
      role,
      status,
      created_by_user_id: userProfile?.id,
      updated_by_user_id: userProfile?.id,
    })
    .select();

  if (dbError || !insertedUserData?.length) {
    await supabase.auth.admin.deleteUser(authUserId); // rollback
    throw dbError || new Error('Failed to insert user record');
  }

  const insertedUserId = insertedUserData[0].id;

  // ? ---------- Insert into store_employees ----------
  const { error: storeOwnerError } = await supabase.from('store_employees').insert({
    store_location_id,
    user_id: insertedUserId,
  });

  if (storeOwnerError) {
    await supabase.auth.admin.deleteUser(authUserId); // rollback
    throw storeOwnerError;
  }

  return { success: true, userId: authUserId };
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'], exact: false });
    },
  });
};

// * ====================== Delete Employee ====================== *
export const deleteEmployee = async ({
  userId,
  employeeId,
}: {
  userId: string;
  employeeId: string;
}) => {
  // ? ----------- Prevent Inactive User Actions -----------
  const isUserActive = await isCurrentUserActive();
  const clearAuth = useAuthStore.getState().clearAuth;

  if (!isUserActive) {
    clearAuth();
    useAuthStore.persist.clearStorage();
    throw new Error('Your account has been suspended by Super Admin');
  }

  if (!userId) throw new Error('User cannot be fetched');

  // Get auth_user_id for Auth deletion
  const { data: userData, error: fetchError } = await supabase
    .from('users')
    .select('auth_user_id, role')
    .eq('id', userId)
    .maybeSingle();

  if (fetchError || !userData?.auth_user_id) {
    throw fetchError || new Error('User not found');
  }

  const authUserId = userData.auth_user_id;

  // Delete from store_employees
  const { error: storeOwnerDeleteError } = await supabase
    .from('store_employees')
    .delete()
    .eq('id', employeeId);

  if (storeOwnerDeleteError) throw storeOwnerDeleteError;

  // Delete from users table
  const { error: userDeleteError } = await supabase.from('users').delete().eq('id', userId);

  if (userDeleteError) throw userDeleteError;

  // Delete from Supabase Auth
  const { error: authDeleteError } = await supabase.auth.admin.deleteUser(authUserId);

  if (authDeleteError) throw authDeleteError;

  return { success: true };
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, employeeId }: { userId: string; employeeId: string }) =>
      deleteEmployee({ userId, employeeId }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'], exact: false });
    },
  });
};

// * ====================== Update Employee ====================== *
export const updateEmployee = async ({
  store_location_id,
  userId,
  name,
  email,
  phone,
  status,
  role,
}: UpdateEmployeeInput) => {
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

  // Optional: check for duplicates if email/phone changed (excluding self)
  const { data: existingUsers, error: checkError } = await supabase
    .from('users')
    .select('id')
    .or(`email.eq.${email},phone.eq.${phone}`)
    .neq('id', userId);

  if (checkError) throw checkError;
  if (existingUsers?.length) {
    throw new Error('Employee with this email or phone number already exists');
  }

  const { data: employee, error: fetchEmployeeError } = await supabase
    .from('users')
    .select('auth_user_id')
    .in('role', ['employee', 'manager'])
    .eq('id', userId)
    .maybeSingle();

  if (fetchEmployeeError) throw fetchEmployeeError;

  const auth_user_id = employee?.auth_user_id;

  // Update Supabase Auth email & metadata
  const { error: authError } = await supabase.auth.admin.updateUserById(auth_user_id, {
    email,
    phone,
    user_metadata: {
      display_name: name,
    },
  });
  if (authError) throw authError;

  // Update in users table
  const { error: dbError } = await supabase
    .from('users')
    .update({
      name,
      email,
      phone,
      status,
      role,
      updated_by_user_id: userProfile?.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (dbError) throw dbError;

  // Update in store_employees or store_managers table
  const { error: storeOwnerUpdateError } = await supabase
    .from('store_employees')
    .update({
      store_location_id: store_location_id ? store_location_id : null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (storeOwnerUpdateError) throw storeOwnerUpdateError;

  return { success: true };
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['employee'], exact: false });
      queryClient.invalidateQueries({
        queryKey: ['owner-store-locations'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['employee-store-locations'],
        exact: false,
      });
    },
  });
};

// * ====================== Fetch All Store Locations of the Store Owner ====================== *
const fetchOwnerStoreLocations = async () => {
  const userId = useAuthStore.getState().userProfile?.id;

  const { data: storeOwnerData, error: storeOwneError } = await supabase
    .from('store_owners')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (storeOwneError) throw storeOwneError;

  const storeOwnerId = storeOwnerData?.id;
  if (!storeOwnerId) return [];

  const { data, error } = await supabase
    .from('store_locations')
    .select(
      `
    id, name, status
   `
    )
    .eq('status', 'active')
    .eq('store_owner_id', storeOwnerId)
    .order('created_at', { ascending: false });

  const result = data;

  if (error) throw error;
  return result;
};

export const useFetchOwnerStoreLocations = () => {
  return useQuery({
    queryKey: ['owner-store-locations'],
    queryFn: fetchOwnerStoreLocations,
    staleTime: timeConverter(20, 'minute'),
  });
};

// * ====================== Fetch All Store Locations of the Store Employee/Manager ====================== *
const fetchStoreLocationsForEmployee = async () => {
  const userId = useAuthStore.getState().userProfile?.id;

  const { data: employeeData, error: employeeError } = await supabase
    .from('store_employees')
    .select(
      `
      id, user_id, store_location_id,
      user:users (
        id, name, email, phone, role, status
      ),
      store_location:store_locations (
        id, name, status
      )
     `
    )
    .eq('user.id', userId)
    .not('user', 'is', null)
    .maybeSingle();

  if (employeeError) throw employeeError;

  const storeLocation = [
    {
      id: (employeeData as any).store_location?.id,
      name: (employeeData as any).store_location.name,
      status: (employeeData as any).store_location.status,
    },
  ];

  const result = storeLocation;
  return result;
};

export const useFetchStoreLocationsForEmployee = () => {
  return useQuery({
    queryKey: ['employee-store-locations'],
    queryFn: fetchStoreLocationsForEmployee,
    staleTime: timeConverter(20, 'minute'),
  });
};

// * ====================== Fetch Employees who shares the same location ====================== *
const fetchEmployeesInSameLocations = async () => {
  const userId = useAuthStore.getState().userProfile?.id;
  if (!userId) throw new Error('User not found');

  // Get Employee
  const { data: employeeData, error: employeeError } = await supabase
    .from('store_employees')
    .select('id, store_location_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (employeeError) throw employeeError;

  const store_location_id = employeeData?.store_location_id;

  // Fetch the employees
  const { data, error } = await supabase
    .from('store_employees')
    .select(
      `
        id, user_id, store_location_id,
        user:users (
          id, name, email, phone, role, status, unique_id
        ),
        store_location:store_locations (
          id, name
        )
    `
    )
    .neq('user_id', userId) // Exclude current user
    .eq('store_location_id', store_location_id)
    .not('user', 'is', null)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const result = data;
  return result;
};

export const useEmployeesInSameLocations = () => {
  return useQuery({
    queryKey: ['employees-in-same-locations'],
    queryFn: fetchEmployeesInSameLocations,
    staleTime: timeConverter(20, 'minute'),
  });
};

// ? ======================================
// ? By Manager
// ? ======================================

// * ====================== Create Employee ====================== *
export const createEmployeeByManager = async (employeeData: CreateEmployeeByManagerInput) => {
  const userProfile = useAuthStore.getState().userProfile;
  const { name, email, phone, role, status } = employeeData;
  const password = `Password@${new Date().getFullYear()}`;
  const unique_id = generateRandomId();

  const user_id = userProfile?.id;
  const { data: userData, error: fetchUserDataError } = await supabase
    .from('users')
    .select(
      `
      *,
      store_employee:store_employees (
        *
      )
      `
    )
    .eq('id', user_id)
    .maybeSingle();

  if (fetchUserDataError) throw fetchUserDataError;
  if (!userData) throw new Error('User not found');
  const store_location_id = userData.store_employee?.[0].store_location_id;

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

  // Check if user with same email or phone number already exists
  const { data: existingUsers, error: fetchError } = await supabase
    .from('users')
    .select('id')
    .or(`email.eq.${email},phone.eq.${phone}`);

  if (fetchError) {
    throw fetchError;
  }

  if (existingUsers && existingUsers.length > 0) {
    throw new Error('Employee with the same email or phone number already exists');
  }

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    phone,
    password,
    email_confirm: true,
    user_metadata: { display_name: name },
  });

  if (authError || !authData?.user) {
    throw authError || new Error('User creation failed');
  }

  const authUserId = authData.user.id;

  // Insert into users table
  const { error: dbError, data: insertedUserData } = await supabase
    .from('users')
    .insert({
      auth_user_id: authUserId,
      unique_id,
      name,
      email,
      phone,
      role,
      status,
      created_by_user_id: userProfile?.id,
      updated_by_user_id: userProfile?.id,
    })
    .select();

  if (dbError || !insertedUserData?.length) {
    await supabase.auth.admin.deleteUser(authUserId); // rollback
    throw dbError || new Error('Failed to insert user record');
  }

  const insertedUserId = insertedUserData[0].id;

  // Insert into store_employees table
  const { error: storeOwnerError } = await supabase.from('store_employees').insert({
    store_location_id,
    user_id: insertedUserId,
  });

  if (storeOwnerError) {
    await supabase.auth.admin.deleteUser(authUserId); // rollback again
    throw storeOwnerError;
  }

  return { success: true, userId: authUserId };
};

export const useCreateEmployeeByManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEmployeeByManager,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['employees-in-same-locations'],
        exact: false,
      });
    },
  });
};

// * ====================== Delete Employee ====================== *
export const deleteEmployeeByManager = async ({
  userId,
  employeeId,
}: {
  userId: string;
  employeeId: string;
}) => {
  // ? ----------- Prevent Inactive User Actions -----------
  const isUserActive = await isCurrentUserActive();
  const clearAuth = useAuthStore.getState().clearAuth;

  if (!isUserActive) {
    clearAuth();
    useAuthStore.persist.clearStorage();
    throw new Error('Your account has been suspended by Super Admin');
  }

  if (!userId) throw new Error('User cannot be fetched');

  // Get auth_user_id for Auth deletion
  const { data: userData, error: fetchError } = await supabase
    .from('users')
    .select('auth_user_id, role')
    .eq('id', userId)
    .maybeSingle();

  if (fetchError || !userData?.auth_user_id) {
    throw fetchError || new Error('User not found');
  }

  const authUserId = userData.auth_user_id;

  // Delete from store_employees
  const { error: storeOwnerDeleteError } = await supabase
    .from('store_employees')
    .delete()
    .eq('id', employeeId);

  if (storeOwnerDeleteError) throw storeOwnerDeleteError;

  // Delete from users table
  const { error: userDeleteError } = await supabase.from('users').delete().eq('id', userId);

  if (userDeleteError) throw userDeleteError;

  // Delete from Supabase Auth
  const { error: authDeleteError } = await supabase.auth.admin.deleteUser(authUserId);

  if (authDeleteError) throw authDeleteError;

  return { success: true };
};

export const useDeleteEmployeeByManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, employeeId }: { userId: string; employeeId: string }) =>
      deleteEmployeeByManager({ userId, employeeId }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'], exact: false });
      queryClient.invalidateQueries({
        queryKey: ['employees-in-same-locations'],
        exact: false,
      });
    },
  });
};

// * ====================== Update Employee ====================== *
export const updateEmployeeByManager = async ({
  userId,
  name,
  email,
  phone,
  status,
}: UpdateEmployeeByManagerInput) => {
  const userProfile = useAuthStore.getState().userProfile;
  const user_id = userProfile?.id;
  const { data: userData, error: fetchUserDataError } = await supabase
    .from('users')
    .select(
      `
      *,
      store_employee:store_employees (
        *
      )
      `
    )
    .eq('id', user_id)
    .maybeSingle();

  if (fetchUserDataError) throw fetchUserDataError;
  if (!userData) throw new Error('User not found');
  const store_location_id = userData.store_employee?.[0].store_location_id;

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

  // Optional: check for duplicates if email/phone changed (excluding self)
  const { data: existingUsers, error: checkError } = await supabase
    .from('users')
    .select('id')
    .or(`email.eq.${email},phone.eq.${phone}`)
    .neq('id', userId);

  if (checkError) throw checkError;
  if (existingUsers?.length) {
    throw new Error('Employee with this email or phone number already exists');
  }

  const { data: employee, error: fetchEmployeeError } = await supabase
    .from('users')
    .select('auth_user_id')
    .in('role', ['employee'])
    .eq('id', userId)
    .maybeSingle();

  if (fetchEmployeeError) throw fetchEmployeeError;

  const auth_user_id = employee?.auth_user_id;

  // Update Supabase Auth email & metadata
  const { error: authError } = await supabase.auth.admin.updateUserById(auth_user_id, {
    email,
    phone,
    user_metadata: {
      display_name: name,
    },
  });
  if (authError) throw authError;

  // Update in users table
  const { error: dbError } = await supabase
    .from('users')
    .update({
      name,
      email,
      phone,
      status,
      updated_by_user_id: userProfile?.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (dbError) throw dbError;

  return { success: true };
};

export const useUpdateEmployeeByManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEmployeeByManager,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['employees-in-same-locations'],
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: ['employee'], exact: false });
    },
  });
};
