
// 'use client';

// import React, { useEffect, useState } from 'react';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Switch } from '@/components/ui/switch';
// import { Separator } from '@/components/ui/separator';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import {
//   Shield,
//   Users,
//   Activity,
//   Settings,
//   AlertTriangle,
//   CheckCircle,
//   Search,
//   MapPin,
//   Key,
//   Eye,
//   Filter
// } from 'lucide-react';

// type AdminSettings = {
//   passwordlessEnabled: boolean;
//   otpFallbackEnabled: boolean;
//   deviceBindingEnabled: boolean;
//   locationEnabled: boolean;
//   behavioralEnabled: boolean;
// };

// const STORAGE_KEY = 'bank_admin_settings';

// const defaultSettings: AdminSettings = {
//   passwordlessEnabled: true,
//   otpFallbackEnabled: true,
//   deviceBindingEnabled: true,
//   locationEnabled: true,
//   behavioralEnabled: true,
// };

// const AdminPanel: React.FC = () => {
//   const [settings, setSettings] = useState<AdminSettings>(defaultSettings);

//   // mock data
//   const systemHealth = {
//     totalUsers: 1248,
//     activeUsers: 342,
//     flaggedAccounts: 12,
//     successfulLogins: 2341,
//     failedAttempts: 45,
//     systemStatus: 'healthy'
//   };

//   const recentLogins = [
//     { id: 1, user: 'rahul.sharma', timestamp: '2 minutes ago', location: 'Pune, IN', status: 'success', riskScore: 'low' },
//     { id: 2, user: 'priya.verma', timestamp: '5 minutes ago', location: 'Mumbai, IN', status: 'success', riskScore: 'medium' },
//     { id: 3, user: 'arjun.patel', timestamp: '8 minutes ago', location: 'Delhi, IN', status: 'failed', riskScore: 'high' },
//     { id: 4, user: 'ananya.singh', timestamp: '12 minutes ago', location: 'Bengaluru, IN', status: 'success', riskScore: 'low' }
//   ];

//   const behavioralParams = [
//     { name: 'Typing Speed', enabled: true, threshold: '150ms', current: '142ms' },
//     { name: 'Mouse Movement', enabled: true, threshold: '95%', current: '97%' },
//     { name: 'Touch Patterns', enabled: false, threshold: '90%', current: 'N/A' },
//     { name: 'Geolocation Consistency', enabled: true, threshold: '10km', current: '2.3km' },
//     { name: 'Device Tilt', enabled: false, threshold: '15°', current: 'N/A' },
//   ];

//   const suspiciousActivity = [
//     { id: 1, type: 'Multiple Failed Logins', user: 'suspicious.user', severity: 'high', timestamp: '5 min ago' },
//     { id: 2, type: 'Location Anomaly', user: 'travel.user', severity: 'medium', timestamp: '12 min ago' },
//     { id: 3, type: 'Device Mismatch', user: 'device.change', severity: 'low', timestamp: '1 hour ago' },
//   ];

//   useEffect(() => {
//     // load saved settings if any
//     try {
//       const raw = localStorage.getItem(STORAGE_KEY);
//       if (raw) {
//         setSettings(JSON.parse(raw));
//       }
//     } catch (e) {
//       console.warn('Failed to load admin settings', e);
//     }
//   }, []);

//   const persistSettings = (newSettings: AdminSettings) => {
//     setSettings(newSettings);
//     try {
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
//       // notify other components in same tab
//       window.dispatchEvent(new CustomEvent('adminSettingsUpdated', { detail: newSettings }));
//     } catch (e) {
//       console.error('Failed to save admin settings', e);
//     }
//   };

//   const toggle = (key: keyof AdminSettings) => {
//     persistSettings({ ...settings, [key]: !settings[key] });
//   };

//   const getSeverityColor = (severity: string) => {
//     switch (severity) {
//       case 'high': return 'destructive';
//       case 'medium': return 'default';
//       case 'low': return 'secondary';
//       default: return 'default';
//     }
//   };

//   const getRiskScoreColor = (risk: string) => {
//     switch (risk) {
//       case 'high': return 'destructive';
//       case 'medium': return 'default';
//       case 'low': return 'secondary';
//       default: return 'default';
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background p-6">
//       <div className="max-w-7xl mx-auto">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
//           <p className="text-muted-foreground">Manage authentication, monitor security, and oversee user activity</p>
//         </div>

//         <Tabs defaultValue="dashboard" className="space-y-6">
//           <TabsList className="grid w-full grid-cols-5">
//             <TabsTrigger value="dashboard" className="flex items-center gap-2">
//               <Activity className="w-4 h-4" />
//               Dashboard
//             </TabsTrigger>
//             <TabsTrigger value="users" className="flex items-center gap-2">
//               <Users className="w-4 h-4" />
//               Users
//             </TabsTrigger>
//             <TabsTrigger value="auth" className="flex items-center gap-2">
//               <Shield className="w-4 h-4" />
//               Auth Controls
//             </TabsTrigger>
//             <TabsTrigger value="behavioral" className="flex items-center gap-2">
//               <Eye className="w-4 h-4" />
//               Behavioral
//             </TabsTrigger>
//             <TabsTrigger value="settings" className="flex items-center gap-2">
//               <Settings className="w-4 h-4" />
//               Settings
//             </TabsTrigger>
//           </TabsList>

//           {/* Dashboard Tab */}
//           <TabsContent value="dashboard" className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <Card>
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-sm font-medium">System Status</CardTitle>
//                   <CheckCircle className="h-4 w-4 text-green-600" />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold text-green-600">Healthy</div>
//                   <p className="text-xs text-muted-foreground">All systems operational</p>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-sm font-medium">Active Users</CardTitle>
//                   <Users className="h-4 w-4 text-blue-600" />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold">{systemHealth.activeUsers}</div>
//                   <p className="text-xs text-muted-foreground">of {systemHealth.totalUsers} total users</p>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-sm font-medium">Flagged Accounts</CardTitle>
//                   <AlertTriangle className="h-4 w-4 text-orange-600" />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold text-orange-600">{systemHealth.flaggedAccounts}</div>
//                   <p className="text-xs text-muted-foreground">Require attention</p>
//                 </CardContent>
//               </Card>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Recent Login Attempts</CardTitle>
//                   <CardDescription>Latest authentication activities</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     {recentLogins.map((login) => (
//                       <div key={login.id} className="flex items-center justify-between p-3 border rounded-lg">
//                         <div className="flex items-center gap-3">
//                           <div className={`w-2 h-2 rounded-full ${login.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
//                           <div>
//                             <p className="font-medium">{login.user}</p>
//                             <p className="text-sm text-muted-foreground flex items-center gap-1">
//                               <MapPin className="w-3 h-3" />
//                               {login.location}
//                             </p>
//                           </div>
//                         </div>
//                         <div className="text-right">
//                           <Badge variant={getRiskScoreColor(login.riskScore)}>{login.riskScore}</Badge>
//                           <p className="text-xs text-muted-foreground mt-1">{login.timestamp}</p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader>
//                   <CardTitle>Suspicious Activity</CardTitle>
//                   <CardDescription>Real-time security alerts</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     {suspiciousActivity.map((activity) => (
//                       <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
//                         <div>
//                           <p className="font-medium">{activity.type}</p>
//                           <p className="text-sm text-muted-foreground">{activity.user}</p>
//                         </div>
//                         <div className="text-right">
//                           <Badge variant={getSeverityColor(activity.severity)}>{activity.severity}</Badge>
//                           <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           </TabsContent>

//           {/* Users Tab */}
//           <TabsContent value="users" className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle>User Management</CardTitle>
//                 <CardDescription>Search and manage user accounts</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="flex gap-4 mb-6">
//                   <div className="flex-1">
//                     <Input placeholder="Search users..." className="w-full" />
//                   </div>
//                   <Button variant="outline" className="flex items-center gap-2">
//                     <Search className="w-4 h-4" />
//                     Search
//                   </Button>
//                   <Button variant="outline" className="flex items-center gap-2">
//                     <Filter className="w-4 h-4" />
//                     Filter
//                   </Button>
//                 </div>

