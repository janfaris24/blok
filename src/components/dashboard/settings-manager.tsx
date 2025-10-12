'use client';

import { useState } from 'react';
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
import { Globe, User, Building2, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/language-context';

interface SettingsManagerProps {
  building: any;
  userEmail: string;
  userName: string;
}

export function SettingsManager({ building, userEmail, userName }: SettingsManagerProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState(building.preferred_language || 'es');
  const [adminName, setAdminName] = useState(userName || '');

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
        throw new Error(t.messages.error);
      }

      toast.success(t.messages.saved);
      router.refresh();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(t.messages.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
  );
}
