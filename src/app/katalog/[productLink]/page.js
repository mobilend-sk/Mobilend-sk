import ProductPage from "@/pages/ProductPage/ProductPage"

export default async function KatalogProduct({ params }) {
	const { productLink } = await params
	return <ProductPage productLink={productLink} />
}