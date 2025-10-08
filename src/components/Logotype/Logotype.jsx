"use client"
import Link from "next/link"

import "./Logotype.scss"

const Logotype = () => {

	return (
		<div className="Logotype">
			<Link href={"/"}>
				<img
				src={"/images/icons/logo.svg"}
				alt={"logo"}
				onError={(e) => { e.target.src = '/images/placeholder.webp' }}
				className="logoImage"
				/>
				Mobilend
			</Link>
		</div>
	)
}

export default Logotype