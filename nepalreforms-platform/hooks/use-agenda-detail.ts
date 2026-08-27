import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { loadAgendaDetailData } from '@/lib/i18n';
import { ManifestoDetailItem, ManifestoSummaryItem } from './use-manifesto-data';
import { withPublicProgress } from '@/lib/public-progress';
import { fetchAgendaGraphStatus } from '@/lib/tracker-graph';

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
  graphStatus?: any;
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

function normalizeDetailItem(item: any, graphStatus?: any): ManifestoDetailItem {
  return withPublicProgress({
    ...item,
    graphStatus: graphStatus ?? null,
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [detailDataRaw, graphStatusById] = await Promise.all([
          loadAgendaDetailData(i18n.language, agendaId),
          fetchAgendaGraphStatus([agendaId]),
        ]);
        if (isCancelled) return;
        if (!detailDataRaw) {
          setError(`Agenda ${agendaId} not found`);
          setLoading(false);
          return;
        }

        const graphStatus = graphStatusById[agendaId] ?? summaryData?.graphStatus ?? null;
        const detailData = normalizeDetailItem(detailDataRaw, graphStatus);
        setAgendaDetail(detailData);
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load agenda data');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      isCancelled = true;
    };
  }, [agendaId, i18n.language]);

  const combinedData = useMemo<CombinedManifestoItem | null>(() => {
    if (!agendaDetail) return null;
    const graphStatus = summaryData?.graphStatus ?? agendaDetail.graphStatus ?? null;

    if (summaryData) {
      return normalizeCombinedManifestoItem({
        id: summaryData.id,
        title: summaryData.title,
        description: summaryData.description,
        category: summaryData.category,
        priority: summaryData.priority,
        timeline: summaryData.timeline,
        performanceTargets: summaryData.performanceTargets,
        legalFoundation: summaryData.legalFoundation,
        updatedOn: agendaDetail.updatedOn,
        graphStatus,
        problem: { short: summaryData.problem.short, long: agendaDetail.problem.long },
        solution: { short: summaryData.solution.short, long: agendaDetail.solution.long },
        realWorldEvidence: { short: summaryData.realWorldEvidence.short, long: agendaDetail.realWorldEvidence.long },
        implementation: { short: summaryData.implementation.short, long: agendaDetail.implementation.long },
      });
    }

    return normalizeCombinedManifestoItem({
      id: agendaDetail.id,
      title: agendaDetail.title,
      description: agendaDetail.description,
      category: agendaDetail.category,
      priority: agendaDetail.priority,
      timeline: agendaDetail.timeline,
      performanceTargets: agendaDetail.performanceTargets,
      legalFoundation: agendaDetail.legalFoundation,
      updatedOn: agendaDetail.updatedOn,
      graphStatus,
      problem: { short: '', long: agendaDetail.problem.long },
      solution: { short: [], long: agendaDetail.solution.long },
      realWorldEvidence: { short: [], long: agendaDetail.realWorldEvidence.long },
      implementation: { short: [], long: agendaDetail.implementation.long },
    });
  }, [agendaDetail, summaryData]);

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
        const graphStatusById = await fetchAgendaGraphStatus([agendaId]);
        const item = data.find((item: ManifestoSummaryItem) => item.id === agendaId);
        setSummaryData(item ? withPublicProgress({ ...item, graphStatus: graphStatusById[agendaId] ?? null }) : null);
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