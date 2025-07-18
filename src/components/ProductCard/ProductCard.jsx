"use client"
import Image from "next/image"
import "./ProductCard.scss"
import { Plus } from "lucide-react"
import Link from "next/link"

const ProductCard = ({ product }) => {

	if (!product) return null

	return (
		<div className="ProductCard">
			<Link href={"/katalog/"}>
				<div className="ProductCard__image">
					<Image src={product.mainImage ? product.mainImage : "/images/placeholder.webp"} alt="Image" width={200} height={220} />
					{
						product.discount ? <div className="ProductCard__image-discount">
							-{product.discount}%
						</div> : ""
					}
				</div>
				<h3>{product.model}</h3>
			</Link>
			<div className="ProductCard__bottom">
				<div className="ProductCard__price">
					<div className="ProductCard__price-total">
						{product.price} €
					</div>
					{
						product.discount ? <div className="ProductCard__price-discount">
							{(product.price + (product.price * (product.discount / 100))).toFixed(0)} €
						</div> : ""
					}

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