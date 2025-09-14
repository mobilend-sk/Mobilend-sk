// src/app/blog/[slug]/page.js
// Страница отдельной статьи блога - только данные и метаданные

import { notFound } from 'next/navigation'
import { getAllBlogSlugs, getBlogPostBySlug, getRelatedBlogPosts } from '@/lib/blog'
import ArticlePage from '@/pages/ArticlePage/ArticlePage'

// ISR - перегенерация каждый час
export const revalidate = 3600

// Генерация статических путей для всех статей
export async function generateStaticParams() {
	try {
		console.log('🔄 Генерируем статические пути для блог статей...')

		const slugs = getAllBlogSlugs() // Убираем await

		console.log(`✅ Найдено ${slugs.length} блог статей для генерации`)

		return slugs.map((slug) => ({
			slug: slug,
		}))
	} catch (error) {
		console.error('❌ Ошибка генерации статических путей блога:', error)
		return []
	}
}

// Генерация мета-данных для каждой статьи
export async function generateMetadata({ params }) {
	try {
		const { slug } = await params
		const post = getBlogPostBySlug(slug) // Убираем await

		if (!post) {
			return {
				title: 'Článok sa nenašiel - Mobilend Blog',
				description: 'Požadovaný článok sa nenašiel v našom blogu.'
			}
		}

		// Определяем изображение для OpenGraph
		const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobilend.sk'
		const ogImage = post.image
			? `${baseUrl}${post.image}`
			: `${baseUrl}/images/blog/default-blog.jpg`

		return {
			title: `${post.title} | Mobilend Blog`,
			description: post.description || post.title,

			keywords: post.categories || [],

			// Open Graph теги
			openGraph: {
				title: post.title,
				description: post.description || post.title,
				type: 'article',
				url: `${baseUrl}/blog/${slug}`,
				siteName: 'Mobilend',
				locale: 'sk_SK',
				images: [
					{
						url: ogImage,
						width: 1200,
						height: 630,
						alt: post.title,
					}
				],
				publishedTime: post.date,
				authors: [post.author || 'Mobilend'],
				section: post.categories ? post.categories[0] : 'Technology',
				tags: post.categories || [],
			},

			// Twitter Card
			twitter: {
				card: 'summary_large_image',
				title: post.title,
				description: post.description || post.title,
				images: [ogImage],
				creator: '@mobilend_sk', // если есть Twitter аккаунт
			},

			// Article теги
			other: {
				'article:published_time': post.date,
				'article:author': post.author || 'Mobilend',
				'article:section': post.categories ? post.categories[0] : 'Technology',
				'article:tag': post.categories ? post.categories.join(', ') : '',
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
				canonical: `https://mobilend.sk/blog/${slug}`,
			},
		}
	} catch (error) {
		console.error('Ошибка генерации метаданных для статьи:', error)
		return {
			title: 'Chyba načítania článku - Mobilend Blog'
		}
	}
}

export default async function BlogPost({ params }) {
	try {
		const { slug } = await params

		// Получаем статью по slug
		const post = getBlogPostBySlug(slug) // Убираем await

		// Если статья не найдена - показываем 404
		if (!post) {
			console.warn(`Статья с slug "${slug}" не найдена`)
			notFound()
		}

		// Получаем похожие статьи (исключаем текущую)
		const relatedPosts = getRelatedBlogPosts(slug, 4) // Убираем await

		// Передаем данные в компонент
		return <ArticlePage post={post} relatedPosts={relatedPosts} />

	} catch (error) {
		console.error('Ошибка загрузки страницы статьи:', error)
		notFound()
	}
}