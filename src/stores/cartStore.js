import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCartStore = create(
	persist(
		(set, get) => ({
			// Состояние корзины
			items: [],

			// Действия
			addItem: (productLink) => {
				const items = get().items
				const existingItem = items.find(item => item.productLink === productLink)

				if (existingItem) {
					set({
						items: items.map(item =>
							item.productLink === productLink
								? { ...item, quantity: item.quantity + 1 }
								: item
						)
					})
				} else {
					set({
						items: [...items, { productLink, quantity: 1 }]
					})
				}
			},

			removeItem: (productLink) => {
				set({
					items: get().items.filter(item => item.productLink !== productLink)
				})
			},

			updateQuantity: (productLink, quantity) => {
				if (quantity <= 0) {
					get().removeItem(productLink)
					return
				}

				set({
					items: get().items.map(item =>
						item.productLink === productLink
							? { ...item, quantity }
							: item
					)
				})
			},

			increaseQuantity: (productLink) => {
				const items = get().items
				const existingItem = items.find(item => item.productLink === productLink)

				if (existingItem) {
					get().updateQuantity(productLink, existingItem.quantity + 1)
				}
			},

			decreaseQuantity: (productLink) => {
				const items = get().items
				const existingItem = items.find(item => item.productLink === productLink)

				if (existingItem && existingItem.quantity > 1) {
					get().updateQuantity(productLink, existingItem.quantity - 1)
				} else if (existingItem && existingItem.quantity === 1) {
					get().removeItem(productLink)
				}
			},

			getItemQuantity: (productLink) => {
				const item = get().items.find(item => item.productLink === productLink)
				return item ? item.quantity : 0
			},

			isItemInCart: (productLink) => {
				return get().items.some(item => item.productLink === productLink)
			},

			getTotalItems: () => {
				return get().items.reduce((total, item) => total + item.quantity, 0)
			},

			clearCart: () => {
				set({ items: [] })
			},

			getTotalPrice: (productList) => {
				const items = get().items
				return items.reduce((total, item) => {
					const product = productList.find(p => p.productLink === item.productLink)
					return total + (product ? product.price * item.quantity : 0)
				}, 0)
			},

			getCartItemsWithProducts: (productList) => {
				const items = get().items
				return items
					.map(item => {
						const product = productList.find(p => p.productLink === item.productLink)
						return {
							...item,
							product: product || null
						}
					})
					.filter(item => item.product !== null)
			},

			// 🔥 ВАЖНО: метод для синхронизации с backend
			// предполагаем, что backend возвращает items в том же формате [{ productLink, quantity }, ...]
			syncCart: (serverItems) => {
				const normalized = serverItems.map(item => ({
					productLink: item.productLink || item.productId, // <-- пріоритет productLink
					productId: item.productId,
					quantity: item.quantity
				}))

				set({ items: normalized })
			}

		}),
		{
			name: 'shopping-cart',
		}
	)
)

export default useCartStore
