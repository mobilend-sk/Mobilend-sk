"use client"
import { useEffect, useState } from "react"
import { useCart } from "@/hooks/useCart"
import productService from "@/services/product.service"
import CartItem from "@/components/CartItem/CartItem"
import Link from "next/link"
import { ShoppingBag, ArrowLeft } from "lucide-react"
import "./CartPage.scss"

const CartPage = () => {
	const { items, totalItems, clearCart } = useCart()
	const [productList, setProductList] = useState([])
	const [loading, setLoading] = useState(true)
	const [cartItemsWithProducts, setCartItemsWithProducts] = useState([])

	// Загрузка всех продуктов
	useEffect(() => {
		const loadProducts = async () => {
			try {
				setLoading(true)
				const products = await productService.getAllProducts()
				setProductList(products)
			} catch (error) {
				console.error('Ошибка загрузки продуктов:', error)
			} finally {
				setLoading(false)
			}
		}

		loadProducts()
	}, [])

	// Получение товаров корзины с полными данными
	useEffect(() => {
		if (productList.length > 0 && items.length > 0) {
			const cartItems = items.map(item => {
				const product = productList.find(p => p.productLink === item.productLink)
				return {
					...item,
					product: product || null
				}
			}).filter(item => item.product !== null)

			setCartItemsWithProducts(cartItems)
		} else {
			setCartItemsWithProducts([])
		}
	}, [items, productList])

	// Расчет общей суммы
	const calculateTotalPrice = () => {
		return cartItemsWithProducts.reduce((total, item) => {
			const price = parseFloat(item.product.price) || 0
			const discount = parseFloat(item.product.discount) || 0
			const discountedPrice = price - (price * discount / 100)
			return total + (discountedPrice * item.quantity)
		}, 0)
	}

	if (loading) {
		return (
			<main className="CartPage">
				<div className="container">
					<div className="CartPage__loading">
						<ShoppingBag size={48} />
						<p>Načítava sa košík...</p>
					</div>
				</div>
			</main>
		)
	}

	return (
		<main className="CartPage">
			<div className="container">
				{/* Хлебные крошки */}
				<div className="CartPage__breadcrumbs">
					<Link href="/" className="CartPage__breadcrumb">
						<ArrowLeft size={16} />
						Hlavná
					</Link>
					<span className="CartPage__breadcrumb-separator">/</span>
					<span className="CartPage__breadcrumb CartPage__breadcrumb--current">
						Košík
					</span>
				</div>

				{/* Заголовок */}
				<div className="CartPage__header">
					<h1 className="CartPage__title">
						<ShoppingBag size={32} />
						Váš košík
					</h1>
					{totalItems > 0 && (
						<p className="CartPage__subtitle">
							{totalItems} {totalItems === 1 ? 'produkt' : totalItems < 5 ? 'produkty' : 'produktov'}
						</p>
					)}
				</div>

				{/* Содержимое корзины */}
				{cartItemsWithProducts.length === 0 ? (
					// Пустая корзина
					<div className="CartPage__empty">
						<div className="CartPage__empty-icon">
							<ShoppingBag size={64} />
						</div>
						<h2>Váš košík je prázdny</h2>
						<p>Pridajte produkty do košíka a vráťte sa sem na objednávku</p>
						<Link href="/katalog" className="CartPage__empty-button">
							Prejsť na katalóg
						</Link>
					</div>
				) : (
					// Товары в корзине
					<div className="CartPage__content">
						{/* Список товаров */}
						<div className="CartPage__items">
							{cartItemsWithProducts.map((item) => (
								<CartItem
									key={item.productLink}
									item={item}
									product={item.product}
								/>
							))}
						</div>

						{/* Итоговая информация */}
						<div className="CartPage__summary">
							<div className="CartPage__summary-card">
								<h3>Súhrn objednávky</h3>

								<div className="CartPage__summary-row">
									<span>Produkty ({totalItems})</span>
									<span>{calculateTotalPrice().toFixed(2)} €</span>
								</div>

								<div className="CartPage__summary-row">
									<span>Doprava</span>
									<span>Zdarma</span>
								</div>

								<div className="CartPage__summary-divider"></div>

								<div className="CartPage__summary-row CartPage__summary-total">
									<span>Celkom</span>
									<span>{calculateTotalPrice().toFixed(2)} €</span>
								</div>

								<div className="CartPage__summary-actions">
									<Link
										href="/potvrdenie-o-kupe"
										className="CartPage__checkout-btn"
									>
										Pokračovať na pokladňu
									</Link>
									<button
										className="CartPage__clear-btn"
										onClick={clearCart}
									>
										Vyčistiť košík
									</button>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</main>
	)
}

export default CartPage