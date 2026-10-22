import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://iziflow.sn";
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/cgu", "/privacy", "/login", "/register"],
      disallow: ["/api/", "/dashboard/", "/settings/", "/invoices/", "/clients/", "/inventory/", "/sales/", "/payroll/", "/crm/", "/relances/", "/reports/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
