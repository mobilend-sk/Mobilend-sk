"use client"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
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

// =============================
// KONSTANTИ
// =============================
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
const MAX_RETRIES = 20
const RETRY_INTERVAL = 5000
const PAYMENT_CHECK_INTERVAL = 15000

const PAYMENT_METHODS = {
	cash_on_delivery: 'Dobierka (platba pri prevzatí)',
	credit: 'Kúpa na splátky',
	online_payment: 'Online platba kartou'
}

// =============================
// HELPER FUNKCIE
// =============================
const removeDiacritics = (str = "") => {
	return str
		.normalize("NFKD")
		.replace(/[\p{Diacritic}]/gu, "")
}

const sanitizeRemittance = (text = "") => {
	return text
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^A-Za-z0-9\/\-\?:\(\)\.,'\+ ]/g, "")
		.trim();
};

const formatPhoneNumber = (phone) => {
	if (!phone) return ""
	let cleaned = phone.replace(/[^\d+]/g, "")
	if (cleaned.startsWith("0")) cleaned = "+421" + cleaned.substring(1)
	if (!cleaned.startsWith("+")) cleaned = "+421" + cleaned
	return cleaned.replace(/\s/g, "")
}

const generateOrderNumber = () => {
	const timestamp = Date.now().toString().slice(-6)
	const random = Math.random().toString(36).substr(2, 3).toUpperCase()
	return `${timestamp}${random}`
}

// =============================
// API SERVISY
// =============================
const orderAPI = {
	checkPaymentStatus: async (paymentId) => {
		const response = await fetch(`${API_BASE_URL}/api/offer/${paymentId}/status`, {
			method: 'GET',
			credentials: 'include'
		})
		const result = await response.json()

		if (!result.success) {
			throw new Error(result.message || 'Chyba pri kontrole stavu')
		}

		return result.data
	},

	updateOrderStatus: async (orderId, status) => {
		const response = await fetch(`${API_BASE_URL}/api/offer/${orderId}/status`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ status })
		})
		const result = await response.json()

		if (!result.success) {
			throw new Error(result.message || 'Chyba pri aktualizácii stavu')
		}

		return result.data
	},

	createOrder: async (orderData) => {
		const response = await fetch(`${API_BASE_URL}/api/offer/`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify(orderData)
		})
		const result = await response.json()

		if (!response.ok || !result.success) {
			throw new Error(result.message || 'Chyba pri vytváraní objednávky')
		}

		return result.data
	}
}

// =============================
// LOKALNE ULOZISKO
// =============================
const storage = {
	getPendingOrder: () => ({
		orderId: localStorage.getItem('pendingOrderId'),
		orderNumber: localStorage.getItem('pendingOrderNumber'),
		paymentId: localStorage.getItem('paymentId')
	}),

	setPendingOrder: (orderId, orderNumber) => {
		localStorage.setItem('pendingOrderId', orderId)
		localStorage.setItem('pendingOrderNumber', orderNumber)
	},

	setPaymentId: (paymentId) => {
		localStorage.setItem('paymentId', paymentId)
	},

	clearPendingOrder: () => {
		localStorage.removeItem('pendingOrderId')
		localStorage.removeItem('pendingOrderNumber')
		localStorage.removeItem('paymentId')
	}
}

