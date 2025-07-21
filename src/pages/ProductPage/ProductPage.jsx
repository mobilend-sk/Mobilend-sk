// src/pages/ProductPage/ProductPage.jsx
// Обновленный компонент для работы с SSG (данные уже предзагружены)

"use client"
import { useEffect, useState } from "react"
import productService from "@/services/productClient.service"
import MainProductInfo from "./MainProductInfo/MainProductInfo"
import AllProductInfo from "./AllProductInfo/AllProductInfo"
import Sliders from "@/components/Sliders/Sliders"
import "./ProductPage.scss"

const ProductPage = ({ product: initialProduct, productLink }) => {
	// Если данные переданы с сервера (SSG) - используем их сразу
	// Если нет - загружаем на клиенте (fallback)
	const [product, setProduct] = useState(initialProduct || null)
	const [loading, setLoading] = useState(!initialProduct)
	const [error, setError] = useState(null)

	useEffect(() => {
		// Если данные уже есть - ничего не делаем
		if (initialProduct) {
			return
		}

		// Иначе загружаем на клиенте (fallback для development)
		loadProduct()
	}, [productLink, initialProduct])

	const loadProduct = async () => {
		try {
			setLoading(true)
			setError(null)

			// Получаем продукт по ссылке (клиентский fallback)
			const productData = await productService.getProductInfo(productLink)

			if (!productData) {
				setError('Produkt sa nenašiel')
				return
			}

			setProduct(productData)
		} catch (err) {
			console.error('Chyba načítania produktu:', err)
			setError('Chyba načítania produktu')
		} finally {
			setLoading(false)
		}
	}

	// Loading состояние
	if (loading) {
		return (
			<div className="ProductPage">
				<div className="container">
					<div className="ProductPage__loading">
						<div className="spinner"></div>
						<p>Načítava sa produkt...</p>
					</div>
				</div>
			</div>
		)
	}

	// Error состояние
	if (error) {
		return (
			<div className="ProductPage">
				<div className="container">
					<div className="ProductPage__error">
						<h2>Chyba</h2>
						<p>{error}</p>
						<button onClick={loadProduct} className="retry-btn">
							Skúsiť znova
						</button>
					</div>
				</div>
			</div>
		)
	}

	// Продукт не найден
	if (!product) {
		return (
			<div className="ProductPage">
				<div className="container">
					<div className="ProductPage__not-found">
						<h2>Produkt sa nenašiel</h2>
						<p>Možno je odkaz nesprávny alebo bol produkt odstránený</p>
						<button
							onClick={() => window.location.href = '/katalog'}
							className="catalog-btn"
						>
							Prejsť do katalógu
						</button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<main className="ProductPage">
			{/* Основная информация о продукте */}
			<MainProductInfo product={product} />

			{/* Подробная информация о продукте */}
			<AllProductInfo product={product} />

			{/* Слайдеры с рекомендуемыми товарами */}
			<Sliders type={"discount"} />
		</main>
	)
}

export default ProductPage