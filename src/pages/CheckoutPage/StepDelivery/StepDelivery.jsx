"use client"
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { MapPin, CreditCard, ArrowLeft } from 'lucide-react'
import "./StepDelivery.scss"

const StepDelivery = ({ initialValues, onSubmit, onNext, onBack }) => {
	// Схема валидации с Yup
	const validationSchema = Yup.object({
		city: Yup.string()
			.matches(
				/^[A-Za-zÁÄáäČčĎďÉéÍíĹĺĽľŇňÓóÔôŘřŠšŤťÚúÝýŽž-]+$/,
				'Mesto môže obsahovať iba písmená a znak "-"'
			)
			.min(2, 'Mesto musí mať aspoň 2 znaky')
			.max(100, 'Názov mesta je príliš dlhý')
			.required('Mesto je povinné'),

		postalCode: Yup.string()
			.matches(/^\d{3}\s\d{2}$/, 'PSČ musí byť ve formáte XXX XX')
			.required('PSČ je povinné'),

		address: Yup.string()
			.matches(
				/^[A-Za-zÁÄáäČčĎďÉéÍíĹĺĽľŇňÓóÔôŘřŠšŤťÚúÝýŽž0-9\s\/.-]+$/,
				'Adresa môže obsahovať písmená, čísla a znaky "-","/","."'
			)
			.min(5, 'Adresa je príliš krátka')
			.max(200, 'Adresa je príliš dlhá')
			.required('Ulica a číslo domu sú povinné'),

		paymentMethod: Yup.string()
			.required('Vyberte spôsob platby')
	})


	// Значения по умолчанию
	const defaultValues = {
		city: '',
		postalCode: '',
		address: '',
		paymentMethod: '',
		...initialValues
	}

	// Функция для форматирования PSČ
	const formatPostalCode = (value) => {
		// Удаляем все нечисловые символы
		const numbers = value.replace(/\D/g, '')

		// Ограничиваем до 5 цифр
		const limited = numbers.slice(0, 5)

		// Добавляем пробел после 3-й цифры
		if (limited.length > 3) {
			return `${limited.slice(0, 3)} ${limited.slice(3)}`
		}

		return limited
	}

	// Варианты оплаты
	const paymentOptions = [
		{
			value: 'cash_on_delivery',
			label: 'Dobierka (platba pri prevzatí)',
			description: 'Zaplatíte pri doručení balíka',
			enabled: true
		},
		{
			value: 'credit',
			label: 'Kúpa na splátky',
			description: 'Rozloženie platby na splátky',
			enabled: false
		},
		{
			value: 'online_payment',
			label: 'Online platba kartou',
			description: 'Okamžitá platba cez internet',
			enabled: false
		}
	]

	return (
		<div className="StepDelivery">
			<div className="StepDelivery__header">
				<h2 className="StepDelivery__title">Doručenie a platba</h2>
				<p className="StepDelivery__subtitle">
					Zadajte adresu doručenia a vyberte spôsob platby
				</p>
			</div>

			<Formik
				initialValues={defaultValues}
				validationSchema={validationSchema}
				onSubmit={(values) => {
					onSubmit(values)
					// Прокрутка вверх перед переходом к следующему шагу
					window.scrollTo({
						top: 0,
						behavior: 'smooth'
					})
					// Небольшая задержка для плавности
					setTimeout(() => {
						onNext()
					}, 300)
				}}
				enableReinitialize
			>
				{({ isValid, setFieldValue, values }) => (
					<Form className="StepDelivery__form">
						{/* Sekcia doručenia */}
						<div className="StepDelivery__section">
							<h3 className="StepDelivery__section-title">
								<MapPin size={20} />
								Adresa doručenia
							</h3>

							<div className="StepDelivery__row">
								{/* Mesto */}
								<div className="StepDelivery__field">
									<label htmlFor="city" className="StepDelivery__label">
										Mesto *
									</label>
									<Field
										type="text"
										id="city"
										name="city"
										className="StepDelivery__input"
										placeholder="Bratislava"
									/>
									<ErrorMessage
										name="city"
										component="div"
										className="StepDelivery__error"
									/>
								</div>

								{/* PSČ */}
								<div className="StepDelivery__field">
									<label htmlFor="postalCode" className="StepDelivery__label">
										PSČ *
									</label>
									<Field name="postalCode">
										{({ field }) => (
											<input
												{...field}
												type="text"
												id="postalCode"
												className="StepDelivery__input"
												placeholder="811 01"
												value={formatPostalCode(field.value)}
												onChange={(e) => {
													const formatted = formatPostalCode(e.target.value)
													setFieldValue('postalCode', formatted)
												}}
											/>
										)}
									</Field>
									<ErrorMessage
										name="postalCode"
										component="div"
										className="StepDelivery__error"
									/>
								</div>
							</div>

							{/* Ulica a číslo domu */}
							<div className="StepDelivery__field">
								<label htmlFor="address" className="StepDelivery__label">
									Ulica a číslo domu *
								</label>
								<Field
									type="text"
									id="address"
									name="address"
									className="StepDelivery__input"
									placeholder="Hlavná ulica 123"
								/>
								<ErrorMessage
									name="address"
									component="div"
									className="StepDelivery__error"
								/>
							</div>
						</div>

						{/* Sekcia platby */}
						<div className="StepDelivery__section">
							<h3 className="StepDelivery__section-title">
								<CreditCard size={20} />
								Spôsob platby
							</h3>

							<div className="StepDelivery__payment-options">
								{paymentOptions.map((option) => (
									<div
										key={option.value}
										className={`StepDelivery__payment-option ${!option.enabled ? 'disabled' : ''}`}
									>
										<Field
											type="radio"
											id={option.value}
											name="paymentMethod"
											value={option.value}
											className="StepDelivery__radio"
											disabled={!option.enabled}
										/>
										<label
											htmlFor={option.value}
											className={`StepDelivery__payment-label ${!option.enabled ? 'disabled' : ''}`}
										>
											<div className="StepDelivery__payment-info">
												<span className="StepDelivery__payment-title">
													{option.label}
													{!option.enabled && (
														<span className="StepDelivery__coming-soon">
															(Pripravujeme)
														</span>
													)}
												</span>
												<span className="StepDelivery__payment-description">
													{option.description}
												</span>
											</div>
										</label>
									</div>
								))}
							</div>

							<ErrorMessage
								name="paymentMethod"
								component="div"
								className="StepDelivery__error"
							/>
						</div>

						{/* Tlačidlá */}
						<div className="StepDelivery__actions">
							<button
								type="button"
								className="StepDelivery__back-btn"
								onClick={() => {
									// Прокрутка вверх при возврате назад
									window.scrollTo({
										top: 0,
										behavior: 'smooth'
									})
									setTimeout(() => {
										onBack()
									}, 300)
								}}
							>
								<ArrowLeft size={18} />
								Späť
							</button>

							<button
								type="submit"
								className="StepDelivery__next-btn"
								disabled={!isValid}
							>
								Pokračovať na potvrdenie
							</button>
						</div>
					</Form>
				)}
			</Formik>
		</div>
	)
}

export default StepDelivery