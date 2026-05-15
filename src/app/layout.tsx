import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.alllinks.app"),
  title: "AllLinks - Seu Painel de Links Pessoal",
  description:
    "AllLinks is the personal link-management dashboard every digital citizen needs. Organize every bookmark, tool, login, and resource into visual categories with drag-and-drop, quick-access shortcuts, emoji-coded sections, and instant panel switching - all in one beautiful, private, mobile-first interface. Stop losing links in browser tabs, notes, and chat threads. Start living organized.",
  keywords: [
    "personal dashboard",
    "link manager",
    "bookmark organizer",
    "digital life",
    "productivity tool",
    "personal start page",
    "link organizer",
    "quick access",
    "drag and drop links",
    "private dashboard",
    "mobile dashboard",
    "alllinks",
    "organize bookmarks",
    "link management app",
    "digital organization",
    "personal homepage",
    "start page",
    "new tab dashboard",
    "web app",
    "category organizer",
    "emoji sections",
    "link hub",
    "life dashboard",
  ],
  authors: [{ name: "AllLinks", url: "https://www.alllinks.app" }],
  creator: "AllLinks",
  publisher: "AllLinks",
  category: "Productivity",
  alternates: {
    canonical: "https://www.alllinks.app",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.alllinks.app",
    siteName: "AllLinks",
    title: "AllLinks - Your Personal Digital Life Dashboard",
    description:
      "Every human with a digital life needs this. Organize all your links, tools, and resources in one beautiful private dashboard. Drag-and-drop categories, emoji-coded sections, quick-access bar, instant panel switching. Mobile-first, blazing fast, delightfully simple.",
    // images: [
    //   {
    //     url: "/og-image.png",
    //     width: 1200,
    //     height: 630,
    //     alt: "AllLinks - Your Personal Digital Life Dashboard",
    //   },
    // ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AllLinks - Your Personal Digital Life Dashboard",
    description:
      "The personal dashboard every internet user deserves. All your links, one beautiful place. Drag and drop, emoji sections, instant switching, mobile-perfect.",
    // images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "AllLinks",
  url: "https://www.alllinks.app",
  description:
    "AllLinks is the personal link-management dashboard every digital citizen needs. Organize every bookmark, tool, login, and resource into visual categories with drag-and-drop, quick-access shortcuts, emoji-coded sections, and instant panel switching - all in one beautiful, private, mobile-first interface. Stop losing links in browser tabs, notes, and chat threads. Start living organized.",
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free to use. Premium features coming soon.",
  },
  featureList: [
    "Private personal dashboard — your data, your control",
    "Emoji-coded sections for instant visual organization",
    "Drag-and-drop link and category management",
    "Quick-access shortcuts bar for your most-used links",
    "Multiple panels with instant one-click switching",
    "Built-in Google Search integration",
    "Mobile-first responsive design",
    "Secure Google Sign-In authentication",
    "Real-time sync across all your devices",
    "Beautiful minimal interface built for focus",
  ],
  keywords:
    "personal dashboard, link manager, bookmark organizer, digital life, productivity tool, personal start page, link organizer, quick access, drag and drop links, private dashboard, mobile dashboard, alllinks, organize bookmarks, link management app, digital organization, personal homepage, start page, new tab dashboard, web app, category organizer, emoji sections, link hub, life dashboard",
  author: {
    "@type": "Organization",
    name: "AllLinks",
    url: "https://www.alllinks.app",
  },
  potentialAction: {
    "@type": "ViewAction",
    name: "Start Organizing Your Digital Life",
    target: "https://www.alllinks.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-CDQ92N01C3"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-CDQ92N01C3');
        `}</Script>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
