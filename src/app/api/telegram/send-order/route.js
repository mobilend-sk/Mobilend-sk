import { NextResponse } from 'next/server'

export async function POST(request) {
	try {
		// Получаем данные заказа из запроса
		const orderData = await request.json()

		// Проверяем наличие необходимых данных
		if (!orderData.orderNumber || !orderData.contact || !orderData.items) {
			return NextResponse.json({
				success: false,
				message: 'Nesprávne dáta objednávky'
			}, { status: 400 })
		}

		// Получаем переменные окружения (только на сервере!)
		const botToken = process.env.TELEGRAM_BOT_TOKEN
		const chatId = process.env.TELEGRAM_CHAT_ID

		if (!botToken || !chatId) {
			console.error('❌ Telegram nie je nakonfigurovaný - chýbajú premenné prostredia')
			return NextResponse.json({
				success: false,
				message: 'Telegram nie je nakonfigurovaný na serveri'
			}, { status: 500 })
		}

		// Форматируем сообщение для Telegram
		const message = formatOrderMessage(orderData)

		// Отправляем в Telegram API
		const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				chat_id: chatId,
				text: message,
				parse_mode: 'HTML',
				disable_web_page_preview: true
			})
		})

		// Проверяем ответ от Telegram
		if (!telegramResponse.ok) {
			const errorData = await telegramResponse.json().catch(() => ({}))
			console.error('❌ Telegram API Error:', errorData)

			return NextResponse.json({
				success: false,
				message: 'Chyba pri odoslaní do Telegram'
			}, { status: 500 })
		}

		const telegramResult = await telegramResponse.json()

		// Логируем успех
		console.log('✅ Objednávka odoslaná do Telegram:', {
			orderNumber: orderData.orderNumber,
			messageId: telegramResult.result?.message_id,
			timestamp: new Date().toISOString()
		})

		// Возвращаем успешный ответ
		return NextResponse.json({
			success: true,
			message: 'Objednávka bola úspešne odoslaná do Telegram',
			orderNumber: orderData.orderNumber,
			messageId: telegramResult.result?.message_id
		})

	} catch (error) {
		console.error('❌ Server error pri odoslaní objednávky:', error)

		return NextResponse.json({
			success: false,
			message: 'Došlo k chybe pri spracovaní objednávky'
		}, { status: 500 })
	}
}

// Функция форматирования сообщения для Telegram
// Функция форматирования сообщения для Telegram (русская версия)
function formatOrderMessage(orderData) {
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
	const date = new Date(timestamp).toLocaleString('ru-RU', {
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

		return `${index + 1}. ${item.product?.model || 'Неизвестный товар'}
   • Количество: ${item.quantity}x
   • Цена: €${totalPrice.toFixed(2)}${discount > 0 ? ` (было €${price.toFixed(2)})` : ''}`
	}).join('\n\n')

	// Получение названия способа оплаты на русском
	const getPaymentMethodLabel = (method) => {
		const methods = {
			cash_on_delivery: 'Наложенный платеж',
			credit: 'Покупка в рассрочку',
			online_payment: 'Онлайн оплата картой'
		}
		return methods[method] || method
	}

	// Создаем финальное сообщение
	const message = `НОВЫЙ ЗАКАЗ #${orderNumber}

📅 Дата: ${date}

👤 КЛИЕНТ:
• ФИО: ${contact.firstName} ${contact.lastName}
• Телефон: ${contact.phone}
• Email: ${contact.email}${contact.comment ? `
• Комментарий: ${contact.comment}` : ''}

🚚 ДОСТАВКА:
• Адрес: ${delivery.address}
• Индекс: ${delivery.postalCode}
• Город: ${delivery.city}
• Оплата: ${getPaymentMethodLabel(delivery.paymentMethod)}

🛒 ЗАКАЗАННЫЕ ТОВАРЫ (${totalItems} шт):
${itemsList}

💰 ОБЩАЯ СУММА: €${total.toFixed(2)}

───────────────────────
Mobilend - mobilend.sk`

	return message
}