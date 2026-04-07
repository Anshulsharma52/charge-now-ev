import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminStations from "@/components/admin/AdminStations";
import AdminEVOwners from "@/components/admin/AdminEVOwners";
import AdminStationMasters from "@/components/admin/AdminStationMasters";
import AdminRevenue from "@/components/admin/AdminRevenue";
import AdminCommission from "@/components/admin/AdminCommission";
import { mockStations, mockBookings, type Station } from "@/lib/mock-data";

const AdminDashboard = () => {
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "dashboard";

  const [stations, setStations] = useState<Station[]>(() => {
    const requestData = localStorage.getItem("pp_station_data");
    if (requestData) {
      const req = JSON.parse(requestData);
      const exists = mockStations.some((s) => s.name === req.name);
      if (!exists) {
        return [
          ...mockStations,
          {
            id: `s${Date.now()}`,
            name: req.name,
            address: req.address,
            city: req.city,
            slots: req.slots || 4,
            availableSlots: req.slots || 4,
            pricePerKWhAC: 12,
            pricePerKWhDC: 18,
            rating: 0,
            status: "pending" as const,
            lat: 28.6,
            lng: 77.2,
            ownerName: req.ownerName || "Station Owner",
            ownerEmail: req.ownerEmail || "",
            ownerPhone: req.ownerPhone || "",
            commissionRate: 15,
          },
        ];
      }
    }
    return mockStations;
  });

  const [defaultCommission, setDefaultCommission] = useState(15);

  const updateStationStatus = (id: string, status: Station["status"]) => {
    setStations((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    if (status === "active") {
      localStorage.setItem("pp_station_approved", "true");
    }
  };

  const updateStationCommission = (id: string, rate: number) => {
    setStations((prev) => prev.map((s) => (s.id === id ? { ...s, commissionRate: rate } : s)));
  };

  const totalRevenue = mockBookings.filter((b) => b.status === "completed").reduce((s, b) => s + b.amount, 0);
  const activeCount = stations.filter((s) => s.status === "active").length;

  const totalCommission = stations.reduce((sum, s) => {
    const stationBookings = mockBookings.filter((b) => b.stationId === s.id && b.status === "completed");
    const stationRevenue = stationBookings.reduce((rs, b) => rs + b.amount, 0);
    return sum + Math.round(stationRevenue * ((s.commissionRate || 15) / 100));
  }, 0);

  return (
    <DashboardLayout title="Admin Panel" subtitle="Platform overview and complete management">
      {currentTab === "dashboard" && (
        <AdminOverview
          activeCount={activeCount}
          totalBookings={mockBookings.length}
          totalRevenue={totalRevenue}
          totalCommission={totalCommission}
        />
      )}
      {currentTab === "stations" && (
        <AdminStations stations={stations} onUpdateStatus={updateStationStatus} />
      )}
      {currentTab === "owners" && <AdminEVOwners />}
      {currentTab === "masters" && <AdminStationMasters stations={stations} />}
      {currentTab === "revenue" && (
        <AdminRevenue stations={stations} totalRevenue={totalRevenue} totalCommission={totalCommission} />
      )}
      {currentTab === "commission" && (
        <AdminCommission
          stations={stations}
          defaultCommission={defaultCommission}
          onDefaultCommissionChange={setDefaultCommission}
          onStationCommissionChange={updateStationCommission}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
