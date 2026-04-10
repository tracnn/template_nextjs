export interface PaginatedResponse<T> {
  data: T[];
  meta: { itemsPerPage: number; totalItems: number; currentPage: number; totalPages: number };
  links: { first: string; prev: string | null; current: string; next: string | null; last: string };
}

export interface Medication {
  id: string; drugCode: string; drugName: string; activeIngredient: string | null;
  drugClass: string | null; atcCode: string | null; fhirCode: string | null;
  isActive: boolean; createdAt: string; updatedAt: string;
}

export interface DrugInteraction {
  id: string; drugAId: string; drugBId: string; drugA?: Medication; drugB?: Medication;
  severity: 'critical' | 'high' | 'moderate' | 'low'; mechanism: string | null;
  clinicalEffect: string | null; clinicalEffectI18n: Record<string, string> | null;
  recommendation: string | null; recommendationI18n: Record<string, string> | null;
  sourceRef: string | null; isActive: boolean; createdAt: string;
}

export interface AllergenRule {
  id: string; allergenCode: string; allergenName: string; blockedDrugClass: string | null;
  blockedDrugId: string | null; blockedDrug?: Medication | null;
  severity: 'contraindicated' | 'caution'; messageI18n: Record<string, string> | null;
  sourceRef: string | null; createdAt: string;
}

export interface ContraindicationRule {
  id: string; conditionCode: string; conditionName: string; drugId: string; drug?: Medication;
  severity: 'contraindicated' | 'caution'; messageI18n: Record<string, string> | null;
  labThreshold: { loinc: string; operator: string; value: number } | null;
  sourceRef: string | null; createdAt: string;
}

export interface ApiKeyItem {
  id: string; name: string; hospitalCode: string; isActive: boolean;
  lastUsedAt: string | null; createdAt: string;
}

export interface AuditLogItem {
  id: string; apiKeyId: string; evaluationId: string | null; apiVersion: string;
  hospitalCode: string; durationMs: number | null; statusCode: number; createdAt: string;
}

export interface AnalyticsStats {
  period: { from: string; to: string }; totalEvaluations: number; totalAlerts: number;
  bySeverity: Record<string, number>; byType: Record<string, number>;
  byHospital: Array<{ hospitalCode: string; evaluations: number; alerts: number }>;
  topInteractions: Array<{ drugA: string; drugB: string; count: number }>;
}
