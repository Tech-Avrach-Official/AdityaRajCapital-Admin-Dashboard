import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { format } from "date-fns"
import { Info } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  STAFF_ROLE_PLURALS,
  PLURAL_LABELS,
  PLURAL_TO_ROLE,
} from "@/modules/admin/api/services/staffService"
import { useStaff, useAuth, useHasPermission } from "@/modules/admin/hooks"
import NotAuthorizedPage from "@/modules/admin/pages/errors/NotAuthorizedPage"

const formatDate = (s) => (s ? format(new Date(s), "MMM dd, yyyy") : "—")

const StaffListPage = () => {
  const { rolePlural } = useParams()
  const navigate = useNavigate()
  const { isSuperAdmin } = useAuth()
  const role = PLURAL_TO_ROLE[rolePlural]
  const canCreate = useHasPermission(role ? `staff.${role.replace("_", "-")}.create` : "")

  const isValid = STAFF_ROLE_PLURALS.includes(rolePlural)
  const { items, total, loading, load } = useStaff(rolePlural)

  useEffect(() => {
    if (isValid) load({ limit: 100, offset: 0 })
  }, [isValid, load])

  if (!isValid) return <NotAuthorizedPage title="Unknown staff role" />

  return (
    <div className="space-y-6">
      <PageHeader
        title={PLURAL_LABELS[rolePlural]}
        description="Manage staff members at this role tier."
        action="Add staff"
        actionHref={`/admin/staff/${rolePlural}/new`}
        showAction={canCreate}
      />

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          {loading ? "Loading…" : `${total} member${total === 1 ? "" : "s"}`}
        </span>
        {!isSuperAdmin && total > 0 && (
          <span
            className="inline-flex items-center gap-1 text-xs"
            title="Showing items in your scope"
          >
            <Info className="h-3 w-3" />
            in your scope
          </span>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last login</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <TableRow key={`sk-${i}`}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No staff yet.
                </TableCell>
              </TableRow>
            ) : (
              items.map((s) => (
                <TableRow
                  key={s.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/admin/staff/${rolePlural}/${s.id}`)}
                >
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {s.mobile || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={s.status === "active" ? "secondary" : "outline"}
                      className={
                        s.status === "active"
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : "bg-gray-100 text-gray-700"
                      }
                    >
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(s.last_login_at)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(s.created_at)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default StaffListPage
