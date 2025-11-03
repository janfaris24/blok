'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, User, Building2, Save, Loader2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/language-context';
import { BillingSection } from './billing-section';
import { type UsageStats } from '@/lib/usage-tracking';
import { BoardMembersManager } from './board-members-manager';

interface SettingsManagerProps {
  building: any;
  userEmail: string;
  userName: string;
  usageStats?: UsageStats | null;
}

export function SettingsManager({ building, userEmail, userName, usageStats }: SettingsManagerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState(building.preferred_language || 'es');
  const [adminName, setAdminName] = useState(userName || '');
  const [activeTab, setActiveTab] = useState('general');

  // Set initial tab from query parameter and handle redirects
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'billing' || tab === 'building' || tab === 'general') {
      setActiveTab(tab);
    }

    // Show success toast when returning from Stripe portal
    const portal = searchParams.get('portal');
    if (portal === 'closed') {
      toast.success(t.settings.changesSaved, {
        description: t.settings.subscriptionUpdated,
      });
    }

    // Show toast when returning from successful checkout
    const checkout = searchParams.get('checkout');
    if (checkout === 'success') {
      toast.success(t.settings.subscriptionActivated, {
        description: t.settings.welcomeMessage,
      });
      // Refresh to show updated subscription data
      setTimeout(() => router.refresh(), 1000);
    } else if (checkout === 'canceled') {
      toast.info(t.settings.paymentCanceled, {
        description: t.settings.paymentCanceledDesc,
      });
    }

    // Clean up URL parameters
    if (portal || checkout) {
      const url = new URL(window.location.href);
      url.searchParams.delete('portal');
      url.searchParams.delete('checkout');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams, router]);

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Update building language preference
      const response = await fetch('/api/settings/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferred_language: language,
          admin_name: adminName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Settings update failed:', errorData);
        throw new Error(t.messages.error);
      }

      const result = await response.json();
      console.log('Settings updated successfully:', result);

      toast.success(t.messages.saved);

      // Force a hard refresh to reload the layout with new language
      window.location.reload();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(t.messages.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 max-w-md">
        <TabsTrigger value="general">
          <User className="w-4 h-4 mr-2" />
          {t.settings.generalTab}
        </TabsTrigger>
        <TabsTrigger value="building">
          <Building2 className="w-4 h-4 mr-2" />
          {t.settings.buildingTab}
        </TabsTrigger>
        <TabsTrigger value="billing">
          <CreditCard className="w-4 h-4 mr-2" />
          {t.settings.billingTab}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="mt-6">
        <div className="grid gap-6 max-w-4xl">
          {/* Language Settings */}
          <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <CardTitle>{t.settings.language}</CardTitle>
          </div>
          <CardDescription>
            {t.settings.languageDesc}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">{t.settings.interfaceLanguage}</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🇪🇸</span>
                    <span>{t.languages.es}</span>
                  </div>
                </SelectItem>
                <SelectItem value="en">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🇺🇸</span>
                    <span>{t.languages.en}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t.settings.languageNote}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Admin Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <CardTitle>{t.settings.adminProfile}</CardTitle>
          </div>
          <CardDescription>
            {t.settings.profileDesc}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-name">{t.settings.fullName}</Label>
            <Input
              id="admin-name"
              type="text"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              placeholder={t.settings.fullName}
            />
            <p className="text-xs text-muted-foreground">
              {t.settings.fullNameNote}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t.settings.email}</Label>
            <Input
              id="email"
              type="email"
              value={userEmail}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              {t.settings.emailNote}
            </p>
          </div>
        </CardContent>
      </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isLoading} size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t.settings.saving}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {t.settings.save}
                </>
              )}
            </Button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="building" className="mt-6">
        <div className="grid gap-6 max-w-4xl">
          {/* Building Info (Read-only) */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                <CardTitle>{t.settings.buildingInfo}</CardTitle>
              </div>
              <CardDescription>
                {t.settings.buildingInfoDesc}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.settings.buildingName}</Label>
                  <Input value={building.name} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>{t.settings.address}</Label>
                  <Input value={building.address} disabled className="bg-muted" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Board Members */}
          <BoardMembersManager buildingId={building.id} />
        </div>
      </TabsContent>

      <TabsContent value="billing" className="mt-6">
        <BillingSection building={building} usageStats={usageStats} />
      </TabsContent>
    </Tabs>
  );
}
