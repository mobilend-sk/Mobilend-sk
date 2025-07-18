"use client"
import "./Sliders.scss"
import ProductCard from "@/components/ProductCard/ProductCard"
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import { useEffect, useState } from "react";
import productService from "@/services/product.service";

const Sliders = ({ type, model }) => {
	const [productList, setProductList] = useState([])
	const [showSlider, setShowSlider] = useState(false)

	useEffect(() => {
		if (type) {
			loadProducts()
		}
	}, [type, model])

	const loadProducts = async () => {
		try {
			let products = []
			if (type === "popular") products = await productService.getPopularProducts()
			if (type === "discount") products = await productService.getProductsWithDiscount()
			if (type === "model" && model) products = await productService.getProductsByModel(model)

			if (!products || !Array.isArray(products) || products.length === 0) throw new Error("Products is not correct")
			setProductList(products)
			setShowSlider(true)
		} catch (error) {
			console.log(error.message);
			setShowSlider(false)
		}
	}

	if (productList.length === 0 || !showSlider) return null

	return (
		<section className="Sliders">
			<div className="container">
				<h2>Populárne tovary v obchode Mobilend</h2>
				<div className="Sliders__Swiper">
					<Swiper
						slidesPerView={'auto'}
						spaceBetween={30}
						pagination={{
							clickable: true,
						}}
						modules={[Pagination]}
						className="mySwiper"
					>
						{
							productList.map((product, index) => <SwiperSlide key={index + "-product"}><ProductCard product={product} /></SwiperSlide>)
						}

					</Swiper>

				</div>
			</div>
		</section>
	)
}

export default Sliders