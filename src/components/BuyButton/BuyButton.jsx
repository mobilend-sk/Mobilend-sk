"use client"
import { Plus, ShoppingCart, Check } from "lucide-react"
import { useCart, useCartItemQuantity } from "@/hooks/useCart"
import Link from "next/link"
import "./BuyButton.scss"

const BuyButton = ({ type = "small", productLink, product }) => {
	const { addItem, updateQuantity, removeItem } = useCart()
	const quantity = useCartItemQuantity(productLink)
	const isInCart = quantity > 0

	const handleAddToCart = (e) => {
		e.preventDefault()
		e.stopPropagation()

		if (!productLink) {
			console.error('ProductLink is required for BuyButton')
			return
		}

		addItem(productLink)
	}

	const handleQuantityChange = (e, action) => {
		e.preventDefault()
		e.stopPropagation()

		if (action === 'increase') {
			updateQuantity(productLink, quantity + 1)
		} else if (action === 'decrease') {
			if (quantity > 1) {
				updateQuantity(productLink, quantity - 1)
			} else {
				removeItem(productLink)
			}
		}
	}

	// Для маленькой кнопки (на карточках)
	if (type === "small") {
		if (!isInCart) {
			return (
				<button
					className="BuyButton BuyButton--small"
					onClick={handleAddToCart}
					title="Pridať do košíka"
				>
					<Plus />
				</button>
			)
		} else {
			return (
				<Link href="/cart" className="BuyButton BuyButton--small BuyButton--in-cart">
					<Check size={16} />
				</Link>
			)
		}
	}

	// Для большой кнопки (на странице товара)
	if (type === "full") {
		if (!isInCart) {
			return (
				<button
					className="BuyButton BuyButton--full"
					onClick={handleAddToCart}
				>
					<ShoppingCart size={20} />
					Do košíka
				</button>
			)
		} else {
			return (
				<Link
					href="/cart"
					className="BuyButton BuyButton--full BuyButton--in-cart"
				>
					<Check size={20} />
					V košíku ({quantity})
				</Link>
			)
		}
	}

	// Fallback для неизвестного типа
	return (
		<button
			className="BuyButton BuyButton--small"
			onClick={handleAddToCart}
		>
			<Plus />
		</button>
	)
}

export default BuyButton