import { rmApiClient } from "../client";
import { endpoints } from "../endpoints";

function unwrap(res) {
  const data = res?.data;

  if (data && data.success === false) {
    throw new Error(data.message || "Request failed");
  }

  return data?.data ?? {};
}

export const visits = {
  async addVisits(formData) {
    const res = await rmApiClient.post(endpoints.rmReport.visit, formData,{
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    console.log("visit response:", res);
    return unwrap(res);
  },

  async getVisits() {
    const res = await rmApiClient.get(endpoints.rmReport.visit);
    console.log("visit response:", res);
    return unwrap(res);
  },
};
