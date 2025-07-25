"use client"
import Hero from "./Hero/Hero"
import Sliders from "../../components/Sliders/Sliders"
import BlogSlider from "../../components/BlogSlider/BlogSlider"
import HomeAdvantages from "./HomeAdvantages/HomeAdvantages"

const HomePage = ({ blogPosts = [] }) => {

	return (
		<main>
			<Hero />
			<Sliders type={"popular"} title={"Populárne tovary v obchode Mobilend"} />
			<Sliders type={"discount"} title={"Tovary so zľavou - ušetrite už dnes!"} />
			<Sliders type={"model"} model={"Iphones"} title={"Najnovšie modely iPhone"} />
			<Sliders type={"model"} model={"Samsung Galaxy"} title={"Samsung Galaxy - prémiové smartfóny"} />

			{/* Блог секция - показываем только если есть статьи */}
			{blogPosts.length > 0 && (
				<BlogSlider
					posts={blogPosts}
					title="Naše najnovšie články"
					subtitle="Prečítajte si užitočné tipy a recenzie o mobilných telefónoch"
					className="BlogSlider--large"
					cardVariant="compact"
					slidesToShow={3}
					autoplay={true}
				/>
			)}

			<HomeAdvantages />
		</main>
	)
}

export default HomePage