const JsonLd = ({ schema }) => {
	if (!schema) return null

	try {
		const jsonString = typeof schema === 'string'
			? schema
			: JSON.stringify(schema)

		return (
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: jsonString }}
				suppressHydrationWarning
			/>
		)
	} catch (error) {
		console.error('Error rendering JsonLd component:', error)
		return null
	}
}

// ✅ Компонент для множественных схем
export const MultipleJsonLd = ({ schemas }) => {
	if (!schemas || schemas.length === 0) return null

	return (
		<>
			{schemas.map((schema, index) => (
				<script
					key={index}
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: schema.replace(/</g, '\\u003c')
					}}
				/>
			))}
		</>
	)
}

export default JsonLd