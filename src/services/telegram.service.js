class TelegramService {
	constructor() {
		// Клиентская версия - использует только API routes
		this.apiEndpoint = '/api/telegram/send-order'
	}

	// Главная функция отправки заказа через API route
	async sendOrderToTelegram(orderData) {
		try {
			console.log('📤 Odosielanie objednávky cez server API...')

			// Отправляем данные на наш API endpoint
			const response = await fetch(this.apiEndpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(orderData)
			})

			// Парсим ответ
			const result = await response.json()

			// Проверяем статус ответа
			if (!response.ok) {
				console.error('❌ Server API error:', result.message)
				throw new Error(result.message || 'Chyba pri odoslaní objednávky')
			}

			// Логируем успех
			console.log('✅ Objednávka úspešne odoslaná cez server:', {
				orderNumber: result.orderNumber,
				messageId: result.messageId
			})

			return {
				success: true,
				message: result.message,
				orderNumber: result.orderNumber,
				messageId: result.messageId
			}

		} catch (error) {
			console.error('❌ Chyba pri odoslaní objednávky:', error)

			// Показываем fallback информацию в консоли для отладки
			console.warn('📋 Objednávka ktorá sa nepodarila odoslať:')
			console.table({
				'Číslo objednávky': orderData.orderNumber,
				'Zákazník': `${orderData.contact.firstName} ${orderData.contact.lastName}`,
				'Email': orderData.contact.email,
				'Telefón': orderData.contact.phone,
				'Suma': `€${orderData.total.toFixed(2)}`,
				'Produkty': orderData.totalItems
			})

			// Пробрасываем ошибку дальше
			throw new Error('Nepodarilo sa odoslať objednávku. Skúste to znovu.')
		}
	}

	// Метод для отправки тестового уведомления
	async sendTestNotification() {
		try {
			const testOrder = {
				orderNumber: 'TEST' + Date.now(),
				contact: {
					firstName: 'Ján',
					lastName: 'Test',
					phone: '+421 900 123 456',
					email: 'test@example.sk',
					comment: 'Testovacia objednávka pre overenie Telegram integrácie'
				},
				delivery: {
					address: 'Testovacia adresa 123',
					postalCode: '811 01',
					city: 'Bratislava',
					paymentMethod: 'cash_on_delivery'
				},
				items: [
					{
						product: {
							model: 'TEST Samsung Galaxy S24 256GB',
							price: 100,
							discount: 0
						},
						quantity: 1
					}
				],
				total: 100,
				totalItems: 1,
				timestamp: new Date().toISOString()
			}

			console.log('🧪 Spúšťanie testovej objednávky...')
			const result = await this.sendOrderToTelegram(testOrder)
			console.log('✅ Test úspešný:', result)

			return result
		} catch (error) {
			console.error('❌ Test neúspešný:', error)
			throw error
		}
	}

	// Метод для проверки доступности API
	async checkApiHealth() {
		try {
			// Можно добавить отдельный endpoint для проверки здоровья API
			// Пока просто возвращаем true
			return {
				success: true,
				message: 'API endpoint je dostupný'
			}
		} catch (error) {
			return {
				success: false,
				message: 'API endpoint nie je dostupný'
			}
		}
	}
}

const telegramService = new TelegramService()

export default telegramService