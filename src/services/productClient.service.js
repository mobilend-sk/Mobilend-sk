// Клиентская версия для работы с продуктами в браузере

class ProductService {
	constructor() {
		// URL к JSON файлу с продуктами
		this.productsUrl = '/data/products.json'
	}

	// Загрузка всех продуктов из JSON
	async getAllProducts() {
		try {
			const response = await fetch(this.productsUrl)

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const data = await response.json()

			// Извлекаем все модели из всех групп и добавляем baseImageUrl и phone
			const allProducts = []
			data.forEach(group => {
				if (group.models && Array.isArray(group.models)) {
					// Добавляем phone и baseImageUrl в каждую модель
					const modelsWithGroupInfo = group.models.map(model => ({
						...model,
						phone: group.phone,
						baseImageUrl: group.baseImageUrl
					}))
					allProducts.push(...modelsWithGroupInfo)
				}
			})

			console.log(allProducts);

			return allProducts
		} catch (error) {
			console.error('Ошибка загрузки продуктов:', error)
			return []
		}
	}

	// Получение продукта по productLink (с деталями из той же группы)
	async getProductInfo(productLink) {
		try {
			if (!productLink) {
				throw new Error('productLink не указан')
			}

			const response = await fetch(this.productsUrl)

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const data = await response.json()

			// Ищем продукт и группу, в которой он находится
			let product = null
			let productGroup = null

			for (const group of data) {
				if (group.models && Array.isArray(group.models)) {
					const foundProduct = group.models.find(p => p.productLink === productLink)
					if (foundProduct) {
						product = foundProduct
						productGroup = group
						break
					}
				}
			}

			if (!product) {
				console.warn(`Продукт с productLink "${productLink}" не найден`)
				return null
			}

			// Объединяем продукт с характеристиками из его группы
			return {
				...product,
				// Добавляем базовые поля группы
				phone: productGroup.phone,
				baseImageUrl: productGroup.baseImageUrl,
				// Добавляем все характеристики из группы
				'main-characteristics': productGroup['main-characteristics'] || [],
				'display': productGroup['display'] || [],
				'camera': productGroup['camera'] || [],
				'features': productGroup['features'] || [],
				'battery': productGroup['battery'] || [],
				'hardware': productGroup['hardware'] || [],
				'connectivity': productGroup['connectivity'] || [],
				'dimensions': productGroup['dimensions'] || [],
				'energy': productGroup['energy'] || [],
				'shareModels': productGroup['shareModels'] || [] // Варианты памяти/цветов
			}
		} catch (error) {
			console.error('Ошибка получения информации о продукте:', error)
			throw error
		}
	}

	// Получение всех productLink
	async getAllProductLinks() {
		try {
			const products = await this.getAllProducts()
			return products.map(product => product.productLink).filter(Boolean)
		} catch (error) {
			console.error('Ошибка получения productLinks:', error)
			return []
		}
	}

	// Получение продуктов по модельной группе
	async getProductsByModel(modelGroup) {
		try {
			const products = await this.getAllProducts()
			return products.filter(product => product.modelGroup === modelGroup)
		} catch (error) {
			console.error('Ошибка получения продуктов по модели:', error)
			return []
		}
	}

	// Получение популярных продуктов
	async getPopularProducts(limit = 10) {
		try {
			const products = await this.getAllProducts()
			return products
				.filter(product => product.popular)
				.slice(0, limit)
		} catch (error) {
			console.error('Ошибка получения популярных продуктов:', error)
			return []
		}
	}

	// Получение продуктов со скидкой
	async getDiscountProducts(limit = 10) {
		try {
			const products = await this.getAllProducts()
			return products
				.filter(product => product.discount && product.discount > 0)
				.sort((a, b) => b.discount - a.discount)
				.slice(0, limit)
		} catch (error) {
			console.error('Ошибка получения продуктов со скидкой:', error)
			return []
		}
	}

	// Получение всех уникальных моделей для фильтрации
	async getAllModelGroups() {
		try {
			const products = await this.getAllProducts()
			const modelGroups = [...new Set(products.map(p => p.modelGroup))]
			return modelGroups.filter(Boolean)
		} catch (error) {
			console.error('Ошибка получения групп моделей:', error)
			return []
		}
	}

	// Получение связанных товаров (той же модельной группы)
	async getRelatedProducts(currentProductLink, limit = 4) {
		try {
			const products = await this.getAllProducts()
			const currentProduct = products.find(p => p.productLink === currentProductLink)

			if (!currentProduct) return []

			return products
				.filter(p =>
					p.modelGroup === currentProduct.modelGroup &&
					p.productLink !== currentProductLink
				)
				.slice(0, limit)
		} catch (error) {
			console.error('Ошибка получения связанных продуктов:', error)
			return []
		}
	}

	// Поиск продуктов по названию
	async searchProducts(query, limit = 20) {
		try {
			const products = await this.getAllProducts()
			const searchQuery = query.toLowerCase()

			return products
				.filter(product =>
					product.model.toLowerCase().includes(searchQuery) ||
					product.modelGroup.toLowerCase().includes(searchQuery)
				)
				.slice(0, limit)
		} catch (error) {
			console.error('Ошибка поиска продуктов:', error)
			return []
		}
	}

	// Получение статистики продуктов
	async getProductsStats() {
		try {
			const products = await this.getAllProducts()

			return {
				total: products.length,
				popular: products.filter(p => p.popular).length,
				withDiscount: products.filter(p => p.discount > 0).length,
				modelGroups: [...new Set(products.map(p => p.modelGroup))].length,
				averagePrice: products.reduce((sum, p) => sum + p.price, 0) / products.length
			}
		} catch (error) {
			console.error('Ошибка получения статистики:', error)
			return {
				total: 0,
				popular: 0,
				withDiscount: 0,
				modelGroups: 0,
				averagePrice: 0
			}
		}
	}
}

// Экспортируем единственный экземпляр
const productService = new ProductService()

export default productService