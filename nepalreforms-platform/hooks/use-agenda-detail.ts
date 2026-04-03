import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { loadAgendaDetailData } from '@/lib/i18n';
import { ManifestoDetailItem, ManifestoSummaryItem } from './use-manifesto-data';
import { withPublicProgress } from '@/lib/public-progress';

export interface CombinedManifestoItem extends ManifestoSummaryItem {
  updatedOn?: string;
  problem: { short: string; long: string };
  solution: { short: string[]; long: { phases: Array<{ phase: string; title: string; items: string[] }> } };
  realWorldEvidence: { short: string[]; long: Array<{ country: string; details: string; impact: string }> };
  implementation: { short: string[]; long: Array<{ timeline: string; description: string; details: string[] }> };
}

type CombinedManifestoItemInput = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  timeline: string;
  performanceTargets: string[];
  legalFoundation?: string;
  updatedOn?: string;
  problem: { short: string; long: string };
  solution: { short: string[]; long: { phases: Array<{ phase: string; title: string; items: string[] }> } };
  realWorldEvidence: { short: string[]; long: Array<{ country: string; details: string; impact: string }> };
  implementation: { short: string[]; long: Array<{ timeline: string; description: string; details: string[] }> };
};

function normalizeCombinedManifestoItem(item: CombinedManifestoItemInput): CombinedManifestoItem {
  return withPublicProgress({
    ...item,
    performanceTargets: item.performanceTargets ?? [],
    problem: item.problem ?? { short: '', long: '' },
    solution: item.solution ?? { short: [], long: { phases: [] } },
    realWorldEvidence: item.realWorldEvidence ?? { short: [], long: [] },
    implementation: item.implementation ?? { short: [], long: [] },
  }) as CombinedManifestoItem;
}

function normalizeDetailItem(item: any): ManifestoDetailItem {
  return withPublicProgress({
    ...item,
    performanceTargets: item.performanceTargets ?? [],
    problem: item.problem ?? { long: '' },
    solution: item.solution ?? { long: { phases: [] } },
    realWorldEvidence: item.realWorldEvidence ?? { long: [] },
    implementation: item.implementation ?? { long: [] },
  }) as ManifestoDetailItem;
}

export function useAgendaDetail(agendaId: string, summaryData?: ManifestoSummaryItem) {
  const { i18n } = useTranslation();
  const [agendaDetail, setAgendaDetail] = useState<ManifestoDetailItem | null>(null);
  const [combinedData, setCombinedData] = useState<CombinedManifestoItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const detailDataRaw = await loadAgendaDetailData(i18n.language, agendaId);
        if (!detailDataRaw) {
          setError(`Agenda ${agendaId} not found`);
          setLoading(false);
          return;
        }

        const detailData = normalizeDetailItem(detailDataRaw);
        setAgendaDetail(detailData);

        if (summaryData) {
          setCombinedData(normalizeCombinedManifestoItem({
            id: summaryData.id,
            title: summaryData.title,
            description: summaryData.description,
            category: summaryData.category,
            priority: summaryData.priority,
            timeline: summaryData.timeline,
            performanceTargets: summaryData.performanceTargets,
            legalFoundation: summaryData.legalFoundation,
            updatedOn: detailData.updatedOn,
            problem: { short: summaryData.problem.short, long: detailData.problem.long },
            solution: { short: summaryData.solution.short, long: detailData.solution.long },
            realWorldEvidence: { short: summaryData.realWorldEvidence.short, long: detailData.realWorldEvidence.long },
            implementation: { short: summaryData.implementation.short, long: detailData.implementation.long },
          }));
        } else {
          setCombinedData(normalizeCombinedManifestoItem({
            id: detailData.id,
            title: detailData.title,
            description: detailData.description,
            category: detailData.category,
            priority: detailData.priority,
            timeline: detailData.timeline,
            performanceTargets: detailData.performanceTargets,
            legalFoundation: detailData.legalFoundation,
            updatedOn: detailData.updatedOn,
            problem: { short: '', long: detailData.problem.long },
            solution: { short: [], long: detailData.solution.long },
            realWorldEvidence: { short: [], long: detailData.realWorldEvidence.long },
            implementation: { short: [], long: detailData.implementation.long },
          }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load agenda data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [agendaId, i18n.language, summaryData]);

  return { agendaDetail, combinedData, loading, error, hasSummaryData: !!summaryData };
}

export function useAgendaSummary(agendaId: string) {
  const { i18n } = useTranslation();
  const [summaryData, setSummaryData] = useState<ManifestoSummaryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummaryData = async () => {
      try {
        const existingBundle = i18n.getResourceBundle(i18n.language, 'manifesto-summary');
        if (existingBundle?.items) {
          const items = existingBundle.items.manifestoData || existingBundle.items;
          const item = items.find((item: ManifestoSummaryItem) => item.id === agendaId);
          if (item) {
            setSummaryData(withPublicProgress(item));
            setLoading(false);
            return;
          }
        }

        const { loadManifestoSummaryData } = await import('@/lib/i18n');
        const data = await loadManifestoSummaryData(i18n.language);
        const item = data.find((item: ManifestoSummaryItem) => item.id === agendaId);
        setSummaryData(item ? withPublicProgress(item) : null);
      } catch (error) {
        console.error(`Failed to load summary data for agenda ${agendaId}:`, error);
        setSummaryData(null);
      } finally {
        setLoading(false);
      }
    };

    loadSummaryData();
  }, [agendaId, i18n.language]);

  return { summaryData, loading };
}