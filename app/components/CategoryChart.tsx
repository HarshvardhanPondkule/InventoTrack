import React, { useEffect, useState } from 'react'
import { ResponsiveContainer, XAxis, YAxis, Bar, LabelList, Cell, BarChart } from 'recharts'
import { getProductCategoryDistribution } from '../actions'
import EmptyState from './EmptyState'
import { ChartData } from '../types';


interface CategoryChartProps {
  email: string
}

const CategoryChart: React.FC<CategoryChartProps> = ({ email }) => {
  const [data, setData] = useState<ChartData[]>([])

  const COLORS = {
    default: '#F1D2BF',
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (email) {
          const result = await getProductCategoryDistribution(email)
          if (result) setData(result)
        }
      } catch (error) {
        console.error('Failed to fetch category data:', error)
      }
    }

    fetchStats()
  }, [email])

  const renderChart = () => (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={data}
        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        barCategoryGap="10%"
      >
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 15, fill: '#793205', fontWeight: 'bold' }}
        />
        <YAxis hide />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          <LabelList
            dataKey="value"
            position="insideRight"
            fill="#793205"
            style={{ fontSize: '20px', fontWeight: 'bold' }}
          />
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS.default} cursor="default" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )

  return (
    <div className="w-full border-2 border-base-200 mt-4 p-4 rounded-3xl">
      <h2 className="text-xl font-bold mb-4">
        Top 5 Categories with the Most Products
      </h2>
      {data.length === 0 ? (
        <EmptyState message="No categories available at the moment" IconComponent="Group" />
      ) : (
        renderChart()
      )}
    </div>
  )
}

export default CategoryChart