// =============================
// HLAVNY KOMPONENT
// =============================
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
	const [retryCount, setRetryCount] = useState(0)

	const timeoutRef = useRef(null)
	const isMountedRef = useRef(true)

	// =============================
	// VYPOCTY S MEMOIZACIOU
	// =============================
	const calculateDiscountedPrice = useCallback((price = 0, discount = 0) => {
		const numPrice = parseFloat(price) || 0
		const numDiscount = parseFloat(discount) || 0
		return numPrice - (numPrice * numDiscount) / 100
	}, [])

	const totalAmount = useMemo(() => {
		if (!Array.isArray(cartItems) || cartItems.length === 0) return 0

		const total = cartItems.reduce((sum, item) => {
			const quantity = parseInt(item?.quantity) || 0
			const price = parseFloat(item?.product?.price) || 0
			const discount = parseFloat(item?.product?.discount) || 0
			const finalPrice = discount > 0
				? calculateDiscountedPrice(price, discount)
				: price

			return sum + finalPrice * quantity
		}, 0)

		return parseFloat(total.toFixed(2))
	}, [cartItems, calculateDiscountedPrice])

	const orderItems = useMemo(() => {
		if (!Array.isArray(cartItems)) return []

		return cartItems.map(item => {
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
	}, [cartItems, calculateDiscountedPrice])

	// =============================
	// SPRACOVANIE USPESNEJ OBJEDNAVKY
	// =============================
	const handleOrderSuccess = useCallback((orderNum) => {
		setOrderNumber(orderNum)
		setIsOrderComplete(true)
		onOrderComplete()
		clearCart()
		storage.clearPendingOrder()

		window.history.replaceState({}, document.title, window.location.pathname + '?step=3')
		window.scrollTo({ top: 0, behavior: "smooth" })
	}, [onOrderComplete, clearCart])

	// =============================
	// KONTROLA STAVU PLATBY
	// =============================
	const checkPaymentStatus = useCallback(async () => {
		if (!isMountedRef.current) return

		const { orderId, orderNumber: storedOrderNumber } = storage.getPendingOrder()

		if (!orderId) {
			console.log('❌ Chýba pendingOrderId')
			setIsCheckingPayment(false)
			return
		}

		try {
			console.log(`🔄 Kontrola ${retryCount + 1}/${MAX_RETRIES}...`)

			const urlParams = new URLSearchParams(window.location.search)
			let paymentId = urlParams.get('paymentId') || storage.getPendingOrder().paymentId

			if (paymentId) {
				storage.setPaymentId(paymentId)
			}

			if (!paymentId) {
				console.log('⏳ Ešte nie je paymentId, čakáme...')
				setRetryCount(prev => prev + 1)

				if (retryCount < MAX_RETRIES && isMountedRef.current) {
					timeoutRef.current = setTimeout(checkPaymentStatus, RETRY_INTERVAL)
				} else {
					alert('Nepodarilo sa získať informácie o platbe. Skúste to neskôr.')
					setIsCheckingPayment(false)
				}
				return
			}

			const paymentData = await orderAPI.checkPaymentStatus(paymentId)

			const paymentStatus = paymentData?.status?.status
			const authStatus = paymentData?.authorizationStatus

			console.log('💳 Status:', paymentStatus, '| Auth:', authStatus)

			// ✅ Platba úspešná
			if (paymentStatus === 'OK' && authStatus === 'AUTH_DONE') {
				console.log('✅ Platba úspešná!')

				try {
					await orderAPI.updateOrderStatus(orderId, 'paid')
					console.log('✅ Stav aktualizovaný na "paid"')
				} catch (updateError) {
					console.warn('⚠️ Nepodarilo sa aktualizovať stav:', updateError)
				}

				if (isMountedRef.current) {
					handleOrderSuccess(storedOrderNumber)
					setIsCheckingPayment(false)
				}
				return
			}

			// ⏳ Platba sa spracováva
			if (paymentStatus === 'INIT' || authStatus === 'AUTH_PENDING') {
				console.log('⏳ Platba sa spracováva...')
				setRetryCount(prev => prev + 1)

				if (retryCount < MAX_RETRIES && isMountedRef.current) {
					timeoutRef.current = setTimeout(checkPaymentStatus, PAYMENT_CHECK_INTERVAL)
				} else {
					setIsCheckingPayment(false)
				}
				return
			}

			// ❌ Platba zlyhala
			if (paymentStatus === 'FAIL') {
				console.log('❌ Platba zlyhala')

				try {
					await orderAPI.updateOrderStatus(orderId, 'cancelled')
					console.log('✅ Stav aktualizovaný na "cancelled"')
				} catch (err) {
					console.error('❌ Chyba pri aktualizácii:', err)
				}

				alert('Platba zlyhala. Skúste to neskôr.')
				storage.clearPendingOrder()

				if (isMountedRef.current) {
					window.history.replaceState({}, document.title, window.location.pathname + '?step=3')
					setIsCheckingPayment(false)
				}
				return
			}

			// ⚠️ Neznámy stav
			console.warn('⚠️ Neznámy stav:', paymentStatus)
			alert('Nepodarilo sa overiť stav platby. Skúste to neskôr.')
			setIsCheckingPayment(false)

		} catch (err) {
			console.error('❌ Chyba:', err)
			setRetryCount(prev => prev + 1)

			if (retryCount < MAX_RETRIES && isMountedRef.current) {
				console.log('🔄 Opakovaný pokus o 10 sekúnd...')
				timeoutRef.current = setTimeout(checkPaymentStatus, 10000)
			} else {
				alert('Chyba pri kontrole platby. Skúste to neskôr.')
				setIsCheckingPayment(false)
			}
		}
	}, [retryCount, handleOrderSuccess])

	// =============================
	// POCIATOCNA KONTROLA PLATBY
	// =============================
	useEffect(() => {
		isMountedRef.current = true

		const { orderId, orderNumber: storedOrderNumber } = storage.getPendingOrder()

		if (orderId && storedOrderNumber && !isOrderComplete) {
			console.log('🔍 Nájdená pending objednávka, začíname kontrolu...')
			setIsCheckingPayment(true)
			setRetryCount(0)
			checkPaymentStatus()
		}

		return () => {
			isMountedRef.current = false
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
		}
	}, [])

	// =============================
	// KONTROLA PRI NAVRATE NA KARTU
	// =============================
	useEffect(() => {
		const handleVisibilityChange = () => {
			const { orderId } = storage.getPendingOrder()

			if (document.visibilityState === 'visible' && orderId && !isOrderComplete) {
				console.log('👁️ Karta aktívna, kontrolujeme platbu...')
				setRetryCount(0)
				setIsCheckingPayment(true)
				checkPaymentStatus()
			}
		}

		document.addEventListener('visibilitychange', handleVisibilityChange)
		return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
	}, [isOrderComplete, checkPaymentStatus])

	// =============================
	// PRIPRAVA DAT OBJEDNAVKY
	// =============================
	const prepareOrderData = useCallback((newOrderNumber) => {

		const cleanFirstName = (contactData?.firstName || "")
			.replace(/[^a-zA-Z0-9À-ž ]/g, "");

		const cleanLastName = (contactData?.lastName || "")
			.replace(/[^a-zA-Z0-9À-ž ]/g, "");

		const cleanedCardHolder = removeDiacritics(
			`${cleanFirstName} ${cleanLastName}`.trim()
		);

		const sanitizedRemittance =
			sanitizeRemittance(contactData?.comment || newOrderNumber);

		return {
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
				firstName: cleanFirstName,
				lastName: cleanLastName,
				email: contactData?.email || "",
				externalApplicantId: newOrderNumber,
				phone: formatPhoneNumber(contactData?.phone)
			},
			bankTransfer: {
				remittanceInformationUnstructured: sanitizedRemittance
			},
			cardDetail: {
				billingAddress: {
					country: "SK",
					streetName: deliveryData?.address || "",
					buildingNumber: "1",
					townName: deliveryData?.city || "",
					postCode: deliveryData?.postalCode || ""
				},
				cardHolder: cleanedCardHolder,
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
					monthlyIncome: parseFloat(deliveryData?.monthlyIncome) || 0,
					monthlyExpenses: parseFloat(deliveryData?.monthlyExpenses) || 0,
					numberOfChildren: parseInt(deliveryData?.numberOfChildren) || 0
				}
			},

			_metadata: {
				orderNumber: newOrderNumber,
				paymentMethod: deliveryData?.paymentMethod || "",
				totalItems: totalItems || 0,
				timestamp: new Date().toISOString(),
				status: "pending"
			}
		};

	}, [cartItems, contactData, deliveryData, totalAmount, totalItems]);


	// =============================
	// POTVRDENIE OBJEDNAVKY
	// =============================
	const handleConfirmOrder = useCallback(async () => {
		setIsSubmitting(true);

		try {
			const paymentMethod = deliveryData?.paymentMethod;
			const newOrderNumber = generateOrderNumber();
			const orderData = prepareOrderData(newOrderNumber);

			// 1️⃣ Dobierka — просто створюємо замовлення, без редіректу
			if (paymentMethod === "cash_on_delivery") {
				await orderAPI.createOrder(orderData);
				handleOrderSuccess(newOrderNumber);
				return;
			}

			// 2️⃣ Splátky — очікуємо loanRedirectUrl
			if (paymentMethod === "credit") {
				const responseData = await orderAPI.createOrder(orderData);

				if (responseData?.loanRedirectUrl) {
					window.location.replace(responseData.loanRedirectUrl);
					return;
				}

				throw new Error("Chýba loanRedirectUrl pre splátky");
			}

			// 3️⃣ Online kartou — TatraPay flow
			const responseData = await orderAPI.createOrder(orderData);

			if (responseData.tatraPayPlusUrl && responseData.orderId) {
				storage.setPendingOrder(responseData.orderId, newOrderNumber);
				window.location.replace(responseData.tatraPayPlusUrl);
				return;
			}

			throw new Error("Chýba orderId alebo URL na online platbu");

		} catch (error) {
			console.error("❌ Chyba:", error);
			alert(error.message || "Chyba pri odoslaní objednávky.");
			setIsSubmitting(false);
		}
	}, [deliveryData, prepareOrderData]);


	// =============================
	// POMOCNE FUNKCIE PRE RENDER
	// =============================
	const getPaymentMethodLabel = useCallback((method) => {
		return PAYMENT_METHODS[method] || 'Neznámy spôsob platby'
	}, [])

	// =============================
	// RENDER: KONTROLA PLATBY
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
						Pokus {retryCount}/{MAX_RETRIES}
					</p>
				</div>
			</div>
		)
	}

	// =============================
	// RENDER: USPESNA OBJEDNAVKA
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
	// RENDER: HLAVNA FORMA
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
							€{totalAmount.toFixed(2)}
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