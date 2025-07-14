import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Gauge, 
  Users, 
  Settings, 
  Bell, 
  FileText, 
  Power,
  Bot
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Sidebar() {
  const [location] = useLocation();
  
  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
    refetchInterval: 5000,
  });

  const navItems = [
    { path: "/", icon: Gauge, label: "Dashboard" },
    { path: "/streamers", icon: Users, label: "Streamers" },
    { path: "/configuration", icon: Settings, label: "Configuration" },
    { path: "/notifications", icon: Bell, label: "Notifications" },
    { path: "/logs", icon: FileText, label: "Logs" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location === "/";
    return location.startsWith(path);
  };

  return (
    <aside className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 discord-btn rounded-lg flex items-center justify-center">
            <Bot className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">StreamBot</h1>
            <p className="text-sm text-gray-500">v1.0.0</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link href={item.path}>
                <span
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer",
                    isActive(item.path)
                      ? "text-[hsl(235,86%,65%)] bg-blue-50"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={cn(
              "w-3 h-3 rounded-full",
              stats?.botConnected ? "bg-[hsl(123,38%,57%)] animate-pulse" : "bg-gray-400"
            )} />
            <span className="text-sm font-medium text-gray-700">
              {stats?.botConnected ? "Bot Online" : "Bot Offline"}
            </span>
          </div>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <Power size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}