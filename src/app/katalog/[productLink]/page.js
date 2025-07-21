// src/app/katalog/[productLink]/page.js
// Обновленная страница товара с полным SSG

import { notFound } from 'next/navigation'
import ProductPage from "@/pages/ProductPage/ProductPage"
import productServiceServer from "@/services/productServer.service"

// Генерация статических путей для всех товаров
export async function generateStaticParams() {
	try {
		console.log('🔄 Генерируем статические пути для товаров...')

		// Получаем все productLink из JSON
		const productLinks = await productServiceServer.getAllProductLinks()

		console.log(`✅ Найдено ${productLinks.length} товаров для генерации`)

		// Возвращаем массив параметров для каждой страницы
		return productLinks.map((productLink) => ({
			productLink: productLink,
		}))
	} catch (error) {
		console.error('❌ Ошибка генерации статических путей:', error)
		return []
	}
}

// Генерация мета-данных для каждого товара
export async function generateMetadata({ params }) {
	try {
		const { productLink } = await params

		// Получаем информацию о товаре
		const product = await productServiceServer.getProductInfo(productLink)

		if (!product) {
			return {
				title: 'Produkt sa nenašiel - Mobilend.sk',
				description: 'Požadovaný produkt sa nenašiel v našom katalógu.'
			}
		}

		// Базовые мета-теги
		const price = product.discount
			? (product.price * (1 - product.discount / 100)).toFixed(0)
			: product.price.toFixed(0)

		// Определяем изображение для OpenGraph
		let ogImage = null
		if (product.mainImage) {
			ogImage = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mobilend.sk'}/data/gallery/${product.mainImage}`
		} else if (product.images && product.images.length > 0) {
			// Берем первое изображение, если mainImage пустое
			const firstImage = product.images[0]
			if (firstImage && !firstImage.startsWith('http')) {
				ogImage = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mobilend.sk'}/data/gallery/${firstImage}`
			}
		}

		return {
			title: `${product.model} - €${price} | Kúpiť v Mobilend.sk`,
			description: `${product.model} ${product.memory ? `s ${product.memory} pamäťou` : ''} za €${price}. ${product.shortInfo || 'Kvalitný mobilný telefón'} s rýchlym doručením.`,

			// Open Graph теги
			openGraph: {
				title: `${product.model} - €${price}`,
				description: `${product.model} za najlepšiu cenu €${price}`,
				type: 'website',
				images: ogImage ? [ogImage] : [],
				url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mobilend.sk'}/katalog/${productLink}`,
				siteName: 'Mobilend',
			},

			// Twitter Card
			twitter: {
				card: 'summary_large_image',
				title: `${product.model} - €${price}`,
				description: `${product.model} za najlepšiu cenu €${price}`,
				images: ogImage ? [ogImage] : [],
			},

			// Canonical URL
			alternates: {
				canonical: `/katalog/${productLink}`,
			},
		}
	} catch (error) {
		console.error('Ошибка генерации метаданных:', error)
		return {
			title: 'Chyba načítania produktu - Mobilend.sk'
		}
	}
}

// Главный компонент страницы товара
export default async function KatalogProduct({ params }) {
	try {
		const { productLink } = await params

		// Получаем данные о товаре на сервере
		const product = await productServiceServer.getProductInfo(productLink)

		// Если товар не найден - показываем 404
		if (!product) {
			console.warn(`Товар с productLink "${productLink}" не найден`)
			notFound()
		}

		// Передаем предзагруженные данные в компонент
		return <ProductPage product={product} productLink={productLink} />

	} catch (error) {
		console.error('Ошибка загрузки страницы товара:', error)
		notFound()
	}
}