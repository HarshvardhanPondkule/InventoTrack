import { StockSummary } from '../types'
import React, { useEffect, useState } from 'react'
import { getStockSummary } from '../actions'
import ProductImage from './ProductImage'
import EmptyState from './EmptyState'

const StockSummaryTable = ({ email }: { email: string }) => {
  const [data, setData] = useState<StockSummary | null>(null)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        if (email) {
          const summary = await getStockSummary(email)
          if (summary) {
            setData(summary)
          }
        }
      } catch (error) {
        console.error(error)
      }
    }

    if (email) fetchSummary()
  }, [email])

  if (!data) {
    return (
      <div className="flex justify-center items-center w-full">
        <span className="loading loading-spinner loading-xl"></span>
      </div>
    )
  }

  return (
    <div className="w-full">
      <ul className="steps steps-vertical border-2 border-base-200 w-full p-4 rounded-3xl">
        <li className="step step-primary">
          <div>
            <span className="text-sm mr-4 font-bold">Normal Stock</span>
            <div className="badge badge-soft badge-success">{data.inStockCount}</div>
          </div>
        </li>
        <li className="step step-primary">
          <div>
            <span className="text-sm mr-4 font-bold">Low Stock (≤ 2)</span>
            <div className="badge badge-soft badge-warning">{data.lowStockCount}</div>
          </div>
        </li>
        <li className="step step-primary">
          <div>
            <span className="text-sm mr-4 font-bold">Out of Stock</span>
            <div className="badge badge-soft badge-error">{data.outOfStockCount}</div>
          </div>
        </li>
      </ul>

      <div className="border-2 border-base-200 w-full p-4 rounded-3xl mt-4">
        <h2 className="text-xl font-bold mb-4">Critical Products</h2>
        {data.criticalProducts.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th></th>
                <th>Image</th>
                <th>Name</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {data.criticalProducts.map((product, index) => (
                <tr key={product.id}>
                  <th>{index + 1}</th>
                  <td>
                    <ProductImage
                      src={product.imageUrl}
                      alt={product.imageUrl}
                      heightClass="h-12"
                      widthClass="w-12"
                    />
                  </td>
                  <td>{product.name}</td>
                  <td className="capitalize">
                    {product.quantity} {product.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState message="No critical products" IconComponent="PackageSearch" />
        )}
      </div>
    </div>
  )
}

export default StockSummaryTable
