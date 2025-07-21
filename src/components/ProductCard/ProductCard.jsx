"use client"
import Image from "next/image"
import "./ProductCard.scss"
import { Plus } from "lucide-react"
import Link from "next/link"
import BuyButton from "../BuyButton/BuyButton"

const ProductCard = ({ product }) => {

	if (!product) return null

	return (
		<div className="ProductCard">
			<Link href={`/katalog/${product.productLink}`}>
				<div className="ProductCard__image">
					<Image src={product.mainImage ? `/data/gallery/${product.mainImage}` : "/images/placeholder.webp"} alt="Image" width={200} height={220} />
					{
						product.discount ? <div className="ProductCard__image-discount">
							-{product.discount}%
						</div> : ""
					}

					{
						product.popular ? <div className="ProductCard__image-popular">
							Populárne
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
				<BuyButton
					type="small"
					productLink={product.productLink}
					product={product}
				/>
			</div>
		</div>
	)
}

export default ProductCard