//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>User</TableHead>
//                       <TableHead>Last Login</TableHead>
//                       <TableHead>Location</TableHead>
//                       <TableHead>Risk Score</TableHead>
//                       <TableHead>Status</TableHead>
//                       <TableHead>Actions</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {recentLogins.map((user) => (
//                       <TableRow key={user.id}>
//                         <TableCell className="font-medium">{user.user}</TableCell>
//                         <TableCell>{user.timestamp}</TableCell>
//                         <TableCell>{user.location}</TableCell>
//                         <TableCell>
//                           <Badge variant={getRiskScoreColor(user.riskScore)}>{user.riskScore}</Badge>
//                         </TableCell>
//                         <TableCell>
//                           <Badge variant={user.status === 'success' ? 'default' : 'destructive'}>
//                             {user.status}
//                           </Badge>
//                         </TableCell>
//                         <TableCell>
//                           <Button variant="outline" size="sm">View Details</Button>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Auth Controls Tab */}
//           <TabsContent value="auth" className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Passwordless Authentication Controls</CardTitle>
//                 <CardDescription>Manage global authentication settings</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="flex items-center justify-between">
//                   <div className="space-y-0.5">
//                     <Label className="text-base">Global Passwordless Authentication</Label>
//                     <p className="text-sm text-muted-foreground">Enable or disable passwordless auth system-wide</p>
//                   </div>
//                   <Switch
//                     checked={settings.passwordlessEnabled}
//                     onCheckedChange={() => toggle('passwordlessEnabled')}
//                   />
//                 </div>

//                 <Separator />

//                 <div className="flex items-center justify-between">
//                   <div className="space-y-0.5">
//                     <Label className="text-base">OTP Fallback</Label>
//                     <p className="text-sm text-muted-foreground">Allow OTP as backup authentication method</p>
//                   </div>
//                   <Switch
//                     checked={settings.otpFallbackEnabled}
//                     onCheckedChange={() => toggle('otpFallbackEnabled')}
//                   />
//                 </div>

//                 <Separator />

//                 <div className="flex items-center justify-between">
//                   <div className="space-y-0.5">
//                     <Label className="text-base">Device Binding</Label>
//                     <p className="text-sm text-muted-foreground">Bind authentication to specific devices</p>
//                   </div>
//                   <Switch
//                     checked={settings.deviceBindingEnabled}
//                     onCheckedChange={() => toggle('deviceBindingEnabled')}
//                   />
//                 </div>

//                 <Separator />

//                 <div className="flex items-center justify-between">
//                   <div className="space-y-0.5">
//                     <Label className="text-base">Location Button</Label>
//                     <p className="text-sm text-muted-foreground">Show or hide "Get Location" button on login form</p>
//                   </div>
//                   <Switch
//                     checked={settings.locationEnabled}
//                     onCheckedChange={() => toggle('locationEnabled')}
//                   />
//                 </div>

//                 <Separator />

//                 <div className="flex items-center justify-between">
//                   <div className="space-y-0.5">
//                     <Label className="text-base">Behavioral Tracking</Label>
//                     <p className="text-sm text-muted-foreground">Enable/disable keystroke & behavioral tracking on login</p>
//                   </div>
//                   <Switch
//                     checked={settings.behavioralEnabled}
//                     onCheckedChange={() => toggle('behavioralEnabled')}
//                   />
//                 </div>

//                 <Separator />

//                 <div className="space-y-4">
//                   <Label className="text-base">Per-User Controls</Label>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <Label htmlFor="user-search">User Identifier</Label>
//                       <Input id="user-search" placeholder="Enter username or email" />
//                     </div>
//                     <div className="flex items-end">
//                       <Button variant="outline" className="w-full">Apply Settings</Button>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Behavioral Tab */}
//           <TabsContent value="behavioral" className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Behavioral Authentication Parameters</CardTitle>
//                 <CardDescription>Configure biometric and behavioral analysis settings</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-6">
//                   {behavioralParams.map((param, index) => (
//                     <div key={index} className="space-y-4">
//                       <div className="flex items-center justify-between">
//                         <div className="space-y-0.5">
//                           <Label className="text-base">{param.name}</Label>
//                           <p className="text-sm text-muted-foreground">
//                             Threshold: {param.threshold} | Current: {param.current}
//                           </p>
//                         </div>
//                         <Switch checked={param.enabled} />
//                       </div>

//                       {param.enabled && (
//                         <div className="ml-6 space-y-2">
//                           <Label htmlFor={`threshold-${index}`}>Sensitivity Threshold</Label>
//                           <Input
//                             id={`threshold-${index}`}
//                             value={param.threshold}
//                             className="w-32"
//                           />
//                         </div>
//                       )}

//                       {index < behavioralParams.length - 1 && <Separator />}
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Settings Tab */}
//           <TabsContent value="settings" className="space-y-6">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>API Configuration</CardTitle>
//                   <CardDescription>Manage API keys and integrations</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="api-key">Primary API Key</Label>
//                     <div className="flex gap-2">
//                       <Input
//                         id="api-key"
//                         type="password"
//                         value="sk-***************************"
//                         readOnly
//                       />
//                       <Button variant="outline" size="sm">
//                         <Key className="w-4 h-4" />
//                       </Button>
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="webhook-url">Webhook URL</Label>
//                     <Input
//                       id="webhook-url"
//                       placeholder="https://your-app.com/webhook"
//                     />
//                   </div>

//                   <Button className="w-full">Update Configuration</Button>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader>
//                   <CardTitle>Security Policies</CardTitle>
//                   <CardDescription>Configure system security settings</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
//                     <Input
//                       id="session-timeout"
//                       type="number"
//                       value="30"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="max-attempts">Max Login Attempts</Label>
//                     <Input
//                       id="max-attempts"
//                       type="number"
//                       value="5"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="lockout-duration">Lockout Duration (minutes)</Label>
//                     <Input
//                       id="lockout-duration"
//                       type="number"
//                       value="15"
//                     />
//                   </div>

//                   <Button className="w-full">Save Policies</Button>
//                 </CardContent>
//               </Card>
//             </div>
//           </TabsContent>
//         </Tabs>
//       </div>
//     </div>
//   );
// };

// export default AdminPanel;


// AdminPanel.tsx
// 'use client';

// import React, { useEffect, useState } from 'react';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Switch } from '@/components/ui/switch';
// import { Separator } from '@/components/ui/separator';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import {
//   Shield,
//   Users,
//   Activity,
//   Settings,
//   AlertTriangle,
//   CheckCircle,
//   Search,
//   MapPin,
//   Key,
//   Eye,
//   Filter
// } from 'lucide-react';

// type AdminSettings = {
//   passwordlessEnabled: boolean;
//   otpFallbackEnabled: boolean;
//   deviceBindingEnabled: boolean;
//   locationEnabled: boolean;
//   behavioralEnabled: boolean;
// };

// type RecentLogin = {
//   _id?: string;
//   id?: number | string;
//   user: string;
//   timestamp: string;
//   location?: string;
//   status: 'success' | 'failed' | string;
//   riskScore?: 'low' | 'medium' | 'high' | string;
// };

// type User = {
//   _id?: string;
//   id?: number | string;
//   username: string;
//   lastLogin?: string;
//   location?: string;
//   riskScore?: string;
//   status?: string;
// };

// type SystemHealth = {
//   totalUsers: number;
//   activeUsers: number;
//   flaggedAccounts: number;
//   successfulLogins: number;
//   failedAttempts: number;
//   systemStatus: string;
// };

// const STORAGE_KEY = 'bank_admin_settings';

// const defaultSettings: AdminSettings = {
//   passwordlessEnabled: true,
//   otpFallbackEnabled: true,
//   deviceBindingEnabled: true,
//   locationEnabled: true,
//   behavioralEnabled: true,
// };

// const AdminPanel: React.FC = () => {
//   const [settings, setSettings] = useState<AdminSettings>(defaultSettings);
//   const [activeTab, setActiveTab] = useState<string>('dashboard');

//   // Data states (all fetched from backend)
//   const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
//   const [systemLoading, setSystemLoading] = useState(false);
//   const [systemError, setSystemError] = useState<string | null>(null);

//   const [recentLogins, setRecentLogins] = useState<RecentLogin[]>([]);
//   const [loginsLoading, setLoginsLoading] = useState(false);
//   const [loginsError, setLoginsError] = useState<string | null>(null);

//   const [usersList, setUsersList] = useState<User[]>([]);
//   const [usersLoading, setUsersLoading] = useState(false);
//   const [usersError, setUsersError] = useState<string | null>(null);

//   const [suspiciousActivity, setSuspiciousActivity] = useState<any[]>([]);
//   const [suspiciousLoading, setSuspiciousLoading] = useState(false);
//   const [suspiciousError, setSuspiciousError] = useState<string | null>(null);

//   const [behavioralParams, setBehavioralParams] = useState<any[]>([]);
//   const [behavioralLoading, setBehavioralLoading] = useState(false);
//   const [behavioralError, setBehavioralError] = useState<string | null>(null);

//   const [searchTerm, setSearchTerm] = useState<string>('');

//   useEffect(() => {
//     // load saved settings if any
//     try {
//       const raw = localStorage.getItem(STORAGE_KEY);
//       if (raw) setSettings(JSON.parse(raw));
//     } catch (e) {
//       console.warn('Failed to load admin settings', e);
//     }

