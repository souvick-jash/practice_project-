import { useState, useRef } from 'react';
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
  StandaloneSearchBox,
} from '@react-google-maps/api';
import { useFetchAllOwnersForMap } from '@/hooks/dashboardHooks';
import Spinner from '@/components/reusables/Spinner';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const defaultCenter = {
  lat: 40.7128, // New York
  lng: -74.006,
};

const MapSection = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'], // Required for search box
  });

  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [activeMarker, setActiveMarker] = useState<number | null>(null);
  // eslint-disable-next-line no-undef
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [mapZoom, setMapZoom] = useState(5);

  const { data: owners } = useFetchAllOwnersForMap();

  const locations = owners?.map((owner) => ({
    id: owner.id,
    name: owner.name,
    position: { lat: owner.lat, lng: owner.lng },
    address: owner.address,
    email: owner.email,
    phone: owner.phone,
  }));

  const onPlacesChanged = () => {
    const places = searchBoxRef.current?.getPlaces();
    if (places && places.length > 0) {
      const location = places[0].geometry?.location;
      if (location) {
        setMapCenter({
          lat: location.lat(),
          lng: location.lng(),
        });
        setMapZoom(17); // Zoom in closer to the selected place
      }
    }
  };
  if (!isLoaded) return <Spinner />;

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Search Box */}
      <div className="bg-card top-2 right-15 z-10 w-full p-5 sm:absolute sm:w-[300px] sm:bg-transparent sm:p-0">
        <StandaloneSearchBox
          onLoad={(ref) => (searchBoxRef.current = ref)}
          onPlacesChanged={onPlacesChanged}
        >
          <input
            type="text"
            placeholder="Search location"
            ref={inputRef}
            className="placeholder:text-muted-foreground border-input inp-field h-11.5 w-full rounded-3xl border bg-white px-5 py-1 text-base transition-[color,box-shadow] outline-none"
          />
        </StandaloneSearchBox>
      </div>

      {/* Map */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={mapZoom}
        onClick={() => setActiveMarker(null)}
      >
        {locations?.map((location) => (
          <Marker
            key={location.id}
            position={location.position}
            onClick={() => setActiveMarker(location.id)}
          >
            {activeMarker === location.id && (
              <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                <div className="max-w-[200px] space-y-1 p-2 text-sm">
                  <strong className="block text-base">{location?.name ?? '----'}</strong>
                  <div>{location?.address ?? '----'}</div>
                  <div className="text-blue-600">{location?.email ?? '----'}</div>
                  <div>{location?.phone ?? '----'}</div>
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}
      </GoogleMap>
    </div>
  );
};

export default MapSection;
