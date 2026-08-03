import L from "leaflet";

import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker from "leaflet/dist/images/marker-icon.png";
import shadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker,
  shadowUrl: shadow,
});

export const defaultIcon = new L.Icon.Default();

export const farmerIcon = new L.DivIcon({
  html: `
    <div class="w-9 h-9 rounded-full bg-[#2D6A4F] border-2 border-white shadow flex items-center justify-center">
      <i class="ri-plant-line text-white text-sm"></i>
    </div>
  `,
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

export const userIcon = new L.DivIcon({
  html: `
    <div class="w-9 h-9 rounded-full bg-blue-500 border-2 border-white shadow flex items-center justify-center">
      <i class="ri-user-line text-white text-sm"></i>
    </div>
  `,
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});