//     // initial fetch for dashboard data
//     fetchSystem();
//     fetchLogins();
//     fetchSuspicious();
//     fetchBehavioral();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   useEffect(() => {
//     if (activeTab === 'users') {
//       fetchUsers();
//     }
//   }, [activeTab]);

//   const persistSettings = (newSettings: AdminSettings) => {
//     setSettings(newSettings);
//     try {
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
//       window.dispatchEvent(new CustomEvent('adminSettingsUpdated', { detail: newSettings }));
//     } catch (e) {
//       console.error('Failed to save admin settings', e);
//     }
//   };

//   const toggle = (key: keyof AdminSettings) => {
//     persistSettings({ ...settings, [key]: !settings[key] });
//   };

//   const getSeverityColor = (severity: string) => {
//     switch (severity) {
//       case 'high': return 'destructive';
//       case 'medium': return 'default';
//       case 'low': return 'secondary';
//       default: return 'default';
//     }
//   };

//   const getRiskScoreColor = (risk: string) => {
//     switch (risk) {
//       case 'high': return 'destructive';
//       case 'medium': return 'default';
//       case 'low': return 'secondary';
//       default: return 'default';
//     }
//   };

//   // ---------- API endpoints (adjust if needed) ----------
//   const API_BASE = ''; // '' means same origin. Set to 'http://localhost:5000' or your API base if different.
//   const ENDPOINTS = {
//     system: `${API_BASE}/api/admin/system`,
//     users: `${API_BASE}/api/admin/users`,
//     logins: `${API_BASE}/api/admin/logins`,
//     suspicious: `${API_BASE}/api/admin/suspicious`,
//     behavioral: `${API_BASE}/api/admin/behavioral`,
//   };

//   // ---------- Fetchers ----------
//   const fetchSystem = async () => {
//     setSystemLoading(true);
//     setSystemError(null);
//     try {
//       const res = await fetch(ENDPOINTS.system);
//       if (!res.ok) throw new Error(`System fetch failed: ${res.status}`);
//       const data = await res.json();
//       // Expecting { totalUsers, activeUsers, flaggedAccounts, successfulLogins, failedAttempts, systemStatus }
//       setSystemHealth(data);
//     } catch (err: any) {
//       console.error(err);
//       setSystemError(err.message || 'Failed to load system stats');
//     } finally {
//       setSystemLoading(false);
//     }
//   };

//   const fetchLogins = async () => {
//     setLoginsLoading(true);
//     setLoginsError(null);
//     try {
//       const res = await fetch(ENDPOINTS.logins);
//       if (!res.ok) throw new Error(`Logins fetch failed: ${res.status}`);
//       const data = await res.json();
//       // Accept either array or { logins: [...] }
//       const arr = Array.isArray(data) ? data : (Array.isArray(data.logins) ? data.logins : []);
//       setRecentLogins(arr);
//     } catch (err: any) {
//       console.error(err);
//       setLoginsError(err.message || 'Failed to load recent logins');
//     } finally {
//       setLoginsLoading(false);
//     }
//   };

//   const fetchUsers = async () => {
//     setUsersLoading(true);
//     setUsersError(null);
//     try {
//       const res = await fetch(ENDPOINTS.users);
//       if (!res.ok) throw new Error(`Users fetch failed: ${res.status}`);
//       const data = await res.json();
//       const arr = Array.isArray(data) ? data : data.users ?? data.data ?? [];
//       setUsersList(arr);
//       // optionally update system totalUsers if returned
//       if (typeof data.total === 'number') {
//         setSystemHealth((prev) => ({ ...(prev ?? {} as SystemHealth), totalUsers: data.total }));
//       }
//     } catch (err: any) {
//       console.error(err);
//       setUsersError(err.message || 'Failed to load users');
//     } finally {
//       setUsersLoading(false);
//     }
//   };

//   const fetchSuspicious = async () => {
//     setSuspiciousLoading(true);
//     setSuspiciousError(null);
//     try {
//       const res = await fetch(ENDPOINTS.suspicious);
//       if (!res.ok) throw new Error(`Suspicious fetch failed: ${res.status}`);
//       const data = await res.json();
//       const arr = Array.isArray(data) ? data : data.suspicious ?? [];
//       setSuspiciousActivity(arr);
//     } catch (err: any) {
//       console.error(err);
//       setSuspiciousError(err.message || 'Failed to load suspicious activity');
//     } finally {
//       setSuspiciousLoading(false);
//     }
//   };

//   const fetchBehavioral = async () => {
//     setBehavioralLoading(true);
//     setBehavioralError(null);
//     try {
//       const res = await fetch(ENDPOINTS.behavioral);
//       if (!res.ok) throw new Error(`Behavioral fetch failed: ${res.status}`);
//       const data = await res.json();
//       const arr = Array.isArray(data) ? data : data.behavioral ?? [];
//       setBehavioralParams(arr);
//     } catch (err: any) {
//       console.error(err);
//       setBehavioralError(err.message || 'Failed to load behavioral params');
//     } finally {
//       setBehavioralLoading(false);
//     }
//   };

//   // filter users by search term
//   const displayedUsers = usersList.filter((u) => {
//     if (!searchTerm.trim()) return true;
//     const q = searchTerm.toLowerCase();
//     return (
//       String(u.username ?? '').toLowerCase().includes(q) ||
//       String(u.location ?? '').toLowerCase().includes(q) ||
//       String(u.status ?? '').toLowerCase().includes(q)
//     );
//   });

//   return (
//     <div className="min-h-screen bg-background p-6">
//       <div className="max-w-7xl mx-auto">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
//           <p className="text-muted-foreground">Manage authentication, monitor security, and oversee user activity</p>
//         </div>

//         <Tabs defaultValue="dashboard" value={activeTab} onValueChange={(v) => setActiveTab(v as string)} className="space-y-6">
//           <TabsList className="grid w-full grid-cols-5">
//             <TabsTrigger value="dashboard" className="flex items-center gap-2">
//               <Activity className="w-4 h-4" />
//               Dashboard
//             </TabsTrigger>
//             <TabsTrigger value="users" className="flex items-center gap-2">
//               <Users className="w-4 h-4" />
//               Users
//             </TabsTrigger>
//             <TabsTrigger value="auth" className="flex items-center gap-2">
//               <Shield className="w-4 h-4" />
//               Auth Controls
//             </TabsTrigger>
//             <TabsTrigger value="behavioral" className="flex items-center gap-2">
//               <Eye className="w-4 h-4" />
//               Behavioral
//             </TabsTrigger>
//             <TabsTrigger value="settings" className="flex items-center gap-2">
//               <Settings className="w-4 h-4" />
//               Settings
//             </TabsTrigger>
//           </TabsList>

//           {/* Dashboard Tab */}
//           <TabsContent value="dashboard" className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <Card>
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-sm font-medium">System Status</CardTitle>
//                   <CheckCircle className="h-4 w-4 text-green-600" />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold text-green-600">
//                     {systemLoading ? 'Loading...' : (systemHealth?.systemStatus ?? 'Unknown')}
//                   </div>
//                   <p className="text-xs text-muted-foreground">Current overall system health</p>
//                   {systemError && <p className="text-xs text-destructive mt-2">{systemError}</p>}
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-sm font-medium">Active Users</CardTitle>
//                   <Users className="h-4 w-4 text-blue-600" />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold">{systemLoading ? '...' : systemHealth?.activeUsers ?? '—'}</div>
//                   <p className="text-xs text-muted-foreground">of {systemLoading ? '...' : systemHealth?.totalUsers ?? '—'} total users</p>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-sm font-medium">Flagged Accounts</CardTitle>
//                   <AlertTriangle className="h-4 w-4 text-orange-600" />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold text-orange-600">{systemLoading ? '...' : systemHealth?.flaggedAccounts ?? '—'}</div>
//                   <p className="text-xs text-muted-foreground">Require attention</p>
//                 </CardContent>
//               </Card>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Recent Login Attempts</CardTitle>
//                   <CardDescription>Latest authentication activities</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   {loginsLoading ? (
//                     <div>Loading recent logins...</div>
//                   ) : loginsError ? (
//                     <div className="text-destructive">{loginsError}</div>
//                   ) : (
//                     <div className="space-y-4">
//                       {recentLogins.length === 0 && <div className="text-muted-foreground">No recent logins</div>}
//                       {recentLogins.map((login) => (
//                         <div key={login._id || login.id} className="flex items-center justify-between p-3 border rounded-lg">
//                           <div className="flex items-center gap-3">
//                             <div className={`w-2 h-2 rounded-full ${login.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
//                             <div>
//                               <p className="font-medium">{login.user}</p>
//                               <p className="text-sm text-muted-foreground flex items-center gap-1">
//                                 <MapPin className="w-3 h-3" />
//                                 {login.location ?? '—'}
//                               </p>
//                             </div>
//                           </div>
//                           <div className="text-right">
//                             <Badge variant={getRiskScoreColor(login.riskScore ?? 'low')}>{login.riskScore ?? 'low'}</Badge>
//                             <p className="text-xs text-muted-foreground mt-1">{login.timestamp}</p>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader>
//                   <CardTitle>Suspicious Activity</CardTitle>
//                   <CardDescription>Real-time security alerts</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   {suspiciousLoading ? (
//                     <div>Loading suspicious activity...</div>
//                   ) : suspiciousError ? (
//                     <div className="text-destructive">{suspiciousError}</div>
//                   ) : (
//                     <div className="space-y-4">
//                       {suspiciousActivity.length === 0 && <div className="text-muted-foreground">No suspicious activity</div>}
//                       {suspiciousActivity.map((activity: any, idx: number) => (
//                         <div key={activity._id ?? idx} className="flex items-center justify-between p-3 border rounded-lg">
//                           <div>
//                             <p className="font-medium">{activity.type ?? activity.title ?? 'Unknown'}</p>
//                             <p className="text-sm text-muted-foreground">{activity.user ?? activity.username ?? '—'}</p>
//                           </div>
//                           <div className="text-right">
//                             <Badge variant={getSeverityColor(activity.severity ?? 'low')}>{activity.severity ?? 'low'}</Badge>
//                             <p className="text-xs text-muted-foreground mt-1">{activity.timestamp ?? activity.createdAt ?? '—'}</p>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             </div>
//           </TabsContent>

