// src/components/SEO/JsonLd.jsx
// Компонент для рендера JSON-LD схем в <head>

import Head from 'next/head'

const JsonLd = ({ schema }) => {
	if (!schema) return null

	return (
		<Head>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: schema }}
			/>
		</Head>
	)
}

// Компонент для множественных схем
export const MultipleJsonLd = ({ schemas }) => {
	if (!schemas || schemas.length === 0) return null

	return (
		<Head>
			{schemas.map((schema, index) => (
				<script
					key={index}
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: schema }}
				/>
			))}
		</Head>
	)
}

export default JsonLd