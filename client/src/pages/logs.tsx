import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Trash2, 
  Download, 
  RefreshCw,
  Check,
  AlertTriangle,
  Info,
  X
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function Logs() {
  const { toast } = useToast();

  const { data: logs, isLoading } = useQuery({
    queryKey: ['/api/logs'],
    refetchInterval: 5000,
  });

  const clearLogsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', '/api/logs');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Logs cleared successfully!" });
      queryClient.invalidateQueries({ queryKey: ['/api/logs'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to clear logs",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  const handleClearLogs = () => {
    if (window.confirm("Are you sure you want to clear all logs?")) {
      clearLogsMutation.mutate();
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/logs'] });
  };

  const handleExport = () => {
    if (!logs || logs.length === 0) {
      toast({ title: "No logs to export", variant: "destructive" });
      return;
    }

    const logData = logs.map((log: any) => ({
      timestamp: new Date(log.createdAt).toISOString(),
      type: log.type,
      message: log.message,
      details: log.details || '',
    }));

    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `streambot-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ title: "Logs exported successfully!" });
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success': return <Check size={16} className="text-green-600" />;
      case 'warning': return <AlertTriangle size={16} className="text-yellow-600" />;
      case 'error': return <X size={16} className="text-red-600" />;
      default: return <Info size={16} className="text-blue-600" />;
    }
  };

  const getLogBadge = (type: string) => {
    switch (type) {
      case 'success': return <Badge className="success-btn">Success</Badge>;
      case 'warning': return <Badge className="warning-btn">Warning</Badge>;
      case 'error': return <Badge className="error-btn">Error</Badge>;
      default: return <Badge variant="secondary">Info</Badge>;
    }
  };

  const getLogStats = () => {
    if (!logs) return { total: 0, success: 0, warning: 0, error: 0 };
    
    return {
      total: logs.length,
      success: logs.filter((log: any) => log.type === 'success').length,
      warning: logs.filter((log: any) => log.type === 'warning').length,
      error: logs.filter((log: any) => log.type === 'error').length,
    };
  };

  const stats = getLogStats();

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText size={24} className="text-gray-700" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Activity Logs</h2>
              <p className="text-gray-600 mt-1">Monitor bot activity and troubleshoot issues</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download size={16} className="mr-2" />
              Export
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleClearLogs}
              disabled={clearLogsMutation.isPending}
            >
              <Trash2 size={16} className="mr-2" />
              Clear Logs
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Logs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="text-blue-600" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success</p>
                  <p className="text-2xl font-bold text-[hsl(123,38%,57%)]">{stats.success}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Check className="text-green-600" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Warnings</p>
                  <p className="text-2xl font-bold text-[hsl(36,100%,60%)]">{stats.warning}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="text-yellow-600" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Errors</p>
                  <p className="text-2xl font-bold text-[hsl(4,90%,58%)]">{stats.error}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <X className="text-red-600" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg animate-pulse">
                    <div className="w-6 h-6 bg-gray-200 rounded" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !logs || logs.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No logs available</h3>
                <p className="text-gray-600">Activity logs will appear here as the bot operates</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {logs.map((log: any) => (
                  <div key={log.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 mt-0.5">
                      {getLogIcon(log.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900">{log.message}</p>
                        {getLogBadge(log.type)}
                      </div>
                      {log.details && (
                        <p className="text-sm text-gray-600 mb-2">{log.details}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
