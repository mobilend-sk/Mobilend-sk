// src/app/page.js
// Главная страница с SEO метаданными

import HomePage from "@/pages/HomePage/HomePage"

// Генерация мета-данных для главной страницы
export async function generateMetadata() {
	return {
		title: 'Mobilend - Predaj mobilných telefónov | iPhone, Samsung Galaxy',
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
			canonical: '/',
		},

		// Dodatočné meta tagy
		other: {
			'theme-color': '#252758', // Tvoja hlavná farba
			'apple-mobile-web-app-capable': 'yes',
			'apple-mobile-web-app-status-bar-style': 'default',
		},
	}
}

export default function Home() {
	return <HomePage />
}