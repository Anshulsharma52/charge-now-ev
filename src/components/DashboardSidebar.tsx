import { Zap, LayoutDashboard, MapPin, CalendarCheck, CreditCard, Building2, ListChecks, IndianRupee, Settings, ShieldCheck, Users, TrendingUp, LogOut, Phone, Star, Sun, Moon } from "lucide-react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  tab: string;
  icon: React.ElementType;
}

const ownerLinks: NavItem[] = [
  { title: "Dashboard", tab: "dashboard", icon: LayoutDashboard },
  { title: "Find Stations", tab: "stations", icon: MapPin },
  { title: "My Bookings", tab: "bookings", icon: CalendarCheck },
  { title: "Payments", tab: "payments", icon: CreditCard },
  { title: "Reviews", tab: "reviews", icon: Star },
  { title: "Contact Station", tab: "contact", icon: Phone },
];

const stationLinks: NavItem[] = [
  { title: "Dashboard", tab: "dashboard", icon: LayoutDashboard },
  { title: "Bookings", tab: "bookings", icon: ListChecks },
  { title: "Pricing", tab: "pricing", icon: IndianRupee },
  { title: "EV Owners", tab: "owners", icon: Users },
  { title: "Settings", tab: "settings", icon: Settings },
];

const adminLinks: NavItem[] = [
  { title: "Overview", tab: "dashboard", icon: LayoutDashboard },
  { title: "Stations", tab: "stations", icon: Building2 },
  { title: "EV Owners", tab: "owners", icon: Users },
  { title: "Station Masters", tab: "masters", icon: ShieldCheck },
  { title: "Revenue", tab: "revenue", icon: TrendingUp },
  { title: "Commission", tab: "commission", icon: IndianRupee },
];

export function DashboardSidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Determine role from route first, then fall back to user role
  const routeRole = location.pathname.startsWith("/admin") ? "admin" : location.pathname.startsWith("/station") ? "station" : null;
  const role = routeRole || user?.role || "owner";
  const links = role === "admin" ? adminLinks : role === "station" ? stationLinks : ownerLinks;
  const currentTab = searchParams.get("tab") || "dashboard";

  const handleNavClick = (tab: string) => {
    setSearchParams({ tab });
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent>
        <div className={`p-4 flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}>
          <Zap className="h-6 w-6 text-primary shrink-0" />
          {!collapsed && <span className="font-bold text-gradient">PowerPulse</span>}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>{collapsed ? "" : role === "admin" ? "Admin" : role === "station" ? "Station" : "EV Owner"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((item) => {
                const isActive = currentTab === item.tab;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton isActive={isActive} onClick={() => handleNavClick(item.tab)}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 space-y-2">
        {/* Theme Toggle */}
        <Button
          size="sm"
          variant="ghost"
          onClick={toggleTheme}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          {theme === "dark" ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
          {!collapsed && (theme === "dark" ? "Light Mode" : "Dark Mode")}
        </Button>

        {!collapsed && user && (
          <div className="px-2">
            <div className="text-sm font-medium truncate">{user.name}</div>
            <div className="text-xs text-muted-foreground truncate">{user.email || user.phone}</div>
          </div>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {!collapsed && "Logout"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
