"use client"

import Logotype from "../Logotype/Logotype"
import Menu from "../Menu/Menu"
import SearchComponent from "../SearchComponent/SearchComponent"
import CartLink from "../CartLink/CartLink"
import { AlignJustify } from "lucide-react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { X } from "lucide-react"
import "./Header.scss"


const Header = () => {
	const [activeMenu, setActiveMenu] = useState(false)

	return (
		<header className={`header searched`}>
			<div className="container">
				<div className="header__wrapper">
					<Logotype />
					<div className={`header__menu ${activeMenu ? "active" : ""}`}>
						<Menu setActiveMenu={setActiveMenu} />
					</div>
					<div className="header-ico__wrapper">
						<div className="search__wrapper">
							<SearchComponent />
						</div>
						<div className="header__cart">
							<CartLink />
						</div>
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