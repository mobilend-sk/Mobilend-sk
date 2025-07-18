import { useEffect, useState } from 'react'
import useCartStore from '@/stores/cartStore'

// Простой хук для получения количества товаров
export const useCartCount = () => {
	const [count, setCount] = useState(0)

	useEffect(() => {
		// Функция для обновления счетчика
		const updateCount = () => {
			const state = useCartStore.getState()
			const totalItems = state.getTotalItems()
			setCount(totalItems)
		}

		// Обновляем сразу
		updateCount()

		// Подписываемся на изменения
		const unsubscribe = useCartStore.subscribe(updateCount)

		return () => unsubscribe()
	}, [])

	return count
}

// Хук для получения количества конкретного товара
export const useCartItemQuantity = (productLink) => {
	const [quantity, setQuantity] = useState(0)

	useEffect(() => {
		const updateQuantity = () => {
			const state = useCartStore.getState()
			const qty = state.getItemQuantity(productLink)
			setQuantity(qty)
		}

		updateQuantity()

		const unsubscribe = useCartStore.subscribe(updateQuantity)
		return () => unsubscribe()
	}, [productLink])

	return quantity
}

// Хук для проверки наличия товара в корзине
export const useIsItemInCart = (productLink) => {
	const [isInCart, setIsInCart] = useState(false)

	useEffect(() => {
		const updateIsInCart = () => {
			const state = useCartStore.getState()
			const inCart = state.isItemInCart(productLink)
			setIsInCart(inCart)
		}

		updateIsInCart()

		const unsubscribe = useCartStore.subscribe(updateIsInCart)
		return () => unsubscribe()
	}, [productLink])

	return isInCart
}

// Основной хук для работы с корзиной
export const useCart = () => {
	const [state, setState] = useState({
		items: [],
		totalItems: 0
	})

	useEffect(() => {
		const updateState = () => {
			const currentState = useCartStore.getState()
			setState({
				items: currentState.items,
				totalItems: currentState.getTotalItems()
			})
		}

		updateState()

		const unsubscribe = useCartStore.subscribe(updateState)
		return () => unsubscribe()
	}, [])

	const store = useCartStore.getState()

	return {
		// Состояние
		items: state.items,
		totalItems: state.totalItems,

		// Действия
		addItem: store.addItem,
		removeItem: store.removeItem,
		updateQuantity: store.updateQuantity,
		increaseQuantity: store.increaseQuantity,
		decreaseQuantity: store.decreaseQuantity,
		clearCart: store.clearCart,

		// Утилиты
		getItemQuantity: store.getItemQuantity,
		isItemInCart: store.isItemInCart,
		getTotalPrice: store.getTotalPrice,
		getCartItemsWithProducts: store.getCartItemsWithProducts
	}
}