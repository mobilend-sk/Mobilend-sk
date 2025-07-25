// src/app/not-found.js
// Кастомная 404 страница для всего сайта

import Link from 'next/link'
import { ArrowLeft, Home, Search, Phone, Mail } from 'lucide-react'
import './not-found.scss'

export const metadata = {
	title: '404 - Stránka sa nenašla | Mobilend',
	description: 'Stránka, ktorú hľadáte, sa nenašla. Prejdite na hlavnú stránku alebo prezrite náš katalóg mobilných telefónov.',
	robots: {
		index: false,
		follow: false,
	},
}

export default function NotFound() {
	return (
		<div className="NotFound">
			<div className="container">
				<div className="NotFound__content">
					{/* Заголовок и описание */}
					<div className="NotFound__text">
						<h1 className="NotFound__title">
							Stránka sa nenašla
						</h1>
						<p className="NotFound__description">
							Oops! Stránka, ktorú hľadáte, neexistuje alebo bola presunutá.
							Možno ste sa pomýlili v adrese, alebo odkaz už nie je aktívny.
						</p>
					</div>

					{/* Кнопки действий */}
					<div className="NotFound__actions">
						<Link href="/" className="NotFound__button NotFound__button--primary">
							<Home size={20} />
							Späť na hlavnú
						</Link>

						<Link href="/katalog" className="NotFound__button NotFound__button--secondary">
							<Search size={20} />
							Prejsť do katalógu
						</Link>
					</div>

					{/* Популярные ссылки */}
					<div className="NotFound__popular">
						<h3>Populárne sekcie:</h3>
						<div className="NotFound__links">
							<Link href="/katalog" className="NotFound__link">
								📱 Všetky telefóny
							</Link>
							<Link href="/blog" className="NotFound__link">
								📝 Náš blog
							</Link>
							<Link href="/caste-otazky" className="NotFound__link">
								❓ FAQ
							</Link>
							<Link href="/o-nas" className="NotFound__link">
								ℹ️ O nás
							</Link>
						</div>
					</div>

					{/* Контактная информация */}
					<div className="NotFound__help">
						<h3>Potrebujete pomoc?</h3>
						<p>Ak sa problém opakuje, kontaktujte nás:</p>
						<div className="NotFound__contacts">
							<a href="mailto:support@mobilend.sk" className="NotFound__contact">
								<Mail size={18} />
								support@mobilend.sk
							</a>
						</div>
					</div>
				</div>

				{/* Анимированный фон */}
				<div className="NotFound__background">
					<div className="NotFound__circle NotFound__circle--1"></div>
					<div className="NotFound__circle NotFound__circle--2"></div>
					<div className="NotFound__circle NotFound__circle--3"></div>
				</div>
			</div>
		</div>
	)
}