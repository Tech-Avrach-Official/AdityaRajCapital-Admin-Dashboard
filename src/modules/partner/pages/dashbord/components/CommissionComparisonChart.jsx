import React from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts"

const COLORS = ["#2563eb", "#f97316"]

const CommissionComparisonChart = ({ totalCommission, pendingCommission }) => {

  const data = [
    {
      name: "Total Commission",
      value: totalCommission,
    },
    {
      name: "Pending Commission",
      value: pendingCommission,
    },
  ]

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value || 0)
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Commission Overview
        </h3>
        <p className="text-sm text-gray-500">
          Total vs Pending Commission
        </p>
      </div>

      <div className="w-full h-[320px]">
        <ResponsiveContainer>
          <BarChart data={data} barSize={60}>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
            />

            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tickFormatter={(value) => `₹${value / 1000}k`}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              formatter={(value) => formatCurrency(value)}
              cursor={{ fill: "rgba(0,0,0,0.05)" }}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "13px",
              }}
            />

            <Bar
              dataKey="value"
              radius={[8, 8, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Bar>

          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default CommissionComparisonChart