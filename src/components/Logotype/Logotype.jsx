"use client"
import Link from "next/link"
import "./Logotype.scss"

const Logotype = () => {

	return (
		<div className="Logotype">
			<Link href={"/"}>
				<img height={48} src="/logo.svg" alt="Mobilend" />
			</Link>
		</div>
	)
}

export default Logotype