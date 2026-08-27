import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { loadManifestoSummaryData } from '@/lib/i18n';
import { PublicProgressFields, withPublicProgress } from '@/lib/public-progress';
import { AgendaGraphStatus, fetchAgendaGraphStatus } from '@/lib/tracker-graph';

export interface ManifestoSummaryItem extends PublicProgressFields {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  timeline: string;
  problem: { short: string };
  solution: { short: string[] };
  performanceTargets: string[];
  realWorldEvidence: { short: string[] };
  implementation: { short: string[] };
  legalFoundation?: string;
}

export interface ManifestoItem extends ManifestoSummaryItem {
  problem: { short: string; long: string };
  solution: { short: string[]; long: { phases: Array<{ phase: string; title: string; items: string[] }> } };
  realWorldEvidence: { short: string[]; long: Array<{ country: string; details: string; impact: string }> };
  implementation: { short: string[]; long: Array<{ timeline: string; description: string; details: string[] }> };
}

export interface ManifestoDetailItem extends PublicProgressFields {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  timeline: string;
  updatedOn?: string;
  problem: { long: string };
  solution: { long: { phases: Array<{ phase: string; title: string; items: string[] }> } };
  realWorldEvidence: { long: Array<{ country: string; details: string; impact: string }> };
  implementation: { long: Array<{ timeline: string; description: string; details: string[] }> };
  performanceTargets: string[];
  legalFoundation?: string;
}

const manifestoCache: Record<string, ManifestoSummaryItem[]> = {};

function normalizeManifestoSummaryItems(items: any[], graphStatusById: Record<string, AgendaGraphStatus> = {}): ManifestoSummaryItem[] {
  return items.map((item) => withPublicProgress({
    ...item,
    graphStatus: graphStatusById[String(item.id)] ?? null,
    problem: item.problem ?? { short: '' },
    solution: item.solution ?? { short: [] },
    realWorldEvidence: item.realWorldEvidence ?? { short: [] },
    implementation: item.implementation ?? { short: [] },
    performanceTargets: item.performanceTargets ?? [],
  }));
}

export function useManifestoData() {
  const { i18n } = useTranslation();
  const [manifestoData, setManifestoData] = useState<ManifestoSummaryItem[]>(() => manifestoCache[i18n.language] || []);
  const [loading, setLoading] = useState(!manifestoCache[i18n.language]);

  useEffect(() => {
    if (manifestoCache[i18n.language]) {
      setManifestoData(manifestoCache[i18n.language]);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      const data = await loadManifestoSummaryData(i18n.language);
      const graphStatusById = await fetchAgendaGraphStatus(data.map((item: { id: string }) => String(item.id)));
      const normalized = normalizeManifestoSummaryItems(data, graphStatusById);
      manifestoCache[i18n.language] = normalized;
      setManifestoData(normalized);
      setLoading(false);
    };

    loadData();
  }, [i18n.language]);

  const getManifestoItemById = (id: string) => manifestoData.find((item) => item.id === id);
  const getManifestoItemsByCategory = (category: string) => manifestoData.filter((item) => item.category === category);
  const getAllCategories = () => [...new Set(manifestoData.map((item) => item.category))];

  return { manifestoData, loading, getManifestoItemById, getManifestoItemsByCategory, getAllCategories };
}