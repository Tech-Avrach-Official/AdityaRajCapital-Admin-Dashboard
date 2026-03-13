import React, { useEffect, useState } from "react"
import { investorService } from "@/modules/partner/api/services/investorService"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount)

const getInitials = (name) =>
  name
    ?.split(" ")
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

const InvestorInvestmentModal = ({ investorId,
  commissionEarned,
  open,
  setOpen }) => {

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  console.log("data", data)

  useEffect(() => {

    if (!investorId || !open) return

    setLoading(true)

    investorService
      .getInvestorInvestments(investorId)
      .then(setData)
      .finally(() => setLoading(false))

  }, [investorId, open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>

      <DialogContent className="max-w-3xl">

        <DialogHeader>
          <DialogTitle>Investor Investments</DialogTitle>
        </DialogHeader>

        {loading ? (

          <div className="space-y-4">

    <div className="flex items-center gap-4">
      <Skeleton className="h-14 w-14 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>

    <Skeleton className="h-24 w-full rounded-lg" />

    <Skeleton className="h-40 w-full rounded-lg" />

  </div>
        ) : (

          <div className="space-y-6">

            {/* Investor Info */}

            <div className="flex items-center gap-4">

              <Avatar className="h-14 w-14">

                <AvatarImage src={data?.investor_profile_image} />

                <AvatarFallback>
                  {getInitials(data?.investor_name)}
                </AvatarFallback>

              </Avatar>

              <div>

                <p className="font-semibold text-lg">
                  {data?.investor_name}
                </p>

                <p className="text-sm text-muted-foreground">
                  {data?.investor_client_id}
                </p>

              </div>

            </div>

            {/* Summary */}

<div className="grid grid-cols-2 gap-4">

  <div className="border rounded-lg p-4">

    <p className="text-sm text-muted-foreground">
      Total Investments
    </p>

    <p className="text-lg font-semibold">
      {data?.purchases?.length || 0}
    </p>

  </div>

  <div className="border rounded-lg p-4">

    <p className="text-sm text-muted-foreground">
      Commission Earned
    </p>

    <p className="text-lg font-semibold text-green-600">
      {formatINR(commissionEarned)}
    </p>

  </div>

</div>

            {/* Investments */}

            <div className="border rounded-lg overflow-hidden">

              <table className="w-full text-sm">

                <thead className="bg-muted">

                  <tr>

                    <th className="text-left p-3">
                      Plan
                    </th>

                    <th className="text-left p-3">
                      Amount
                    </th>

                    <th className="text-left p-3">
                      Status
                    </th>

                    <th className="text-left p-3">
                      Date
                    </th>

                  </tr>

                </thead>

                <tbody>

  {data?.purchases && data.purchases.length > 0 ? (

    data.purchases.map((p) => (

      <tr key={p.id} className="border-t">

        <td className="p-3 font-medium">
          {p.plan_name}
        </td>

        <td className="p-3">
          {formatINR(p.amount)}
        </td>

        <td className="p-3 capitalize">
          {p.status.replace("_", " ")}
        </td>

        <td className="p-3">
          {new Date(p.created_at).toLocaleDateString("en-IN")}
        </td>

      </tr>

    ))

  ) : (

    <tr>
      <td colSpan={4} className="p-10 text-center text-muted-foreground">

        <div className="flex flex-col items-center gap-2">

          <p className="font-medium">
            No Investments Found
          </p>

          <p className="text-sm">
            This investor has not made any investments yet.
          </p>

        </div>

      </td>
    </tr>

  )}

</tbody>

              </table>

            </div>

          </div>

        )}

      </DialogContent>

    </Dialog>
  )
}

export default InvestorInvestmentModal