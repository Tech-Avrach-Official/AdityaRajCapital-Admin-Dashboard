import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "@/components/common/StatusBadge";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount ?? 0);
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN");
};

const DetailItem = ({ label, value }) => (
  <div>
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="text-sm font-medium">{value ?? "-"}</div>
  </div>
);

const SummaryCard = ({ title, value }) => (
  <div className="rounded-lg border bg-muted px-4 py-3 text-center">
    <div className="text-xs text-muted-foreground">{title}</div>
    <div className="text-lg font-semibold">{value}</div>
  </div>
);

const InvestorDetails = ({ open, setOpen, investor, loading }) => {
  if (!investor) return null;
  console.log("investor:", investor);
  const idLabel =
    investor.client_id ?? investor.client_number ?? investor.id ?? "-";

  const status =
    investor.status ?? (investor.kyc_complete ? "complete" : "pending");

  const summary = investor.purchase_summary ?? {};

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Investor Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4 py-8">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <Avatar className="h-16 w-16">
                <AvatarImage src={investor.profile_image} />
                <AvatarFallback>{investor.name?.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-lg font-semibold">{investor.name}</div>
                  <StatusBadge status={status} />
                </div>
                <div className="text-sm text-muted-foreground">{idLabel}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DetailItem label="Email" value={investor.email} />
              <DetailItem label="Mobile" value={investor.mobile} />
              <DetailItem
                label="KYC"
                value={
                  <StatusBadge
                    status={investor.kyc_complete ? "complete" : "pending"}
                  />
                }
              />
              <DetailItem
                label="Joined"
                value={formatDate(
                  investor.created_at ?? investor.joined ?? investor.created,
                )}
              />
              <DetailItem
                label="Referral"
                value={investor.referral ?? investor.referral_code}
              />
              <DetailItem
                label="Has Nominees"
                value={investor.has_nominees ? "Yes" : "No"}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <SummaryCard
                title="Investments"
                value={
                  investor.total_investments_count ??
                  summary.total_verified_count ??
                  investor.verified_count ??
                  0
                }
              />
              <SummaryCard
                title="Total Invested"
                value={formatCurrency(
                  investor.total_invested_amount ??
                    summary.total_invested_amount ??
                    investor.total_invested,
                )}
              />
              <SummaryCard
                title="Last Verified"
                value={formatDate(
                  summary.last_verified_at ?? investor.last_verified,
                )}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InvestorDetails;
