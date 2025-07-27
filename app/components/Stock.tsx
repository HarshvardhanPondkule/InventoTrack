import { Product } from '../types'
import { useUser } from '@clerk/nextjs'
import React, { useCallback, useEffect, useState } from 'react'
import { readProducts, replenishStockWithTransaction } from '../actions'
import ProductComponent from './ProductComponent'
import { toast } from 'react-toastify'

const Stock = () => {
    const { user } = useUser()
    const email = user?.primaryEmailAddress?.emailAddress as string

    const [products, setProducts] = useState<Product[]>([])
    const [selectedProductId, setSelectedProductId] = useState<string>("")
    const [quantity, setQuantity] = useState<number>(0)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

    const fetchProducts = useCallback(async () => {
        try {
            if (email) {
                const fetchedProducts = await readProducts(email)
                if (fetchedProducts) {
                    setProducts(fetchedProducts)
                }
            }
        } catch (error) {
            console.error("Error while loading products:", error)
        }
    }, [email])

    useEffect(() => {
        if (email) {
            fetchProducts()
        }
    }, [email, fetchProducts])

    const handleProductChange = (productId: string) => {
        const product = products.find((p) => p.id === productId)
        setSelectedProduct(product || null)
        setSelectedProductId(productId)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedProductId || quantity <= 0) {
            toast.error("Please select a product and enter a valid quantity.")
            return
        }
        try {
            if (email) {
                await replenishStockWithTransaction(selectedProductId, quantity, email)
            }
            toast.success("Stock has been successfully replenished.")
            fetchProducts()
            setSelectedProductId('')
            setQuantity(0)
            setSelectedProduct(null)

            const modal = document.getElementById("my_modal_stock") as HTMLDialogElement
            if (modal) modal.close()
        } catch (error) {
            console.error("Error during submission:", error)
        }
    }

    return (
        <div>
            <dialog id="my_modal_stock" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="font-bold text-lg">Stock Management</h3>
                    <p className="py-4">Add quantities to the products available in your inventory.</p>

                    <form className='space-y-2' onSubmit={handleSubmit}>
                        <label className='block'>Select a product</label>
                        <select
                            value={selectedProductId}
                            className='select select-bordered w-full'
                            required
                            onChange={(e) => handleProductChange(e.target.value)}
                        >
                            <option value="">Select a product</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name} - {product.categoryName}
                                </option>
                            ))}
                        </select>

                        {selectedProduct && (
                            <ProductComponent product={selectedProduct} />
                        )}

                        <label className='block'>Quantity to add</label>
                        <input
                            type="number"
                            placeholder='Quantity to add'
                            value={quantity}
                            required
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className='input input-bordered w-full'
                        />

                        <button type="submit" className='btn btn-primary w-fit'>
                            Add to stock
                        </button>
                    </form>
                </div>
            </dialog>
        </div>
    )
}

export default Stock
