import { Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Station } from "@/lib/mock-data";

interface AdminStationMastersProps {
  stations: Station[];
}

const AdminStationMasters = ({ stations }: AdminStationMastersProps) => {
  return (
    <div className="space-y-3">
      {stations.map((station, i) => (
        <motion.div key={station.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{station.ownerName}</div>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {station.ownerEmail}</span>
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {station.ownerPhone}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Station: {station.name} · {station.city} · {station.slots} slots
                  </div>
                </div>
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
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default AdminStationMasters;
