import { Montserrat } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header/Header";
import CartProvider from "@/components/CartProvider/CartProvider";
import Footer from "@/components/Footer/Footer";
import Script from "next/script";

import {
	generateOrganizationSchema,
	generateLocalBusinessSchema,
	generateWebsiteSchema
} from "@/components/SEO/JsonLdSchemas";


const montserrat = Montserrat({
	variable: "--font-montserrat-sans",
	subsets: ["latin"],
});


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
	// Правильный способ добавления гео-тегов
	other: {
		'theme-color': '#ffffff', // Tvoja hlavná farba
		'apple-mobile-web-app-capable': 'yes',
		'apple-mobile-web-app-status-bar-style': 'default',
		'geo.region': 'SK',
		'geo.placename': 'Slovakia',
		'geo.position': '48.198111;17.135069', // координаты вашего магазина
		'ICBM': '48.198111, 17.135069',
		'DC.title': 'Mobilend - Mobilné telefóny',
		'DC.creator': 'Mobilend',
		'DC.subject': 'mobilné telefóny, smartfóny, iPhone, Samsung',
		'DC.description': 'Predaj mobilných telefónov na Slovensku',
		'DC.language': 'sk',
	},
	// Open Graph pre sociálne siete
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

	// Twitter Card
	twitter: {
		card: 'summary_large_image',
		title: 'Mobilend - Predaj mobilných telefónov',
		description: 'Najlepšie ceny mobilných telefónov na Slovensku. iPhone, Samsung Galaxy a ďalšie.',
		images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://mobilend.sk'}/images/og.jpg`],
	},
	// Дополнительные SEO теги
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

};

export default function RootLayout({ children }) {
	const organizationSchema = generateOrganizationSchema();
	const localBusinessSchema = generateLocalBusinessSchema();
	const websiteSchema = generateWebsiteSchema();
	return (
		<html lang="sk">
			<head>
				<Script
					id="clarity-script"
					strategy="afterInteractive"
					dangerouslySetInnerHTML={{
						__html: `
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "smye6dsu89");
          `,
					}}
				/>
				<script>{(function(w,d,s,l,i){w[l] = w[l] || [];w[l].push({'gtm.start':
					new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
					j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
					'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
					})(window,document,'script','dataLayer','GTM-MS49G67V')}
				</script>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: organizationSchema.replace(/</g, '\\u003c')
					}}
				/>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: localBusinessSchema.replace(/</g, '\\u003c')
					}}
				/>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: websiteSchema.replace(/</g, '\\u003c')
					}}
				/>

				<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
				<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
				<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
				<link rel="manifest" href="/site.webmanifest"></link>
				<meta name="google-site-verification" content="FSaPwNNHa_INuIokyRiaONgJt97b84T43F6xqFTkR_8" />
			</head>
			<body className={`${montserrat.variable}`}>
				<noscript>
					<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MS49G67V" height="0" width="0" style="display:none;visibility:hidden">
					</iframe>
				</noscript>

				<Script
					id="zoho-salesiq-init"
					strategy="beforeInteractive"
					dangerouslySetInnerHTML={{
						__html: `
							window.$zoho = window.$zoho || {};
							$zoho.salesiq = $zoho.salesiq || {
								ready: function() {
									console.log('Zoho SalesIQ initialized');
								}
							};
						`
					}}
				/>
				<Header />
				<CartProvider>
					{children}
				</CartProvider>
				<Footer />

				{/* Zoho SalesIQ Chat Widget - Main Script */}
				<Script
					id="zoho-salesiq-widget"
					src="https://salesiq.zohopublic.eu/widget?wc=siq6baa26158f6358677c5d4ab519fd128520a6948174d7839f102574e3dbd3f4c2"
					strategy="lazyOnload"
				/>

			</body>
		</html>
	);
}
