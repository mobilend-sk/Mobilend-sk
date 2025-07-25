// src/lib/blog.js
// Серверные утилиты для работы с markdown файлами блога (ТОЛЬКО ДЛЯ СЕРВЕРА!)

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'

// Путь к папке с блог статьями
const BLOG_DIR = path.join(process.cwd(), 'public', 'data', 'blog', 'articles')

// Форматирование даты для отображения
export function formatBlogDate(dateString, locale = 'sk-SK') {
	if (!dateString) return ''

	try {
		const date = new Date(dateString)
		return date.toLocaleDateString(locale, {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	} catch (error) {
		console.error('Ошибка форматирования даты:', error)
		return dateString
	}
}

// Создать excerpt (краткое описание) из контента
export function createExcerpt(content, maxLength = 150) {
	if (!content) return ''

	// Убираем markdown разметку и HTML теги
	const plainText = content
		.replace(/#{1,6}\s+/g, '') // заголовки
		.replace(/\*\*(.*?)\*\*/g, '$1') // жирный текст
		.replace(/\*(.*?)\*/g, '$1') // курсив
		.replace(/\[(.*?)\]\(.*?\)/g, '$1') // ссылки
		.replace(/<[^>]*>/g, '') // HTML теги
		.trim()

	// Обрезаем до нужной длины
	if (plainText.length <= maxLength) return plainText

	const truncated = plainText.substring(0, maxLength)
	const lastSpace = truncated.lastIndexOf(' ')

	return lastSpace > 0
		? truncated.substring(0, lastSpace) + '...'
		: truncated + '...'
}

// Рендер markdown в HTML
export function markdownToHtml(markdown) {
	if (!markdown) return ''

	try {
		return marked(markdown)
	} catch (error) {
		console.error('Ошибка рендера markdown:', error)
		return markdown
	}
}

// Предобработка поста для компонентов
function processPostForComponents(post) {
	if (!post) return null

	return {
		...post,
		formattedDate: formatBlogDate(post.date),
		excerpt: post.description || createExcerpt(post.content, 120),
		htmlContent: markdownToHtml(post.content)
	}
}

// Проверяем существование папки блога
function ensureBlogDirExists() {
	if (!fs.existsSync(BLOG_DIR)) {
		console.warn(`⚠️ Папка блога не найдена: ${BLOG_DIR}`)
		return false
	}
	return true
}

// Получить все MD файлы из папки блога
export function getAllBlogFiles() {
	if (!ensureBlogDirExists()) return []

	try {
		const files = fs.readdirSync(BLOG_DIR)
		return files.filter(file => file.endsWith('.md'))
	} catch (error) {
		console.error('Ошибка чтения папки блога:', error)
		return []
	}
}

// Получить содержимое MD файла и распарсить frontmatter
export function getBlogPost(filename) {
	if (!ensureBlogDirExists()) return null

	try {
		const filePath = path.join(BLOG_DIR, filename)

		if (!fs.existsSync(filePath)) {
			console.warn(`⚠️ Файл не найден: ${filePath}`)
			return null
		}

		const fileContent = fs.readFileSync(filePath, 'utf8')
		const { data, content } = matter(fileContent)

		// Проверяем обязательные поля
		if (!data.title || !data.slug) {
			console.warn(`⚠️ Отсутствуют обязательные поля в ${filename}`)
			return null
		}

		return {
			...data,
			content,
			filename
		}
	} catch (error) {
		console.error(`Ошибка чтения файла ${filename}:`, error)
		return null
	}
}

// Получить статью по slug (с предобработкой)
export function getBlogPostBySlug(slug) {
	const files = getAllBlogFiles()

	for (const file of files) {
		const post = getBlogPost(file)
		if (post && post.slug === slug) {
			return processPostForComponents(post)
		}
	}

	return null
}

// Получить все статьи с сортировкой по дате (с предобработкой)
export function getAllBlogPosts(limit = null) {
	const files = getAllBlogFiles()
	const posts = []

	for (const file of files) {
		const post = getBlogPost(file)
		if (post) {
			posts.push(processPostForComponents(post))
		}
	}

	// Сортируем по дате (новые сверху)
	posts.sort((a, b) => {
		const dateA = new Date(a.date || 0)
		const dateB = new Date(b.date || 0)
		return dateB - dateA
	})

	// Ограничиваем количество если нужно
	return limit ? posts.slice(0, limit) : posts
}

// Получить все slug для generateStaticParams
export function getAllBlogSlugs() {
	const posts = getAllBlogPosts()
	return posts.map(post => post.slug).filter(Boolean)
}

// Получить рекомендуемые статьи (исключая текущую)
export function getRelatedBlogPosts(currentSlug, limit = 4) {
	const allPosts = getAllBlogPosts()

	// Исключаем текущую статью
	const relatedPosts = allPosts.filter(post => post.slug !== currentSlug)

	// Возвращаем ограниченное количество
	return relatedPosts.slice(0, limit)
}