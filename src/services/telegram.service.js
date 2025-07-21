class TelegramService {
	constructor() {
		// Здесь будут настройки для Telegram Bot API
		this.botToken = process.env.TELEGRAM_BOT_TOKEN || ''
		this.chatId = process.env.TELEGRAM_CHAT_ID || ''
	}

	// Форматирование сообщения с заказом
	formatOrderMessage(orderData) {
		const {
			orderNumber,
			contact,
			delivery,
			items,
			total,
			totalItems,
			timestamp
		} = orderData

		// Форматируем дату
		const date = new Date(timestamp).toLocaleString('sk-SK', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		})

		// Форматируем список товаров
		const itemsList = items.map((item, index) => {
			const price = parseFloat(item.product?.price) || 0
			const discount = parseFloat(item.product?.discount) || 0
			const discountedPrice = discount > 0
				? price - (price * discount / 100)
				: price
			const totalPrice = discountedPrice * item.quantity

			return `${index + 1}. ${item.product?.model || 'Neznámy produkt'}
   • Množstvo: ${item.quantity}x
   • Cena: €${totalPrice.toFixed(2)}${discount > 0 ? ` (pôvodne €${price.toFixed(2)})` : ''}`
		}).join('\n\n')

		// Získanie názvu spôsobu platby
		const getPaymentMethodLabel = (method) => {
			const methods = {
				cash_on_delivery: 'Dobierka (platba pri prevzatí)',
				credit: 'Kúpa na splátky',
				online_payment: 'Online platba kartou'
			}
			return methods[method] || method
		}

		// Hlavná správa
		const message = `
🛍️ NOVÁ OBJEDNÁVKA #${orderNumber}

📅 Dátum: ${date}

👤 ZÁKAZNÍK:
• Meno: ${contact.firstName} ${contact.lastName}
• Telefón: ${contact.phone}
• Email: ${contact.email}${contact.comment ? `
• Poznámka: ${contact.comment}` : ''}

🚚 DORUČENIE:
• Adresa: ${delivery.address}
• PSČ: ${delivery.postalCode}
• Mesto: ${delivery.city}
• Platba: ${getPaymentMethodLabel(delivery.paymentMethod)}

🛒 OBJEDNANÉ PRODUKTY (${totalItems} ks):
${itemsList}

💰 CELKOVÁ SUMA: €${total.toFixed(2)}

───────────────────────
Mobilend - mobilne-technologie.sk
		`.trim()

		return message
	}

	// Отправка сообщения в Telegram (пока console.log)
	async sendOrderToTelegram(orderData) {
		try {
			const message = this.formatOrderMessage(orderData)

			// Пока выводим в консоль вместо отправки в Telegram
			console.log('📱 TELEGRAM ORDER MESSAGE:')
			console.log('─'.repeat(50))
			console.log(message)
			console.log('─'.repeat(50))

			// В будущем здесь будет реальная отправка:
			/*
			const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					chat_id: this.chatId,
					text: message,
					parse_mode: 'HTML'
				})
			})

			if (!response.ok) {
				throw new Error('Chyba pri odoslaní správy do Telegram')
			}

			return await response.json()
			*/

			// Симуляция успешной отправки
			return {
				success: true,
				message: 'Objednávka bola úspešne odoslaná',
				orderNumber: orderData.orderNumber
			}

		} catch (error) {
			console.error('Chyba pri odoslaní objednávky do Telegram:', error)
			throw new Error('Nepodarilo sa odoslať objednávku. Skúste to znovu.')
		}
	}

	// Метод для отправки уведомлений (для будущего использования)
	async sendNotification(message, type = 'info') {
		try {
			const emoji = {
				info: 'ℹ️',
				success: '✅',
				warning: '⚠️',
				error: '❌'
			}

			const formattedMessage = `${emoji[type]} ${message}`

			console.log(`📱 TELEGRAM NOTIFICATION [${type.toUpperCase()}]:`)
			console.log(formattedMessage)

			return { success: true }
		} catch (error) {
			console.error('Chyba pri odoslaní notifikácie:', error)
			throw error
		}
	}

	// Валидация конфигурации Telegram (для будущего использования)
	validateConfig() {
		if (!this.botToken) {
			console.warn('⚠️ TELEGRAM_BOT_TOKEN nie je nastavený')
			return false
		}

		if (!this.chatId) {
			console.warn('⚠️ TELEGRAM_CHAT_ID nie je nastavený')
			return false
		}

		return true
	}

	// Тестовое сообщение
	async sendTestMessage() {
		const testOrder = {
			orderNumber: 'TEST123',
			contact: {
				firstName: 'Ján',
				lastName: 'Novák',
				phone: '+421 900 123 456',
				email: 'jan.novak@example.sk',
				comment: 'Testovacia objednávka'
			},
			delivery: {
				address: 'Hlavná ulica 123',
				postalCode: '811 01',
				city: 'Bratislava',
				paymentMethod: 'cash_on_delivery'
			},
			items: [
				{
					product: {
						model: 'Samsung Galaxy S24 256GB Black',
						price: 899,
						discount: 10
					},
					quantity: 1
				}
			],
			total: 809.10,
			totalItems: 1,
			timestamp: new Date().toISOString()
		}

		return await this.sendOrderToTelegram(testOrder)
	}
}

const telegramService = new TelegramService()

export default telegramService