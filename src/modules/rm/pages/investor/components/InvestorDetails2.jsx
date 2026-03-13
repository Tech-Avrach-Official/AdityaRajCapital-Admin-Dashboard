import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { subUsers } from "@/modules/rm/api/services/subUsers";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import StatusBadge from "@/components/common/StatusBadge";
import { getProfileImageUrl } from "@/lib/utils";
import {
  ChevronRight,
  Mail,
  Phone,
  ShieldCheck,
  Users,
  TrendingUp,
  Wallet,
  BadgeIndianRupee,
  CalendarCheck,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const getInitials = (name) =>
  (name || "?")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
    <div
      className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}
    >
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-0.5">
        {label}
      </p>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
    </div>
  </div>
);

const InvestorDetail2 = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [investor, setInvestor] = useState(location.state?.investor || null);
  const [investments, setInvestments] = useState([]);

  useEffect(() => {
    const loadInvestor = async () => {
      try {
        const res = await subUsers.getInvestorDetail(id);
        setInvestor(res);
        const resInvestments = await subUsers.getInvestorInvestments(id);
        setInvestments(resInvestments?.purchases || []);
      } catch (err) {
        console.log(err);
      }
    };
    loadInvestor();
  }, [id]);

  if (!investor)
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm animate-pulse">
        Loading investor details…
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link
          to="/rm/investors"
          className="hover:text-foreground transition-colors font-medium"
        >
          Investors
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-border" />
        <span className="text-foreground font-semibold truncate">
          {investor.name}
        </span>
      </nav>

      {/* Profile Card */}
      <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
        {/* Banner strip */}
        <div className="h-2 w-full bg-gradient-to-r from-primary via-primary/70 to-primary/30" />

        <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-5">
          <Avatar className="h-20 w-20 shrink-0 rounded-2xl border-2 border-border/60 shadow-md">
            <AvatarImage
              src={getProfileImageUrl(investor.profile_image)}
              alt={investor.name}
              className="object-cover"
            />
            <AvatarFallback className="rounded-2xl bg-primary/10 text-primary text-xl font-bold">
              {getInitials(investor.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight truncate">
                {investor.name}
              </h1>
              <StatusBadge status={investor.status} />
            </div>
            <p className="text-xs text-muted-foreground font-mono bg-muted/60 inline-block px-2 py-0.5 rounded-md mb-4">
              {investor.client_id}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <InfoItem icon={Mail} label="Email" value={investor.email} />
              <InfoItem icon={Phone} label="Mobile" value={investor.mobile} />
              <InfoItem
                icon={ShieldCheck}
                label="KYC"
                value={investor.kyc_complete ? "Complete" : "Pending"}
                valueClass={
                  investor.kyc_complete ? "text-emerald-600" : "text-amber-500"
                }
              />
              <InfoItem
                icon={Users}
                label="Nominees"
                value={investor.has_nominees ? "Added" : "None"}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Total Investments"
          value={investor.total_investments_count ?? "—"}
          accent="bg-blue-500/10 text-blue-600"
        />
        <StatCard
          icon={Wallet}
          label="Total Invested"
          value={
            investor.total_invested_amount != null
              ? `₹${Number(investor.total_invested_amount).toLocaleString("en-IN")}`
              : "—"
          }
          accent="bg-violet-500/10 text-violet-600"
        />
        <StatCard
          icon={BadgeIndianRupee}
          label="RM Commission"
          value={
            investor.commission_earned != null
              ? `₹${Number(investor.commission_earned).toLocaleString("en-IN")}`
              : "—"
          }
          accent="bg-emerald-500/10 text-emerald-600"
        />
      </div>

      {/* Investments Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight">
            Investment History
          </h2>
          <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            {investments.length} record{investments.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="rounded-2xl border border-border/50 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/60 border-b border-border/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Plan Name
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Verified
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 bg-card">
              {investments.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-muted-foreground text-sm"
                  >
                    No investments found.
                  </td>
                </tr>
              ) : (
                investments.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    <td className="px-4 py-3.5 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                        {inv.plan_name}
                      </div>
                    </td>
                    <td className="px-4 py-3.5   font-semibold">
                      ₹{Number(inv.amount).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusPill status={inv.status} />
                    </td>
                    <td className="px-4 py-3.5   ">
                      ₹
                      {Number(inv.commission_earned || 0).toLocaleString(
                        "en-IN",
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {inv.payment_verified_at ? (
                        <div className="flex items-center gap-1.5">
                          <CalendarCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          {new Date(inv.payment_verified_at).toLocaleDateString(
                            "en-IN",
                            { day: "2-digit", month: "short", year: "numeric" },
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        to={`/rm/investors/investment/${inv.id}`}
                        state={{ investment: inv }}
                        className="inline-flex items-center gap-1 text-primary text-xs font-semibold hover:underline"
                      >
                       <Button  onClick={() =>
                        navigate(`/rm/investors/investment/${inv.id}`, {
                          state: { investment: inv }
                        })
                      }>View </Button> 
                         
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon: Icon, label, value, valueClass = "" }) => (
  <div className="flex flex-col gap-0.5">
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Icon className="w-3 h-3" />
      {label}
    </div>
    <p className={`text-sm font-medium truncate ${valueClass}`}>
      {value || "—"}
    </p>
  </div>
);

const STATUS_STYLES = {
  active: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  completed: "bg-blue-500/10 text-blue-700 border-blue-200",
  pending: "bg-amber-500/10 text-amber-700 border-amber-200",
  cancelled: "bg-red-500/10 text-red-700 border-red-200",
};

const StatusPill = ({ status }) => {
  const key = (status || "").toLowerCase();
  const cls =
    STATUS_STYLES[key] || "bg-muted text-muted-foreground border-border/50";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${cls}`}
    >
      {status || "—"}
    </span>
  );
};

export default InvestorDetail2;
