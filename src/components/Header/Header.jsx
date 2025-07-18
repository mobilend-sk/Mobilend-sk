"use client"

import Logotype from "../Logotype/Logotype"
import Menu from "../Menu/Menu"
import CartLink from "../CartLink/CartLink"
import { AlignJustify } from "lucide-react"
import { useState } from "react"
import { X } from "lucide-react"
import "./Header.scss"

const Header = () => {
	const [activeMenu, setActiveMenu] = useState(false)

	return (
		<header>
			<div className="container">
				<div className="header__wrapper">
					<Logotype />
					<div className={`header__menu ${activeMenu ? "active" : ""}`}>
						<Menu />
					</div>
					<div className="header__cart">
						<CartLink />
					</div>
					<button
						className="header__burger"
						onClick={() => setActiveMenu(prev => !prev)}
					>
						{
							activeMenu ? <X /> : <AlignJustify />
						}
					</button>
				</div>
			</div>
		</header>
	)
}

export default Header