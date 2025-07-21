"use client"
import { useEffect, useState } from "react"
import ProductCard from "@/components/ProductCard/ProductCard"
import productService from "@/services/product.service"
import { Filter, X, FilterX } from "lucide-react"
import "./CatalogList.scss"

const CatalogList = () => {
	const [productList, setProductList] = useState([])
	const [filteredProducts, setFilteredProducts] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [isFilterOpen, setIsFilterOpen] = useState(false)

	// Фильтры
	const [selectedModel, setSelectedModel] = useState('all')
	const [sortBy, setSortBy] = useState('default')

	// Загрузка всех продуктов
	useEffect(() => {
		loadProducts()
	}, [])

	// Применение фильтров только при загрузке продуктов (без фильтров)
	useEffect(() => {
		if (productList.length > 0) {
			setFilteredProducts(productList)
		}
	}, [productList])

	const loadProducts = async () => {
		try {
			setLoading(true)
			const products = await productService.getAllProducts()
			setProductList(products)
			setError(null)
		} catch (error) {
			console.error('Ошибка загрузки продуктов:', error)
			setError('Ошибка загрузки продуктов')
		} finally {
			setLoading(false)
		}
	}

	const applyFilters = () => {
		let filtered = [...productList]

		// Фильтр по модели
		if (selectedModel !== 'all') {
			filtered = filtered.filter(product => product.modelGroup === selectedModel)
		}

		// Сортировка
		switch (sortBy) {
			case 'priceAsc':
				filtered.sort((a, b) => a.price - b.price)
				break
			case 'priceDesc':
				filtered.sort((a, b) => b.price - a.price)
				break
			case 'nameAsc':
				filtered.sort((a, b) => a.model.localeCompare(b.model))
				break
			case 'nameDesc':
				filtered.sort((a, b) => b.model.localeCompare(a.model))
				break
			case 'discount':
				filtered.sort((a, b) => b.discount - a.discount)
				break
			default:
				// Сортировка по умолчанию - сначала популярные
				filtered.sort((a, b) => {
					if (a.popular && !b.popular) return -1
					if (!a.popular && b.popular) return 1
					return 0
				})
		}

		setFilteredProducts(filtered)
	}

	// Получение уникальных моделей
	const getUniqueModels = () => {
		const models = [...new Set(productList.map(product => product.modelGroup))]
		return models.filter(model => model) // Убираем пустые значения
	}

	const resetFilters = () => {
		setSelectedModel('all')
		setSortBy('default')
		setFilteredProducts(productList) // Сразу применяем сброс
	}

	const toggleFilter = () => {
		setIsFilterOpen(!isFilterOpen)
	}

	const FilterContent = () => (
		<div className="CatalogList__filters-content">
			<div className="CatalogList__filters-header">
				<h3>Filtre:</h3>
				<button
					className="CatalogList__close-btn"
					onClick={() => setIsFilterOpen(false)}
				>
					<X size={20} />
				</button>
			</div>

			{/* Фильтр по модели */}
			<div className="CatalogList__filter">
				<label>Model:</label>
				<select
					value={selectedModel}
					onChange={(e) => setSelectedModel(e.target.value)}
				>
					<option value="all">Všetky modely</option>
					{getUniqueModels().map(model => (
						<option key={model} value={model}>{model}</option>
					))}
				</select>
			</div>

			{/* Сортировка */}
			<div className="CatalogList__filter">
				<label>Triedenie:</label>
				<select
					value={sortBy}
					onChange={(e) => setSortBy(e.target.value)}
				>
					<option value="default">Predvolené</option>
					<option value="priceAsc">Cena: najlacnejšie najprv</option>
					<option value="priceDesc">Cena: najdrahšie najprv</option>
					<option value="nameAsc">Názov: A–Z</option>
					<option value="nameDesc">Názov: Z–A</option>
					<option value="discount">So zľavou</option>
				</select>
			</div>

			{/* Кнопки фильтров */}
			<div className="CatalogList__filter-buttons">
				<button
					className="CatalogList__reset-btn"
					onClick={resetFilters}
					title="Zrušiť filtre"
				>
					<FilterX size={20} />
				</button>
				<button
					className="CatalogList__apply-btn"
					onClick={applyFilters}
				>
					Aplikovať filtre
				</button>
			</div>
		</div>
	)

	if (loading) {
		return <div className="CatalogList__loading">Načítavajú sa produkty...</div>
	}

	if (error) {
		return <div className="CatalogList__error">{error}</div>
	}

	return (
		<div className="CatalogList">
			<div className="container">
				<div className="CatalogList__header">
					<h1 className="title-h1 title-h1--desktop">Katalóg tovaru</h1>
					<div className="CatalogList__header-right CatalogList__header-right--desktop">
						<div className="CatalogList__results-count">
							Nájdené: {filteredProducts.length} produktov
						</div>
					</div>
				</div>

				<div className="CatalogList__sticky-controls">

					<div className="CatalogList__sticky-controls--box">
						<div className="CatalogList__sticky-controls--header">
							<h1 className="title-h1 title-h1--mobile">Katalóg tovaru</h1>
							<div className="CatalogList__results-count">
								Nájdené: {filteredProducts.length} produktov
							</div>
						</div>
						<button
							className="CatalogList__filter-btn"
							onClick={toggleFilter}
						>
							<Filter size={20} />
							Filter
						</button>
					</div>
				</div>

				<div className="CatalogList__content">
					{/* Фильтры слева на десктопе */}
					<div className="CatalogList__filters CatalogList__filters--desktop">
						<FilterContent />
					</div>

					{/* Список продуктов */}
					<div className="CatalogList__products">
						{filteredProducts.length === 0 ? (
							<div className="CatalogList__empty">
								<p>Produkty nenájdené</p>
								<button onClick={resetFilters}>Resetovať filtre</button>
							</div>
						) : (
							<div className="CatalogList__grid">
								{filteredProducts.map((product, index) => (
									<ProductCard key={`${product.productLink}-${index}`} product={product} />
								))}
							</div>
						)}
					</div>
				</div>

				{/* Модалка фильтров для мобильных */}
				{isFilterOpen && (
					<div className="CatalogList__modal-overlay" onClick={() => setIsFilterOpen(false)}>
						<div className="CatalogList__modal" onClick={(e) => e.stopPropagation()}>
							<FilterContent />
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default CatalogList