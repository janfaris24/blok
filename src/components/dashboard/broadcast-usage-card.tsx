'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Calendar } from 'lucide-react';

interface BroadcastUsageCardProps {
  count: number;
  limit?: number | null; // null = unlimited
}

export function BroadcastUsageCard({ count, limit }: BroadcastUsageCardProps) {
  const currentMonth = new Date().toLocaleDateString('es-PR', { month: 'long', year: 'numeric' });
  const isUnlimited = limit === null || limit === undefined;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Megaphone className="w-4 h-4" />
          Anuncios este mes
        </CardTitle>
        <CardDescription className="flex items-center gap-1 text-xs">
          <Calendar className="w-3 h-3" />
          {currentMonth}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">{count}</span>
          {!isUnlimited && limit && (
            <>
              <span className="text-muted-foreground">/ {limit}</span>
              <Badge variant="secondary" className="ml-auto">
                {limit - count} restantes
              </Badge>
            </>
          )}
          {isUnlimited && (
            <Badge variant="secondary" className="ml-auto">
              Ilimitado
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {count === 0 ? 'No has enviado anuncios este mes' :
           count === 1 ? 'Has enviado 1 anuncio este mes' :
           `Has enviado ${count} anuncios este mes`}
        </p>
      </CardContent>
    </Card>
  );
}
