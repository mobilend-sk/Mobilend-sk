"use client"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import "./CartLink.scss"

const CartLink = () => {

	return (
		<div className="CartLink">
			<Link href={"/cart"}>
				<ShoppingBag />
			</Link>
		</div>
	)
}

export default CartLink