"use client"
import { useState, useEffect, useRef } from "react"
import { useCart } from "@/hooks/useCart"
import {
	ArrowLeft,
	ShoppingBag,
	User,
	MapPin,
	Check,
	Loader2
} from "lucide-react"
import "./StepConfirmation.scss"

// API URL константа
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const removeDiacritics = (str = "") => {
	return str
		.normalize("NFKD")
		.replace(/[\p{Diacritic}]/gu, "")
}

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

	const retryCountRef = useRef(0)
	const maxRetries = 20
	const checkIntervalRef = useRef(null)

	// =============================
	// ПЕРЕВІРКА ПЛАТЕЖУ
	// =============================
	useEffect(() => {
		const pendingOrderId = localStorage.getItem('pendingOrderId')
		const pendingOrderNumber = localStorage.getItem('pendingOrderNumber')

		if (pendingOrderId && pendingOrderNumber && !isOrderComplete) {
			console.log('🔍 Знайдено pending замовлення, починаємо перевірку...')
			setIsCheckingPayment(true)
			startPaymentCheck()
		}

		return () => {
			if (checkIntervalRef.current) {
				clearTimeout(checkIntervalRef.current)
			}
		}
	}, [])

	const startPaymentCheck = async () => {
		const pendingOrderId = localStorage.getItem('pendingOrderId')
		const pendingOrderNumber = localStorage.getItem('pendingOrderNumber')

		if (!pendingOrderId) {
			console.log('❌ Немає pendingOrderId')
			setIsCheckingPayment(false)
			return
		}

		try {
			console.log(`🔄 Перевірка ${retryCountRef.current + 1}/${maxRetries}...`)

			const urlParams = new URLSearchParams(window.location.search)
			let paymentId = urlParams.get('paymentId')

			if (!paymentId) {
				paymentId = localStorage.getItem('paymentId')
			} else {
				localStorage.setItem('paymentId', paymentId)
			}

			if (!paymentId) {
				console.log('⏳ Ще немає paymentId, чекаємо...')
				retryCountRef.current++

				if (retryCountRef.current < maxRetries) {
					checkIntervalRef.current = setTimeout(startPaymentCheck, 5000)
				} else {
					alert('Не вдалося отримати інформацію про платіж.')
					setIsCheckingPayment(false)
				}
				return
			}

			// Перевірка статусу платежу
			const response = await fetch(`${API_BASE_URL}/api/offer/${paymentId}/status`)
			const result = await response.json()

			console.log('📦 Відповідь:', result)

			if (!result.success) {
				throw new Error(result.message)
			}

			const paymentStatus = result.data?.status?.status
			const authStatus = result.data?.authorizationStatus

			console.log('💳 Status:', paymentStatus, '| Auth:', authStatus)

			// ✅ Платіж успішний
			if (paymentStatus === 'OK' && authStatus === 'AUTH_DONE') {
				console.log('✅ Платіж успішний!')

				// 🔥 ОНОВИТИ СТАТУС ЗАМОВЛЕННЯ НА "paid"
				try {
					const updateStatusResponse = await fetch(
						`${API_BASE_URL}/api/offer/${pendingOrderId}/status`,
						{
							method: 'POST',
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify({ status: 'paid' })
						}
					)

					const updateResult = await updateStatusResponse.json()

					if (updateResult.success) {
						console.log('✅ Статус замовлення оновлено на "paid"')
					} else {
						console.warn('⚠️ Не вдалося оновити статус:', updateResult.message)
					}
				} catch (updateError) {
					console.error('❌ Помилка при оновленні статусу:', updateError)
					// Не зупиняємо процес, навіть якщо оновлення статусу не вдалося
				}

				// Показати успішне замовлення
				setOrderNumber(pendingOrderNumber)
				setIsOrderComplete(true)
				onOrderComplete()
				clearCart()

				// Очистити localStorage
				localStorage.removeItem('pendingOrderId')
				localStorage.removeItem('pendingOrderNumber')
				localStorage.removeItem('paymentId')
				
				clearAllCookies()

				// Очистити URL
				window.history.replaceState({}, document.title, window.location.pathname + '?step=3')
				window.scrollTo({ top: 0, behavior: "smooth" })

				setIsCheckingPayment(false)
				return
			}

			// ⏳ Платіж обробляється
			if (paymentStatus === 'INIT' || authStatus === 'AUTH_PENDING') {
				console.log('⏳ Платіж обробляється...')
				retryCountRef.current++

				if (retryCountRef.current < maxRetries) {
					checkIntervalRef.current = setTimeout(startPaymentCheck, 15000)
				} else {
					alert('Platba sa spracováva príliš dlho. Skontrolujte stav objednávky neskôr.')
					setIsCheckingPayment(false)
				}
				return
			}

			// ❌ Платіж не вдався
			if (paymentStatus === 'FAIL') {
				console.log('❌ Платіж не вдався')

				// Оновити статус на "cancelled"
				try {
					await fetch(
						`${API_BASE_URL}/api/orders/${pendingOrderId}/status`,
						{
							method: 'POST',
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify({ status: 'cancelled' })
						}
					)
					console.log('✅ Статус замовлення оновлено на "cancelled"')
				} catch (err) {
					console.error('❌ Помилка при оновленні статусу:', err)
				}

				alert('Platba zlyhala. Skúste znova.')

				localStorage.removeItem('pendingOrderId')
				localStorage.removeItem('pendingOrderNumber')
				localStorage.removeItem('paymentId')

				window.history.replaceState({}, document.title, window.location.pathname + '?step=3')
				setIsCheckingPayment(false)
				return
			}

			// ⚠️ Невідомий статус
			console.warn('⚠️ Neznámy stav:', paymentStatus)
			alert('Nepodarilo sa overiť stav platby.')
			setIsCheckingPayment(false)

		} catch (err) {
			console.error('❌ Chyba:', err)
			retryCountRef.current++

			if (retryCountRef.current < maxRetries) {
				console.log('🔄 Повторна спроба через 10 сек...')
				checkIntervalRef.current = setTimeout(startPaymentCheck, 10000)
			} else {
				alert('Chyba pri kontrole platby.')
				setIsCheckingPayment(false)
			}
		}
	}


	// Очистити COOKIES
	const clearAllCookies = () => {
		document.cookie.split(";").forEach(cookie => {
			const eqPos = cookie.indexOf("=")
			const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
			document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
		})
	}

	// =============================
	// ОБРОБКА VISIBILITY CHANGE
	// =============================
	useEffect(() => {
		const handleVisibilityChange = () => {
			const pendingOrderId = localStorage.getItem('pendingOrderId')

			if (document.visibilityState === 'visible' && pendingOrderId && !isOrderComplete) {
				console.log('👁️ Вкладка активна, перевіряємо платіж...')
				retryCountRef.current = 0
				setIsCheckingPayment(true)
				startPaymentCheck()
			}
		}

		document.addEventListener('visibilitychange', handleVisibilityChange)
		return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
	}, [isOrderComplete])

	// =============================
	// ДОПОМІЖНІ ФУНКЦІЇ
	// =============================
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
			const finalPrice = discount > 0 ? calculateDiscountedPrice(price, discount) : price

			return sum + finalPrice * quantity
		}, 0)

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

	const formatPhoneNumber = (phone) => {
		if (!phone) return ""
		let cleaned = phone.replace(/[^\d+]/g, "")
		if (cleaned.startsWith("0")) cleaned = "+421" + cleaned.substring(1)
		if (!cleaned.startsWith("+")) cleaned = "+421" + cleaned
		return cleaned.replace(/\s/g, "")
	}

	// =============================
	// ПІДТВЕРДЖЕННЯ ЗАМОВЛЕННЯ
	// =============================
	const handleConfirmOrder = async () => {
		setIsSubmitting(true)

		try {
			const newOrderNumber = generateOrderNumber()

			const orderItems = Array.isArray(cartItems)
				? cartItems.map(item => {
					const quantity = parseInt(item?.quantity) || 0
					const product = item?.product || {}
					const price = parseFloat(product?.price) || 0
					const discount = parseFloat(product?.discount) || 0
					const finalPrice = discount > 0
						? calculateDiscountedPrice(price, discount)
						: price
					const totalItemPrice = parseFloat((finalPrice * quantity).toFixed(2))

					return {
						quantity,
						totalItemPrice,
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
						itemInfoURL: product?.link
							? `https://yourdomain.com/product/${product.link}`
							: "https://yourdomain.com"
					}
				})
				: []

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
					remittanceInformationUnstructured: contactData?.comment || newOrderNumber
				},
				cardDetail: {
					billingAddress: {
						country: "SK",
						streetName: deliveryData?.address || "",
						buildingNumber: "1",
						townName: deliveryData?.city || "",
						postCode: deliveryData?.postalCode || ""
					},
					cardHolder: removeDiacritics(
						`${contactData?.firstName || ""} ${contactData?.lastName || ""}`.trim()
					),
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
						orderItems,
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

			const response = await fetch(`${API_BASE_URL}/api/offer/`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(orderData)
			})

			const result = await response.json()

			if (!response.ok || result.data === "none") {
				throw new Error(result.message || 'Chyba servera')
			}

			if (result.data.tatraPayPlusUrl && result.data.orderId) {
				localStorage.setItem('pendingOrderId', result.data.orderId)
				localStorage.setItem('pendingOrderNumber', newOrderNumber)

				window.location.replace(result.data.tatraPayPlusUrl)
			} else {
				throw new Error('Chýba orderId alebo URL na platbu')
			}

		} catch (error) {
			console.error('❌ Chyba:', error)
			alert("Chyba pri odoslaní objednávky.")
			setIsSubmitting(false)
		}
	}

	// =============================
	// RENDER: ПЕРЕВІРКА ПЛАТЕЖУ
	// =============================
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
						Prosím, počkajte chvíľu. Prebieha overovanie platby.
					</p>
					<p className="StepConfirmation__success-text" style={{ fontSize: '0.9em', marginTop: '1rem', opacity: 0.7 }}>
						Pokus {retryCountRef.current}/{maxRetries}
					</p>
				</div>
			</div>
		)
	}

	// =============================
	// RENDER: УСПІШНЕ ЗАМОВЛЕННЯ
	// =============================
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
						Ďakujeme za Vašu objednávku. Čoskoro Vás budeme kontaktovať.
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

	// =============================
	// RENDER: ГОЛОВНА ФОРМА
	// =============================
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