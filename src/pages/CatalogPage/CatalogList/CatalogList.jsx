'use client';

import { useEffect, useState } from "react"
import { useSearchParams } from 'next/navigation' // Додано
import ProductCard from "@/components/ProductCard/ProductCard"
import productService from "@/services/productClient.service"
import { Filter, X, FilterX } from "lucide-react"
import "./CatalogList.scss"

const PRODUCTS_PER_PAGE = 12
const STORAGE_KEY = "catalog_filters"
const SCROLL_STORAGE_KEY = "catalog_scroll_position"

const CatalogList = ({
  showFilters = true,
  initialSearchTerm = "",
  onSearchChange = null
}) => {
  const searchParams = useSearchParams() // Додано
  const urlSearchTerm = searchParams.get('search') || '' // Додано
  const [productList, setProductList] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState("all")
  const [sortBy, setSortBy] = useState("default")
  // Використовуємо URL параметр якщо він є, інакше initialSearchTerm
  const [searchTerm, setSearchTerm] = useState(urlSearchTerm || initialSearchTerm)

  // Загрузка фільтрів із localStorage
  const loadFiltersFromStorage = () => {
    try {
      const savedFilters = localStorage.getItem(STORAGE_KEY)
      if (savedFilters) {
        const { selectedModel: savedModel, sortBy: savedSort, visibleCount: savedCount, searchTerm: savedSearch } = JSON.parse(savedFilters)
        setSelectedModel(savedModel || "all")
        setSortBy(savedSort || "default")
        setVisibleCount(savedCount || PRODUCTS_PER_PAGE)
        // Використовуємо initialSearchTerm якщо він переданий, інакше збережений
        if (!initialSearchTerm) {
          setSearchTerm(savedSearch || "")
        }
      }
    } catch (error) {
      console.error("Помилка завантаження фільтрів:", error)
    }
  }

  // Збереження фільтрів у localStorage
  const saveFiltersToStorage = (model, sort, count, search) => {
    try {
      const filters = {
        selectedModel: model,
        sortBy: sort,
        visibleCount: count,
        searchTerm: search
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
    } catch (error) {
      console.error("Помилка збереження фільтрів:", error)
    }
  }

  // Збереження позиції скролла при уході зі сторінки
  const saveScrollPosition = () => {
    try {
      const scrollPosition = window.scrollY
      localStorage.setItem(SCROLL_STORAGE_KEY, scrollPosition.toString())
    } catch (error) {
      console.error("Помилка збереження позиції скролла:", error)
    }
  }

  // Відновлення позиції скролла
  const restoreScrollPosition = () => {
    try {
      const savedPosition = localStorage.getItem(SCROLL_STORAGE_KEY)
      if (savedPosition) {
        const scrollY = parseInt(savedPosition, 10)
        setTimeout(() => {
          window.scrollTo({ top: scrollY, behavior: "auto" })
          localStorage.removeItem(SCROLL_STORAGE_KEY)
        }, 100)
      }
    } catch (error) {
      console.error("Помилка відновлення позиції скролла:", error)
    }
  }

  // Оновлення пошукового терміна ззовні
  useEffect(() => {
    setSearchTerm(initialSearchTerm)
  }, [initialSearchTerm])

  // Повідомлення батьківського компонента про зміну пошукового запита
  useEffect(() => {
    if (onSearchChange) {
      onSearchChange(searchTerm)
    }
  }, [searchTerm, onSearchChange])

  // Оновлення пошукового терміна з URL
  useEffect(() => {
    if (urlSearchTerm) {
      setSearchTerm(urlSearchTerm)
    } else if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm)
    }
  }, [urlSearchTerm, initialSearchTerm])

  // Завантаження фільтрів при монтуванні компонента
  useEffect(() => {
    loadFiltersFromStorage()
  }, [])

  // Завантаження всіх продуктів
  useEffect(() => {
    loadProducts()
  }, [])

  // Застосування фільтрів при завантаженні продуктів або зміненні фільтрів
  useEffect(() => {
    if (productList.length > 0) {
      applyFilters()
    }
  }, [productList, selectedModel, sortBy, searchTerm])

  // Відновлення позиції скролла після завантаження даних
  useEffect(() => {
    if (filteredProducts.length > 0 && !loading) {
      restoreScrollPosition()
    }
  }, [filteredProducts, loading])

  // Збереження фільтрів при їх зміненні (тільки якщо не передано initialSearchTerm)
  useEffect(() => {
    if (!initialSearchTerm) {
      saveFiltersToStorage(selectedModel, sortBy, visibleCount, searchTerm)
    } else {
      // Зберігаємо без searchTerm якщо він керується ззовні
      saveFiltersToStorage(selectedModel, sortBy, visibleCount, "")
    }
  }, [selectedModel, sortBy, visibleCount, searchTerm, initialSearchTerm])

  // Збереження позиції скролла перед уходом зі сторінки
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveScrollPosition()
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [])

  // Підвантаження при прокрутці
  useEffect(() => {
    const handleScroll = () => {
      const bottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 400
      if (bottom && visibleCount < filteredProducts.length) {
        setVisibleCount((prev) => prev + PRODUCTS_PER_PAGE)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [visibleCount, filteredProducts.length])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const products = await productService.getAllProducts()
      setProductList(products)
      setError(null)
    } catch (error) {
      console.error("Помилка завантаження продуктів:", error)
      setError("Помилка завантаження продуктів")
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {   // GET 
    let filtered = [...productList]

    // Фільтр по моделі
    if (selectedModel !== "all") {
      filtered = filtered.filter((product) => product.modelGroup === selectedModel)
    }

    // Фільтр по пошуковому запиту
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchLower) ||
        product.model?.toLowerCase().includes(searchLower) ||
        product.modelGroup?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower)
      )
    }

    // Сортування
    switch (sortBy) {
      case "priceAsc":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "priceDesc":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "nameAsc":
        filtered.sort((a, b) => a.model.localeCompare(b.model))
        break
      case "nameDesc":
        filtered.sort((a, b) => b.model.localeCompare(a.model))
        break
      case "discount":
        filtered = filtered
          .filter(product => product.discount > 0)
          .sort((a, b) => b.discount - a.discount)
        break
      default:
        // За замовчуванням - популярні спочатку
        filtered = filtered.sort((a, b) => {
          if (a.popular && !b.popular) return -1
          if (!a.popular && b.popular) return 1
          return 0
        })
        break
    }

    setFilteredProducts(filtered)
    setVisibleCount(PRODUCTS_PER_PAGE)
    setIsFilterOpen(false)
  }

  const getUniqueModels = () => {
    const models = [...new Set(productList.map((p) => p.modelGroup))]
    return models.filter((m) => m)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (selectedModel !== "all") count++
    if (sortBy !== "default") count++
    if (searchTerm.trim()) count++
    return count
  }

  const resetFilters = () => {
    setSelectedModel("all")
    setSortBy("default")
    setSearchTerm("")
    setVisibleCount(PRODUCTS_PER_PAGE)
    setIsFilterOpen(false)

    // Очистка localStorage при скиданні
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(SCROLL_STORAGE_KEY)

    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen)
  }

  const handleModelChange = (e) => {
    const newModel = e.target.value
    setSelectedModel(newModel)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSortChange = (e) => {
    const newSort = e.target.value
    setSortBy(newSort)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const FilterContent = () => (
    <div className="CatalogList__filters-content">
      <div className="CatalogList__filters-header">
        <h3>Filtre:</h3>
        <button className="CatalogList__close-btn" onClick={() => setIsFilterOpen(false)}>
          <X size={20} />
        </button>
      </div>

      {/* Фільтр по моделі */}
      <div className="CatalogList__filter">
        <label>Model:</label>
        <select value={selectedModel} onChange={handleModelChange}>
          <option value="all">Všetky modely</option>
          {getUniqueModels().map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>

      {/* Сортування */}
      <div className="CatalogList__filter">
        <label>Triedenie:</label>
        <select value={sortBy} onChange={handleSortChange}>
          <option value="default">Predvolené</option>
          <option value="priceAsc">Cena: najlacnejšie najprv</option>
          <option value="priceDesc">Cena: najdrahšie najprv</option>
          <option value="nameAsc">Názov: A–Z</option>
          <option value="nameDesc">Názov: Z–A</option>
          <option value="discount">So zľavou</option>
        </select>
      </div>

      <div className="CatalogList__filter-buttons">
        <button className="CatalogList__reset-btn" onClick={resetFilters} title="Zrušiť filtre">
          <FilterX size={20} />
        </button>
        <button className="CatalogList__apply-btn" onClick={applyFilters}>
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

        {showFilters && (
          <div className="CatalogList__sticky-controls">
            <div className="CatalogList__sticky-controls--box">
              <div className="CatalogList__sticky-controls--header">
                <h1 className="title-h1 title-h1--mobile">Katalóg tovaru</h1>
                <div className="CatalogList__results-count">
                  Nájdené: {filteredProducts.length} produktov
                </div>
              </div>
              <button className="CatalogList__filter-btn" onClick={toggleFilter}>
                <Filter size={20} />
                Filter
                {getActiveFiltersCount() > 0 && (
                  <span className="filter-badge">{getActiveFiltersCount()}</span>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="CatalogList__content">
          {showFilters && (
            <div className="CatalogList__filters CatalogList__filters--desktop">
              <FilterContent />
            </div>
          )}

          <div className="CatalogList__products">
            {filteredProducts.length === 0 ? (
              <div className="CatalogList__empty">
                <p>
                  {searchTerm.trim()
                    ? `Produkty pre "${searchTerm}" nenájdené`
                    : "Produkty nenájdené"
                  }
                </p>
                {showFilters && (
                  <button onClick={resetFilters}>Resetovať filtre</button>
                )}
              </div>
            ) : (
              <div className="CatalogList__grid">
                {filteredProducts.slice(0, visibleCount).map((product, index) => (
                  <ProductCard key={`${product.productLink}-${index}`} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>

        {showFilters && isFilterOpen && (
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