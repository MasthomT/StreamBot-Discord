import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  MessageCircle, 
  Trash2, 
  ExternalLink,
  Calendar,
  Hash
} from "lucide-react";

export default function Notifications() {
  const { data: messages, isLoading } = useQuery({
    queryKey: ['/api/discord-messages'],
    // This endpoint doesn't exist in our routes, but we'll show the structure
    enabled: false,
  });

  const { data: streamers } = useQuery({
    queryKey: ['/api/streamers'],
  });

  const activeNotifications = streamers?.filter((s: any) => s.isLive) || [];

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <Bell size={24} className="text-gray-700" />
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Notifications</h2>
            <p className="text-gray-600 mt-1">Manage active notification messages</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Notifications</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {activeNotifications.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="text-blue-600" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sent Today</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {/* This would come from logs */}
                    0
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Bell className="text-green-600" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Auto-Deleted</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {/* This would come from logs */}
                    0
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Trash2 className="text-purple-600" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle size={20} />
              <span>Active Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No active notifications</h3>
                <p className="text-gray-600">Notifications will appear here when streamers go live</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeNotifications.map((streamer: any) => (
                  <div key={streamer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-[hsl(123,38%,57%)] rounded-lg flex items-center justify-center">
                        <Bell size={20} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{streamer.displayName}</h4>
                        <p className="text-sm text-gray-600">
                          {streamer.streamTitle || 'No title'}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span className="flex items-center space-x-1">
                            <Calendar size={12} />
                            <span>Live since {new Date(streamer.lastLiveAt).toLocaleTimeString()}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Hash size={12} />
                            <span>{streamer.platform}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="success-btn">
                        Active
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <ExternalLink size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Auto-delete when stream ends</h4>
                <p className="text-sm text-gray-600">Automatically remove notifications when streamers go offline</p>
              </div>
              <Badge className="success-btn">Enabled</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Notification cooldown</h4>
                <p className="text-sm text-gray-600">Prevent duplicate notifications for the same stream</p>
              </div>
              <Badge className="success-btn">Enabled</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Rich embeds</h4>
                <p className="text-sm text-gray-600">Show stream details in Discord embeds</p>
              </div>
              <Badge className="success-btn">Enabled</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
