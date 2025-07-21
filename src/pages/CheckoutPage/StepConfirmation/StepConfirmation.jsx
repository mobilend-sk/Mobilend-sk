"use client"
import { useState } from "react"
import { useCart } from "@/hooks/useCart"
import { ArrowLeft, ShoppingBag, User, MapPin, CreditCard, Check, Loader2 } from "lucide-react"
import telegramService from "@/services/telegram.service"
import "./StepConfirmation.scss"

const StepConfirmation = ({ contactData, deliveryData, cartItems, onBack, onOrderComplete }) => {
	const { totalItems, clearCart } = useCart()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isOrderComplete, setIsOrderComplete] = useState(false)
	const [orderNumber, setOrderNumber] = useState(null)

	// Функция расчета цены со скидкой
	const calculateDiscountedPrice = (price, discount) => {
		const numPrice = parseFloat(price) || 0
		const numDiscount = parseFloat(discount) || 0
		return numPrice - (numPrice * numDiscount / 100)
	}

	// Расчет общей суммы корзины
	const calculateTotal = () => {
		return cartItems.reduce((total, item) => {
			const price = parseFloat(item.product?.price) || 0
			const discount = parseFloat(item.product?.discount) || 0
			const discountedPrice = discount > 0 ? calculateDiscountedPrice(price, discount) : price
			return total + (discountedPrice * item.quantity)
		}, 0)
	}

	// Получение названия способа оплаты
	const getPaymentMethodLabel = (method) => {
		const methods = {
			cash_on_delivery: 'Dobierka (platba pri prevzatí)',
			credit: 'Kúpa na splátky',
			online_payment: 'Online platba kartou'
		}
		return methods[method] || method
	}

	// Генерация номера заказа
	const generateOrderNumber = () => {
		const timestamp = Date.now().toString().slice(-6)
		const random = Math.random().toString(36).substr(2, 3).toUpperCase()
		return `MBL${timestamp}${random}`
	}

	// Обработка подтверждения заказа
	const handleConfirmOrder = async () => {
		setIsSubmitting(true)

		try {
			const newOrderNumber = generateOrderNumber()

			const orderData = {
				orderNumber: newOrderNumber,
				contact: contactData,
				delivery: deliveryData,
				items: cartItems,
				total: calculateTotal(),
				totalItems: totalItems,
				timestamp: new Date().toISOString()
			}

			// Отправляем заказ в Telegram
			await telegramService.sendOrderToTelegram(orderData)

			// Устанавливаем состояние завершенного заказа
			setOrderNumber(newOrderNumber)
			setIsOrderComplete(true)

			// Уведомляем родительский компонент о завершении заказа
			onOrderComplete?.()

			// Очищаем корзину
			clearCart()

			// Прокрутка вверх
			window.scrollTo({
				top: 0,
				behavior: 'smooth'
			})

		} catch (error) {
			console.error('Chyba pri spracovaní objednávky:', error)
			alert('Nastala chyba pri odoslaní objednávky. Skúste to znovu.')
		} finally {
			setIsSubmitting(false)
		}
	}

	// Если заказ завершен, показываем успешное сообщение
	if (isOrderComplete) {
		return (
			<div className="StepConfirmation">
				<div className="StepConfirmation__success">
					<div className="StepConfirmation__success-icon">
						<Check size={48} />
					</div>
					<h2 className="StepConfirmation__success-title">
						Objednávka bola úspešne odoslaná!
					</h2>
					<p className="StepConfirmation__success-subtitle">
						Číslo objednávky: <strong>{orderNumber}</strong>
					</p>
					<p className="StepConfirmation__success-text">
						Ďakujeme za Vašu objednávku. Čoskoro Vás budeme kontaktovať na telefónnom čísle{' '}
						<strong>{contactData.phone}</strong> ohľadom potvrdenia a doručenia.
					</p>
					<button
						className="StepConfirmation__success-btn"
						onClick={() => window.location.href = '/'}
					>
						Pokračovať na hlavnú stránku
					</button>
				</div>
			</div>
		)
	}

	return (
		<div className="StepConfirmation">
			<div className="StepConfirmation__header">
				<h2 className="StepConfirmation__title">Potvrdenie objednávky</h2>
				<p className="StepConfirmation__subtitle">
					Skontrolujte údaje pred potvrdením objednávky
				</p>
			</div>

			<div className="StepConfirmation__content">
				{/* Súhrn objednávky */}
				<div className="StepConfirmation__section">
					<h3 className="StepConfirmation__section-title">
						<ShoppingBag size={20} />
						Objednané produkty ({totalItems})
					</h3>

					<div className="StepConfirmation__items">
						{cartItems.map((item, index) => {
							const price = parseFloat(item.product?.price) || 0
							const discount = parseFloat(item.product?.discount) || 0
							const discountedPrice = discount > 0 ? calculateDiscountedPrice(price, discount) : price
							const totalPrice = discountedPrice * item.quantity

							return (
								<div key={index} className="StepConfirmation__item">
									<div className="StepConfirmation__item-info">
										<span className="StepConfirmation__item-name">
											{item.product?.model || 'Neznámy produkt'}
										</span>
										<span className="StepConfirmation__item-quantity">
											{item.quantity}x
										</span>
									</div>
									<div className="StepConfirmation__item-prices">
										{discount > 0 && (
											<span className="StepConfirmation__item-original">
												€{price.toFixed(2)}
											</span>
										)}
										<span className="StepConfirmation__item-price">
											€{totalPrice.toFixed(2)}
										</span>
									</div>
								</div>
							)
						})}
					</div>

					<div className="StepConfirmation__total">
						<span className="StepConfirmation__total-label">Celková suma:</span>
						<span className="StepConfirmation__total-price">€{calculateTotal().toFixed(2)}</span>
					</div>
				</div>

				{/* Kontaktné údaje */}
				<div className="StepConfirmation__section">
					<h3 className="StepConfirmation__section-title">
						<User size={20} />
						Kontaktné údaje
					</h3>
					<p className="StepConfirmation__info">
						{contactData.firstName} {contactData.lastName}, {contactData.phone}, {contactData.email}
						{contactData.comment && (
							<span className="StepConfirmation__comment">
								<br />Poznámka: {contactData.comment}
							</span>
						)}
					</p>
				</div>

				{/* Doručenie a platba */}
				<div className="StepConfirmation__section">
					<h3 className="StepConfirmation__section-title">
						<MapPin size={20} />
						Doručenie a platba
					</h3>
					<p className="StepConfirmation__info">
						<strong>Adresa:</strong> {deliveryData.address}, {deliveryData.postalCode} {deliveryData.city}
						<br />
						<strong>Platba:</strong> {getPaymentMethodLabel(deliveryData.paymentMethod)}
					</p>
				</div>
			</div>

			{/* Tlačidlá */}
			<div className="StepConfirmation__actions">
				<button
					type="button"
					className="StepConfirmation__back-btn"
					onClick={() => {
						// Прокрутка вверх при возврате назад
						window.scrollTo({
							top: 0,
							behavior: 'smooth'
						})
						setTimeout(() => {
							onBack()
						}, 300)
					}}
					disabled={isSubmitting}
				>
					<ArrowLeft size={18} />
					Späť
				</button>

				<button
					type="button"
					className="StepConfirmation__confirm-btn"
					onClick={handleConfirmOrder}
					disabled={isSubmitting}
				>
					{isSubmitting ? (
						<>
							<Loader2 size={18} className="spinning" />
							Spracováva sa...
						</>
					) : (
						<>
							<Check size={18} />
							Potvrdiť objednávku
						</>
					)}
				</button>
			</div>
		</div>
	)
}

export default StepConfirmation