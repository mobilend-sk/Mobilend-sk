"use client"
import Image from "next/image"
import "./ProductCard.scss"
import { Plus } from "lucide-react"
import Link from "next/link"

const ProductCard = () => {

	return (
		<div className="ProductCard">
			<Link href={"/katalog/"}>
				<div className="ProductCard__image">
					<Image src={"/image.png"} alt="Image" width={200} height={220} />
					<div className="ProductCard__image-discount">
						-10%
					</div>
				</div>
				<h3>Apple iPhone 14 128GB</h3>
			</Link>
			<div className="ProductCard__bottom">
				<div className="ProductCard__price">
					<div className="ProductCard__price-total">
						420 €
					</div>
					<div className="ProductCard__price-discount">
						462
					</div>
				</div>
				{/* <button className="buy-btn">Do košíka</button> */}
				<button className="buy-btn">
					<Plus />
				</button>
			</div>
		</div>
	)
}

export default ProductCard