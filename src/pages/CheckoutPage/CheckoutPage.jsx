"use client"
import { useState, useEffect, Suspense } from "react"
import { useCart } from "@/hooks/useCart"
import productService from "@/services/productClient.service"
import ProgressBar from "./ProgressBar/ProgressBar"
import StepContact from "./StepContact/StepContact"
import StepDelivery from "./StepDelivery/StepDelivery"
import StepConfirmation from "./StepConfirmation/StepConfirmation"
import Link from "next/link"
import { ArrowLeft, ShoppingBag } from "lucide-react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

import "./CheckoutPage.scss"

// Виносимо логіку з useSearchParams в окремий компонент
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

	useEffect(() => {
		const urlStep = Number(searchParams.get("step"))
		if (urlStep >= 1 && urlStep <= 3) {
			setCurrentStep(urlStep)
		}
	}, [searchParams])

	useEffect(() => {
		const params = new URLSearchParams(window.location.search)
		const paymentId = params.get("paymentId")
		const pendingOrderId = localStorage.getItem("pendingOrderId")

		if (paymentId || pendingOrderId) {
			router.replace(`${pathname}?step=3`)
			setCurrentStep(3)

			const savedContactData = localStorage.getItem("checkoutContactData")
			const savedDeliveryData = localStorage.getItem("checkoutDeliveryData")

			if (savedContactData) setContactData(JSON.parse(savedContactData))
			if (savedDeliveryData) setDeliveryData(JSON.parse(savedDeliveryData))
		}
	}, [])

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

	useEffect(() => {
		if (productList.length > 0 && items.length > 0) {
			const cartItems = items
				.map(item => {
					const product = productList.find(
						p => p.productLink === item.productLink
					)
					return {
						...item,
						product: product || null
					}
				})
				.filter(item => item.product !== null)

			setCartItemsWithProducts(cartItems)
		} else {
			setCartItemsWithProducts([])
		}
	}, [items, productList])

	if (!loading && items.length === 0 && !orderCompleted) {
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

	if (loading) {
		return (
			<main className="CheckoutPage">
				<div className="container">
					<div className="CheckoutPage__loading">
						<div className="spinner"></div>
						<p>Načítava sa pokladňa...</p>
					</div>
				</div>
			</main>
		)
	}

	const goToNextStep = () => {
		if (currentStep < 3) {
			const next = currentStep + 1
			setCurrentStep(next)
			router.push(`${pathname}?step=${next}`, { scroll: false })
		}
	}

	const goToPrevStep = () => {
		if (currentStep > 1) {
			const prev = currentStep - 1
			setCurrentStep(prev)
			router.push(`${pathname}?step=${prev}`, { scroll: false })
		}
	}

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

// Основний компонент з Suspense
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