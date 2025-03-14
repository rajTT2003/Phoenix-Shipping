import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";

// Define coordinates for different locations
const warehouse = [27.9944024, -81.7602544]; // Florida (Warehouse)
const floridaAirport = [25.7933, -80.2906]; // Miami International Airport
const jamaicaAirport = [17.9357, -76.787]; // Norman Manley International Airport
const companyOffice = [18.1096, -77.2975]; // Final Destination in Kingston, Jamaica

// Custom icons for markers
const createIcon = (color) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

// Routing component for road travel
const Routing = ({ waypoints, color = "blue" }) => {
  const map = useMap(); // Get Leaflet map instance

  useEffect(() => {
    if (!map) return;

    const routingControl = L.Routing.control({
      waypoints: waypoints.map((point) => L.latLng(point)),
      createMarker: () => null, // Hide default markers
      lineOptions: { styles: [{ color, weight: 4 }] }, // Route color
      routeWhileDragging: true,
      addWaypoints: false, // Prevent additional waypoints
      showAlternatives: false, // Disable alternative routes
      fitSelectedRoutes: false, // Prevent zooming to fit routes
      show: false, // Ensure the instruction box is hidden
      hide: true, // Hide any route instructions
    }).addTo(map);

    // Clean up on unmount to remove routing control
    return () => {
      map.removeControl(routingControl);
    };
  }, [map, waypoints, color]);

  return null;
};

const Map = ({ latestStatus }) => {
  const [currentLocation, setCurrentLocation] = useState(floridaAirport); // Default: Florida Airport

  useEffect(() => {
    if (latestStatus) {
      setCurrentLocation(latestStatus); // Update dynamically
    }
  }, [latestStatus]);

  return (
    <MapContainer center={warehouse} zoom={5} style={{ height: "500px", width: "100%" }}>
      {/* OpenStreetMap Tile Layer */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {/* Road Route: Warehouse → Florida Airport */}
      <Routing waypoints={[warehouse, floridaAirport]} color="blue" />

      {/* Air Route: Florida Airport → Jamaica Airport (Dashed Line) */}
      <Polyline positions={[floridaAirport, jamaicaAirport]} color="gray" dashArray="10, 10" />

      {/* Road Route: Jamaica Airport → Company Office */}
      <Routing waypoints={[jamaicaAirport, companyOffice]} color="green" />

      {/* Markers */}
      <Marker position={warehouse} icon={createIcon("blue")} />
      <Marker position={currentLocation} icon={createIcon("orange")} />
      <Marker position={companyOffice} icon={createIcon("green")} />
    </MapContainer>
  );
};

export default Map;
