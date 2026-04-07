import { Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { type Station } from "@/lib/mock-data";
import { toast } from "sonner";

interface AdminCommissionProps {
  stations: Station[];
  defaultCommission: number;
  onDefaultCommissionChange: (val: number) => void;
  onStationCommissionChange: (id: string, rate: number) => void;
}

const AdminCommission = ({ stations, defaultCommission, onDefaultCommissionChange, onStationCommissionChange }: AdminCommissionProps) => {
  return (
    <>
      <Card className="bg-card border-border mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Percent className="h-5 w-5 text-primary" /> Default Commission Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4 max-w-sm">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Default Rate (%)</Label>
              <Input
                type="number"
                min={1}
                max={50}
                value={defaultCommission}
                onChange={(e) => onDefaultCommissionChange(+e.target.value)}
                className="mt-1 bg-secondary border-border"
              />
            </div>
            <Button
              onClick={() => toast.success(`Default commission set to ${defaultCommission}%`)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Save
            </Button>
          </div>
        </CardContent>
      </Card>

      <h3 className="font-semibold mb-3">Per-Station Commission</h3>
      <div className="space-y-3">
        {stations.map((station) => (
          <Card key={station.id} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{station.name}</div>
                  <div className="text-xs text-muted-foreground">{station.city} · {station.ownerName}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={station.commissionRate || 15}
                    onChange={(e) => {
                      onStationCommissionChange(station.id, +e.target.value);
                      toast.success(`${station.name} commission updated to ${e.target.value}%`);
                    }}
                    className="w-20 bg-secondary border-border text-center"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default AdminCommission;
