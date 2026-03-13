import React from "react"
import { Button } from "@/components/ui/button"

const RecentInvestors = ({ investors = [] }) => {

  const recentInvestors = investors.slice(0, 10)

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value || 0)

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold">
          Recent Investors
        </h3>

        <Button variant="ghost" size="sm">
          View All
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">

        <table className="w-full text-sm">

          <thead className="text-left text-gray-500 border-b">
            <tr>
              <th className="py-2">Name</th>
              <th className="py-2">Phone</th>
              <th className="py-2 text-right">Total Invested</th>
            </tr>
          </thead>

          <tbody>

            {recentInvestors.length > 0 ? (
              recentInvestors.map((investor) => (
                <tr
                  key={investor.id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="py-3 font-medium">
                    {investor.name}
                  </td>

                  <td className="py-3 text-gray-600">
                    {investor.mobile}
                  </td>

                  <td className="py-3 text-right font-medium">
                    {formatCurrency(investor.total_invested_amount)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="py-6 text-center text-gray-400">
                  No investors found
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

    </div>
  )
}

export default RecentInvestors