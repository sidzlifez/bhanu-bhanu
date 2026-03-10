import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { User, Lock, Bell, Mail, Moon, Shield, Save } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useDatabase } from '@/context/DatabaseContext';

gsap.registerPlugin(ScrollTrigger);

export function Settings() {
  const { currentUser, updateUser } = useDatabase();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('general');

  const [generalForm, setGeneralForm] = useState({
    name: currentUser.name,
    email: currentUser.email,
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [preferences, setPreferences] = useState({
    notifications: currentUser.preferences.notifications,
    emailAlerts: currentUser.preferences.emailAlerts,
    darkMode: currentUser.preferences.darkMode,
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.settings-card',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            end: 'top 50%',
            scrub: 0.8,
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleGeneralSave = () => {
    updateUser({
      name: generalForm.name,
      email: generalForm.email,
    });
  };

  const handleSecuritySave = () => {
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    // In a real app, this would update the password
    alert('Password updated successfully');
    setSecurityForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handlePreferencesSave = () => {
    updateUser({
      preferences: {
        ...currentUser.preferences,
        ...preferences,
      },
    });
  };

  return (
    <div ref={sectionRef} className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#111827]">Settings</h1>
        <p className="text-[#6B7280] mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Card */}
      <Card className="settings-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-[#2E5BFF]/10 flex items-center justify-center text-2xl font-bold text-[#2E5BFF]">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[#111827]">{currentUser.name}</h3>
              <p className="text-[#6B7280]">{currentUser.email}</p>
              <Badge className="mt-2 bg-[#2E5BFF]/10 text-[#2E5BFF] hover:bg-[#2E5BFF]/10">
                {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="settings-card">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={generalForm.name}
                  onChange={(e) => setGeneralForm({ ...generalForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={generalForm.email}
                  onChange={(e) => setGeneralForm({ ...generalForm, email: e.target.value })}
                />
              </div>
              <Button 
                onClick={handleGeneralSave}
                className="bg-[#2E5BFF] hover:bg-[#1E4BEF]"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input
                  type="password"
                  value={securityForm.currentPassword}
                  onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={securityForm.newPassword}
                  onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  value={securityForm.confirmPassword}
                  onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                />
              </div>
              <Button 
                onClick={handleSecuritySave}
                className="bg-[#2E5BFF] hover:bg-[#1E4BEF]"
              >
                <Lock className="w-4 h-4 mr-2" />
                Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-[#111827]">Push Notifications</p>
                    <p className="text-sm text-[#6B7280]">Receive notifications in the app</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.notifications}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, notifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-[#111827]">Email Alerts</p>
                    <p className="text-sm text-[#6B7280]">Receive email notifications</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.emailAlerts}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, emailAlerts: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Moon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-[#111827]">Dark Mode</p>
                    <p className="text-sm text-[#6B7280]">Enable dark theme</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.darkMode}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, darkMode: checked })}
                />
              </div>

              <Button 
                onClick={handlePreferencesSave}
                className="bg-[#2E5BFF] hover:bg-[#1E4BEF]"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
