import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { 
  Settings, 
  Bot, 
  Twitch, 
  Youtube, 
  Save,
  Eye,
  EyeOff,
  Clock
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";

const configSchema = z.object({
  discordToken: z.string().optional(),
  discordChannelId: z.string().optional(),
  discordServerId: z.string().optional(),
  twitchClientId: z.string().optional(),
  twitchClientSecret: z.string().optional(),
  youtubeApiKey: z.string().optional(),
  checkInterval: z.number().min(30).max(3600),
  defaultMessage: z.string().min(1),
});

type ConfigData = z.infer<typeof configSchema>;

export default function Configuration() {
  const { toast } = useToast();
  const [showSecrets, setShowSecrets] = useState({
    discordToken: false,
    twitchClientSecret: false,
    youtubeApiKey: false,
  });

  const { data: config, isLoading } = useQuery({
    queryKey: ['/api/configuration'],
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
    refetchInterval: 5000,
  });

  const form = useForm<ConfigData>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      discordToken: "",
      discordChannelId: "",
      discordServerId: "",
      twitchClientId: "",
      twitchClientSecret: "",
      youtubeApiKey: "",
      checkInterval: 60,
      defaultMessage: "🔴 {streamer} is now live! 🔴",
    },
  });

  // Update form when config data loads
  React.useEffect(() => {
    if (config) {
      form.reset({
        discordToken: config.discordToken === "***" ? "" : config.discordToken || "",
        discordChannelId: config.discordChannelId || "",
        discordServerId: config.discordServerId || "",
        twitchClientId: config.twitchClientId || "",
        twitchClientSecret: config.twitchClientSecret === "***" ? "" : config.twitchClientSecret || "",
        youtubeApiKey: config.youtubeApiKey === "***" ? "" : config.youtubeApiKey || "",
        checkInterval: config.checkInterval || 60,
        defaultMessage: config.defaultMessage || "🔴 {streamer} is now live! 🔴",
      });
    }
  }, [config, form]);

  const updateConfigMutation = useMutation({
    mutationFn: async (data: ConfigData) => {
      // Filter out empty strings for sensitive fields
      const cleanData = {
        ...data,
        discordToken: data.discordToken || undefined,
        twitchClientSecret: data.twitchClientSecret || undefined,
        youtubeApiKey: data.youtubeApiKey || undefined,
      };
      
      const response = await apiRequest('POST', '/api/configuration', cleanData);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Configuration updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ['/api/configuration'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update configuration",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ConfigData) => {
    updateConfigMutation.mutate(data);
  };

  const toggleSecretVisibility = (field: keyof typeof showSecrets) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (isLoading) {
    return (
      <div>
        <header className="bg-white shadow-sm border-b border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Settings size={24} className="text-gray-700" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Configuration</h2>
              <p className="text-gray-600 mt-1">Configure your bot settings and API keys</p>
            </div>
          </div>
        </header>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-1/4" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-10 bg-gray-200 rounded w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <Settings size={24} className="text-gray-700" />
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Configuration</h2>
            <p className="text-gray-600 mt-1">Configure your bot settings and API keys</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Discord Configuration */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 discord-btn rounded-lg flex items-center justify-center">
                      <Bot size={20} className="text-white" />
                    </div>
                    <div>
                      <CardTitle>Discord Configuration</CardTitle>
                      <p className="text-sm text-gray-600">Set up your Discord bot</p>
                    </div>
                  </div>
                  <Badge className={stats?.botConnected ? "success-btn" : "bg-gray-500"}>
                    {stats?.botConnected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="discordToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discord Bot Token</FormLabel>
                      <FormDescription>
                        Create a bot at https://discord.com/developers/applications
                      </FormDescription>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            type={showSecrets.discordToken ? "text" : "password"}
                            placeholder="Enter Discord bot token"
                            {...field} 
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-0 h-full px-2"
                          onClick={() => toggleSecretVisibility('discordToken')}
                        >
                          {showSecrets.discordToken ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discordChannelId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discord Channel ID</FormLabel>
                      <FormDescription>
                        Right-click on your channel and select "Copy ID"
                      </FormDescription>
                      <FormControl>
                        <Input 
                          placeholder="Enter channel ID"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discordServerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discord Server ID</FormLabel>
                      <FormDescription>
                        Right-click on your server and select "Copy ID"
                      </FormDescription>
                      <FormControl>
                        <Input 
                          placeholder="Enter server ID"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Twitch Configuration */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 twitch-btn rounded-lg flex items-center justify-center">
                      <Twitch size={20} className="text-white" />
                    </div>
                    <div>
                      <CardTitle>Twitch Configuration</CardTitle>
                      <p className="text-sm text-gray-600">Set up Twitch API access</p>
                    </div>
                  </div>
                  <Badge className={config?.twitchClientId ? "success-btn" : "bg-gray-500"}>
                    {config?.twitchClientId ? "Configured" : "Not configured"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="twitchClientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitch Client ID</FormLabel>
                      <FormDescription>
                        Get your client ID from https://dev.twitch.tv/console/apps
                      </FormDescription>
                      <FormControl>
                        <Input 
                          placeholder="Enter Twitch client ID"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="twitchClientSecret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitch Client Secret</FormLabel>
                      <FormDescription>
                        Get your client secret from https://dev.twitch.tv/console/apps
                      </FormDescription>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            type={showSecrets.twitchClientSecret ? "text" : "password"}
                            placeholder="Enter Twitch client secret"
                            {...field} 
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-0 h-full px-2"
                          onClick={() => toggleSecretVisibility('twitchClientSecret')}
                        >
                          {showSecrets.twitchClientSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* YouTube Configuration */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 youtube-btn rounded-lg flex items-center justify-center">
                      <Youtube size={20} className="text-white" />
                    </div>
                    <div>
                      <CardTitle>YouTube Configuration</CardTitle>
                      <p className="text-sm text-gray-600">Set up YouTube API access</p>
                    </div>
                  </div>
                  <Badge className={config?.youtubeApiKey ? "success-btn" : "bg-gray-500"}>
                    {config?.youtubeApiKey ? "Configured" : "Not configured"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="youtubeApiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>YouTube API Key</FormLabel>
                      <FormDescription>
                        Get your API key from https://console.cloud.google.com/
                      </FormDescription>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            type={showSecrets.youtubeApiKey ? "text" : "password"}
                            placeholder="Enter YouTube API key"
                            {...field} 
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-0 h-full px-2"
                          onClick={() => toggleSecretVisibility('youtubeApiKey')}
                        >
                          {showSecrets.youtubeApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* General Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
                    <Clock size={20} className="text-white" />
                  </div>
                  <div>
                    <CardTitle>General Settings</CardTitle>
                    <p className="text-sm text-gray-600">Configure bot behavior</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="checkInterval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check Interval (seconds)</FormLabel>
                      <FormDescription>
                        How often to check for stream status (30-3600 seconds)
                      </FormDescription>
                      <FormControl>
                        <Input 
                          type="number"
                          min="30"
                          max="3600"
                          placeholder="60"
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defaultMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Notification Message</FormLabel>
                      <FormDescription>
                        Use {'{streamer}'} as a placeholder for the streamer name
                      </FormDescription>
                      <FormControl>
                        <Textarea 
                          placeholder="🔴 {streamer} is now live! 🔴"
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="discord-btn"
                disabled={updateConfigMutation.isPending}
              >
                <Save size={16} className="mr-2" />
                {updateConfigMutation.isPending ? "Saving..." : "Save Configuration"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
