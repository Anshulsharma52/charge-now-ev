import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { io } from "socket.io-client";
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

  const queryClient = useQueryClient();
  const { data: stations = [] } = useQuery({ queryKey: ['admin-stations'], queryFn: async () => (await api.get('/stations')).data });
  const { data: bookings = [] } = useQuery({ queryKey: ['admin-bookings'], queryFn: async () => (await api.get('/bookings')).data });
  const { data: users = [] } = useQuery({ queryKey: ['admin-users'], queryFn: async () => (await api.get('/auth/users')).data });

  const [defaultCommission, setDefaultCommission] = useState(15);

  useEffect(() => {
    const socket = io("http://localhost:5000");
    socket.on("station-updated", () => {
      queryClient.invalidateQueries({ queryKey: ["admin-stations"] });
    });
    socket.on("new-booking", () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
    });
    socket.on("booking-updated", () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
    });
    socket.on("new-user", () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    });
    return () => { socket.disconnect(); };
  }, [queryClient]);

  const updateStatusMut = useMutation({
    mutationFn: async ({ id, status }: any) => await api.put(`/stations/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-stations"] })
  });

  const updateStationStatus = (id: string, status: Station["status"]) => {
    updateStatusMut.mutate({ id, status });
  };

  const updateCommissionMut = useMutation({
    mutationFn: async ({ id, commissionRate }: any) => await api.put(`/stations/${id}`, { commissionRate }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-stations"] })
  });

  const updateStationCommission = (id: string, rate: number) => {
    updateCommissionMut.mutate({ id, commissionRate: rate });
  };

  const totalRevenue = bookings.filter((b: any) => b.status === "completed").reduce((s: any, b: any) => s + b.amount, 0);
  const activeCount = stations.filter((s: any) => s.status === "active").length;

  const totalCommission = stations.reduce((sum: number, s: any) => {
    const stationId = s._id || s.id;
    const stationBookings = bookings.filter((b: any) => {
      const bStationId = b.stationId?._id || b.stationId;
      return bStationId === stationId && b.status === "completed";
    });
    const stationRevenue = stationBookings.reduce((rs: any, b: any) => rs + b.amount, 0);
    return sum + Math.round(stationRevenue * ((s.commissionRate || 15) / 100));
  }, 0);

  const recentReviews = bookings
    .filter((b: any) => b.review)
    .map((b: any) => ({ ...b.review, stationName: b.stationName }))
    .reverse()
    .slice(0, 5);

  return (
    <DashboardLayout title="Admin Panel" subtitle="Platform overview and complete management">
      {currentTab === "dashboard" && (
        <AdminOverview
          activeCount={activeCount}
          totalBookings={bookings.length}
          totalRevenue={totalRevenue}
          totalCommission={totalCommission}
          recentReviews={recentReviews}
        />
      )}
      {currentTab === "stations" && (
        <AdminStations stations={stations} onUpdateStatus={updateStationStatus} />
      )}
      {currentTab === "owners" && <AdminEVOwners users={users} bookings={bookings} />}
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