//           {/* Users Tab */}
//           <TabsContent value="users" className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle>User Management</CardTitle>
//                 <CardDescription>Search and manage user accounts</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="flex gap-4 mb-6">
//                   <div className="flex-1">
//                     <Input placeholder="Search users..." className="w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
//                   </div>
//                   <Button variant="outline" className="flex items-center gap-2" onClick={() => fetchUsers()}>
//                     <Search className="w-4 h-4" />
//                     Refresh
//                   </Button>
//                   <Button variant="outline" className="flex items-center gap-2" onClick={() => fetchUsers()}>
//                     <Filter className="w-4 h-4" />
//                     Filter
//                   </Button>
//                 </div>

//                 {usersLoading ? (
//                   <div>Loading users...</div>
//                 ) : usersError ? (
//                   <div className="text-destructive">{usersError}</div>
//                 ) : (
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>User</TableHead>
//                         <TableHead>Last Login</TableHead>
//                         <TableHead>Location</TableHead>
//                         <TableHead>Risk Score</TableHead>
//                         <TableHead>Status</TableHead>
//                         <TableHead>Actions</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {displayedUsers.map((user) => (
//                         <TableRow key={user._id ?? user.id}>
//                           <TableCell className="font-medium">{user.username}</TableCell>
//                           <TableCell>{user.lastLogin ?? '—'}</TableCell>
//                           <TableCell>{user.location ?? '—'}</TableCell>
//                           <TableCell>
//                             <Badge variant={getRiskScoreColor(user.riskScore ?? 'low')}>{user.riskScore ?? 'low'}</Badge>
//                           </TableCell>
//                           <TableCell>
//                             <Badge variant={(user.status === 'active' || user.status === 'success') ? 'default' : 'destructive'}>
//                               {user.status ?? '—'}
//                             </Badge>
//                           </TableCell>
//                           <TableCell>
//                             <Button variant="outline" size="sm">View Details</Button>
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 )}
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Auth Controls Tab */}
//           <TabsContent value="auth" className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Passwordless Authentication Controls</CardTitle>
//                 <CardDescription>Manage global authentication settings</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="flex items-center justify-between">
//                   <div className="space-y-0.5">
//                     <Label className="text-base">Global Passwordless Authentication</Label>
//                     <p className="text-sm text-muted-foreground">Enable or disable passwordless auth system-wide</p>
//                   </div>
//                   <Switch
//                     checked={settings.passwordlessEnabled}
//                     onCheckedChange={() => toggle('passwordlessEnabled')}
//                   />
//                 </div>

//                 <Separator />

//                 <div className="flex items-center justify-between">
//                   <div className="space-y-0.5">
//                     <Label className="text-base">OTP Fallback</Label>
//                     <p className="text-sm text-muted-foreground">Allow OTP as backup authentication method</p>
//                   </div>
//                   <Switch
//                     checked={settings.otpFallbackEnabled}
//                     onCheckedChange={() => toggle('otpFallbackEnabled')}
//                   />
//                 </div>

//                 <Separator />

//                 <div className="flex items-center justify-between">
//                   <div className="space-y-0.5">
//                     <Label className="text-base">Device Binding</Label>
//                     <p className="text-sm text-muted-foreground">Bind authentication to specific devices</p>
//                   </div>
//                   <Switch
//                     checked={settings.deviceBindingEnabled}
//                     onCheckedChange={() => toggle('deviceBindingEnabled')}
//                   />
//                 </div>

//                 <Separator />

//                 <div className="flex items-center justify-between">
//                   <div className="space-y-0.5">
//                     <Label className="text-base">Location Button</Label>
//                     <p className="text-sm text-muted-foreground">Show or hide "Get Location" button on login form</p>
//                   </div>
//                   <Switch
//                     checked={settings.locationEnabled}
//                     onCheckedChange={() => toggle('locationEnabled')}
//                   />
//                 </div>

//                 <Separator />

//                 <div className="flex items-center justify-between">
//                   <div className="space-y-0.5">
//                     <Label className="text-base">Behavioral Tracking</Label>
//                     <p className="text-sm text-muted-foreground">Enable/disable keystroke & behavioral tracking on login</p>
//                   </div>
//                   <Switch
//                     checked={settings.behavioralEnabled}
//                     onCheckedChange={() => toggle('behavioralEnabled')}
//                   />
//                 </div>

//                 <Separator />

//                 <div className="space-y-4">
//                   <Label className="text-base">Per-User Controls</Label>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <Label htmlFor="user-search">User Identifier</Label>
//                       <Input id="user-search" placeholder="Enter username or email" />
//                     </div>
//                     <div className="flex items-end">
//                       <Button variant="outline" className="w-full">Apply Settings</Button>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Behavioral Tab */}
//           <TabsContent value="behavioral" className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Behavioral Authentication Parameters</CardTitle>
//                 <CardDescription>Configure biometric and behavioral analysis settings</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 {behavioralLoading ? (
//                   <div>Loading behavioral parameters...</div>
//                 ) : behavioralError ? (
//                   <div className="text-destructive">{behavioralError}</div>
//                 ) : (
//                   <div className="space-y-6">
//                     {behavioralParams.length === 0 && <div className="text-muted-foreground">No behavioral parameters configured</div>}
//                     {behavioralParams.map((param: any, index: number) => (
//                       <div key={param._id ?? index} className="space-y-4">
//                         <div className="flex items-center justify-between">
//                           <div className="space-y-0.5">
//                             <Label className="text-base">{param.name}</Label>
//                             <p className="text-sm text-muted-foreground">
//                               Threshold: {param.threshold ?? '—'} | Current: {param.current ?? '—'}
//                             </p>
//                           </div>
//                           <Switch checked={!!param.enabled} onCheckedChange={() => { /* optionally call save API */ }} />
//                         </div>

//                         {param.enabled && (
//                           <div className="ml-6 space-y-2">
//                             <Label htmlFor={`threshold-${index}`}>Sensitivity Threshold</Label>
//                             <Input
//                               id={`threshold-${index}`}
//                               value={param.threshold ?? ''}
//                               className="w-32"
//                               readOnly
//                             />
//                           </div>
//                         )}

//                         {index < behavioralParams.length - 1 && <Separator />}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Settings Tab */}
//           <TabsContent value="settings" className="space-y-6">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>API Configuration</CardTitle>
//                   <CardDescription>Manage API keys and integrations</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="api-key">Primary API Key</Label>
//                     <div className="flex gap-2">
//                       <Input
//                         id="api-key"
//                         type="password"
//                         value="sk-***************************"
//                         readOnly
//                       />
//                       <Button variant="outline" size="sm">
//                         <Key className="w-4 h-4" />
//                       </Button>
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="webhook-url">Webhook URL</Label>
//                     <Input
//                       id="webhook-url"
//                       placeholder="https://your-app.com/webhook"
//                     />
//                   </div>

//                   <Button className="w-full">Update Configuration</Button>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader>
//                   <CardTitle>Security Policies</CardTitle>
//                   <CardDescription>Configure system security settings</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
//                     <Input
//                       id="session-timeout"
//                       type="number"
//                       value="30"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="max-attempts">Max Login Attempts</Label>
//                     <Input
//                       id="max-attempts"
//                       type="number"
//                       value="5"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="lockout-duration">Lockout Duration (minutes)</Label>
//                     <Input
//                       id="lockout-duration"
//                       type="number"
//                       value="15"
//                     />
//                   </div>

