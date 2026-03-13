import React, { useEffect, useState } from "react";
import { visits } from "@/modules/rm/api/services/visits";
import toast from "react-hot-toast";
import {  useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Visit = () => {
  const [visitsList, setVisitsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const loadVisits = async () => {
  
      try {
        const data = await visits.getVisits();
        const list = data?.visits ?? [];
        setVisitsList(list);
      } catch (err) {
        toast.error("Failed to load visits");
      } finally {
        setLoading(false);
      }
    };

    loadVisits();
  }, []);

  // name fallback
  const getName = (visit) =>
    visit.contact_display_name || visit.contact_name || "-";

  // number fallback
  const getNumber = (visit) =>
    visit.contact_display_number || visit.contact_number || "-";

  return (
    <div className="max-w-6xl mx-auto p-6">

      <h1 className="text-xl font-bold mb-6">RM Visits <Button onClick={() => navigate("/rm/visits/new")}>New Visit</Button></h1>

      <div className="border rounded-xl overflow-hidden bg-card">

        <table className="w-full text-sm">

          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Mobile</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-muted-foreground">
                  Loading visits...
                </td>
              </tr>
            ) : visitsList.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-muted-foreground">
                  No visits found
                </td>
              </tr>
            ) : (
              visitsList.map((visit) => (
                <tr key={visit.id} className="border-t hover:bg-muted/30">

                  <td className="px-4 py-3 capitalize">
                    {visit.visit_type}
                  </td>

                  <td className="px-4 py-3">
                    {getName(visit)}
                  </td>

                  <td className="px-4 py-3">
                    {getNumber(visit)}
                  </td>

                  <td className="px-4 py-3">
                    {new Date(visit.created_at).toLocaleDateString("en-IN")}
                  </td>

                  <td className="px-4 py-3 text-right">

                    {/* <Link
                      to={`/visits/${visit.id}`}
                      state={{ visit }}
                      className="text-primary font-medium hover:underline"
                    >
                      View
                    </Link> */}
                      <Button onClick={() => {
                        navigate(`/rm/visits/${visit.id}`,{  state: {  visit }});
                      }}>View</Button>
                  </td>

                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default Visit;