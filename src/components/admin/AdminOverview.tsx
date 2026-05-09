import { Building2, IndianRupee, TrendingUp, Users, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminOverviewProps {
  activeCount: number;
  totalBookings: number;
  totalRevenue: number;
  totalCommission: number;
  recentReviews?: any[];
}

const AdminOverview = ({ activeCount, totalBookings, totalRevenue, totalCommission, recentReviews = [] }: AdminOverviewProps) => {
  const stats = [
    { icon: Building2, label: "Active Stations", value: activeCount, color: "text-primary" },
    { icon: Users, label: "Total Bookings", value: totalBookings, color: "text-accent" },
    { icon: IndianRupee, label: "Total Revenue", value: `₹${totalRevenue}`, color: "text-green-500" },
    { icon: TrendingUp, label: "Commission Earned", value: `₹${totalCommission}`, color: "text-yellow-500" },
  ];

  const dailyData = [
    { day: "Mon", val: 1200 },
    { day: "Tue", val: 1800 },
    { day: "Wed", val: 950 },
    { day: "Thu", val: 2100 },
    { day: "Fri", val: 1600 },
    { day: "Sat", val: 2400 },
    { day: "Sun", val: 1900 },
  ];

  const maxVal = Math.max(...dailyData.map((d) => d.val));

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <s.icon className={`h-5 w-5 mb-2 ${s.color}`} />
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Daily Income Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {dailyData.map((d, i) => (
              <div key={d.day} className="text-center">
                <div className="h-28 flex items-end justify-center mb-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.val / maxVal) * 100}%` }}
                    transition={{ duration: 0.6, delay: i * 0.08 }}
                    className="w-8 rounded-t-md bg-primary"
                  />
                </div>
                <div className="text-xs text-muted-foreground">{d.day}</div>
                <div className="text-xs font-semibold">₹{d.val}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {recentReviews.length > 0 && (
        <Card className="bg-card border-border mt-8">
          <CardHeader>
            <CardTitle className="text-base">Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReviews.map((r, i) => (
                <div key={i} className="p-3 bg-secondary/50 rounded-lg text-sm border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{r.stationName} <span className="text-muted-foreground font-normal ml-1">by {r.userName}</span></span>
                    <div className="flex items-center gap-1 text-warning">
                      {[...Array(r.rating)].map((_, idx) => <Star key={idx} className="h-3 w-3 fill-current" />)}
                    </div>
                  </div>
                  <div className="text-muted-foreground italic">"{r.comment}"</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default AdminOverview;