//                   <Button className="w-full">Save Policies</Button>
//                 </CardContent>
//               </Card>
//             </div>
//           </TabsContent>
//         </Tabs>
//       </div>
//     </div>
//   );
// };

// export default AdminPanel;



// 'use client';

// import React, { useEffect, useState } from 'react';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Switch } from '@/components/ui/switch';
// import { Separator } from '@/components/ui/separator';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import {
//   Shield,
//   Users,
//   Activity,
//   Settings,
//   AlertTriangle,
//   CheckCircle,
//   Search,
//   MapPin,
//   Key,
//   Eye,
//   Filter
// } from 'lucide-react';

// type AdminSettings = {
//   passwordlessEnabled: boolean;
//   otpFallbackEnabled: boolean;
//   deviceBindingEnabled: boolean;
//   locationEnabled: boolean;
//   behavioralEnabled: boolean;
// };

// type RecentLogin = {
//   _id?: string;
//   id?: number | string;
//   user: string;
//   timestamp: string;
//   location?: string;
//   status: 'success' | 'failed' | string;
//   riskScore?: 'low' | 'medium' | 'high' | string;
// };

// type User = {
//   _id?: string;
//   id?: number | string;
//   username: string;
//   lastLogin?: string;
//   location?: string;
//   riskScore?: string;
//   status?: string;
// };

// type SystemHealth = {
//   totalUsers: number;
//   activeUsers?: number;
//   flaggedAccounts?: number;
//   successfulLogins?: number;
//   failedAttempts?: number;
//   systemStatus?: string;
// };

// const STORAGE_KEY = 'bank_admin_settings';

// const defaultSettings: AdminSettings = {
//   passwordlessEnabled: true,
//   otpFallbackEnabled: true,
//   deviceBindingEnabled: true,
//   locationEnabled: true,
//   behavioralEnabled: true,
// };

// const AdminPanel: React.FC = () => {
//   const [settings, setSettings] = useState<AdminSettings>(defaultSettings);
//   const [activeTab, setActiveTab] = useState<string>('dashboard');

//   // Dashboard data: total users and recent logins
//   const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
//   const [systemLoading, setSystemLoading] = useState(false);
//   const [systemError, setSystemError] = useState<string | null>(null);

//   const [recentLogins, setRecentLogins] = useState<RecentLogin[]>([]);
//   const [loginsLoading, setLoginsLoading] = useState(false);
//   const [loginsError, setLoginsError] = useState<string | null>(null);

//   // Users tab data (fetched when users tab active)
//   const [usersList, setUsersList] = useState<User[]>([]);
//   const [usersLoading, setUsersLoading] = useState(false);
//   const [usersError, setUsersError] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState<string>('');

//   // Other tabs data (kept, but not required to change)
//   const [suspiciousActivity, setSuspiciousActivity] = useState<any[]>([]);
//   const [suspiciousLoading, setSuspiciousLoading] = useState(false);
//   const [suspiciousError, setSuspiciousError] = useState<string | null>(null);

//   const [behavioralParams, setBehavioralParams] = useState<any[]>([]);
//   const [behavioralLoading, setBehavioralLoading] = useState(false);
//   const [behavioralError, setBehavioralError] = useState<string | null>(null);

//   useEffect(() => {
//     // load saved settings if any
//     try {
//       const raw = localStorage.getItem(STORAGE_KEY);
//       if (raw) setSettings(JSON.parse(raw));
//     } catch (e) {
//       console.warn('Failed to load admin settings', e);
//     }

//     // fetch only the dashboard data at mount
//     fetchSystem();
//     fetchLogins();
//     // optionally prefetch others if desired
//     // fetchSuspicious();
//     // fetchBehavioral();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   useEffect(() => {
//     if (activeTab === 'users') fetchUsers();
//   }, [activeTab]);

//   const persistSettings = (newSettings: AdminSettings) => {
//     setSettings(newSettings);
//     try {
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
//       window.dispatchEvent(new CustomEvent('adminSettingsUpdated', { detail: newSettings }));
//     } catch (e) {
//       console.error('Failed to save admin settings', e);
//     }
//   };

//   const toggle = (key: keyof AdminSettings) => {
//     persistSettings({ ...settings, [key]: !settings[key] });
//   };

//   const getSeverityColor = (severity: string) => {
//     switch (severity) {
//       case 'high': return 'destructive';
//       case 'medium': return 'default';
//       case 'low': return 'secondary';
//       default: return 'default';
//     }
//   };

//   const getRiskScoreColor = (risk: string) => {
//     switch (risk) {
//       case 'high': return 'destructive';
//       case 'medium': return 'default';
//       case 'low': return 'secondary';
//       default: return 'default';
//     }
//   };

//   // ---------- API configuration ----------
//   // If backend runs elsewhere set API_BASE to e.g. 'http://localhost:5000'
//   const API_BASE = 'http://localhost:5000';
//   const ENDPOINTS = {
//     system: `${API_BASE}/api/admin/system`,      // returns { totalUsers, ... }
//     users: `${API_BASE}/api/admin/users`,        // returns { users, total } or array
//     logins: `${API_BASE}/api/admin/logins`,      // returns array of recent logins
//     suspicious: `${API_BASE}/api/admin/suspicious`,
//     behavioral: `${API_BASE}/api/admin/behavioral`,
//   };

//   // ---------- Fetchers ----------
//   const fetchSystem = async () => {
//     setSystemLoading(true);
//     setSystemError(null);
//     try {
//       const res = await fetch(ENDPOINTS.system);
//       if (!res.ok) throw new Error(`System fetch failed: ${res.status}`);
//       const data = await res.json();
//       setSystemHealth(data);
//     } catch (err: any) {
//       console.error(err);
//       setSystemError(err.message || 'Failed to load system stats');
//     } finally {
//       setSystemLoading(false);
//     }
//   };

//   const fetchLogins = async () => {
//     setLoginsLoading(true);
//     setLoginsError(null);
//     try {
//       const res = await fetch(ENDPOINTS.logins);
//       if (!res.ok) throw new Error(`Logins fetch failed: ${res.status}`);
//       const data = await res.json();
//       const arr = Array.isArray(data) ? data : data.logins ?? [];
//       setRecentLogins(arr);
//     } catch (err: any) {
//       console.error(err);
//       setLoginsError(err.message || 'Failed to load recent logins');
//     } finally {
//       setLoginsLoading(false);
//     }
//   };

//   const fetchUsers = async () => {
//     setUsersLoading(true);
//     setUsersError(null);
//     try {
//       const res = await fetch(ENDPOINTS.users);
//       if (!res.ok) throw new Error(`Users fetch failed: ${res.status}`);
//       const data = await res.json();
//       const arr = Array.isArray(data) ? data : data.users ?? data.data ?? [];
//       setUsersList(arr);
//       if (typeof data.total === 'number') {
//         setSystemHealth((prev) => ({ ...(prev ?? {} as SystemHealth), totalUsers: data.total }));
//       }
//     } catch (err: any) {
//       console.error(err);
//       setUsersError(err.message || 'Failed to load users');
//     } finally {
//       setUsersLoading(false);
//     }
//   };

//   const fetchSuspicious = async () => {
//     setSuspiciousLoading(true);
//     setSuspiciousError(null);
//     try {
//       const res = await fetch(ENDPOINTS.suspicious);
//       if (!res.ok) throw new Error(`Suspicious fetch failed: ${res.status}`);
//       const data = await res.json();
//       const arr = Array.isArray(data) ? data : data.suspicious ?? [];
//       setSuspiciousActivity(arr);
//     } catch (err: any) {
//       console.error(err);
//       setSuspiciousError(err.message || 'Failed to load suspicious activity');
//     } finally {
//       setSuspiciousLoading(false);
//     }
//   };

//   const fetchBehavioral = async () => {
//     setBehavioralLoading(true);
//     setBehavioralError(null);
//     try {
//       const res = await fetch(ENDPOINTS.behavioral);
//       if (!res.ok) throw new Error(`Behavioral fetch failed: ${res.status}`);
//       const data = await res.json();
//       const arr = Array.isArray(data) ? data : data.behavioral ?? [];
//       setBehavioralParams(arr);
//     } catch (err: any) {
//       console.error(err);
//       setBehavioralError(err.message || 'Failed to load behavioral params');
//     } finally {
//       setBehavioralLoading(false);
//     }
//   };

//   // filter users in Users tab
//   const displayedUsers = usersList.filter((u) => {
//     if (!searchTerm.trim()) return true;
//     const q = searchTerm.toLowerCase();
//     return (
//       String(u.username ?? '').toLowerCase().includes(q) ||
//       String(u.location ?? '').toLowerCase().includes(q) ||
//       String(u.status ?? '').toLowerCase().includes(q)
//     );
//   });

