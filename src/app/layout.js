// src/app/layout.tsx
import React from 'react'
import { Montserrat } from 'next/font/google'
import "./globals.css"
import Header from "@/components/Header/Header"
import CartProvider from "@/components/CartProvider/CartProvider"
import Footer from "@/components/Footer/Footer"

import {
  generateOrganizationSchema,
  generateLocalBusinessSchema,
  generateWebsiteSchema
} from "@/components/SEO/JsonLdSchemas"

const montserrat = Montserrat({
  variable: "--font-montserrat-sans",
  subsets: ["latin"],
})

export const metadata = {
  title: "Mobilend - Predaj mobilných telefónov | iPhone, Samsung Galaxy",
  description: 'Široký výber mobilných telefónov za najlepšie ceny. iPhone, Samsung Galaxy a ďalšie značky. Rýchle doručenie po celom Slovensku s garancia kvalitnej služby.',
  keywords: [
    'mobilné telefóny',
    'iPhone',
    'Samsung Galaxy',
    'smartfóny',
    'predaj telefónov',
    'Bratislava',
    'Slovensko',
    'mobilend'
  ],
  authors: [{ name: 'Mobilend group' }],
  creator: 'Mobilend studio',
  publisher: 'Mobilend',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: 'https://mobilend.sk',
  },
  verification: {
    google: 'FSaPwNNHa_INuIokyRiaONgJt97b84T43F6xqFTkR_8'
  },
  other: {
    'theme-color': '#ffffff',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'geo.region': 'SK',
    'geo.placename': 'Slovakia',
    'geo.position': '48.198111;17.135069',
    'ICBM': '48.198111, 17.135069',
    'DC.title': 'Mobilend - Mobilné telefóny',
    'DC.creator': 'Mobilend',
    'DC.subject': 'mobilné telefóny, smartfóny, iPhone, Samsung',
    'DC.description': 'Predaj mobilných telefónov na Slovensku',
    'DC.language': 'sk',
  },
  openGraph: {
    title: 'Mobilend - Najlepšie mobilné telefóny na Slovensku',
    description: 'Objavte široký výber mobilných telefónov za skvelé ceny. iPhone, Samsung a ďalšie značky s rýchlym doručením.',
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mobilend.sk'}`,
    siteName: 'Mobilend',
    locale: 'sk_SK',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mobilend.sk'}/images/og.jpg`,
        width: 1200,
        height: 630,
        alt: 'Mobilend - Mobilné telefóny',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mobilend - Predaj mobilných telefónov',
    description: 'Najlepšie ceny mobilných telefónov na Slovensku. iPhone, Samsung Galaxy a ďalšie.',
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://mobilend.sk'}/images/og.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default async function RootLayout({ children }) {
  const organizationSchema = generateOrganizationSchema()
  const localBusinessSchema = generateLocalBusinessSchema()
  const websiteSchema = generateWebsiteSchema()

  return (
    <html lang="sk">
      <body className={montserrat.variable}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: organizationSchema }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: localBusinessSchema }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: websiteSchema }}
        />

        <Header />
        <CartProvider>
          {children}
        </CartProvider>
        <Footer />
      </body>
    </html>
  )
}