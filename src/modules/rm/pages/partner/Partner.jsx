import React, { useState, useEffect, useMemo } from "react"
import { Download, Search, X } from "lucide-react"
import { toast } from "react-hot-toast"
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"

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

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

import { subUsers } from "@/modules/rm/api/services/subUsers"
import { cn } from "@/lib/utils"

const Partners = () => {

  const navigate = useNavigate()

  const [partners, setPartners] = useState([])
  const [filteredPartners, setFilteredPartners] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {

    const loadPartners = async () => {

      try {

        const data = await subUsers.getSubUsers()

        const list = data?.partners ?? []

        setPartners(list)
        setFilteredPartners(list)

      } catch {

        toast.error("Failed to load partners")

      } finally {

        setLoading(false)

      }

    }

    loadPartners()

  }, [])

  useEffect(() => {

    let list = [...partners]

    if (search) {

      const s = search.toLowerCase()

      list = list.filter((p) =>
        p.name?.toLowerCase().includes(s) ||
        p.email?.toLowerCase().includes(s) ||
        p.mobile?.includes(s)
      )

    }

    if (statusFilter !== "all") {

      list = list.filter((p) => p.status === statusFilter)

    }

    setFilteredPartners(list)

  }, [search, statusFilter, partners])

  const formatCurrency = (amount) => {

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount ?? 0)

  }

  const handleExport = () => {

    if (!filteredPartners.length) {

      toast.error("No partners to export")
      return

    }

    const headers = [
      "Name",
      "Email",
      "Mobile",
      "Status",
      "Partner Commission",
      "RM Commission",
      "Created At",
    ]

    const rows = filteredPartners.map((p) => [

      p.name,
      p.email,
      p.mobile,
      p.status,
      p.commission_earned,
      p.rm_commission_earned_from_their_investors,
      p.created_at,

    ])

    const csv = [headers, ...rows]
      .map((r) => r.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })

    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")

    a.href = url
    a.download = "partners.csv"
    a.click()

    URL.revokeObjectURL(url)

  }

  const columns = useMemo(() => [

    {
      accessorKey: "name",
      header: "Partner",
      cell: ({ row }) => {

        const p = row.original

        return (
          <div className="flex items-center gap-3">

            <Avatar className="h-9 w-9">
              <AvatarImage src={p.profile_image} />
              <AvatarFallback>
                {p.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="font-medium">{p.name}</div>

          </div>
        )

      },
    },

    {
      accessorKey: "email",
      header: "Email",
    },

    {
      accessorKey: "mobile",
      header: "Mobile",
    },

    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.status} />
      ),
    },

    {
      accessorKey: "commission_earned",
      header: "Partner Commission",
      cell: ({ row }) => (
        <span className="font-medium">
          {formatCurrency(row.original.commission_earned)}
        </span>
      ),
    },

    {
      accessorKey: "rm_commission_earned_from_their_investors",
      header: "Investor Commission",
      cell: ({ row }) => (
        <span className="font-medium">
          {formatCurrency(
            row.original.rm_commission_earned_from_their_investors
          )}
        </span>
      ),
    },

    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => (
        new Date(row.original.created_at).toLocaleDateString("en-IN")
      ),
    }

  ], [])

  const table = useReactTable({
    data: filteredPartners,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )

  return (

    <div className="space-y-6">

      <PageHeader
        title="Partners"
        actionLabel={
          <>
            <Download className="mr-2 h-4 w-4" />
            Export
          </>
        }
        onActionClick={handleExport}
      />

      <div className="flex flex-wrap gap-3">

        <div className="relative max-w-xs">

          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

          <Input
            placeholder="Search partners..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >

          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>

        </Select>

        <Button
          variant="outline"
          onClick={() => {
            setSearch("")
            setStatusFilter("all")
          }}
        >
          <X className="h-4 w-4 mr-2" />
          Clear
        </Button>

      </div>

      {loading ? (

        <LoadingSkeleton />

      ) : (

        <div className="rounded-md border">

          <Table>

            <TableHeader>

              {table.getHeaderGroups().map((headerGroup) => (

                <TableRow key={headerGroup.id}>

                  {headerGroup.headers.map((header) => (

                    <TableHead key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>

                  ))}

                </TableRow>

              ))}

            </TableHeader>

            <TableBody>

              {table.getRowModel().rows.length ? (

                table.getRowModel().rows.map((row) => {

                  const signupStatus = row.original.status

                  const borderClass =
                    signupStatus === "active"
                      ? "border-l-4 border-l-green-500"
                      : "border-l-4 border-l-orange-500"

                  return (

                    <TableRow
                      key={row.id}
                      className={cn(borderClass, "hover:bg-muted/40 cursor-pointer")}
                      onClick={() =>
                        navigate(`/rm/partners/${row.original.id}`, {
                          state: { partner: row.original }
                        })
                      }
                    >

                      {row.getVisibleCells().map((cell) => (

                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>

                      ))}

                    </TableRow>

                  )

                })

              ) : (

                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center h-24">
                    No partners found
                  </TableCell>
                </TableRow>

              )}

            </TableBody>

          </Table>

        </div>

      )}

    </div>

  )

}

export default Partners