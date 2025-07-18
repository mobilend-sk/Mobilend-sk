"use client"
import { Plus } from "lucide-react"
import "./BuyButton.scss"

const BuyButton = ({ type = "small" }) => {
	return (
		<button className={`BuyButton BuyButton--${type}`}>
			{type === "full" ? "Do košíka" : <Plus />}
		</button>
	)
}

export default BuyButton