import React, { useEffect, useState } from "react";
import { visits } from "@/modules/rm/api/services/visits";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  Filter,
  Plus,
  Eye,
  Download
} from "lucide-react";
import PageHeader from "@/components/common/PageHeader";

const VISIT_TYPE_CONFIG = {
  partner: {
    icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950",
    label: "Partner",
  },
  investor: {
    icon: Users,
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-950",
    label: "Investor",
  },
  default: {
    icon: Calendar,
    color: "text-gray-500",
    bg: "bg-gray-100 dark:bg-gray-800",
    label: "Other",
  },
};

const getTypeConfig = (type) => {
  const key = (type || "").toLowerCase();
  return VISIT_TYPE_CONFIG[key] || VISIT_TYPE_CONFIG.default;
};

const Visit = () => {

  const [visitsList, setVisitsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  const navigate = useNavigate();

  useEffect(() => {

    const loadVisits = async () => {

      try {

        const data = await visits.getVisits();
        const list = data?.visits ?? [];
        setVisitsList(list);

      } catch {

        toast.error("Failed to load visits");

      } finally {

        setLoading(false);

      }

    };

    loadVisits();

  }, []);

  const getName = (visit) =>
    visit.contact_display_name || visit.contact_name || "-";

  const getNumber = (visit) =>
    visit.contact_display_number || visit.contact_number || "-";

  const filterTypes = ["all", "partner", "investor"];

  const filtered =
    activeFilter === "all"
      ? visitsList
      : visitsList.filter(
          (v) => (v.visit_type || "").toLowerCase() === activeFilter
        );

  // EXPORT FUNCTION
  const handleExport = () => {

    if (!filtered.length) {
      toast.error("No visits to export");
      return;
    }

    const headers = ["Type", "Name", "Mobile", "Date"];

    const rows = filtered.map((visit) => [
      visit.visit_type || "-",
      getName(visit),
      getNumber(visit),
      new Date(visit.created_at).toLocaleDateString("en-IN"),
    ]);

    const csv =
      [headers, ...rows]
        .map((row) => row.join(","))
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "rm-visits.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (

    <div className="max-w-6xl mx-auto  space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">

        <PageHeader title="Visits" />

        <div className="flex gap-2">

          <Button
            variant="outline"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>

          <Button
            onClick={() => navigate("/rm/visits_new")}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Visit
          </Button>

        </div>

      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">

        <Filter className="w-4 h-4 text-muted-foreground shrink-0" />

        {filterTypes.map((type) => {

          const cfg = type === "all" ? null : getTypeConfig(type);
          const Icon = cfg?.icon;
          const isActive = activeFilter === type;

          return (

            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-muted-foreground border-border hover:bg-muted"
                }
              `}
            >

              {Icon && <Icon className="w-3.5 h-3.5" />}

              <span className="capitalize">
                {type === "all" ? "All" : cfg?.label || type}
              </span>

              {!loading && (
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold
                    ${isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"}
                  `}
                >
                  {type === "all"
                    ? visitsList.length
                    : visitsList.filter(
                        (v) => (v.visit_type || "").toLowerCase() === type
                      ).length}
                </span>
              )}

            </button>

          );

        })}

      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-hidden bg-card">

        <table className="w-full text-sm">

          <thead className="bg-muted">

            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Mobile</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Action</th>
            </tr>

          </thead>

          <tbody>

            {loading ? (

              <tr>
                <td colSpan="5" className="text-center py-10 text-muted-foreground">
                  Loading visits...
                </td>
              </tr>

            ) : filtered.length === 0 ? (

              <tr>
                <td colSpan="5" className="text-center py-10 text-muted-foreground">
                  No visits found
                </td>
              </tr>

            ) : (

              filtered.map((visit) => {

                const cfg = getTypeConfig(visit.visit_type);
                const Icon = cfg.icon;

                return (

                  <tr key={visit.id} className="border-t hover:bg-muted/30 transition-colors">

                    <td className="px-4 py-3">

                      <div className="flex items-center gap-2">

                        <span className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${cfg.bg}`}>
                          <Icon className={`w-4 h-4 ${cfg.color}`} />
                        </span>

                        <span className="capitalize text-sm font-medium">
                          {visit.visit_type || "-"}
                        </span>

                      </div>

                    </td>

                    <td className="px-4 py-3">
                      {getName(visit)}
                    </td>

                    <td className="px-4 py-3 text-muted-foreground">
                      {getNumber(visit)}
                    </td>

                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(visit.created_at).toLocaleDateString("en-IN")}
                    </td>

                    <td className="px-4 py-3 text-right">

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(`/rm/visits/${visit.id}`, { state: { visit } })
                        }
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        View
                      </Button>

                    </td>

                  </tr>

                );

              })

            )}

          </tbody>

        </table>

      </div>

    </div>

  );

};

export default Visit;