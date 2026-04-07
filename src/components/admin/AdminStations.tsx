import { Ban, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Station } from "@/lib/mock-data";
import { toast } from "sonner";

interface AdminStationsProps {
  stations: Station[];
  onUpdateStatus: (id: string, status: Station["status"]) => void;
}

const AdminStations = ({ stations, onUpdateStatus }: AdminStationsProps) => {
  const handleStatus = (id: string, status: Station["status"]) => {
    onUpdateStatus(id, status);
    toast.success(
      status === "active" ? "Station approved / unsuspended!" : "Station suspended!"
    );
  };

  return (
    <div className="space-y-3">
      {stations.map((station, i) => (
        <motion.div key={station.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{station.name}</span>
                  <Badge
                    variant="outline"
                    className={
                      station.status === "active"
                        ? "border-green-500/30 text-green-500"
                        : station.status === "pending"
                        ? "border-yellow-500/30 text-yellow-500"
                        : "border-destructive/30 text-destructive"
                    }
                  >
                    {station.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {station.address}, {station.city} · {station.slots} slots
                </div>
                <div className="text-xs text-muted-foreground">
                  AC: ₹{station.pricePerKWhAC}/kWh · DC: ₹{station.pricePerKWhDC}/kWh · Commission: {station.commissionRate || 15}%
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {station.status !== "active" && (
                  <Button size="sm" onClick={() => handleStatus(station.id, "active")} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    {station.status === "suspended" ? "Unsuspend" : "Approve"}
                  </Button>
                )}
                {station.status === "active" && (
                  <Button size="sm" variant="outline" onClick={() => handleStatus(station.id, "suspended")} className="border-destructive/30 text-destructive hover:bg-destructive/10">
                    <Ban className="h-3.5 w-3.5 mr-1" /> Suspend
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default AdminStations;
