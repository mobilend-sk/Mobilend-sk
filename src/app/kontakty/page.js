// src/app/kontakty/page.js
// Страница контактов с SEO метаданными

import ContactsPage from "@/pages/ContactsPage/ContactsPage"

// Генерация мета-данных для страницы контактов
export async function generateMetadata() {
	return {
		title: 'Kontakt - Mobilend | +421 919 496 013 | Bratislava',
		description: 'Kontaktujte nás pre poradenstvo a objednávky mobilných telefónov. Tel: +421 919 496 013, Email: zl.maildesk@gmail.com. Návštívte nás na Pekná cesta 2459, Bratislava.',

		keywords: [
			'kontakt mobilend',
			'+421 919 496 013',
			'zl.maildesk@gmail.com',
			'Pekná cesta 2459 Bratislava',
			'kontakt predajňa telefóny',
			'adresa mobilend',
			'telefónne číslo',
			'email mobilend'
		],

		// Open Graph
		openGraph: {
			title: 'Kontakt - Mobilend Bratislava',
			description: 'Potrebujete poradiť s výberom telefónu? Kontaktujte nás na +421 919 496 013 alebo navštívte našu predajňu v Bratislave.',
			type: 'website',
			url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mobilend.sk'}/kontakty`,
			siteName: 'Mobilend',
			locale: 'sk_SK',
			images: [
				{
					url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mobilend.sk'}/images/og.jpg`,
					width: 1200,
					height: 630,
					alt: 'Kontakt - Mobilend Bratislava',
				}
			],
		},

		// Twitter Card
		twitter: {
			card: 'summary_large_image',
			title: 'Kontakt - Mobilend',
			description: 'Kontaktujte nás: +421 919 496 013 | Bratislava, Pekná cesta 2459',
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
			canonical: '/kontakty',
		},

		// Dodatočné meta tagy pre kontakty
		other: {
			'theme-color': '#252758',
			// Local Business schema (pridáme v ďalšom kroku)
			'geo.region': 'SK-BL',
			'geo.placename': 'Bratislava',
			'geo.position': '48.198111;17.135069',
			'ICBM': '48.198111, 17.135069',
		},
	}
}

export default function Kontakty() {
	return <ContactsPage />
}