//   return (
//     <div className="min-h-screen bg-background p-6">
//       <div className="max-w-7xl mx-auto">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
//           <p className="text-muted-foreground">Manage authentication, monitor security, and oversee user activity</p>
//         </div>

//         <Tabs defaultValue="dashboard" value={activeTab} onValueChange={(v) => setActiveTab(v as string)} className="space-y-6">
//           <TabsList className="grid w-full grid-cols-5">
//             <TabsTrigger value="dashboard" className="flex items-center gap-2">
//               <Activity className="w-4 h-4" />
//               Dashboard
//             </TabsTrigger>
//             <TabsTrigger value="users" className="flex items-center gap-2">
//               <Users className="w-4 h-4" />
//               Users
//             </TabsTrigger>
//             <TabsTrigger value="auth" className="flex items-center gap-2">
//               <Shield className="w-4 h-4" />
//               Auth Controls
//             </TabsTrigger>
//             <TabsTrigger value="behavioral" className="flex items-center gap-2">
//               <Eye className="w-4 h-4" />
//               Behavioral
//             </TabsTrigger>
//             <TabsTrigger value="settings" className="flex items-center gap-2">
//               <Settings className="w-4 h-4" />
//               Settings
//             </TabsTrigger>
//           </TabsList>

//           {/* --------------------------
//               DASHBOARD (ONLY: Total Users + Recent Logins)
//               -------------------------- */}
//           <TabsContent value="dashboard" className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Total Users card */}
//               <Card>
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-sm font-medium">Total Users</CardTitle>
//                   <Users className="h-4 w-4 text-blue-600" />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-3xl font-bold">
//                     {systemLoading ? 'Loading...' : (systemHealth?.totalUsers ?? '—')}
//                   </div>
//                   <p className="text-xs text-muted-foreground">Total registered users in the system</p>
//                   {systemError && <p className="text-xs text-destructive mt-2">{systemError}</p>}
//                 </CardContent>
//               </Card>

//               {/* Recent Logins */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Recent Login Attempts</CardTitle>
//                   <CardDescription>Latest authentication activities</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   {loginsLoading ? (
//                     <div>Loading recent logins...</div>
//                   ) : loginsError ? (
//                     <div className="text-destructive">{loginsError}</div>
//                   ) : (
//                     <div className="space-y-4">
//                       {recentLogins.length === 0 && <div className="text-muted-foreground">No recent logins</div>}
//                       {recentLogins.map((login) => (
//                         <div key={login._id || login.id} className="flex items-center justify-between p-3 border rounded-lg">
//                           <div className="flex items-center gap-3">
//                             <div className={`w-2 h-2 rounded-full ${login.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
//                             <div>
//                               <p className="font-medium">{login.user}</p>
//                               <p className="text-sm text-muted-foreground flex items-center gap-1">
//                                 <MapPin className="w-3 h-3" />
//                                 {login.location ?? '—'}
//                               </p>
//                             </div>
//                           </div>
//                           <div className="text-right">
//                             <Badge variant={getRiskScoreColor(login.riskScore ?? 'low')}>{login.riskScore ?? 'low'}</Badge>
//                             <p className="text-xs text-muted-foreground mt-1">{login.timestamp}</p>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             </div>
//           </TabsContent>

//           {/* --------------------------
//               USERS TAB (unchanged behavior, fetches from backend)
//               -------------------------- */}
//           <TabsContent value="users" className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle>User Management</CardTitle>
//                 <CardDescription>Search and manage user accounts</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="flex gap-4 mb-6">
//                   <div className="flex-1">
//                     <Input placeholder="Search users..." className="w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
//                   </div>
//                   <Button variant="outline" className="flex items-center gap-2" onClick={() => fetchUsers()}>
//                     <Search className="w-4 h-4" />
//                     Refresh
//                   </Button>
//                   <Button variant="outline" className="flex items-center gap-2" onClick={() => fetchUsers()}>
//                     <Filter className="w-4 h-4" />
//                     Filter
//                   </Button>
//                 </div>

//                 {usersLoading ? (
//                   <div>Loading users...</div>
//                 ) : usersError ? (
//                   <div className="text-destructive">{usersError}</div>
//                 ) : (
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>User</TableHead>
//                         <TableHead>Last Login</TableHead>
//                         <TableHead>Location</TableHead>
//                         <TableHead>Risk Score</TableHead>
//                         <TableHead>Status</TableHead>
//                         <TableHead>Actions</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {displayedUsers.map((user) => (
//                         <TableRow key={user._id ?? user.id}>
//                           <TableCell className="font-medium">{user.username}</TableCell>
//                           <TableCell>{user.lastLogin ?? '—'}</TableCell>
//                           <TableCell>{user.location ?? '—'}</TableCell>
//                           <TableCell>
//                             <Badge variant={getRiskScoreColor(user.riskScore ?? 'low')}>{user.riskScore ?? 'low'}</Badge>
//                           </TableCell>
//                           <TableCell>
//                             <Badge variant={(user.status === 'active' || user.status === 'success') ? 'default' : 'destructive'}>
//                               {user.status ?? '—'}
//                             </Badge>
//                           </TableCell>
//                           <TableCell>
//                             <Button variant="outline" size="sm">View Details</Button>
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 )}
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* --------------------------
//               AUTH CONTROLS (unchanged)
//               -------------------------- */}
//           <TabsContent value="auth" className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Passwordless Authentication Controls</CardTitle>
//                 <CardDescription>Manage global authentication settings</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="flex items-center justify-between">
//                   <div className="space-y-0.5">
//                     <Label className="text-base">Global Passwordless Authentication</Label>
//                     <p className="text-sm text-muted-foreground">Enable or disable passwordless auth system-wide</p>
//                   </div>
//                   <Switch
//                     checked={settings.passwordlessEnabled}
//                     onCheckedChange={() => toggle('passwordlessEnabled')}
//                   />
//                 </div>

//                 <Separator />

//                 <div className="flex items-center justify-between">
//                   <div className="space-y-0.5">
//                     <Label className="text-base">OTP Fallback</Label>
//                     <p className="text-sm text-muted-foreground">Allow OTP as backup authentication method</p>
//                   </div>
//                   <Switch
//                     checked={settings.otpFallbackEnabled}
//                     onCheckedChange={() => toggle('otpFallbackEnabled')}
//                   />
//                 </div>

//                 <Separator />

//                 <div className="flex items-center justify-between">
//                   <div className="space-y-0.5">
//                     <Label className="text-base">Device Binding</Label>
//                     <p className="text-sm text-muted-foreground">Bind authentication to specific devices</p>
//                   </div>
//                   <Switch
//                     checked={settings.deviceBindingEnabled}
//                     onCheckedChange={() => toggle('deviceBindingEnabled')}
//                   />
//                 </div>

//                 <Separator />

//                 <div className="flex items-center justify-between">
//                   <div className="space-y-0.5">
//                     <Label className="text-base">Location Button</Label>
//                     <p className="text-sm text-muted-foreground">Show or hide "Get Location" button on login form</p>
//                   </div>
//                   <Switch
//                     checked={settings.locationEnabled}
//                     onCheckedChange={() => toggle('locationEnabled')}
//                   />
//                 </div>

//                 <Separator />

//                 <div className="flex items-center justify-between">
//                   <div className="space-y-0.5">
//                     <Label className="text-base">Behavioral Tracking</Label>
//                     <p className="text-sm text-muted-foreground">Enable/disable keystroke & behavioral tracking on login</p>
//                   </div>
//                   <Switch
//                     checked={settings.behavioralEnabled}
//                     onCheckedChange={() => toggle('behavioralEnabled')}
//                   />
//                 </div>

//                 <Separator />

//                 <div className="space-y-4">
//                   <Label className="text-base">Per-User Controls</Label>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <Label htmlFor="user-search">User Identifier</Label>
//                       <Input id="user-search" placeholder="Enter username or email" />
//                     </div>
//                     <div className="flex items-end">
//                       <Button variant="outline" className="w-full">Apply Settings</Button>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* --------------------------
//               BEHAVIORAL TAB (unchanged)
//               -------------------------- */}
//           <TabsContent value="behavioral" className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Behavioral Authentication Parameters</CardTitle>
//                 <CardDescription>Configure biometric and behavioral analysis settings</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 {behavioralLoading ? (
//                   <div>Loading behavioral parameters...</div>
//                 ) : behavioralError ? (
//                   <div className="text-destructive">{behavioralError}</div>
//                 ) : (
//                   <div className="space-y-6">
//                     {behavioralParams.length === 0 && <div className="text-muted-foreground">No behavioral parameters configured</div>}
//                     {behavioralParams.map((param: any, index: number) => (
//                       <div key={param._id ?? index} className="space-y-4">
//                         <div className="flex items-center justify-between">
//                           <div className="space-y-0.5">
//                             <Label className="text-base">{param.name}</Label>
//                             <p className="text-sm text-muted-foreground">
//                               Threshold: {param.threshold ?? '—'} | Current: {param.current ?? '—'}
//                             </p>
//                           </div>
//                           <Switch checked={!!param.enabled} onCheckedChange={() => { /* optional */ }} />
//                         </div>

