"use client"
import { useState, useEffect } from "react"
import { useCart } from "@/hooks/useCart"
import productService from "@/services/productClient.service"
import ProgressBar from "./ProgressBar/ProgressBar"
import StepContact from "./StepContact/StepContact"
import StepDelivery from "./StepDelivery/StepDelivery"
import StepConfirmation from "./StepConfirmation/StepConfirmation"
import Link from "next/link"
import { ArrowLeft, ShoppingBag } from "lucide-react"
import "./CheckoutPage.scss"

const CheckoutPage = () => {
	const { items, totalItems } = useCart()
	const [currentStep, setCurrentStep] = useState(1)
	const [productList, setProductList] = useState([])
	const [cartItemsWithProducts, setCartItemsWithProducts] = useState([])
	const [loading, setLoading] = useState(true)
	const [orderCompleted, setOrderCompleted] = useState(false)
	const [showSuccessScreen, setShowSuccessScreen] = useState(false)

	// Данные форм
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

	// Перевірка на повернення з платіжної системи
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search)
		const paymentId = urlParams.get('paymentId')
		const pendingOrderId = localStorage.getItem('pendingOrderId')

		// Якщо є paymentId або pendingOrderId, автоматично перейти на крок 3
		if (paymentId || pendingOrderId) {
			setCurrentStep(3)

			// Завантажити збережені дані форм з localStorage
			const savedContactData = localStorage.getItem('checkoutContactData')
			const savedDeliveryData = localStorage.getItem('checkoutDeliveryData')

			if (savedContactData) {
				try {
					setContactData(JSON.parse(savedContactData))
				} catch (e) {
					console.error('Chyba načítania kontaktných údajov:', e)
				}
			}

			if (savedDeliveryData) {
				try {
					setDeliveryData(JSON.parse(savedDeliveryData))
				} catch (e) {
					console.error('Chyba načítania údajov doručenia:', e)
				}
			}
		}
	}, [])

	// Загрузка продуктов для корзины
	useEffect(() => {
		const loadProducts = async () => {
			try {
				setLoading(true)
				const products = await productService.getAllProducts()
				setProductList(products)
			} catch (error) {
				console.error('Chyba načítania produktov:', error)
			} finally {
				setLoading(false)
			}
		}

		loadProducts()
	}, [])

	// Обновление товаров корзины с полными данными
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

	// Проверка на пустую корзину (только если заказ не завершен)
	if (!loading && items.length === 0 && !orderCompleted) {
		// Перевірити, чи це повернення з оплати
		const pendingOrderId = localStorage.getItem('pendingOrderId')
		if (!pendingOrderId) {
			return (
				<main className="CheckoutPage">
					<div className="container">
						<div className="CheckoutPage__empty">
							<ShoppingBag size={64} />
							<h2>Váš košík je prázdny</h2>
							<p>Pred pokračovaním na pokladňu pridajte do košíka nejaké produkty</p>
							<Link href="/katalog" className="CheckoutPage__empty-link">
								Prejsť do katalógu
							</Link>
						</div>
					</div>
				</main>
			)
		}
	}

	// Loading состояние
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

	// Обработчики шагов
	const handleContactSubmit = (data) => {
		setContactData(data)
		// Зберегти дані в localStorage
		localStorage.setItem('checkoutContactData', JSON.stringify(data))
	}

	const handleDeliverySubmit = (data) => {
		setDeliveryData(data)
		// Зберегти дані в localStorage
		localStorage.setItem('checkoutDeliveryData', JSON.stringify(data))
	}

	const goToNextStep = () => {
		if (currentStep < 3) {
			setCurrentStep(currentStep + 1)
		}
	}

	const goToPrevStep = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1)
		}
	}

	const handleOrderComplete = () => {
		setOrderCompleted(true)
		setShowSuccessScreen(true)

		// Очистити збережені дані форм
		localStorage.removeItem('checkoutContactData')
		localStorage.removeItem('checkoutDeliveryData')
	}

	// Рендер текущего шага
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
				{/* Хлебные крошки - тоже скрываем на экране успеха */}
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

				{/* Прогресс-бар - скрываем на экране успеха */}
				{!showSuccessScreen && <ProgressBar currentStep={currentStep} />}

				{/* Контент шага */}
				<div className="CheckoutPage__content">
					{renderCurrentStep()}
				</div>
			</div>
		</main>
	)
}

export default CheckoutPage