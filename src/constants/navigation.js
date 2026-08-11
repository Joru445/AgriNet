export const farmerNavigation = [
  {
    to: "/farmer",
    icon: "ri-dashboard-line",
    label: "Dashboard",
    bottom: true,
  },
  {
    to: "/farmer/products",
    icon: "ri-store-2-line",
    label: "My Products",
    bottom: true,
  },
  {
    to: "/farmer/inquiries",
    icon: "ri-file-list-3-line",
    label: "Inquiries",
    bottom: true,
  },
  {
    to: "/farmer/messages",
    icon: "ri-message-3-line",
    label: "Messages",
    bottom: true,
  },
  {
    to: "/farmer/reviews",
    icon: "ri-star-line",
    label: "Reviews",
    bottom: false,
  },
  {
    to: "/farmer/me",
    icon: "ri-user-line",
    label: "My Profile",
    bottom: true,
  },
];

export const consumerNavigation = [
  {
    to: "/home",
    icon: "ri-store-2-line",
    label: "Home",
    bottom: true,
  },
  {
    to: "/nearby",
    icon: "ri-map-pin-line",
    label: "Nearby",
    bottom: true,
  },
  {
    to: "/inquiries",
    icon: "ri-file-list-3-line",
    label: "Inquiries",
    bottom: true,
  },
  {
    to: "/messages",
    icon: "ri-message-3-line",
    label: "Messages",
    bottom: true,
  },
  {
    to: "/me",
    icon: "ri-user-line",
    label: "Profile",
    bottom: true,
  },
];

export const adminNavigation = [
  {
    to: "/admin",
    label: "Dashboard",
    icon: "ri-dashboard-line",
    bottom: true,
  },
  {
    to: "/admin/farmers/verification",
    label: "Farmer Verification",
    icon: "ri-user-search-line",
    bottom: true,
  },
  {
    to: "/admin/messages",
    icon: "ri-message-3-line",
    label: "Messages",
    bottom: true,
  },
  {
    to: "/admin/me",
    icon: "ri-user-line",
    label: "Profile",
    bottom: true,
  },
];

export const navigationByRole = {
  consumer: consumerNavigation,
  farmer: farmerNavigation,
  admin: adminNavigation,
};
