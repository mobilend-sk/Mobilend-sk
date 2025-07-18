"use client"
import Hero from "./Hero/Hero"
import Sliders from "../../components/Sliders/Sliders"

const HomePage = () => {

	return (
		<main>
			<Hero />
			<Sliders type={"discount"} />
		</main>
	)
}

export default HomePage