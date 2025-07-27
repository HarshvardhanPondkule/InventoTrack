import { Transaction } from '../types'
import React, { useEffect, useState } from 'react'
import { getTransactions } from '../actions'
import EmptyState from './EmptyState'
import TransactionComponent from './TransactionComponent'

const RecentTransactions = ({ email }: { email: string }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (email) {
                    const txs = await getTransactions(email, 10)
                    if (txs) {
                        setTransactions(txs)
                    }
                }
            } catch (error) {
                console.error(error)
            }
        }

        if (email) fetchData()
    }, [email])

    return (
        <div className='w-full border-2 border-base-200 mt-4 p-4 rounded-3xl'>
            {transactions.length === 0 ? (
                <EmptyState
                    message='No transactions available at the moment'
                    IconComponent='CaptionsOff'
                />
            ) : (
                <div>
                    <h2 className='text-xl font-bold mb-4'>Last 10 Transactions</h2>
                    <div className='space-y-4'>
                        {transactions.map((tx) => (
                            <TransactionComponent key={tx.id} tx={tx} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default RecentTransactions
