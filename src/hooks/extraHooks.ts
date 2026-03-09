import supabase from '@/configs/supabse';
import logger from '@/utils/logger';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';

// * ====================== Upsert Vendors ====================== *
export const upsertVendors = async () => {
  const vendorList = [
    'Abingdon Flooring',
    'Ahf',
    'Aladain Mohawk Commerical',
    'Alloc',
    'Altro',
    'American Olean',
    'Anderson Tuftex',
    'Ardex',
    'Arizona Tile',
    'Armstrong',
    'Artistic Tile',
    'Arto',
    'Azrock',
    'Balterio',
    'Beaulieu',
    'Bedrosians',
    'Bel Air',
    'Berryalloc',
    'Bigd',
    'Bona',
    'Bostik',
    'Brothers',
    'Bruce',
    'C&A Floorcoverings',
    'Cali Bamboo',
    'Carlisle Wide Plank',
    'Cavalio',
    'Classen Flooring',
    'Columbia Flooring',
    'Congoleum',
    'Coretec',
    'Cormar Carpets',
    'Coverall Stone',
    'Crossville',
    'Dal-Tile',
    'Daltile',
    'Dbns',
    'Delta Carpets',
    'Distinctive Flooring',
    'Dream Weaver',
    'Dreamweaver',
    'Duchateau',
    'Duchâteau',
    'Durkan',
    'Earthwerks',
    'Ecore',
    'Ef Contract',
    'Egger',
    'Elevate',
    'Elysium',
    'Emser',
    'Emser Tile',
    'Engineered Floors',
    'Engineered Floors (Dream Weaver, Pentz, Dwellings)',
    'F. Ball And Co.',
    'Fabrica',
    'Fabrica Hardwood',
    'Fabrica-',
    'Faus',
    'Feltex Carpets',
    'Fibreworks',
    'Flor',
    'Forbo',
    'Gallaher Tom Duffy',
    'Gerber Flooring',
    'Gerflor',
    'Godfrey Hirst',
    'Goodwin Heart Pine',
    'Graf Hardwood',
    'Hakwood',
    'Happy Floors',
    'Haro',
    'Hartco',
    'Haussman',
    'Hearne Hardwoods',
    'Inhaus',
    'Interceramic',
    'Interceramics',
    'Interface',
    'Intermountain Flooring',
    'Intermountain Hardwoods',
    'Jeffrey Court',
    'Jj Group',
    'Johnson Hardwood',
    'Johnsonite',
    'Kahrs',
    'Kane Carpet',
    'Karndean',
    'Kraus Flooring',
    'Krono Original',
    'Kronotex',
    'Lauzon',
    'Lexmark Carpet Bought Out By Tarket',
    'Lions',
    'Mannington',
    'Mapei',
    'Marazzi',
    'Marmoleum Forbo',
    'Masland Carpets',
    'Mcmillian Flooring',
    'Mcraes',
    'Metro',
    'Midwest',
    'Milliken',
    'Mir Mosaic',
    'Mirage',
    'Mohawk',
    'Mohawk Industries',
    'Moxie Distribution Happy Feet',
    'Msi',
    'Msi (Mohawk Stone)',
    'Mulia Ceramics',
    'Mullican Flooring',
    'National Woods',
    "Nature'S Path",
    'Nora Systems',
    'Novafloor',
    'Oasis',
    'Pamesa Cerámica',
    'Paralment (Visions Hardwood)',
    'Pentz',
    'Pergo',
    'Phenix Flooring',
    'Phenix Owned By Mannington',
    'Polyflor',
    'Porcelanosa',
    'Professional Supply',
    'Proximity Mills',
    'Quick-Step',
    'Regal Hardwood',
    'Republic',
    'Republic Floor',
    'Revolution Mills',
    'Robins Ahf',
    'Roca Tile',
    'Roppe',
    'Rubber Flooring',
    'Schluter Systems',
    'Shaw Industries',
    'Shaw, Tuftex And Anderson',
    'Six Degrees',
    'Soci Sales And Tile (Also Sell Sinks And Faucets) Rebranded To Fabstone',
    'Somerset Hardwood Flooring',
    'Somertile',
    'Stainmaster',
    'Stanton',
    'Stanton Carpet',
    'Stone Products Inc.',
    'Stonepeak Ceramics',
    'Stonhard',
    'Surface Art',
    'Tarket Mannington',
    'Tarkett',
    'Tas',
    'Tayse',
    'The Dixie Group',
    'The Tile Shop',
    'Toli',
    'Topps Tiles',
    'Torlys',
    'Triwest',
    'Urban Surface',
    'Us Rubber',
    'Usfloors',
    'Versa Rim',
    'Villeroy & Boch',
    'Virginia Vintage',
    'Vitromex',
    'Välinge',
    'Wayne Tile',
    'Wicanders',
    'Wilsonart',
    'Wow',
  ];

  const vendors = vendorList.map((name) => ({
    name,
    status: 'active',
  }));

  // Perform upsert
  const { data, error } = await supabase.from('master_vendors').upsert(vendors, {
    onConflict: 'name', // 🔑 must be unique column or have unique index
  });

  if (error) {
    logger.error('Upsert error:', error);
    throw error;
  }

  return { success: true, data };
};

export const useUpsertVendors = () => {
  return useMutation({
    mutationFn: upsertVendors,
    onSuccess: () => {
      toast.success('Vendor added successfully');
    },
  });
};

// * ====================== Sync Product Vendors ====================== *

const syncProductVendors = async () => {
  // 1. Fetch all store locations
  const { data: storeLocations, error: storeLocationsError } = await supabase
    .from('store_locations')
    .select('id');

  if (storeLocationsError) throw storeLocationsError;

  // 2. Fetch all master vendors
  const { data: masterVendors, error: masterVendorsError } = await supabase
    .from('master_vendors')
    .select('name, status');

  if (masterVendorsError) throw masterVendorsError;

  if (!storeLocations?.length || !masterVendors?.length) {
    throw new Error('No store locations or master vendors found');
  }

  // 3. Build rows for product_vendors (cross join)
  const vendorsToInsert = storeLocations.flatMap((loc) =>
    masterVendors.map((vendor) => ({
      name: vendor.name,
      status: vendor.status ?? 'active',
      store_location_id: loc.id,
    }))
  );

  // 4. Upsert into product_vendors
  const { data, error } = await supabase.from('product_vendors').upsert(vendorsToInsert, {
    onConflict: 'name,store_location_id', // 👈 requires unique constraint
  });

  if (error) throw error;

  return { success: true, data };
};

export const useSyncProductVendors = () => {
  return useMutation({
    mutationFn: syncProductVendors,
    onSuccess: () => {
      toast.success('Product Vendors synced successfully');
    },
  });
};
