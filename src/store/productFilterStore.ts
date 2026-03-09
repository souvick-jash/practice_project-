import { create } from 'zustand';

interface ProductFiltersState {
  storeLocationFilter: string;
  vendorFilter: string | null;
  colorFilter: string[] | null;
  styleFilter: string[] | null;

  setStoreLocationFilter: (value: string) => void;
  setVendorFilter: (value: string | null) => void;
  setColorFilter: (value: string[] | null) => void;
  setStyleFilter: (value: string[] | null) => void;

  resetFilters: () => void;
}

export const useProductFiltersStore = create<ProductFiltersState>((set) => ({
  storeLocationFilter: 'all',
  vendorFilter: null,
  colorFilter: null,
  styleFilter: null,

  setStoreLocationFilter: (value) => set({ storeLocationFilter: value }),
  setVendorFilter: (value) => set({ vendorFilter: value }),
  setColorFilter: (value) => set({ colorFilter: value }),
  setStyleFilter: (value) => set({ styleFilter: value }),

  resetFilters: () =>
    set({
      storeLocationFilter: 'all',
      vendorFilter: null,
      colorFilter: null,
      styleFilter: null,
    }),
}));
