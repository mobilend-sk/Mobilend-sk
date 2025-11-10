"use client"
import { useState, useEffect } from "react"
import { useCart } from "@/hooks/useCart"
import {
	ArrowLeft,
	ShoppingBag,
	User,
	MapPin,
	CreditCard,
	Check,
	Loader2
} from "lucide-react"
import "./StepConfirmation.scss"

const StepConfirmation = ({
	contactData = {},
	deliveryData = {},
	cartItems = [],
	onBack = () => { },
	onOrderComplete = () => { }
}) => {
	const { totalItems = 0, clearCart = () => { } } = useCart()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isOrderComplete, setIsOrderComplete] = useState(false)
	const [orderNumber, setOrderNumber] = useState(null)
	const [isCheckingPayment, setIsCheckingPayment] = useState(false)

	// Перевірка статусу платежу при поверненні користувача
	useEffect(() => {
		let retryCount = 0
		const maxRetries = 10 // Максимум 10 спроб (50 секунд)

		const checkPaymentStatus = async () => {
			const pendingOrderId = localStorage.getItem('pendingOrderId')
			const pendingOrderNumber = localStorage.getItem('pendingOrderNumber')

			// Перевірити чи є URL параметри від платіжної системи
			const urlParams = new URLSearchParams(window.location.search)
			const paymentId = urlParams.get('paymentId')
			const paymentMethod = urlParams.get('paymentMethod')

			if (!paymentId) {
				return
			}

			console.log('🔍 Перевірка статусу платежу...')
			console.log('pendingOrderId:', pendingOrderId)
			console.log('pendingOrderNumber:', pendingOrderNumber)
			console.log('paymentId з URL:', paymentId)
			console.log('paymentMethod з URL:', paymentMethod)

			setIsCheckingPayment(true)

			try {
				// перевірка - робимо запит прямо до TatraPay Plus API
				console.log('📡 Запит до API...')

				const response = await fetch(`http://localhost:5000/api/offer/${paymentId}/status`)
				const result = await response.json()

				console.log('📦 Відповідь від сервера:', result)

				if (!result.success) {
					throw new Error(result.message || 'Chyba pri kontrole platby')
				}

				// Перевірити статус з відповіді
				const paymentStatus = result.data?.status?.status // "OK", "FAIL", "INIT"
				const authStatus = result.data?.authorizationStatus // "AUTH_DONE", "AUTH_PENDING"

				console.log('💳 Payment Status:', paymentStatus)
				console.log('🔐 Auth Status:', authStatus)

				if (paymentStatus === 'OK' && authStatus === 'AUTH_DONE') {
					// ✅ Платіж успішний
					console.log('✅ Платіж успішний!')
					setOrderNumber(pendingOrderNumber)
					setIsOrderComplete(true)
					onOrderComplete()
					clearCart()

					// Очистити localStorage
					localStorage.removeItem('pendingOrderId')
					localStorage.removeItem('pendingOrderNumber')

					// Очистити URL параметри
					window.history.replaceState({}, document.title, window.location.pathname)

					window.scrollTo({ top: 0, behavior: "smooth" })
					setIsCheckingPayment(false)

				} else if (paymentStatus === 'INIT' || authStatus === 'AUTH_PENDING') {
					// ⏳ Платіж ще обробляється
					retryCount++
					console.log(`⏳ Платіж обробляється... Спроба ${retryCount}/${maxRetries}`)

					if (retryCount <= maxRetries) {
						// Повторити перевірку через 5 секунд
						console.log('⏰ Повторна перевірка через 15 секунд...')
						setTimeout(() => checkPaymentStatus(), 15000)
					} else {
						// Перевищено ліміт спроб
						console.log('⚠️ Перевищено ліміт спроб')
						alert('Platba sa spracováva príliš dlho. Skontrolujte stav objednávky neskôr alebo kontaktujte podporu.')
						setIsCheckingPayment(false)
					}

				} else if (paymentStatus === 'FAIL') {
					// ❌ Платіж не вдався
					console.log('❌ Платіж не вдався')
					const reasonCode = result.data?.status?.reasonCode
					console.log('Код помилки:', reasonCode)

					let errorMessage = 'Platba zlyhala.'

					// Можна додати специфічні повідомлення для різних кодів помилок
					if (reasonCode === '51') {
						errorMessage = 'Platba bola zamietnutá. Nedostatok prostriedkov na účte.'
					} else if (reasonCode === '05') {
						errorMessage = 'Platba bola zamietnutá bankou.'
					}

					alert(errorMessage + ' Môžete skúsiť znovu.')
					localStorage.removeItem('pendingOrderId')
					localStorage.removeItem('pendingOrderNumber')
					window.history.replaceState({}, document.title, window.location.pathname)
					setIsCheckingPayment(false)

				} else {
					// Невідомий статус
					console.warn('⚠️ Neznámy stav platby:', result.data)
					alert('Nepodarilo sa overiť stav platby. Skúste obnoviť stránku.')
					setIsCheckingPayment(false)
				}

			} catch (error) {
				console.error('❌ Chyba pri kontrole stavu platby:', error)
				alert('Chyba pri kontrole stavu platby. Skúste obnoviť stránku.')
				setIsCheckingPayment(false)
			}
		}

		// Перевірити при завантаженні
		console.log('🚀 Запуск перевірки статусу при завантаженні...')
		checkPaymentStatus()

		// Перевірити при поверненні на вкладку
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				retryCount = 0 // Скинути лічильник при поверненні
				checkPaymentStatus()
			}
		}

		document.addEventListener('visibilitychange', handleVisibilityChange)

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange)
		}
	}, [onOrderComplete, clearCart])


	const calculateDiscountedPrice = (price = 0, discount = 0) => {
		const numPrice = parseFloat(price) || 0
		const numDiscount = parseFloat(discount) || 0
		return numPrice - (numPrice * numDiscount) / 100
	}

	const calculateTotal = () => {
		if (!Array.isArray(cartItems)) return 0

		const total = cartItems.reduce((sum, item) => {
			const quantity = parseInt(item?.quantity) || 0
			const price = parseFloat(item?.product?.price) || 0
			const discount = parseFloat(item?.product?.discount) || 0

			const finalPrice =
				discount > 0 ? calculateDiscountedPrice(price, discount) : price

			return sum + finalPrice * quantity
		}, 0)

		// Округлення до 2 знаків після коми, як вимагають фінансові API
		return parseFloat(total.toFixed(2))
	}


	const getPaymentMethodLabel = (method) => {
		const methods = {
			cash_on_delivery: 'Dobierka (platba pri prevzatí)',
			credit: 'Kúpa na splátky',
			online_payment: 'Online platba kartou'
		}
		return methods[method] || 'Neznámy spôsob platby'
	}

	const generateOrderNumber = () => {
		const timestamp = Date.now().toString().slice(-6)
		const random = Math.random().toString(36).substr(2, 3).toUpperCase()
		return `${timestamp}${random}`
	}

	const handleConfirmOrder = async () => {
		setIsSubmitting(true)

		try {
			const newOrderNumber = generateOrderNumber()

			const formatPhoneNumber = (phone) => {
				if (!phone) return "";

				let cleaned = phone.replace(/[^\d+]/g, "");

				if (cleaned.startsWith("0")) {
					cleaned = "+421" + cleaned.substring(1);
				}

				if (!cleaned.startsWith("+")) {
					cleaned = "+421" + cleaned;
				}

				cleaned = cleaned.replace(/\s/g, "");

				return cleaned;
			};

			const orderItems = Array.isArray(cartItems) ? cartItems.map(item => {
				const quantity = parseInt(item?.quantity) || 0
				const product = item?.product || {}
				const price = parseFloat(product?.price) || 0
				const discount = parseFloat(product?.discount) || 0
				const finalPrice = discount > 0
					? calculateDiscountedPrice(price, discount)
					: price
				const totalItemPrice = (finalPrice * quantity).toFixed(2)


				return {
					quantity: quantity,
					totalItemPrice: totalItemPrice,
					itemDetail: {
						itemDetailSK: {
							itemName: product?.model || "Neznámy produkt",
							itemDescription: product?.description || product?.model || ""
						},
						itemDetailEN: {
							itemName: product?.model || "Unknown product",
							itemDescription: product?.description || product?.model || ""
						}
					},
					itemInfoURL: product?.link ? `https://yourdomain.com/product/${product.link}` : "https://yourdomain.com"
				}
			}) : []

			const totalAmount = calculateTotal()

			const orderData = {
				basePayment: {
					instructedAmount: {
						amountValue: totalAmount,
						currency: "EUR"
					},
					endToEnd: {
						variableSymbol: "1",
						specificSymbol: "2",
						constantSymbol: "3"
					}
				},
				userData: {
					firstName: contactData?.firstName || "",
					lastName: contactData?.lastName || "",
					email: contactData?.email || "",
					externalApplicantId: newOrderNumber,
					phone: formatPhoneNumber(contactData?.phone)
				},
				bankTransfer: {
					remittanceInformationUnstructured: contactData?.comment || `${newOrderNumber}`
				},
				cardDetail: {
					billingAddress: {
						country: "SK",
						streetName: deliveryData?.address || "",
						buildingNumber: "1",
						townName: deliveryData?.city || "",
						postCode: deliveryData?.postalCode || ""
					},
					cardHolder: `${contactData?.firstName || ""} ${contactData?.lastName || ""}`.trim(),
					isPreAuthorization: false,
					shippingAddress: {
						country: "SK",
						streetName: deliveryData?.address || "",
						buildingNumber: "1",
						townName: deliveryData?.city || "",
						postCode: deliveryData?.postalCode || ""
					}
				},
				payLater: {
					order: {
						orderNo: newOrderNumber,
						orderItems: orderItems,
						preferredLoanDuration: 24,
						downPayment: 0
					},
					capacityInfo: {
						monthlyIncome: 0,
						monthlyExpenses: 0,
						numberOfChildren: 0
					}
				},
				_metadata: {
					orderNumber: newOrderNumber,
					paymentMethod: deliveryData?.paymentMethod || "",
					totalItems: totalItems || 0,
					timestamp: new Date().toISOString(),
					status: "pending"
				}
			}

			console.log(orderData)

			const response = await fetch('http://localhost:5000/api/offer/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(orderData)
			})

			const result = await response.json()

			if (!response.ok || result.data === "none") {
				throw new Error(result.message || 'Chyba servera')
			}

			if (result.data.tatraPayPlusUrl && result.data.orderId) {
				// Зберегти дані перед редіректом
				localStorage.setItem('pendingOrderId', result.data.orderId)
				localStorage.setItem('pendingOrderNumber', newOrderNumber)

				// Редірект на платіжну систему
				window.location.replace(result.data.tatraPayPlusUrl)
			} else {
				throw new Error(result.message || 'Chyba servera - chýba orderId alebo URL platby')
			}

		} catch (error) {
			console.error("Chyba pri spracovaní objednávky:", error)
			alert("Nastala chyba pri odoslaní objednávky. Skúste to znovu.")
			setIsSubmitting(false)
		}
	}

	// Stav načítavania pri kontrole platby
	if (isCheckingPayment) {
		return (
			<div className="StepConfirmation">
				<div className="StepConfirmation__success">
					<div className="StepConfirmation__success-icon">
						<Loader2 size={48} className="spinning" />
					</div>
					<h2 className="StepConfirmation__success-title">
						Kontrola stavu platby...
					</h2>
					<p className="StepConfirmation__success-text">
						Prosím, počkajte chvíľu.
					</p>
				</div>
			</div>
		)
	}

	// Úspešná objednávka
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
						Ďakujeme za Vašu objednávku. Čoskoro Vás budeme kontaktovať na telefónnom čísle{" "}
						<strong>{contactData?.phone || "neznáme číslo"}</strong>.
					</p>
					<button
						className="StepConfirmation__success-btn"
						onClick={() => (window.location.href = "/")}
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
				{/* Produkty */}
				<div className="StepConfirmation__section">
					<h3 className="StepConfirmation__section-title">
						<ShoppingBag size={20} />
						Objednané produkty ({totalItems || 0})
					</h3>

					<div className="StepConfirmation__items">
						{Array.isArray(cartItems) && cartItems.length > 0 ? (
							cartItems.map((item, index) => {
								const quantity = parseInt(item?.quantity) || 0
								const product = item?.product || {}
								const model = product?.model || "Neznámy produkt"
								const price = parseFloat(product?.price) || 0
								const discount = parseFloat(product?.discount) || 0
								const finalPrice = discount > 0
									? calculateDiscountedPrice(price, discount)
									: price
								const totalPrice = finalPrice * quantity

								return (
									<div key={index} className="StepConfirmation__item">
										<div className="StepConfirmation__item-info">
											<span className="StepConfirmation__item-name">{model}</span>
											<span className="StepConfirmation__item-quantity">{quantity}x</span>
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
							})
						) : (
							<p className="StepConfirmation__empty">Košík je prázdny.</p>
						)}
					</div>

					<div className="StepConfirmation__total">
						<span className="StepConfirmation__total-label">Celková suma:</span>
						<span className="StepConfirmation__total-price">
							€{calculateTotal().toFixed(2)}
						</span>
					</div>
				</div>

				{/* Kontaktné údaje */}
				<div className="StepConfirmation__section">
					<h3 className="StepConfirmation__section-title">
						<User size={20} />
						Kontaktné údaje
					</h3>
					<p className="StepConfirmation__info">
						{contactData?.firstName || ""} {contactData?.lastName || ""},{" "}
						{contactData?.phone || ""}, {contactData?.email || ""}
						{contactData?.comment && (
							<span className="StepConfirmation__comment">
								<br />
								Poznámka: {contactData.comment}
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
						<strong>Adresa:</strong>{" "}
						{deliveryData?.address || ""}, {deliveryData?.postalCode || ""}{" "}
						{deliveryData?.city || ""}
						<br />
						<strong>Platba:</strong>{" "}
						{getPaymentMethodLabel(deliveryData?.paymentMethod)}
					</p>
				</div>
			</div>

			{/* Tlačidlá */}
			<div className="StepConfirmation__actions">
				<button
					type="button"
					className="StepConfirmation__back-btn"
					onClick={() => {
						window.scrollTo({ top: 0, behavior: "smooth" })
						setTimeout(() => onBack(), 300)
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