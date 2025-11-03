'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { BroadcastComposer } from '@/components/dashboard/broadcast-composer';
import { BroadcastsList } from '@/components/dashboard/broadcasts-list';
import { BroadcastUsageCard } from '@/components/dashboard/broadcast-usage-card';
import { UpgradePrompt } from '@/components/upgrade-prompt';
import { CardSkeleton } from '@/components/ui/skeleton';
import type { Broadcast } from '@/types/blok';

function BroadcastsContent() {
  const searchParams = useSearchParams();
  const [building, setBuilding] = useState<any>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [broadcastCount, setBroadcastCount] = useState(0);
  const [hasAccess, setHasAccess] = useState(true);
  const [loading, setLoading] = useState(true);

  // Read prefill data from URL params
  const initialTitle = searchParams.get('title') || '';
  const initialMessage = searchParams.get('message') || '';
  const initialTarget = (searchParams.get('target') as 'all' | 'owners' | 'renters' | 'specific_units') || 'all';

  // Fetch broadcasts from server
  const fetchBroadcasts = async (buildingId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from('broadcasts')
      .select('*')
      .eq('building_id', buildingId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      setBroadcasts(data);
    }
  };

  // Initial load
  useEffect(() => {
    const supabase = createClient();

    const loadData = async () => {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get building
      const { data: buildingData } = await supabase
        .from('buildings')
        .select('*')
        .eq('admin_user_id', user.id)
        .single();

      if (!buildingData) {
        setLoading(false);
        return;
      }

      setBuilding(buildingData);

      // Get units
      const { data: unitsData } = await supabase
        .from('units')
        .select('id, unit_number')
        .eq('building_id', buildingData.id)
        .order('unit_number', { ascending: true });

      if (unitsData) {
        setUnits(unitsData);
      }

      // Get broadcasts
      await fetchBroadcasts(buildingData.id);

      setLoading(false);
    };

    loadData();
  }, []);

  // Handler for when broadcast is sent
  const handleBroadcastSent = async () => {
    if (building?.id) {
      await fetchBroadcasts(building.id);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-24 lg:pb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Anuncios</h1>
          <p className="text-sm text-muted-foreground">
            Envía mensajes masivos a tus residentes
          </p>
        </div>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!building) {
    return <div>No se encontró el edificio</div>;
  }

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-1">Anuncios</h1>
        <p className="text-sm text-muted-foreground">
          Envía mensajes masivos a tus residentes
        </p>
      </div>

      {/* Feature Gate: Check if user has access to broadcasts */}
      {!hasAccess ? (
        <UpgradePrompt
          currentPlan={null}
          requiredPlan="PROFESSIONAL"
          feature="Anuncios"
          description="Envía mensajes masivos a todos tus residentes, propietarios, o inquilinos con el plan Professional."
        />
      ) : (
        <>
          {/* Broadcast Usage Stats */}
          <BroadcastUsageCard count={broadcastCount} limit={null} />

          {/* Broadcast Composer */}
          <BroadcastComposer
            buildingId={building.id}
            units={units}
            onBroadcastSent={handleBroadcastSent}
            initialTitle={initialTitle}
            initialMessage={initialMessage}
            initialTarget={initialTarget}
          />

          {/* Recent Broadcasts */}
          <BroadcastsList initialBroadcasts={broadcasts} buildingId={building.id} />
        </>
      )}
    </div>
  );
}

export default function BroadcastsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6 pb-24 lg:pb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Anuncios</h1>
          <p className="text-sm text-muted-foreground">
            Envía mensajes masivos a tus residentes
          </p>
        </div>
        <CardSkeleton />
        <CardSkeleton />
      </div>
    }>
      <BroadcastsContent />
    </Suspense>
  );
}
