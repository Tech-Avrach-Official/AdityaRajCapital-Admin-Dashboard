import React, { useMemo } from "react"
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Edit, Trash2, UserPlus, Copy } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import StatusBadge from "@/components/common/StatusBadge"
import { format } from "date-fns"
import { toast } from "react-hot-toast"

const RMsTable = ({ data, onView, onEdit, onDelete, onAssignPartners, onViewPartners }) => {
  // Copy RM code to clipboard
  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code)
    toast.success("RM code copied!")
  }

  const columns = useMemo(
    () => [
      // RM Code - First column
      {
        accessorKey: "rm_code",
        header: "RM Code",
        cell: ({ row }) => {
          const rmCode = row.original.rm_code || row.original.referralCode
          return (
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                {rmCode}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation()
                  copyToClipboard(rmCode)
                }}
                title="Copy RM code"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          )
        },
      },
      // Name
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <button
            onClick={() => onView(row.original)}
            className="text-primary hover:underline font-medium text-left"
          >
            {row.original.name}
          </button>
        ),
      },
      // Email
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.email}</span>
        ),
      },
      // Mobile/Phone
      {
        accessorKey: "phone_number",
        header: "Mobile",
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.phone_number || row.original.mobile}
          </span>
        ),
      },
      // Partners Count - Clickable
      {
        accessorKey: "partner_count",
        header: "Partners",
        cell: ({ row }) => {
          const count = row.original.partner_count ?? row.original.partnersCount ?? 0
          return (
            <button
              onClick={() => {
                if (onViewPartners) {
                  onViewPartners(row.original)
                } else if (onAssignPartners) {
                  onAssignPartners(row.original)
                }
              }}
              className="text-primary hover:underline font-medium"
              title="View partners"
            >
              {count}
            </button>
          )
        },
      },
      // Status
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      // Created Date
      {
        accessorKey: "created_at",
        header: "Created Date",
        cell: ({ row }) => {
          const date = row.original.created_at || row.original.createdDate
          if (!date) return "-"
          try {
            return format(new Date(date), "MMM dd, yyyy")
          } catch {
            return date
          }
        },
      },
      // Actions
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(row.original)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(row.original)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAssignPartners(row.original)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Assign Partners
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(row.original)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [onView, onEdit, onDelete, onAssignPartners, onViewPartners]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No RMs found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default RMsTable
