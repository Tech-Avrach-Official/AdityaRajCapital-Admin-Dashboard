import React, { useEffect, useState, useMemo } from "react"
import { Search, Eye } from "lucide-react"
import { investorService } from "@/modules/partner/api/services/investorService"
import PageHeader from "@/components/common/PageHeader"
import StatusBadge from "@/components/common/StatusBadge"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import InvestorInvestmentModal from "./InvestorInvestmentModal"

const getInitials = (name) =>
  (name || "?")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0)

const Investors = () => {
    const [selectedInvestor, setSelectedInvestor] = useState(null)
const [openModal, setOpenModal] = useState(false)

  const [investors, setInvestors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState("")

  useEffect(() => {

    investorService
      .getInvestors()
      .then((res) => setInvestors(res.data || []))
      .catch(() => setInvestors([]))
      .finally(() => setLoading(false))

  }, [])

  const filtered = useMemo(() => {

    if (!searchValue) return investors

    const q = searchValue.toLowerCase()

    return investors.filter(
      (i) =>
        i.name?.toLowerCase().includes(q) ||
        i.email?.toLowerCase().includes(q) ||
        i.client_id?.toLowerCase().includes(q)
    )

  }, [investors, searchValue])

//   console.log("all investors:", investors)

  return (
    <div className="space-y-6">

      <PageHeader title="Investors" />

      {/* Search */}
      <div className="border rounded-xl p-4 bg-card">

        <div className="relative max-w-md">

          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

          <Input
            placeholder="Search investors..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10"
          />

        </div>

      </div>

      {/* Table */}
      <div className="border rounded-xl bg-card overflow-hidden">

        {loading ? (

          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>

        ) : filtered.length === 0 ? (

          <div className="py-12 text-center text-muted-foreground">
            No investors found
          </div>

        ) : (

          <Table>

            <TableHeader>
              <TableRow>
                <TableHead>Investor</TableHead>
                <TableHead>Client ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>Total Invested</TableHead>
                <TableHead>Investments</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>

              {filtered.map((inv) => (

                <TableRow key={inv.id}>

                  {/* Avatar + Name */}
                  <TableCell>

                    <div className="flex items-center gap-3">

                      <Avatar className="h-9 w-9">

                        <AvatarImage
                          src={inv.profile_image}
                          alt={inv.name}
                        />

                        <AvatarFallback>
                          {getInitials(inv.name)}
                        </AvatarFallback>

                      </Avatar>

                      <span className="font-medium">
                        {inv.name}
                      </span>

                    </div>

                  </TableCell>

                  <TableCell className="font-mono">
                    {inv.client_id}
                  </TableCell>

                  <TableCell>
                    {inv.email}
                  </TableCell>

                  <TableCell>
                    {inv.mobile}
                  </TableCell>

                  {/* Status */}
                  <TableCell>

                    <StatusBadge
                      status={inv.status}
                      customLabel={inv.status}
                    />

                  </TableCell>

                  {/* KYC */}
                  <TableCell>

                    <StatusBadge
                      status={inv.kyc_complete ? "verified" : "pending"}
                      customLabel={inv.kyc_complete ? "Complete" : "Pending"}
                    />

                  </TableCell>

                  {/* Investment */}
                  <TableCell className="font-medium">
                    {formatINR(inv.total_invested_amount)}
                  </TableCell>

                  <TableCell>
                    {inv.total_investments_count}
                  </TableCell>

                  {/* View */}
                  <TableCell>

                    <Button
  variant="outline"
  size="sm"
  onClick={() => {
    setSelectedInvestor({
      id: inv.id,
      commission: inv.commission_earned
    })
    setOpenModal(true)
  }}
>
  View
</Button>

                  </TableCell>

                </TableRow>

              ))}

            </TableBody>

          </Table>

        )}

       

       <InvestorInvestmentModal
  investorId={selectedInvestor?.id}
  commissionEarned={selectedInvestor?.commission}
  open={openModal}
  setOpen={setOpenModal}
/>
      </div>

    </div>
  )
}

export default Investors