// src/app/katalog/page.js
// Страница каталога с SEO метаданными

import CatalogPage from "@/pages/CatalogPage/CatalogPage"

// Генерация мета-данных для каталога
export async function generateMetadata() {
	return {
		title: 'Katalóg mobilných telefónov - Mobilend.sk | iPhone, Samsung',
		description: 'Kompletný katalóg mobilných telefónov. iPhone, Samsung Galaxy a ďalšie značky za najlepšie ceny s doručením zadarmo. Porovnajte ceny a vyberte si.',

		keywords: [
			'katalóg telefónov',
			'všetky mobilné telefóny',
			'porovnanie cien',
			'iPhone katalóg',
			'Samsung katalóg',
			'výber telefónov',
			'mobilné telefóny bratislava',
			'najlepšie ceny'
		],

		// Open Graph
		openGraph: {
			title: 'Katalóg telefónov - Mobilend | Všetky modely na jednom mieste',
			description: 'Prezrite si náš kompletný katalóg mobilných telefónov. Porovnajte ceny, funkcionalita a vyberte si najlepší telefón.',
			type: 'website',
			url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mobilend.sk'}/katalog`,
			siteName: 'Mobilend',
			locale: 'sk_SK',
			images: [
				{
					url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mobilend.sk'}/images/og.jpg`,
					width: 1200,
					height: 630,
					alt: 'Katalóg mobilných telefónov - Mobilend',
				}
			],
		},

		// Twitter Card
		twitter: {
			card: 'summary_large_image',
			title: 'Katalóg telefónov - Mobilend',
			description: 'Kompletný výber mobilných telefónov za najlepšie ceny.',
			images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://mobilend.sk'}/images/og.jpg`],
		},

		// Robots
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

		// Canonical URL
		alternates: {
			canonical: '/katalog',
		},

		// Dodatočné meta tagy
		other: {
			'theme-color': '#ffffff',
		},
	}
}

export default function Katalog() {
	return <CatalogPage />
}