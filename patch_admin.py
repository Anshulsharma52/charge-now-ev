import re

dashboard_path = r"c:\Users\HP\OneDrive\Desktop\Projects\charge-now-ev\src\pages\AdminDashboard.tsx"
with open(dashboard_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update imports
content = content.replace('import { useState } from "react";', 'import { useState } from "react";\nimport { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";\nimport api from "@/lib/api";')

# 2. Update logic block
old_logic = r'const \[stations, setStations\] = useState<Station\[\]>\(\(\) => \{.+?\}\);\s*const \[defaultCommission, setDefaultCommission\] = useState\(15\);\s*const updateStationStatus = \(id: string, status: Station\["status"\]\) => \{.+?\};\s*const updateStationCommission = \(id: string, rate: number\) => \{.+?\};\s*const totalRevenue = mockBookings\.filter\(\(b\) => b\.status === "completed"\)\.reduce\(\(s, b\) => s \+ b\.amount, 0\);\s*const activeCount = stations\.filter\(\(s\) => s\.status === "active"\)\.length;\s*const totalCommission = stations\.reduce\(\(sum, s\) => \{.+?\}, 0\);'

new_logic = """const queryClient = useQueryClient();
  const { data: stations = [] } = useQuery({ queryKey: ['admin-stations'], queryFn: async () => (await api.get('/stations')).data });
  const { data: bookings = [] } = useQuery({ queryKey: ['admin-bookings'], queryFn: async () => (await api.get('/bookings')).data });

  const [defaultCommission, setDefaultCommission] = useState(15);

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
    const stationBookings = bookings.filter((b: any) => b.stationId === stationId && b.status === "completed");
    const stationRevenue = stationBookings.reduce((rs: any, b: any) => rs + b.amount, 0);
    return sum + Math.round(stationRevenue * ((s.commissionRate || 15) / 100));
  }, 0);"""

content = re.sub(old_logic, new_logic, content, flags=re.DOTALL)

# Update JSX usages
content = content.replace("mockBookings.length", "bookings.length")

with open(dashboard_path, 'w', encoding='utf-8') as f:
    f.write(content)

stations_path = r"c:\Users\HP\OneDrive\Desktop\Projects\charge-now-ev\src\components\admin\AdminStations.tsx"
with open(stations_path, 'r', encoding='utf-8') as f:
    s_content = f.read()

s_content = s_content.replace('station.id', '(station._id || station.id)')
# Wait, some places it's `key={station.id}` which should just use `station._id || station.id`.
s_content = s_content.replace('key={station.id}', 'key={station._id || station.id}')

with open(stations_path, 'w', encoding='utf-8') as f:
    f.write(s_content)


commission_path = r"c:\Users\HP\OneDrive\Desktop\Projects\charge-now-ev\src\components\admin\AdminCommission.tsx"
with open(commission_path, 'r', encoding='utf-8') as f:
    c_content = f.read()

c_content = c_content.replace('station.id', '(station._id || station.id)')
c_content = c_content.replace('key={station.id}', 'key={station._id || station.id}')

with open(commission_path, 'w', encoding='utf-8') as f:
    f.write(c_content)

print("Admin dashboard dynamically patched.")
