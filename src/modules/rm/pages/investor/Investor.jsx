import React, { useState, useEffect, useMemo } from "react";
import { Search, Download, X } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useNavigate } from "react-router-dom"
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

import { subUsers } from "@/modules/rm/api/services/subUsers";
// import InvestorDetails from "./components/InvestorDetails";

const Investor = () => {
  const [investors, setInvestors] = useState([]);
  const [filteredInvestors, setFilteredInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
const navigate = useNavigate()
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [kycFilter, setKycFilter] = useState("all");

  // const [selectedInvestor, setSelectedInvestor] = useState(null);
  // const [open, setOpen] = useState(false);
  // const [detailLoading, setDetailLoading] = useState(false);
  useEffect(() => {
    const loadInvestors = async () => {
      try {
        const data = await subUsers.getSubUsers();

        const list = data?.investors ?? [];

        setInvestors(list);
        setFilteredInvestors(list);
      } catch (err) {
        toast.error("Failed to load investors");
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    loadInvestors();
  }, []);

  useEffect(() => {
    let list = [...investors];

    if (search) {
      const s = search.toLowerCase();

      list = list.filter(
        (i) =>
          i.name?.toLowerCase().includes(s) ||
          i.email?.toLowerCase().includes(s) ||
          i.client_id?.toLowerCase().includes(s) ||
          i.mobile?.includes(s),
      );
    }

    if (statusFilter !== "all") {
      list = list.filter((i) => i.status === statusFilter);
    }

    if (kycFilter !== "all") {
      list = list.filter((i) =>
        kycFilter === "complete" ? i.kyc_complete === 1 : i.kyc_complete === 0,
      );
    }

    setFilteredInvestors(list);
  }, [search, statusFilter, kycFilter, investors]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount ?? 0);
  };

  const handleExport = () => {
    if (!filteredInvestors.length) {
      toast.error("No investors to export");
      return;
    }

    const headers = [
      "Client ID",
      "Name",
      "Email",
      "Mobile",
      "Status",
      "KYC",
      "Commission Earned",
      "Created At",
    ];

    const rows = filteredInvestors.map((i) => [
      i.client_id,
      i.name,
      i.email,
      i.mobile,
      i.status,
      i.kyc_complete ? "Complete" : "Pending",
      i.commission_earned,
      i.created_at,
    ]);

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "investors.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "client_id",
        header: "Client ID",
      },

      {
        accessorKey: "name",
        header: "Investor",
        cell: ({ row }) => {
          const i = row.original;

          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={i.profile_image} />
                <AvatarFallback>{i.name?.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="font-medium">{i.name}</div>
            </div>
          );
        },
      },

      {
        accessorKey: "email",
        header: "Email",
      },

      {
        accessorKey: "referral_code",
        header: "Referral Code",
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.referral_code || "-"}
          </span>
        ),
      },

      {
        id: "source",
        header: "Source",
        cell: ({ row }) => {
          const i = row.original;

          if (i.rm_id) {
            return <span className="text-blue-600 font-medium">RM</span>;
          }

          if (i.partner_id) {
            return <span className="text-green-600 font-medium">Partner</span>;
          }

          return "-";
        },
      },

      // {
      //   accessorKey: "status",
      //   header: "Status",
      //   cell: ({ row }) => <StatusBadge status={row.original.status} />,
      // },

      // {
      //   accessorKey: "kyc_complete",
      //   header: "KYC",
      //   cell: ({ row }) => (
      //     <StatusBadge
      //       status={row.original.kyc_complete ? "complete" : "pending"}
      //     />
      //   ),
      // },

      {
        accessorKey: "commission_earned",
        header: "RM Commission",
        cell: ({ row }) => (
          <span className="font-medium">
            {formatCurrency(row.original.commission_earned)}
          </span>
        ),
      },

      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) =>
          new Date(row.original.created_at).toLocaleDateString("en-IN"),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filteredInvestors,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
  // const openInvestor = async (investor) => {
  //   console.log("investor:", investor);
  //   const investorId =
  //     investor?.id ??
  //     investor?.client_id ??
  //     investor?.investor_id ??
  //     investor?.client_number;
  //   //  console.log("investor:", investorId);
  //   if (!investorId) {
  //     toast.error("Unable to determine investor ID");
  //     return;
  //   }

  //   setSelectedInvestor(investor);
  //   setOpen(true);
  //   setDetailLoading(true);

  //   try {
  //     const res = await subUsers.getInvestorDetail(investorId);
  //     console.log("res:", res);
  //     setSelectedInvestor(res ?? investor);
  //   } catch (err) {
  //     toast.error("Failed to load investor details");
  //     console.log(err);
  //   } finally {
  //     setDetailLoading(false);
  //   }
  // };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Investors"
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
            placeholder="Search investors..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select value={kycFilter} onValueChange={setKycFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="KYC" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="complete">Complete</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => {
            setSearch("");
            setStatusFilter("all");
            setKycFilter("all");
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
                        header.getContext(),
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => {
                  const status = row.original.kyc_complete;
                  const borderClass =
                    status === 1
                      ? "border-l-4 border-l-green-500"
                      : "border-l-4 border-l-orange-500";

                  return (
                    <TableRow
                      key={row.id}
                      className={`${borderClass} cursor-pointer hover:bg-muted/50`}
                       onClick={() =>
  navigate(`/rm/investors/${row.original.id}`)
}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center h-24"
                  >
                    No investors found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      {/* <InvestorDetails
        open={open}
        setOpen={setOpen}
        investor={selectedInvestor}
        loading={detailLoading}
      /> */}
    </div>
  );
};

export default Investor;
