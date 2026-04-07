import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockBookings, type Station } from "@/lib/mock-data";

interface AdminRevenueProps {
  stations: Station[];
  totalRevenue: number;
  totalCommission: number;
}

const AdminRevenue = ({ stations, totalRevenue, totalCommission }: AdminRevenueProps) => {
  const completedCount = mockBookings.filter((b) => b.status === "completed").length;

  return (
    <>
      <Card className="bg-card border-border mb-6">
        <CardHeader><CardTitle className="text-base">Revenue Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <div className="text-2xl font-bold text-primary">₹{totalRevenue}</div>
              <div className="text-xs text-muted-foreground">Total Revenue</div>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <div className="text-2xl font-bold text-yellow-500">₹{totalCommission}</div>
              <div className="text-xs text-muted-foreground">Commission Earned</div>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <div className="text-2xl font-bold text-accent">{completedCount}</div>
              <div className="text-xs text-muted-foreground">Completed Bookings</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <h3 className="font-semibold mb-3">Per-Station Revenue</h3>
      <div className="space-y-3">
        {stations.filter((s) => s.status === "active").map((station) => {
          const stationBookings = mockBookings.filter((b) => b.stationId === station.id && b.status === "completed");
          const stationRevenue = stationBookings.reduce((s, b) => s + b.amount, 0);
          const stationCommission = Math.round(stationRevenue * ((station.commissionRate || 15) / 100));
          return (
            <Card key={station.id} className="bg-card border-border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{station.name}</div>
                  <div className="text-xs text-muted-foreground">{station.city} · {stationBookings.length} completed</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-primary">₹{stationRevenue}</div>
                  <div className="text-xs text-yellow-500">Commission: ₹{stationCommission} ({station.commissionRate}%)</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
};

export default AdminRevenue;
