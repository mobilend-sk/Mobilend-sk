"use client"

import Logotype from "../Logotype/Logotype"
import Menu from "../Menu/Menu"
import CartLink from "../CartLink/CartLink"
import { AlignJustify } from "lucide-react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { X } from "lucide-react"
import "./Header.scss"


const Header = () => {
	const [activeMenu, setActiveMenu] = useState(false)
	const [isScrolled, setIsScrolled] = useState(false)
	const pathname = usePathname()

	useEffect(() => {
		const handleScroll = () => {
			if (pathname === '/katalog') {
				setIsScrolled(false)
				return
			}
			setIsScrolled(window.scrollY > 0)
		}

		window.addEventListener('scroll', handleScroll)
		return () => window.removeEventListener('scroll', handleScroll)
	}, [pathname])

	return (
		<header className={isScrolled ? 'scrolled' : ''}>
			<div className="container">
				<div className="header__wrapper">
					<Logotype />
					<div className={`header__menu ${activeMenu ? "active" : ""}`}>
						<Menu setActiveMenu={setActiveMenu} />
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