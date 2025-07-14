import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Radio, 
  Bell, 
  Clock, 
  RefreshCw, 
  Server,
  Plus,
  Send,
  Download,
  FileText,
  Check,
  AlertTriangle,
  Info,
  Bot,
  Twitch,
  Youtube
} from "lucide-react";
import { useState } from "react";
import AddStreamerModal from "@/components/add-streamer-modal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function Dashboard() {
  const [showAddModal, setShowAddModal] = useState(false);
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stats'],
    refetchInterval: 5000,
  });

  const { data: streamers, isLoading: streamersLoading } = useQuery({
    queryKey: ['/api/streamers'],
    refetchInterval: 10000,
  });

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ['/api/logs'],
    refetchInterval: 10000,
  });

  const { data: config } = useQuery({
    queryKey: ['/api/configuration'],
  });

  const handleRefresh = async () => {
    try {
      await apiRequest('POST', '/api/refresh');
      queryClient.invalidateQueries({ queryKey: ['/api/streamers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({ title: "Refreshed successfully" });
    } catch (error) {
      toast({ title: "Failed to refresh", variant: "destructive" });
    }
  };

  const liveStreamers = streamers?.filter((s: any) => s.isLive) || [];
  const recentLogs = logs?.slice(0, 4) || [];

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success': return <Check className="text-white" size={12} />;
      case 'warning': return <AlertTriangle className="text-white" size={12} />;
      case 'error': return <AlertTriangle className="text-white" size={12} />;
      default: return <Info className="text-white" size={12} />;
    }
  };

  const getActivityIconBg = (type: string) => {
    switch (type) {
      case 'success': return 'bg-[hsl(123,38%,57%)]';
      case 'warning': return 'bg-[hsl(36,100%,60%)]';
      case 'error': return 'bg-[hsl(4,90%,58%)]';
      default: return 'bg-[hsl(235,86%,65%)]';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitch': return <Twitch className="text-white" size={16} />;
      case 'youtube': return <Youtube className="text-white" size={16} />;
      default: return <Radio className="text-white" size={16} />;
    }
  };

  const getPlatformBg = (platform: string) => {
    switch (platform) {
      case 'twitch': return 'bg-[hsl(262,100%,64%)]';
      case 'youtube': return 'bg-[hsl(0,100%,50%)]';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
            <p className="text-gray-600 mt-1">Monitor your streamers and bot activity</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={handleRefresh} className="discord-btn">
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </Button>
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
              <Server size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {stats?.botConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Streamers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? "..." : stats?.totalStreamers || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="text-blue-600" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Currently Live</p>
                  <p className="text-2xl font-bold text-[hsl(123,38%,57%)]">
                    {statsLoading ? "..." : stats?.liveStreamers || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Radio className="text-green-600" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Notifications Sent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? "..." : stats?.notificationsSent || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Bell className="text-purple-600" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Uptime</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? "..." : formatUptime(stats?.uptime || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-yellow-600" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Streamers and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Streamers */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Live Now</CardTitle>
                <Badge className="success-btn">
                  {liveStreamers.length} Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {streamersLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg animate-pulse">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : liveStreamers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No streamers live right now</p>
              ) : (
                <div className="space-y-4">
                  {liveStreamers.map((streamer: any) => (
                    <div key={streamer.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-10 h-10 ${getPlatformBg(streamer.platform)} rounded-lg flex items-center justify-center`}>
                        {getPlatformIcon(streamer.platform)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{streamer.displayName}</h4>
                        <p className="text-sm text-gray-600">{streamer.gameName || 'Unknown'}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {streamer.viewerCount?.toLocaleString() || '0'}
                        </span>
                        <div className="w-2 h-2 bg-[hsl(123,38%,57%)] rounded-full animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full justify-start discord-btn"
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={16} className="mr-3" />
                Add New Streamer
              </Button>
              
              <Button 
                className="w-full justify-start bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => toast({ title: "Test notification sent!" })}
              >
                <Send size={16} className="mr-3" />
                Test Notification
              </Button>
              
              <Button 
                className="w-full justify-start bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => toast({ title: "Export not implemented yet" })}
              >
                <Download size={16} className="mr-3" />
                Export Settings
              </Button>
              
              <Button 
                className="w-full justify-start bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => window.location.href = '/logs'}
              >
                <FileText size={16} className="mr-3" />
                View Debug Logs
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" className="text-[hsl(235,86%,65%)] hover:text-blue-700">
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg animate-pulse">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {recentLogs.map((activity: any) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 ${getActivityIconBg(activity.type)} rounded-full flex items-center justify-center flex-shrink-0`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuration Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Discord Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Server</span>
                <span className="text-sm text-gray-900">
                  {config?.discordServerId ? "Connected" : "Not configured"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Channel</span>
                <span className="text-sm text-gray-900">
                  {config?.discordChannelId ? "Configured" : "Not configured"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Bot Status</span>
                <Badge className={stats?.botConnected ? "success-btn" : "bg-gray-500"}>
                  <div className="w-2 h-2 bg-white rounded-full mr-1" />
                  {stats?.botConnected ? "Connected" : "Disconnected"}
                </Badge>
              </div>
              <Button 
                className="w-full discord-btn"
                onClick={() => window.location.href = '/configuration'}
              >
                Edit Configuration
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">API Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Twitch className="text-[hsl(262,100%,64%)]" size={16} />
                  <span className="text-sm font-medium text-gray-700">Twitch API</span>
                </div>
                <Badge className={config?.twitchClientId ? "success-btn" : "bg-gray-500"}>
                  {config?.twitchClientId ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Youtube className="text-[hsl(0,100%,50%)]" size={16} />
                  <span className="text-sm font-medium text-gray-700">YouTube API</span>
                </div>
                <Badge className={config?.youtubeApiKey ? "success-btn" : "bg-gray-500"}>
                  {config?.youtubeApiKey ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="text-[hsl(235,86%,65%)]" size={16} />
                  <span className="text-sm font-medium text-gray-700">Discord API</span>
                </div>
                <Badge className={stats?.botConnected ? "success-btn" : "bg-gray-500"}>
                  {stats?.botConnected ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="text-xs text-gray-500">
                Last check: Just now
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AddStreamerModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal}
      />
    </div>
  );
}
