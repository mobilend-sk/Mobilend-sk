"use client"
import Link from "next/link"
import Image from "next/image"

import "./Logotype.scss"

const Logotype = () => {
	return (
		<div className="Logotype">
			<Link href={"/"}>
				<Image
					src="/images/icons/logo.svg"
					alt="logo"
					width={40}
					height={40}
					className="logoImage"
					priority
				/>
				Mobilend
			</Link>
		</div>
	)
}

export default Logotype