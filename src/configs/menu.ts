import {
  BellRing,
  Box,
  CircleGauge,
  FileChartColumn,
  FileCog,
  FileStack,
  Globe,
  Mails,
  QrCode,
  ReceiptText,
  Store,
  UserRound,
  UsersRound,
} from "lucide-react";

// ? ============================= Super Admin Menus ============================= ?
const superadminMenuItems = [
  {
    title: "Dashboard",
    url: "/superadmin/dashboard",
    icon: CircleGauge,
    roles: ["superadmin"],
  },
  {
    title: "Owner Management",
    url: "/superadmin/owner-management",
    icon: UsersRound,
    roles: ["superadmin"],
  },
  {
    title: "Store Management",
    url: "/superadmin/store-management",
    icon: Store,
    roles: ["superadmin"],
  },
  {
    title: "Alerts",
    url: "/superadmin/alerts",
    icon: BellRing,
    roles: ["superadmin"],
  },
  {
    title: "Genie Requests",
    url: "/superadmin/genie-requests",
    icon: Mails,
    roles: ["superadmin"],
  },
  {
    title: "Uploaded Files",
    url: "/superadmin/uploaded-files",
    icon: FileStack,
    roles: ["superadmin"],
  },
];

// ? ============================= Store Owner Menus ============================= ?
const storeOwnerMenuItems = [
  {
    title: "Dashboard",
    url: "/store-owner/dashboard",
    icon: CircleGauge,
    roles: ["owner"],
  },
  {
    title: "Employee Management",
    url: "/store-owner/employee-management",
    icon: UserRound,
    roles: ["owner"],
  },
  {
    title: "QR Code Settings",
    url: "/store-owner/qr-code-generator/settings",
    icon: FileCog,
    roles: ["owner"],
  },
  {
    title: "Landing Page",
    url: "/store-owner/landing-page-configuration",
    icon: Globe,
    roles: ["owner"],
  },
  {
    title: "Vendors",
    url: "/store-owner/product-catalog",
    icon: Box,
    roles: ["owner"],
  },
  {
    title: "Print QR Codes",
    url: "/store-owner/qr-code-management",
    icon: QrCode,
    roles: ["owner"],
  },
  {
    title: "Leads",
    url: "/store-owner/quote-and-lead",
    icon: ReceiptText,
    roles: ["owner"],
  },
  {
    title: "Reports",
    url: "/store-owner/qrscan-analytics",
    icon: FileChartColumn,
    roles: ["owner"],
  },
];

// ? ============================= Manager Menus ============================= ?
const managerMenuItems = [
  {
    title: "Dashboard",
    url: "/store-manager/dashboard",
    icon: CircleGauge,
    roles: ["manager"],
  },
  {
    title: "Employee Management",
    url: "/store-manager/employee-management",
    icon: UserRound,
    roles: ["manager"],
  },
  {
    title: "QR Code Settings",
    url: "/store-manager/qr-code-generator/settings",
    icon: FileCog,
    roles: ["manager"],
  },
  {
    title: "Landing Page",
    url: "/store-manager/landing-page-configuration",
    icon: Globe,
    roles: ["manager"],
  },
  {
    title: "Vendors",
    url: "/store-manager/product-catalog",
    icon: Box,
    roles: ["manager"],
  },
  {
    title: "Print QR Codes",
    url: "/store-manager/qr-code-management",
    icon: QrCode,
    roles: ["manager"],
  },
  {
    title: "Leads",
    url: "/store-manager/quote-and-lead",
    icon: ReceiptText,
    roles: ["manager"],
  },
];

// ? ============================= Employee Menus ============================= ?
const employeeMenuItems = [
  {
    title: "Dashboard",
    url: "/employee/dashboard",
    icon: CircleGauge,
    roles: ["employee"],
  },
  {
    title: "Vendors",
    url: "/employee/product-lookup",
    icon: Box,
    roles: ["employee"],
  },
  {
    title: "QR Codes",
    url: "/employee/qr-code-management",
    icon: QrCode,
    roles: ["employee"],
  },
];

// ? ============================= All Menus ============================= ?
export const menuItems = [
  ...superadminMenuItems,
  ...storeOwnerMenuItems,
  ...managerMenuItems,
  ...employeeMenuItems,
];
