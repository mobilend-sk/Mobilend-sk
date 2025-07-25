// src/app/robots.js
// Автоматическая генерация robots.txt

export default function robots() {
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobilend.sk'

	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				disallow: [
					'/admin/',
					'/api/',
					'/private/',
					'/_next/',
					'/data/',
				],
			},
			// Специальные правила для поисковых ботов
			{
				userAgent: 'Googlebot',
				allow: '/',
				disallow: ['/admin/', '/api/'],
			},
			{
				userAgent: 'Bingbot',
				allow: '/',
				disallow: ['/admin/', '/api/'],
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
		host: baseUrl,
	}
}