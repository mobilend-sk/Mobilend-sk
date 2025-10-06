"use client"
import Link from "next/link"

import "./Logotype.scss"

const Logotype = () => {

	return (
		<div className="Logotype">
			<Link href={"/"}>
				<img src={"./images/icons/logo.svg"} className="logoImage"/>
				Mobilend
			</Link>
		</div>
	)
}

export default Logotype