class ProductService {

	constructor() {
		this.baseUrl = "/data/products.json"
	}

	async getPopularProducts() {
		try {
			const allProds = await this.getAllProducts()

			const popularProducts = allProds.filter(prod => prod.popular)

			return popularProducts
		} catch (error) {
			throw error
		}
	}

	async getProductsWithDiscount() {
		try {
			const allProds = await this.getAllProducts()

			const discountProducts = allProds.filter(prod => prod.discount > 0)

			return discountProducts
		} catch (error) {
			throw error
		}
	}

	async getProductsByModel(modelGroup) {
		try {
			const allProds = await this.getAllProducts()

			const productsByModelGroup = allProds.filter(prod => prod.modelGroup === modelGroup)
			return productsByModelGroup
		} catch (error) {
			throw error

		}
	}

	async getAllProducts() {
		try {
			const res = await fetch(this.baseUrl)

			const data = await res.json()

			if (!data || !Array.isArray(data)) throw new Error("Products is not defined")

			const products = data.flatMap(el =>
				el.models.map(model => ({
					...model,
					shareModels: el.shareModels,
					mainCharacteristics: el.mainCharacteristics,
					display: el.display,
					dimensions: el.dimensions,
					camera: el.camera,
					features: el.features,
					battery: el.battery,
					hardware: el.hardware,
					connectivity: el.connectivity,
					energy: el.energy
				}))
			)
			return products
		} catch (error) {
			throw error
		}
	}

	async getProductInfo(productLink) {
		try {
			const allProds = await this.getAllProducts()

			const product = allProds.find(prod => prod.productLink === productLink)
			return product
		} catch (error) {
			throw error
		}
	}
}

const productService = new ProductService()

export default productService