"use client"
import { Product, Transaction } from '../types'
import { useUser } from '@clerk/nextjs'
import React, { useEffect, useState, useCallback } from 'react'
import Wrapper from '../components/Wrapper'
import { getTransactions, readProducts } from '../actions'
import EmptyState from '../components/EmptyState'
import TransactionComponent from '../components/TransactionComponent'
import { RotateCcw } from 'lucide-react'

const ITEMS_PER_Page = 5

const Page = () => {
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress as string
  const [products, setProducts] = useState<Product[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)

  const fetchData = useCallback(async () => {
    try {
      if (email) {
        const [products, txs] = await Promise.all([
          readProducts(email),
          getTransactions(email),
        ])
        if (products) setProducts(products)
        if (txs) setTransactions(txs)
      }
    } catch (error) {
      console.error(error)
    }
  }, [email])

  useEffect(() => {
    if (email) fetchData()
  }, [email, fetchData])

  useEffect(() => {
    let filtered = transactions

    if (selectedProduct) {
      filtered = filtered.filter((tx) => tx.productId === selectedProduct.id)
    }
    if (dateFrom) {
      filtered = filtered.filter((tx) => new Date(tx.createdAt) >= new Date(dateFrom))
    }
    if (dateTo) {
      filtered = filtered.filter((tx) => new Date(tx.createdAt) <= new Date(dateTo))
    }

    setFilteredTransactions(filtered)
    setCurrentPage(1)
  }, [selectedProduct, dateFrom, dateTo, transactions])

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_Page)
  const startIndex = (currentPage - 1) * ITEMS_PER_Page
  const currentTransactions = filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_Page)

  return (
    <Wrapper>
      <div className='flex justify-between items-center flex-wrap gap-4'>
        <div className='flex md:justify-between w-full mb-4 space-x-2 md:space-x-0'>
          <div>
            <select
              className='select select-bordered md:w-64'
              value={selectedProduct?.id || ""}
              onChange={(e) => {
                const product = products.find((p) => p.id === e.target.value) || null
                setSelectedProduct(product)
              }}
            >
              <option value="">All products</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className='flex items-center space-x-2'>
            <input
              type="text"
              placeholder='Start Date'
              className='input input-bordered'
              value={dateFrom}
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = "text"
              }}
              onChange={(e) => setDateFrom(e.target.value)}
            />

            <input
              type="text"
              placeholder='End Date'
              className='input input-bordered'
              value={dateTo}
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = "text"
              }}
              onChange={(e) => setDateTo(e.target.value)}
            />

            <button
              className='btn btn-primary'
              onClick={() => {
                setSelectedProduct(null)
                setDateTo("")
                setDateFrom("")
              }}
            >
              <RotateCcw className='w-4 h-4' />
            </button>
          </div>
        </div>

        {transactions.length === 0 ? (
          <EmptyState
            message='No transactions yet'
            IconComponent='CaptionsOff'
          />
        ) : (
          <div className='space-y-4 w-full'>
            {currentTransactions.map((tx) => (
              <TransactionComponent key={tx.id} tx={tx} />
            ))}
          </div>
        )}

        {filteredTransactions.length > ITEMS_PER_Page && (
          <div className="join">
            <button
              className="join-item btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              «
            </button>
            <button className="join-item btn">
              Page {currentPage}
            </button>
            <button
              className="join-item btn"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              »
            </button>
          </div>
        )}
      </div>
    </Wrapper>
  )
}

export default Page
