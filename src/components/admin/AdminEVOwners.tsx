import { Mail, Phone, Car, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { mockEVOwners } from "@/lib/mock-data";

const AdminEVOwners = () => {
  return (
    <div className="space-y-3">
      {mockEVOwners.map((owner, i) => (
        <motion.div key={owner.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{owner.name}</div>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {owner.email}</span>
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {owner.phone}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Car className="h-3 w-3" /> {owner.vehicleType}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Joined: {owner.joinedDate}</span>
                  </div>
                </div>
                <div className="flex gap-4 text-center shrink-0">
                  <div>
                    <div className="text-lg font-bold text-accent">{owner.totalBookings}</div>
                    <div className="text-xs text-muted-foreground">Bookings</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-primary">₹{owner.totalSpent}</div>
                    <div className="text-xs text-muted-foreground">Spent</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default AdminEVOwners;
