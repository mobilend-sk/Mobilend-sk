// src/app/blog/page.js
// Главная страница блога - только данные и метаданные

import { getAllBlogPosts } from '@/lib/blog'
import BlogPage from '@/pages/BlogPage/BlogPage'

// ISR - перегенерация каждый час
export const revalidate = 3600

// Генерация мета-данных для SEO
export async function generateMetadata() {
	return {
		title: 'Blog - Mobilend | Novinky a tipy o mobilných telefónoch',
		description: 'Najnovšie články o mobilných telefónoch, recenzie, porovnania a tipy. Držte sa v obraze s najnovšími trendmi vo svete smartfónov.',

		keywords: [
			'blog mobilné telefóny',
			'recenzie smartfónov',
			'novinky telefóny',
			'tipy mobilné zariadenia',
			'porovnania telefónov',
			'technológie blog',
			'iPhone články',
			'Samsung blog'
		],

		// Open Graph
		openGraph: {
			title: 'Blog - Mobilend | Najnovšie o mobilných telefónoch',
			description: 'Prečítajte si najnovšie články o smartfónoch, recenzie a užitočné tipy od expertov na mobilné technológie.',
			type: 'website',
			url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mobilend.sk'}/blog`,
			siteName: 'Mobilend',
			locale: 'sk_SK',
			images: [
				{
					url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mobilend.sk'}/images/blog/og-blog.jpg`,
					width: 1200,
					height: 630,
					alt: 'Mobilend Blog - Články o mobilných telefónoch',
				}
			],
		},

		// Twitter Card
		twitter: {
			card: 'summary_large_image',
			title: 'Blog - Mobilend',
			description: 'Najnovšie články a recenzie mobilných telefónov.',
			images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://mobilend.sk'}/images/blog/og-blog.jpg`],
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
			canonical: 'https://mobilend.sk/blog',
		},

		// Dodatočné meta tagy
		other: {
			'theme-color': '#ffffff',
		},
	}
}

export default async function Blog() {
	// Получаем все статьи блога (ISR - перегенерируется каждый час)
	const allPosts = getAllBlogPosts() // Убираем await

	// Передаем данные в компонент
	return <BlogPage allPosts={allPosts} />
}