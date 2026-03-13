import React from "react"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"

const COLORS = ["#6366f1", "#10b981"]

const InvestorInvestmentChart = ({ totalInvestors, totalInvestments }) => {

  const data = [
    {
      name: "Total Investors",
      value: totalInvestors
    },
    {
      name: "Total Investments",
      value: totalInvestments
    }
  ]

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">

      <h3 className="text-lg font-semibold mb-4">
        Investors vs Investments
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>

          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={3}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>

          <Tooltip />

          <Legend />

        </PieChart>
      </ResponsiveContainer>

    </div>
  )
}

export default InvestorInvestmentChart