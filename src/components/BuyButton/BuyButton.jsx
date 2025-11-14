"use client"
import { Plus, ShoppingCart, Check } from "lucide-react"
import { useCart, useCartItemQuantity } from "@/hooks/useCart"
import cartService from "@/services/cart.service"
import { useRouter } from "next/navigation"
import "./BuyButton.scss"

const BuyButton = ({ type = "small", productLink, product }) => {
	const { addItem, updateQuantity, removeItem, syncCart } = useCart()
	const quantity = useCartItemQuantity(productLink)
	const isInCart = quantity > 0
	const router = useRouter()

	// ДОБАВИТЬ В КОРЗИНУ
	const handleAddToCart = async (e) => {
		e.preventDefault()
		e.stopPropagation()

		if (!productLink) return

		// 🔥 1. мгновенно обновляем локальный стейт (для анимации)
		addItem(productLink)

		// 🔥 2. backend в фоне
		try {
			const res = await cartService.add(productLink, 1)
			if (res?.success && res.cart?.items) {
				syncCart(res.cart.items)
			}
		} catch (err) {
			console.error("server error", err)
		}
	}

	// ИЗМЕНЕНИЕ КОЛИЧЕСТВА (если будешь использовать на большой кнопке)
	const handleQuantityChange = async (e, action) => {
		e.preventDefault()
		e.stopPropagation()

		let newQty = quantity
		if (action === "increase") newQty = quantity + 1
		else if (action === "decrease") newQty = quantity - 1

		updateQuantity(productLink, newQty)

		try {
			const res = await cartService.update(productLink, newQty)
			if (res?.success && res.cart?.items) {
				syncCart(res.cart.items)
			}
		} catch (err) {
			console.error("update error", err)
		}
	}

	// 👉 ДЛЯ МАЛЕНЬКОЙ КНОПКИ — ВСЕГДА ОДИН И ТОТ ЖЕ <button>
	if (type === "small") {
		const handleClick = isInCart
			? (e) => {
				e.preventDefault()
				e.stopPropagation()
				router.push("/cart")
			}
			: handleAddToCart

		return (
			<button
				className={`BuyButton BuyButton--small ${isInCart ? "BuyButton--in-cart" : ""
					}`}
				onClick={handleClick}
				title={isInCart ? "Prejsť do košíka" : "Pridať do košíka"}
			>
				{isInCart ? <Check size={16} /> : <Plus />}
			</button>
		)
	}

	// 👉 ДЛЯ БОЛЬШОЙ КНОПКИ — ТО ЖЕ САМОЕ: один <button>
	if (type === "full") {
		const handleClick = isInCart
			? (e) => {
				e.preventDefault()
				e.stopPropagation()
				router.push("/cart")
			}
			: handleAddToCart

		return (
			<button
				className={`BuyButton BuyButton--full ${isInCart ? "BuyButton--in-cart" : ""
					}`}
				onClick={handleClick}
			>
				{isInCart ? (
					<>
						<Check size={20} />
						V košíku ({quantity})
					</>
				) : (
					<>
						<ShoppingCart size={20} />
						Do košíka
					</>
				)}
			</button>
		)
	}

	// fallback
	return (
		<button
			className={`BuyButton BuyButton--small ${isInCart ? "BuyButton--in-cart" : ""}`}
			onClick={isInCart ? () => router.push("/cart") : handleAddToCart}
		>
			{isInCart ? <Check size={16} /> : <Plus />}
		</button>
	)
}

export default BuyButton
