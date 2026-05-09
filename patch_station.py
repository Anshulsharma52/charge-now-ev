import re

filepath = r"c:\Users\HP\OneDrive\Desktop\Projects\charge-now-ev\src\pages\StationDashboard.tsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Imports
content = content.replace('import { useState } from "react";', 'import { useState, useEffect } from "react";\nimport { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";\nimport api from "@/lib/api";\nimport LoadingScreen from "@/components/LoadingScreen";')

# 2. Update Dashboard State
state_re = r'const stationApproved = localStorage\.getItem\("pp_station_approved"\) === "true";.+?const updateStatus = \(id: string, status: Booking\["status"\]\) => \{.+?toast\.success\(`Booking \$\{status\}!`\);.+?\};'

replacement = """const queryClient = useQueryClient();

  const { data: station, isLoading } = useQuery({
    queryKey: ['myStation'],
    queryFn: async () => {
      try {
        const res = await api.get('/stations/my-station');
        return res.data;
      } catch (e: any) {
        if (e.response?.status === 404) return null;
        throw e;
      }
    }
  });

  const { data: initialBookings = [] } = useQuery({
    queryKey: ['myStationBookings'],
    queryFn: async () => {
      const res = await api.get('/bookings');
      return res.data;
    },
    enabled: !!station && station.status === 'active'
  });

  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  useEffect(() => { setBookings(initialBookings) }, [initialBookings]);

  const [acPrice, setAcPrice] = useState("12");
  const [dcPrice, setDcPrice] = useState("18");

  const [stationName, setStationName] = useState("");
  const [stationAddress, setStationAddress] = useState("");
  const [stationCity, setStationCity] = useState("");
  const [stationSlots, setStationSlots] = useState("4");

  const pending = bookings.filter((b) => b.status === "pending");
  const approved = bookings.filter((b) => b.status === "approved");
  const completed = bookings.filter((b) => b.status === "completed");
  const rejected = bookings.filter((b) => b.status === "cancelled");
  const totalRevenue = completed.reduce((s, b) => s + b.amount, 0);

  const updateStatusMut = useMutation({
    mutationFn: async ({ id, status }: any) => await api.put(`/bookings/${id}`, { status }),
    onSuccess: (data, variables) => {
      toast.success(`Booking ${variables.status}!`);
      queryClient.invalidateQueries({ queryKey: ["myStationBookings"] });
    }
  });

  const updateStatus = (id: string, status: Booking["status"]) => {
    updateStatusMut.mutate({ id, status });
  };"""

content = re.sub(state_re, replacement, content, flags=re.DOTALL)

# 3. Update Register station
submit_re = r'const submitStationRequest = \(\) => \{.+?toast\.success\("Station registration request sent to admin!"\);.+?window\.location\.reload\(\);.+?\}'

new_submit = """const createStationMut = useMutation({
    mutationFn: async (data: any) => await api.post('/stations', data),
    onSuccess: () => {
      toast.success("Station registration request sent to admin!");
      queryClient.invalidateQueries({ queryKey: ["myStation"] });
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message || "Failed to register station");
    }
  });

  const submitStationRequest = () => {
    if (!stationName || !stationAddress || !stationCity) {
      toast.error("Please fill all fields");
      return;
    }
    
    createStationMut.mutate({
      name: stationName,
      address: stationAddress,
      city: stationCity,
      slots: +stationSlots,
      pricePerKWhAC: +acPrice,
      pricePerKWhDC: +dcPrice,
      status: "pending"
    });
  };"""

content = re.sub(submit_re, new_submit, content, flags=re.DOTALL)

# 4. Auth flow and render condition
auth_render_re = r'// If station not yet approved, show registration/pending screen.*?if \(!stationApproved\) \{.*?return \(.+?\}\);.+?\}'

new_auth_render = """if (isLoading) return <LoadingScreen />;

  // If station not yet approved or not created, show registration/pending screen
  if (!station || station.status !== "active") {
    return (
      <DashboardLayout title="Station Registration" subtitle="Register your station to start accepting bookings">
        <div className="max-w-lg mx-auto">
          {station && station.status === "pending" ? (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center">
                <Hourglass className="h-12 w-12 text-warning mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Request Pending</h2>
                <p className="text-muted-foreground text-sm">Your station registration is under review by the admin. You'll get access once approved.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" /> Register Your Station
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm">Station Name</Label>
                  <Input value={stationName} onChange={(e) => setStationName(e.target.value)} placeholder="e.g. GreenCharge Hub" className="mt-1 bg-secondary border-border" />
                </div>
                <div>
                  <Label className="text-sm">Address</Label>
                  <Input value={stationAddress} onChange={(e) => setStationAddress(e.target.value)} placeholder="e.g. MG Road, Sector 14" className="mt-1 bg-secondary border-border" />
                </div>
                <div>
                  <Label className="text-sm">City</Label>
                  <Input value={stationCity} onChange={(e) => setStationCity(e.target.value)} placeholder="e.g. Gurugram" className="mt-1 bg-secondary border-border" />
                </div>
                <div>
                  <Label className="text-sm">Number of Slots</Label>
                  <Input type="number" value={stationSlots} onChange={(e) => setStationSlots(e.target.value)} className="mt-1 bg-secondary border-border" />
                </div>
                <Button onClick={submitStationRequest} className="w-full gradient-primary text-primary-foreground">
                  <Send className="h-4 w-4 mr-2" /> Submit for Approval
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    );
  }"""

content = re.sub(auth_render_re, new_auth_render, content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("StationDashboard.tsx patched successfully!")
