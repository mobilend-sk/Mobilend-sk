"use client"
import Link from "next/link"
import "./Menu.scss"

const Menu = () => {

	return (
		<nav className="Menu">
			<ul>
				<li><Link href={"/"}>Hlavná</Link></li>
				<li><Link href={"/katalog"}>Katalóg</Link></li>
				<li><Link href={"/o-nas"}>O nás</Link></li>
				<li><Link href={"/kontakty"}>Kontakty</Link></li>
			</ul>
		</nav>
	)
}

export default Menu