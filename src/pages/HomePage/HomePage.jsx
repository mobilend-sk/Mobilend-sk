"use client"
import Hero from "./Hero/Hero"
import Sliders from "../../components/Sliders/Sliders"
import HomeAdvantages from "./HomeAdvantages/HomeAdvantages"

const HomePage = () => {

	return (
		<main>
			<Hero />
			<Sliders type={"popular"} title={"Populárne tovary v obchode Mobilend"} />
			<Sliders type={"discount"} title={"Tovary so zľavou - ušetrite už dnes!"} />
			<Sliders type={"model"} model={"Iphones"} title={"Najnovšie modely iPhone"} />
			<Sliders type={"model"} model={"Samsung Galaxy"} title={"Samsung Galaxy - prémiové smartfóny"} />
			<HomeAdvantages />
		</main>
	)
}

export default HomePage