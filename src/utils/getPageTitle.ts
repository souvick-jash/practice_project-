export const getPageTitle = (path: string): string => {
  const routes: { match: string; title: string; startsWith?: boolean }[] = [
    { match: "/superadmin/dashboard", title: "Dashboard" },
    { match: "/superadmin/profile", title: "Profile" },
    { match: "/superadmin/owner-management", title: "Owner Management" },
    { match: "/superadmin/alerts", title: "Notifications & Alerts" },
    {
      match: "/superadmin/store-management/manufacturers",
      title: "Store Management",
    },
    { match: "/superadmin/store-management", title: "Store Management" },
    { match: "/superadmin/genie-requests", title: "Genie Requests" },
    { match: "/superadmin/uploaded-files", title: "Uploaded Files" },
    { match: "/superadmin/product-import", title: "Product Import" },
    { match: "/superadmin/import-history", title: "Import History" },
    {
      match: "/superadmin/all-payment-methods/",
      title: "Payment Methods",
      startsWith: true,
    },
    {
      match: "/superadmin/add-payment-method/",
      title: "Add Payment Method",
      startsWith: true,
    },
    {
      match: "/superadmin/all-subscriptions/",
      title: "Subscriptions",
      startsWith: true,
    },
    {
      match: "/superadmin/add-subscription",
      title: "Add Subscription",
      startsWith: true,
    },

    { match: "/store-owner/profile", title: "Profile" },
    { match: "/store-owner/employee-management", title: "Employee Management" },
    { match: "/store-owner/product-catalog", title: "Vendors" },
    {
      match: "/store-owner/product-category",
      title: "Product Category Management",
    },
    {
      match: "/store-owner/product-vendor",
      title: "Product Vendor Management",
    },
    { match: "/store-owner/product-tag", title: "Product Tag Management" },
    { match: "/store-owner/qr-code-management", title: "Print QR Codes" },
    {
      match: "/store-owner/qr-code-generator",
      title: "QR Code Settings",
      startsWith: true,
    },
    { match: "/store-owner/add-qr-print", title: "Print QR Codes" },
    { match: "/store-owner/review-qr-print", title: "Print QR Codes" },
    {
      match: "/store-owner/landing-page-configuration",
      title: "Landing Page Configuration",
    },
    {
      match: "/store-owner/landing-preview",
      title: "Landing Page Preview",
      startsWith: true,
    },
    { match: "/store-owner/quote-and-lead", title: "Leads" },
    { match: "/store-owner/billing", title: "Billing" },
    { match: "/store-owner/qrscan-analytics", title: "Reports" },
    { match: "/store-owner/qr-scan-activity", title: "QR Scan Activity" },
    {
      match: "/store-owner/product-catalog/import-history",
      title: "Import History",
    },

    { match: "/store-manager/profile", title: "Profile" },
    { match: "/store-manager/product-catalog", title: "Vendors" },
    { match: "/store-manager/qr-code-management", title: "Print QR Codes" },
    {
      match: "/store-manager/qr-code-generator",
      title: "QR Code Settings",
      startsWith: true,
    },
    { match: "/store-manager/add-qr-print", title: "Print QR Codes" },
    { match: "/store-manager/review-qr-print", title: "Print QR Codes" },
    {
      match: "/store-manager/landing-page-configuration",
      title: "Landing Page Configuration",
    },
    {
      match: "/store-manager/landing-preview",
      title: "Landing Page Preview",
      startsWith: true,
    },
    { match: "/store-manager/quote-and-lead", title: "Leads" },
    {
      match: "/store-manager/employee-management",
      title: "Employee Management",
    },
    {
      match: "/store-manager/product-catalog/import-history",
      title: "Import History",
    },

    { match: "/employee/profile", title: "Profile" },
    { match: "/employee/product-lookup", title: "Vendors" },
    { match: "/employee/qr-code-management", title: "Print QR Codes" },
  ];

  for (const route of routes) {
    if (route.startsWith) {
      if (path.startsWith(route.match)) return route.title;
    } else {
      if (path === route.match) return route.title;
    }
  }

  return "Dashboard"; // default fallback
};
