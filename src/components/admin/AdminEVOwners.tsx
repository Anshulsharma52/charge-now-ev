import { Mail, Phone, Car, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface AdminEVOwnersProps {
  users?: any[];
  bookings?: any[];
}

const AdminEVOwners = ({ users = [], bookings = [] }: AdminEVOwnersProps) => {
  const evOwners = users.filter((u: any) => u.role === "evowner");

  return (
    <div className="space-y-3">
      {evOwners.map((owner, i) => {
        const ownerBookings = bookings.filter((b: any) => (b.userId?._id || b.userId) === owner._id);
        const totalBookings = ownerBookings.length;
        const totalSpent = ownerBookings.filter((b: any) => b.status === "completed").reduce((sum: number, b: any) => sum + (b.amount || 0), 0);
        
        return (
          <motion.div key={owner._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
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
                    <span className="flex items-center gap-1"><Car className="h-3 w-3" /> {owner.vehicleType || "EV"}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Joined: {new Date(owner.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-4 text-center shrink-0">
                  <div>
                    <div className="text-lg font-bold text-accent">{totalBookings}</div>
                    <div className="text-xs text-muted-foreground">Bookings</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-primary">₹{totalSpent}</div>
                    <div className="text-xs text-muted-foreground">Spent</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )})}
    </div>
  );
};

export default AdminEVOwners;
