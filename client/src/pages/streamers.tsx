import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Plus, 
  Trash2, 
  Twitch, 
  Youtube, 
  Radio,
  Eye,
  Gamepad2
} from "lucide-react";
import AddStreamerModal from "@/components/add-streamer-modal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function Streamers() {
  const [showAddModal, setShowAddModal] = useState(false);
  const { toast } = useToast();

  const { data: streamers, isLoading } = useQuery({
    queryKey: ['/api/streamers'],
    refetchInterval: 10000,
  });

  const deleteStreamerMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/streamers/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Streamer removed successfully!" });
      queryClient.invalidateQueries({ queryKey: ['/api/streamers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove streamer",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitch': return <Twitch size={16} className="text-white" />;
      case 'youtube': return <Youtube size={16} className="text-white" />;
      default: return <Radio size={16} className="text-white" />;
    }
  };

  const getPlatformBg = (platform: string) => {
    switch (platform) {
      case 'twitch': return 'bg-[hsl(262,100%,64%)]';
      case 'youtube': return 'bg-[hsl(0,100%,50%)]';
      default: return 'bg-gray-500';
    }
  };

  const handleDelete = (id: number, displayName: string) => {
    if (window.confirm(`Are you sure you want to remove ${displayName}?`)) {
      deleteStreamerMutation.mutate(id);
    }
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Streamers</h2>
            <p className="text-gray-600 mt-1">Manage your monitored streamers</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="discord-btn">
            <Plus size={16} className="mr-2" />
            Add Streamer
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-16" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !streamers || streamers.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No streamers added yet</h3>
            <p className="text-gray-600 mb-4">Start by adding your first streamer to monitor</p>
            <Button onClick={() => setShowAddModal(true)} className="discord-btn">
              <Plus size={16} className="mr-2" />
              Add Your First Streamer
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {streamers.map((streamer: any) => (
              <Card key={streamer.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 ${getPlatformBg(streamer.platform)} rounded-lg flex items-center justify-center`}>
                        {getPlatformIcon(streamer.platform)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{streamer.displayName}</CardTitle>
                        <p className="text-sm text-gray-600">@{streamer.username}</p>
                      </div>
                    </div>
                    {streamer.isLive && (
                      <Badge className="success-btn">
                        <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
                        Live
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {streamer.isLive && (
                      <div className="space-y-2">
                        {streamer.streamTitle && (
                          <div>
                            <p className="text-sm font-medium text-gray-900 line-clamp-2">
                              {streamer.streamTitle}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-sm">
                          {streamer.gameName && (
                            <div className="flex items-center space-x-1">
                              <Gamepad2 size={14} className="text-gray-500" />
                              <span className="text-gray-600">{streamer.gameName}</span>
                            </div>
                          )}
                          {streamer.viewerCount !== null && (
                            <div className="flex items-center space-x-1">
                              <Eye size={14} className="text-gray-500" />
                              <span className="text-gray-600">
                                {streamer.viewerCount.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {!streamer.isLive && (
                      <div className="text-sm text-gray-500">
                        {streamer.lastLiveAt ? (
                          <span>Last live: {new Date(streamer.lastLiveAt).toLocaleDateString()}</span>
                        ) : (
                          <span>Never been live</span>
                        )}
                      </div>
                    )}
                    
                    {streamer.customMessage && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <strong>Custom message:</strong> {streamer.customMessage}
                      </div>
                    )}
                    
                    <div className="flex justify-end pt-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(streamer.id, streamer.displayName)}
                        disabled={deleteStreamerMutation.isPending}
                      >
                        <Trash2 size={14} className="mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AddStreamerModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal}
      />
    </div>
  );
}
