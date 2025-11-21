"use client"
import { useState, useEffect, Suspense } from "react"
import { useCart } from "@/hooks/useCart"
import cartService from "@/services/cart.service"
import productService from "@/services/productClient.service"

import ProgressBar from "./ProgressBar/ProgressBar"
import StepContact from "./StepContact/StepContact"
import StepDelivery from "./StepDelivery/StepDelivery"
import StepConfirmation from "./StepConfirmation/StepConfirmation"

import Link from "next/link"
import { ArrowLeft, ShoppingBag } from "lucide-react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

import "./CheckoutPage.scss"

const CHECKOUT_LINK = "__checkout__" // технический item для step

// -------------------------
// Оснoвной компонент
// -------------------------
const CheckoutPageContent = () => {
	const { items } = useCart()
	const searchParams = useSearchParams()
	const router = useRouter()
	const pathname = usePathname()

	const initialStep = Number(searchParams.get("step")) || 1
	const [currentStep, setCurrentStep] = useState(initialStep)

	const [productList, setProductList] = useState([])
	const [cartItemsWithProducts, setCartItemsWithProducts] = useState([])
	const [loading, setLoading] = useState(true)
	const [orderCompleted, setOrderCompleted] = useState(false)
	const [showSuccessScreen, setShowSuccessScreen] = useState(false)

	const [contactData, setContactData] = useState({
		firstName: '',
		lastName: '',
		phone: '',
		email: '',
		comment: ''
	})

	const [deliveryData, setDeliveryData] = useState({
		city: '',
		postalCode: '',
		address: '',
		paymentMethod: ''
	})

	// -----------------------------
	// Защита step на основании backend
	// -----------------------------
	useEffect(() => {
		const urlStep = Number(searchParams.get("step")) || 1

		const sync = async () => {
			const checkoutItem = items.find(i => i.productLink === CHECKOUT_LINK)
			const cartStep = checkoutItem?.step || 1

			// URL показывает step, который нельзя посещать → редирект назад
			if (urlStep > cartStep) {
				router.replace(`${pathname}?step=${cartStep}`)
				setCurrentStep(cartStep)
				return
			}

			// Если step в URL меньше — например после оплаты можно прыгнуть вперёд
			if (urlStep < cartStep) {
				router.replace(`${pathname}?step=${cartStep}`)
				setCurrentStep(cartStep)
				return
			}

			setCurrentStep(urlStep)
		}

		sync()
	}, [searchParams, items])

	// -----------------------------
	// Создаём item "__checkout__" если нет
	// -----------------------------
	useEffect(() => {
		if (items.length === 0) return

		const checkoutItem = items.find(i => i.productLink === CHECKOUT_LINK)
		if (!checkoutItem) {
			cartService.updateStep(1)
		}
	}, [items])

	// -----------------------------
	// Загрузка продуктов
	// -----------------------------
	useEffect(() => {
		const loadProducts = async () => {
			try {
				setLoading(true)
				const products = await productService.getAllProducts()
				setProductList(products)
			} catch (error) {
				console.error("Chyba načítania produktov:", error)
			} finally {
				setLoading(false)
			}
		}
		loadProducts()
	}, [])

	// -----------------------------
	// Сопоставляем cart items → products
	// -----------------------------
	useEffect(() => {
		if (productList.length > 0 && items.length > 0) {
			const cartItems = items
				.map(item => {
					if (item.productLink === CHECKOUT_LINK) return null

					const product = productList.find(
						p => p.productLink === item.productLink
					)

					return product ? { ...item, product } : null
				})
				.filter(i => i !== null)

			setCartItemsWithProducts(cartItems)
		} else {
			setCartItemsWithProducts([])
		}
	}, [items, productList])

	// -----------------------------
	// Пустая корзина
	// -----------------------------
	if (!loading && cartItemsWithProducts.length === 0 && !orderCompleted) {
		const pendingOrderId = localStorage.getItem("pendingOrderId")
		if (!pendingOrderId) {
			return (
				<main className="CheckoutPage">
					<div className="container">
						<div className="CheckoutPage__empty">
							<ShoppingBag size={64} />
							<h2>Váš košík je prázdny</h2>
							<p>Pred pokračovaním na pokladňu pridajte produkty</p>
							<Link href="/katalog" className="CheckoutPage__empty-link">
								Prejsť do katalógu
							</Link>
						</div>
					</div>
				</main>
			)
		}
	}

	// -----------------------------
	// Переключение шагов
	// -----------------------------
	const goToNextStep = async () => {
		if (currentStep < 3) {
			const next = currentStep + 1
			await cartService.updateStep(next)

			setCurrentStep(next)
			router.push(`${pathname}?step=${next}`, { scroll: false })
		}
	}

	const goToPrevStep = async () => {
		if (currentStep > 1) {
			const prev = currentStep - 1

			// если логика на backend запрещает уменьшать step — можно удалить строку ниже
			await cartService.updateStep(prev)

			setCurrentStep(prev)
			router.push(`${pathname}?step=${prev}`, { scroll: false })
		}
	}

	// -----------------------------
	// Сохранение форм
	// -----------------------------
	const handleContactSubmit = data => {
		setContactData(data)
		localStorage.setItem("checkoutContactData", JSON.stringify(data))
	}

	const handleDeliverySubmit = data => {
		setDeliveryData(data)
		localStorage.setItem("checkoutDeliveryData", JSON.stringify(data))
	}

	const handleOrderComplete = () => {
		setOrderCompleted(true)
		setShowSuccessScreen(true)
		localStorage.removeItem("checkoutContactData")
		localStorage.removeItem("checkoutDeliveryData")
	}

	// -----------------------------
	// Рендеринг шагов
	// -----------------------------
	const renderCurrentStep = () => {
		switch (currentStep) {
			case 1:
				return (
					<StepContact
						initialValues={contactData}
						onSubmit={handleContactSubmit}
						onNext={goToNextStep}
					/>
				)

			case 2:
				return (
					<StepDelivery
						initialValues={deliveryData}
						onSubmit={handleDeliverySubmit}
						onNext={goToNextStep}
						onBack={goToPrevStep}
					/>
				)

			case 3:
				return (
					<StepConfirmation
						contactData={contactData}
						deliveryData={deliveryData}
						cartItems={cartItemsWithProducts}
						onBack={goToPrevStep}
						onOrderComplete={handleOrderComplete}
					/>
				)

			default:
				return null
		}
	}

	// -----------------------------
	// Основной UI
	// -----------------------------
	return (
		<main className="CheckoutPage">
			<div className="container">

				{!showSuccessScreen && (
					<div className="CheckoutPage__breadcrumbs">
						<Link href="/cart" className="CheckoutPage__breadcrumb">
							<ArrowLeft size={16} />
							Košík
						</Link>
						<span className="CheckoutPage__breadcrumb-separator">/</span>
						<span className="CheckoutPage__breadcrumb CheckoutPage__breadcrumb--current">
							Potvrdenie kúpy
						</span>
					</div>
				)}

				{!showSuccessScreen && (
					<ProgressBar currentStep={currentStep} />
				)}

				<div className="CheckoutPage__content">
					{renderCurrentStep()}
				</div>

			</div>
		</main>
	)
}

// -------------------------
// Suspense wrapper
// -------------------------
const CheckoutPage = () => {
	return (
		<Suspense fallback={
			<main className="CheckoutPage">
				<div className="container">
					<div className="CheckoutPage__loading">
						<div className="spinner"></div>
						<p>Načítava sa pokladňa...</p>
					</div>
				</div>
			</main>
		}>
			<CheckoutPageContent />
		</Suspense>
	)
}

export default CheckoutPage
