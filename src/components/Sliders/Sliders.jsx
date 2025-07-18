"use client"
import "./Sliders.scss"
import ProductCard from "@/components/ProductCard/ProductCard"
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';

const Sliders = () => {

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
						<SwiperSlide><ProductCard /></SwiperSlide>
						<SwiperSlide><ProductCard /></SwiperSlide>
						<SwiperSlide><ProductCard /></SwiperSlide>
						<SwiperSlide><ProductCard /></SwiperSlide>
						<SwiperSlide><ProductCard /></SwiperSlide>
						<SwiperSlide><ProductCard /></SwiperSlide>
						<SwiperSlide><ProductCard /></SwiperSlide>
					</Swiper>

				</div>
			</div>
		</section>
	)
}

export default Sliders