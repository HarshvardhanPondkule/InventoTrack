"use client"
import { Product, OrderItem } from '../types'
import { useUser } from '@clerk/nextjs'
import React, { useEffect, useState } from 'react'
import { deductStockWithTransaction, readProducts } from '../actions'
import Wrapper from '../components/Wrapper'
import ProductComponent from '../components/ProductComponent'
import EmptyState from '../components/EmptyState'
import ProductImage from '../components/ProductImage'
import { Trash } from 'lucide-react'
import { toast } from 'react-toastify'

const Page = () => {
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress

  const [products, setProducts] = useState<Product[]>([])
  const [order, setOrder] = useState<OrderItem[]>([])
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (email) {
          const products = await readProducts(email)
          if (products) setProducts(products)
        }
      } catch (error) {
        console.error(error)
      }
    }

    if (email) fetchProducts()
  }, [email])

  const filteredAvailableProducts = products
    .filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(product => !selectedProductIds.includes(product.id))
    .slice(0, 10)

  const handleAddToCart = (product: Product) => {
    setOrder(prevOrder => {
      const existingProduct = prevOrder.find(item => item.productId === product.id)
      let updatedOrder

      if (existingProduct) {
        updatedOrder = prevOrder.map(item =>
          item.productId === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.quantity) }
            : item
        )
      } else {
        updatedOrder = [
          ...prevOrder,
          {
            productId: product.id,
            quantity: 1,
            unit: product.unit,
            imageUrl: product.imageUrl,
            name: product.name,
            availableQuantity: product.quantity,
          }
        ]
      }

      setSelectedProductIds(prevSelected =>
        prevSelected.includes(product.id) ? prevSelected : [...prevSelected, product.id]
      )

      return updatedOrder
    })
  }

  const handleQuantityChange = (productId: string, quantity: number) => {
    setOrder(prevOrder =>
      prevOrder.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    )
  }

  const handleRemoveFromCart = (productId: string) => {
    setOrder(prevOrder => {
      const updatedOrder = prevOrder.filter(item => item.productId !== productId)
      setSelectedProductIds(prevSelected => prevSelected.filter(id => id !== productId))
      return updatedOrder
    })
  }

  const handleSubmit = async () => {
    try {
      if (order.length === 0) {
        toast.error("Please add products to your order.")
        return
      }

      const response = await deductStockWithTransaction(order, email!)

      if (response?.success) {
        toast.success("Stock has been updated successfully!")
        setOrder([])
        setSelectedProductIds([])
        const refreshedProducts = await readProducts(email!)
        if (refreshedProducts) setProducts(refreshedProducts)
      } else {
        // Type guard to safely access message property without using 'any'
        if (
          response &&
          typeof response === "object" &&
          "message" in response &&
          typeof (response as { message?: unknown }).message === "string"
        ) {
          toast.error((response as { message: string }).message)
        } else {
          toast.error("Something went wrong")
        }
      }
    } catch (error) {
      console.error(error)
      toast.error("An unexpected error occurred.")
    }
  }

  return (
    <Wrapper>
      <div className="flex md:flex-row flex-col-reverse">
        <div className="md:w-1/3">
          <input
            type="text"
            placeholder="Search a product..."
            className="input input-bordered w-full mb-4"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <div className="space-y-4">
            {filteredAvailableProducts.length > 0 ? (
              filteredAvailableProducts.map((product, index) => (
                <ProductComponent
                  key={index}
                  add={true}
                  product={product}
                  handleAddToCart={handleAddToCart}
                />
              ))
            ) : (
              <EmptyState message="No product available" IconComponent="PackageSearch" />
            )}
          </div>
        </div>

        <div className="md:w-2/3 p-4 md:ml-4 mb-4 md:mb-0 h-fit border-2 border-base-200 rounded-3xl overflow-x-auto">
          {order.length > 0 ? (
            <>
              <table className="table w-full scroll-auto">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {order.map(item => (
                    <tr key={item.productId}>
                      <td>
                        <ProductImage
                          src={item.imageUrl}
                          alt={item.name}
                          heightClass="h-12"
                          widthClass="w-12"
                        />
                      </td>
                      <td>{item.name}</td>
                      <td>
                        <input
                          type="number"
                          value={item.quantity}
                          min={1}
                          max={item.availableQuantity}
                          className="input input-bordered w-20"
                          onChange={e =>
                            handleQuantityChange(item.productId, Number(e.target.value))
                          }
                        />
                      </td>
                      <td className="capitalize">{item.unit}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-error"
                          onClick={() => handleRemoveFromCart(item.productId)}
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={handleSubmit} className="btn btn-primary mt-4 w-fit">
                Confirm Stock Update
              </button>
            </>
          ) : (
            <EmptyState message="No product in cart" IconComponent="HandHeart" />
          )}
        </div>
      </div>
    </Wrapper>
  )
}

export default Page