//                         {param.enabled && (
//                           <div className="ml-6 space-y-2">
//                             <Label htmlFor={`threshold-${index}`}>Sensitivity Threshold</Label>
//                             <Input
//                               id={`threshold-${index}`}
//                               value={param.threshold ?? ''}
//                               className="w-32"
//                               readOnly
//                             />
//                           </div>
//                         )}

//                         {index < behavioralParams.length - 1 && <Separator />}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* --------------------------
//               SETTINGS TAB (unchanged)
//               -------------------------- */}
//           <TabsContent value="settings" className="space-y-6">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>API Configuration</CardTitle>
//                   <CardDescription>Manage API keys and integrations</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="api-key">Primary API Key</Label>
//                     <div className="flex gap-2">
//                       <Input
//                         id="api-key"
//                         type="password"
//                         value="sk-***************************"
//                         readOnly
//                       />
//                       <Button variant="outline" size="sm">
//                         <Key className="w-4 h-4" />
//                       </Button>
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="webhook-url">Webhook URL</Label>
//                     <Input
//                       id="webhook-url"
//                       placeholder="https://your-app.com/webhook"
//                     />
//                   </div>

//                   <Button className="w-full">Update Configuration</Button>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader>
//                   <CardTitle>Security Policies</CardTitle>
//                   <CardDescription>Configure system security settings</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
//                     <Input
//                       id="session-timeout"
//                       type="number"
//                       value="30"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="max-attempts">Max Login Attempts</Label>
//                     <Input
//                       id="max-attempts"
//                       type="number"
//                       value="5"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="lockout-duration">Lockout Duration (minutes)</Label>
//                     <Input
//                       id="lockout-duration"
//                       type="number"
//                       value="15"
//                     />
//                   </div>

//                   <Button className="w-full">Save Policies</Button>
//                 </CardContent>
//               </Card>
//             </div>
//           </TabsContent>
//         </Tabs>
//       </div>
//     </div>
//   );
// };

// export default AdminPanel;



'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Shield,
  Users,
  Activity,
  Settings,
  Eye,
  Search,
  MapPin,
  Key,
  Filter
} from 'lucide-react';

type AdminSettings = {
  passwordlessEnabled: boolean;
  otpFallbackEnabled: boolean;
  deviceBindingEnabled: boolean;
  locationEnabled: boolean;
  behavioralEnabled: boolean;
};

type RecentLogin = {
  _id?: string;
  id?: number | string;
  user: string;
  timestamp: string; // normalized to string for safe rendering
  location?: string; // normalized to string
  status: 'success' | 'failed' | string;
  riskScore?: 'low' | 'medium' | 'high' | string;
};

type User = {
  _id?: string;
  id?: number | string;
  username: string;
  lastLogin?: string;
  location?: string;
  riskScore?: string;
  status?: string;
};

type SystemHealth = {
  totalUsers: number;
  activeUsers?: number;
  flaggedAccounts?: number;
  successfulLogins?: number;
  failedAttempts?: number;
  systemStatus?: string;
};

const STORAGE_KEY = 'bank_admin_settings';

const defaultSettings: AdminSettings = {
  passwordlessEnabled: true,
  otpFallbackEnabled: true,
  deviceBindingEnabled: true,
  locationEnabled: true,
  behavioralEnabled: true,
};

