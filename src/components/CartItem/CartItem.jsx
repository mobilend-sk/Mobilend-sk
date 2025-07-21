"use client"
import { useState } from "react"
import { useCart } from "@/hooks/useCart"
import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, Trash2, ExternalLink } from "lucide-react"
import "./CartItem.scss"

const CartItem = ({ item, product }) => {
	const { updateQuantity, removeItem } = useCart()
	const [isUpdating, setIsUpdating] = useState(false)

	// Расчет цены со скидкой
	const calculateDiscountedPrice = (price, discount) => {
		const numPrice = parseFloat(price) || 0
		const numDiscount = parseFloat(discount) || 0
		return numPrice - (numPrice * numDiscount / 100)
	}

	const price = parseFloat(product.price) || 0
	const discount = parseFloat(product.discount) || 0
	const discountedPrice = calculateDiscountedPrice(price, discount)
	const totalPrice = discountedPrice * item.quantity

	const handleQuantityChange = async (newQuantity) => {
		if (isUpdating) return

		setIsUpdating(true)

		try {
			if (newQuantity <= 0) {
				removeItem(item.productLink)
			} else {
				updateQuantity(item.productLink, newQuantity)
			}
		} catch (error) {
			console.error('Ошибка обновления количества:', error)
		} finally {
			// Небольшая задержка для UX
			setTimeout(() => setIsUpdating(false), 50)
		}
	}

	const handleRemoveItem = () => {
		removeItem(item.productLink)
	}

	return (
		<div className="CartItem">
			{/* Изображение товара */}
			<div className="CartItem__image">
				<Link href={`/katalog/${product.productLink}`}>
					<Image
						src={`/data/gallery/${product.mainImage}` || "/images/placeholder.webp"}
						alt={product.model}
						width={120}
						height={120}
						className="CartItem__img"
					/>
				</Link>
				{discount > 0 && (
					<div className="CartItem__discount-badge">
						-{discount}%
					</div>
				)}
			</div>

			{/* Информация о товаре */}
			<div className="CartItem__info">
				<div className="CartItem__header">
					<Link href={`/katalog/${product.productLink}`} className="CartItem__title">
						{product.model}
						<ExternalLink size={16} />
					</Link>
					<button
						className="CartItem__remove-btn"
						onClick={handleRemoveItem}
						title="Odstrániť z košíka"
					>
						<Trash2 size={18} />
					</button>
				</div>

				<div className="CartItem__details">
					{/* Цена */}
					<div className="CartItem__price">
						<div className="CartItem__price-current">
							{discountedPrice.toFixed(2)} €
						</div>
						{discount > 0 && (
							<div className="CartItem__price-original">
								{price.toFixed(2)} €
							</div>
						)}
					</div>

					{/* Контролы количества */}
					<div className="CartItem__quantity">
						<button
							className="CartItem__quantity-btn"
							onClick={() => handleQuantityChange(item.quantity - 1)}
							disabled={isUpdating || item.quantity <= 1}
							title="Znížiť množstvo"
						>
							<Minus size={16} />
						</button>

						<div className="CartItem__quantity-display">
							{item.quantity}
						</div>

						<button
							className="CartItem__quantity-btn"
							onClick={() => handleQuantityChange(item.quantity + 1)}
							disabled={isUpdating}
							title="Zvýšiť množstvo"
						>
							<Plus size={16} />
						</button>
					</div>

					{/* Общая цена за товар */}
					<div className="CartItem__total">
						<div className="CartItem__total-label">Celkom:</div>
						<div className="CartItem__total-price">
							{totalPrice.toFixed(2)} €
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default CartItem