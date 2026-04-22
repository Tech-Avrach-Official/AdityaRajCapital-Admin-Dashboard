import React, { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { Eye, RefreshCw } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { usersService } from "@/modules/admin/api/services/usersService"
import { cn } from "@/lib/utils"

const STATUS_OPTIONS = [
  { value: "requested", label: "Requested" },
  { value: "blocked", label: "Blocked" },
  { value: "processed", label: "Processed" },
]

function normalizeListResponse(payload) {
  const root = payload?.data ?? payload
  const data = root?.data ?? root
  const list =
    data?.requests ??
    data?.rows ??
    data?.items ??
    data?.investors ??
    data?.partners ??
    data
  const total =
    data?.total ??
    data?.count ??
    data?.requests_count ??
    data?.items_count ??
    (Array.isArray(list) ? list.length : 0)
  return {
    list: Array.isArray(list) ? list : [],
    total: Number(total) || 0,
  }
}

function pickRowIdentity(row, kind) {
  if (kind === "investors") {
    const inv = row?.investor ?? row
    return {
      id: inv?.id ?? inv?.investor_id ?? row?.investor_id ?? row?.id,
      name: inv?.name ?? row?.name,
      email: inv?.email ?? row?.email,
      mobile: inv?.mobile ?? row?.mobile,
      code: inv?.client_id ?? row?.client_id,
    }
  }
  const p = row?.partner ?? row
  return {
    id: p?.id ?? p?.partner_id ?? row?.partner_id ?? row?.id,
    name: p?.name ?? row?.name,
    email: p?.email ?? row?.email,
    mobile: p?.mobile ?? row?.mobile,
    code: p?.partner_referral_code ?? p?.referral_code ?? row?.partner_referral_code ?? row?.referral_code,
  }
}

function formatDateTime(val) {
  if (!val) return "—"
  try {
    return new Date(val).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
  } catch {
    return String(val)
  }
}

function statusBadgeVariant(status) {
  const s = String(status || "").toLowerCase()
  if (s === "processed") return "secondary"
  if (s === "blocked") return "destructive"
  return "outline"
}

const DeletionRequestsPage = () => {
  const navigate = useNavigate()
  const [tab, setTab] = useState("investors")
  const [status, setStatus] = useState("requested")
  const [limit, setLimit] = useState(50)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [confirm, setConfirm] = useState({ open: false, kind: null, row: null })
  const [processing, setProcessing] = useState(false)

  const page = useMemo(() => Math.floor(offset / limit) + 1, [offset, limit])
  const totalPages = useMemo(() => Math.max(1, Math.ceil((total || 0) / (limit || 1))), [total, limit])

  const load = async ({ nextTab = tab, nextStatus = status, nextLimit = limit, nextOffset = offset } = {}) => {
    setLoading(true)
    try {
      const params = { status: nextStatus, limit: nextLimit, offset: nextOffset }
      const res =
        nextTab === "investors"
          ? await usersService.getInvestorDeletionRequests(params)
          : await usersService.getPartnerDeletionRequests(params)
      const { list, total: t } = normalizeListResponse(res)
      setRows(list)
      setTotal(t)
    } catch (e) {
      toast.error("Failed to load deletion requests")
      setRows([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, status, limit, offset])

  const openConfirm = (kind, row) => setConfirm({ open: true, kind, row })
  const closeConfirm = () => setConfirm({ open: false, kind: null, row: null })

  const doProcess = async () => {
    if (!confirm.open || !confirm.kind || !confirm.row) return
    const kind = confirm.kind
    const picked = pickRowIdentity(confirm.row, kind)
    if (!picked.id) {
      toast.error("Missing user id for this request")
      return
    }
    setProcessing(true)
    try {
      const res =
        kind === "investors"
          ? await usersService.processInvestorDeletion(picked.id)
          : await usersService.processPartnerDeletion(picked.id)
      if (res?.success) toast.success(res?.message || "Deletion processed")
      else toast.error(res?.message || "Failed to process deletion")
      closeConfirm()
      await load()
    } catch (err) {
      const statusCode = err?.response?.status
      const data = err?.response?.data
      if (statusCode === 409 && data?.error_code === "DEL_001") {
        const reasons = Array.isArray(data?.blocked_reasons) ? data.blocked_reasons.join(", ") : ""
        toast.error(reasons ? `${data.message} (${reasons})` : data.message || "Deletion is blocked")
      } else {
        toast.error(data?.message || err?.message || "Failed to process deletion")
      }
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Deletion Requests" />

      <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Tabs value={tab} onValueChange={(v) => { setTab(v); setOffset(0) }}>
            <TabsList>
              <TabsTrigger value="investors">Investors</TabsTrigger>
              <TabsTrigger value="partners">Partners</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={status} onValueChange={(v) => { setStatus(v); setOffset(0) }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setOffset(0) }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Limit" />
            </SelectTrigger>
            <SelectContent>
              {[25, 50, 100].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2" onClick={() => load()} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>

          <div className="ml-auto text-sm text-muted-foreground">
            {loading ? "Loading…" : `${total} request(s)`}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            No {tab} deletion requests found for status “{status}”.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="font-semibold">User</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Mobile</TableHead>
                  <TableHead className="font-semibold">Requested at</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, idx) => {
                  const picked = pickRowIdentity(r, tab)
                  const reqAt =
                    r?.deletion_requested_at ??
                    r?.requested_at ??
                    r?.created_at ??
                    r?.createdAt ??
                    r?.deletion_processed_at ??
                    r?.updated_at ??
                    null
                  const s = r?.deletion_status ?? r?.status ?? status
                  return (
                    <TableRow key={picked.id ?? idx} className={cn(idx % 2 === 1 && "bg-muted/20")}>
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="font-medium text-foreground">
                            {picked.name || "—"}{" "}
                            <span className="font-mono text-xs text-muted-foreground">
                              {picked.code ? `(${picked.code})` : picked.id ? `(#${picked.id})` : ""}
                            </span>
                          </div>
                          {picked.id && (
                            <div className="text-xs text-muted-foreground">
                              ID: <span className="font-mono">{picked.id}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{picked.email || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{picked.mobile || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDateTime(reqAt)}</TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(s)}>{String(s || "requested")}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => {
                              if (!picked.id) return
                              navigate(
                                tab === "investors"
                                  ? `/admin/users/investors/${picked.id}`
                                  : `/admin/users/partners/${picked.id}`
                              )
                            }}
                            disabled={!picked.id}
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openConfirm(tab, r)}
                            disabled={!picked.id}
                          >
                            Process
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {!loading && rows.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= total}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={confirm.open} onOpenChange={(open) => (!open ? closeConfirm() : null)}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Process deletion</DialogTitle>
            <DialogDescription>
              This will process the deletion request and anonymize PII. If there are active obligations, the backend will block it.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
            {(() => {
              const picked = pickRowIdentity(confirm.row, confirm.kind)
              return (
                <div>
                  <span className="font-medium text-foreground">
                    {confirm.kind === "partners" ? "Partner" : "Investor"}:
                  </span>{" "}
                  <span className="font-medium">{picked.name || "—"}</span>{" "}
                  <span className="font-mono">{picked.code ? `(${picked.code})` : picked.id ? `(#${picked.id})` : ""}</span>
                </div>
              )
            })()}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={closeConfirm} disabled={processing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={doProcess} disabled={processing}>
              {processing ? "Processing…" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DeletionRequestsPage