const AdminPanel: React.FC = () => {
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Dashboard data: total users and recent logins
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [systemLoading, setSystemLoading] = useState(false);
  const [systemError, setSystemError] = useState<string | null>(null);

  const [recentLogins, setRecentLogins] = useState<RecentLogin[]>([]);
  const [loginsLoading, setLoginsLoading] = useState(false);
  const [loginsError, setLoginsError] = useState<string | null>(null);

  // Users tab data (fetched when users tab active)
  const [usersList, setUsersList] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Other tabs data (kept, but not required to change)
  const [suspiciousActivity, setSuspiciousActivity] = useState<any[]>([]);
  const [suspiciousLoading, setSuspiciousLoading] = useState(false);
  const [suspiciousError, setSuspiciousError] = useState<string | null>(null);

  const [behavioralParams, setBehavioralParams] = useState<any[]>([]);
  const [behavioralLoading, setBehavioralLoading] = useState(false);
  const [behavioralError, setBehavioralError] = useState<string | null>(null);

  // -------------------------
  // Helper formatters / normalizers
  // -------------------------
  const formatLocation = (loc: any) => {
    if (!loc) return '—';
    if (typeof loc === 'string') return loc;
    // If city or human-readable fields
    if (loc.city) return loc.city;
    if (loc.name) return loc.name;
    // If coordinates
    const lat = loc.latitude ?? loc.lat ?? loc[0];
    const lng = loc.longitude ?? loc.lng ?? loc[1];
    if ((lat !== undefined && lat !== null) && (lng !== undefined && lng !== null)) {
      // keep 4 decimals
      const latStr = Number(lat).toFixed(4);
      const lngStr = Number(lng).toFixed(4);
      return `${latStr}, ${lngStr}`;
    }
    // fallback small JSON
    try {
      return JSON.stringify(loc);
    } catch {
      return '—';
    }
  };

  const formatTimestamp = (t: any) => {
    if (!t) return '—';
    // already a string
    if (typeof t === 'string') {
      // Try to parse ISO-like strings; if parseable, present local string
      const parsed = new Date(t);
      if (!isNaN(parsed.getTime())) return parsed.toLocaleString();
      return t;
    }
    // Date object
    if (t instanceof Date) {
      if (!isNaN(t.getTime())) return t.toLocaleString();
      return String(t);
    }
    // numeric epoch
    if (typeof t === 'number') {
      const d = new Date(t);
      if (!isNaN(d.getTime())) return d.toLocaleString();
      return String(t);
    }
    // object with timestamp field
    if (t.timestamp) {
      return formatTimestamp(t.timestamp);
    }
    try {
      return String(t);
    } catch {
      return '—';
    }
  };

  // -------------------------
  // API configuration (change API_BASE if backend elsewhere)
  // -------------------------
  const API_BASE = 'http://localhost:5000';
  const ENDPOINTS = {
    system: `${API_BASE}/api/admin/system`,
    users: `${API_BASE}/api/admin/users`,
    logins: `${API_BASE}/api/admin/logins`,
    suspicious: `${API_BASE}/api/admin/suspicious`,
    behavioral: `${API_BASE}/api/admin/behavioral`,
  };

  // -------------------------
  // Persistence & simple toggles
  // -------------------------
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings(JSON.parse(raw));
    } catch (e) {
      console.warn('Failed to load admin settings', e);
    }

    // initial fetches
    fetchSystem();
    fetchLogins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  const persistSettings = (newSettings: AdminSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      window.dispatchEvent(new CustomEvent('adminSettingsUpdated', { detail: newSettings }));
    } catch (e) {
      console.error('Failed to save admin settings', e);
    }
  };

  const toggle = (key: keyof AdminSettings) => {
    persistSettings({ ...settings, [key]: !settings[key] });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getRiskScoreColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  // -------------------------
  // Fetchers (with normalization)
  // -------------------------
  const fetchSystem = async () => {
    setSystemLoading(true);
    setSystemError(null);
    try {
      const res = await fetch(ENDPOINTS.system);
      if (!res.ok) throw new Error(`System fetch failed: ${res.status}`);
      const data = await res.json();
      setSystemHealth(data);
    } catch (err: any) {
      console.error(err);
      setSystemError(err.message || 'Failed to load system stats');
    } finally {
      setSystemLoading(false);
    }
  };

  const fetchLogins = async () => {
    setLoginsLoading(true);
    setLoginsError(null);
    try {
      const res = await fetch(ENDPOINTS.logins);
      if (!res.ok) throw new Error(`Logins fetch failed: ${res.status}`);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : data.logins ?? [];
      // Normalize so frontend always gets safe strings
      const normalized: RecentLogin[] = arr.map((d: any) => ({
        _id: d._id ?? d.id,
        id: d._id ?? d.id,
        user: d.username ?? d.user ?? d.useremail ?? 'Unknown',
        location: formatLocation(d.location ?? d.city ?? d.geo ?? d.coords),
        timestamp: formatTimestamp(d.timestamp ?? d.createdAt ?? d.time),
        status: d.status ?? (d.success ? 'success' : 'failed'),
        riskScore: d.riskScore ?? d.risk ?? 'low',
      }));
      setRecentLogins(normalized);
    } catch (err: any) {
      console.error(err);
      setLoginsError(err.message || 'Failed to load recent logins');
    } finally {
      setLoginsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const res = await fetch(ENDPOINTS.users);
      if (!res.ok) throw new Error(`Users fetch failed: ${res.status}`);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : data.users ?? data.data ?? [];
      // Normalize each user
      const normalizedUsers: User[] = arr.map((u: any) => ({
        _id: u._id ?? u.id,
        id: u._id ?? u.id,
        username: u.username ?? u.name ?? u.email ?? 'Unknown',
        lastLogin: formatTimestamp(u.lastLogin ?? u.last_login ?? u.lastSeen),
        location: formatLocation(u.location ?? u.city),
        riskScore: u.riskScore ?? u.risk ?? 'low',
        status: u.status ?? 'unknown',
      }));
      setUsersList(normalizedUsers);
      if (typeof data.total === 'number') {
        setSystemHealth((prev) => ({ ...(prev ?? {} as SystemHealth), totalUsers: data.total }));
      }
    } catch (err: any) {
      console.error(err);
      setUsersError(err.message || 'Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchSuspicious = async () => {
    setSuspiciousLoading(true);
    setSuspiciousError(null);
    try {
      const res = await fetch(ENDPOINTS.suspicious);
      if (!res.ok) throw new Error(`Suspicious fetch failed: ${res.status}`);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : data.suspicious ?? [];
      setSuspiciousActivity(arr);
    } catch (err: any) {
      console.error(err);
      setSuspiciousError(err.message || 'Failed to load suspicious activity');
    } finally {
      setSuspiciousLoading(false);
    }
  };

  const fetchBehavioral = async () => {
    setBehavioralLoading(true);
    setBehavioralError(null);
    try {
      const res = await fetch(ENDPOINTS.behavioral);
      if (!res.ok) throw new Error(`Behavioral fetch failed: ${res.status}`);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : data.behavioral ?? [];
      setBehavioralParams(arr);
    } catch (err: any) {
      console.error(err);
      setBehavioralError(err.message || 'Failed to load behavioral params');
    } finally {
      setBehavioralLoading(false);
    }
  };

  // filter users in Users tab
  const displayedUsers = usersList.filter((u) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      String(u.username ?? '').toLowerCase().includes(q) ||
      String(u.location ?? '').toLowerCase().includes(q) ||
      String(u.status ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage authentication, monitor security, and oversee user activity</p>
        </div>

        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={(v) => setActiveTab(v as string)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="auth" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Auth Controls
            </TabsTrigger>
            <TabsTrigger value="behavioral" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Behavioral
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* DASHBOARD */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {systemLoading ? 'Loading...' : (systemHealth?.totalUsers ?? '—')}
                  </div>
                  <p className="text-xs text-muted-foreground">Total registered users in the system</p>
                  {systemError && <p className="text-xs text-destructive mt-2">{systemError}</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Login Attempts</CardTitle>
                  <CardDescription>Latest authentication activities</CardDescription>
                </CardHeader>
                <CardContent>
                  {loginsLoading ? (
                    <div>Loading recent logins...</div>
                  ) : loginsError ? (
                    <div className="text-destructive">{loginsError}</div>
                  ) : (
                    <div className="space-y-4">
                      {recentLogins.length === 0 && <div className="text-muted-foreground">No recent logins</div>}
                      {recentLogins.map((login) => (
                        <div key={login._id || login.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${login.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                            <div>
                              <p className="font-medium">{login.user}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {login.location ?? '—'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={getRiskScoreColor(login.riskScore ?? 'low')}>{login.riskScore ?? 'low'}</Badge>
                            <p className="text-xs text-muted-foreground mt-1">{login.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* USERS */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Search and manage user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <Input placeholder="Search users..." className="w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                  <Button variant="outline" className="flex items-center gap-2" onClick={() => fetchUsers()}>
                    <Search className="w-4 h-4" />
                    Refresh
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2" onClick={() => fetchUsers()}>
                    <Filter className="w-4 h-4" />
                    Filter
                  </Button>
                </div>

                {usersLoading ? (
                  <div>Loading users...</div>
                ) : usersError ? (
                  <div className="text-destructive">{usersError}</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Risk Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayedUsers.map((user) => (
                        <TableRow key={user._id ?? user.id}>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.lastLogin ?? '—'}</TableCell>
                          <TableCell>{user.location ?? '—'}</TableCell>
                          <TableCell>
                            <Badge variant={getRiskScoreColor(user.riskScore ?? 'low')}>{user.riskScore ?? 'low'}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={(user.status === 'active' || user.status === 'success') ? 'default' : 'destructive'}>
                              {user.status ?? '—'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">View Details</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AUTH CONTROLS */}
          <TabsContent value="auth" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Passwordless Authentication Controls</CardTitle>
                <CardDescription>Manage global authentication settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Global Passwordless Authentication</Label>
                    <p className="text-sm text-muted-foreground">Enable or disable passwordless auth system-wide</p>
                  </div>
                  <Switch
                    checked={settings.passwordlessEnabled}
                    onCheckedChange={() => toggle('passwordlessEnabled')}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">OTP Fallback</Label>
                    <p className="text-sm text-muted-foreground">Allow OTP as backup authentication method</p>
                  </div>
                  <Switch
                    checked={settings.otpFallbackEnabled}
                    onCheckedChange={() => toggle('otpFallbackEnabled')}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Device Binding</Label>
                    <p className="text-sm text-muted-foreground">Bind authentication to specific devices</p>
                  </div>
                  <Switch
                    checked={settings.deviceBindingEnabled}
                    onCheckedChange={() => toggle('deviceBindingEnabled')}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Location Button</Label>
                    <p className="text-sm text-muted-foreground">Show or hide "Get Location" button on login form</p>
                  </div>
                  <Switch
                    checked={settings.locationEnabled}
                    onCheckedChange={() => toggle('locationEnabled')}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Behavioral Tracking</Label>
                    <p className="text-sm text-muted-foreground">Enable/disable keystroke & behavioral tracking on login</p>
                  </div>
                  <Switch
                    checked={settings.behavioralEnabled}
                    onCheckedChange={() => toggle('behavioralEnabled')}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base">Per-User Controls</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="user-search">User Identifier</Label>
                      <Input id="user-search" placeholder="Enter username or email" />
                    </div>
                    <div className="flex items-end">
                      <Button variant="outline" className="w-full">Apply Settings</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* BEHAVIORAL */}
          <TabsContent value="behavioral" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Behavioral Authentication Parameters</CardTitle>
                <CardDescription>Configure biometric and behavioral analysis settings</CardDescription>
              </CardHeader>
              <CardContent>
                {behavioralLoading ? (
                  <div>Loading behavioral parameters...</div>
                ) : behavioralError ? (
                  <div className="text-destructive">{behavioralError}</div>
                ) : (
                  <div className="space-y-6">
                    {behavioralParams.length === 0 && <div className="text-muted-foreground">No behavioral parameters configured</div>}
                    {behavioralParams.map((param: any, index: number) => (
                      <div key={param._id ?? index} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base">{param.name}</Label>
                            <p className="text-sm text-muted-foreground">
                              Threshold: {param.threshold ?? '—'} | Current: {param.current ?? '—'}
                            </p>
                          </div>
                          <Switch checked={!!param.enabled} onCheckedChange={() => { /* optional */ }} />
                        </div>

                        {param.enabled && (
                          <div className="ml-6 space-y-2">
                            <Label htmlFor={`threshold-${index}`}>Sensitivity Threshold</Label>
                            <Input
                              id={`threshold-${index}`}
                              value={param.threshold ?? ''}
                              className="w-32"
                              readOnly
                            />
                          </div>
                        )}

                        {index < behavioralParams.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SETTINGS */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Configuration</CardTitle>
                  <CardDescription>Manage API keys and integrations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-key">Primary API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        id="api-key"
                        type="password"
                        value="sk-***************************"
                        readOnly
                      />
                      <Button variant="outline" size="sm">
                        <Key className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <Input
                      id="webhook-url"
                      placeholder="https://your-app.com/webhook"
                    />
                  </div>

                  <Button className="w-full">Update Configuration</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Policies</CardTitle>
                  <CardDescription>Configure system security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      value="30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-attempts">Max Login Attempts</Label>
                    <Input
                      id="max-attempts"
                      type="number"
                      value="5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lockout-duration">Lockout Duration (minutes)</Label>
                    <Input
                      id="lockout-duration"
                      type="number"
                      value="15"
                    />
                  </div>

                  <Button className="w-full">Save Policies</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
