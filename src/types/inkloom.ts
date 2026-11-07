/**
 * INKLOOM AI - Type Definitions
 * Complete definitions for the 15-table relational schema & AI pipeline.
 */

export type UserRole = 'admin' | 'creator' | 'reviewer';

export interface User {
  user_id: string;
  org_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Organisation {
  org_id: string;
  name: string;
  domain?: string;
  created_at: string;
}

export interface BrandProfile {
  profile_id: string;
  org_id: string;
  name: string;
  voice_notes: string;
  external_ai_allowed: boolean;
  team_visibility: 'team' | 'own';
  status: 'active' | 'archived';
  created_at: string;
}

export type GuidelineCategory =
  | 'tone'
  | 'claims'
  | 'terminology'
  | 'accessibility'
  | 'visual'
  | 'general';

export type ContentType =
  | 'email'
  | 'social_post'
  | 'blog'
  | 'ad_copy'
  | 'landing_page'
  | 'press_release';

export interface BrandGuideline {
  guideline_id: string;
  profile_id: string;
  code: string; // e.g. G-01
  title: string;
  category: GuidelineCategory;
  rule_text: string;
  content_types: ContentType[];
  example_good?: string;
  example_bad?: string;
  version: number;
  is_active: boolean;
  created_at: string;
}

export interface ApprovedFact {
  fact_id: string;
  profile_id: string;
  code: string; // e.g. F-01
  statement: string;
  subject: string;
  source_ref?: string;
  valid_until?: string; // YYYY-MM-DD
  is_active: boolean;
  created_at: string;
}

export interface TerminologyItem {
  term_id: string;
  profile_id: string;
  code: string; // e.g. T-01
  preferred_term: string;
  avoid_terms: string[];
  notes?: string;
  case_sensitive: boolean;
}

export interface BrandAsset {
  asset_id: string;
  profile_id: string;
  name: string;
  asset_type: 'logo' | 'color' | 'font' | 'image';
  file_url?: string;
  alt_text?: string;
  created_at: string;
}

export type SubmissionStatus =
  | 'draft'
  | 'in_analysis'
  | 'in_correction'
  | 'in_review'
  | 'approved'
  | 'changes_requested';

export interface ContentSubmission {
  submission_id: string;
  profile_id: string;
  creator_id: string;
  creator_name?: string;
  title: string;
  content_type: ContentType;
  status: SubmissionStatus;
  created_at: string;
  updated_at: string;
}

export interface MediaItem {
  name: string;
  alt_text: string | null;
  url?: string;
}

export interface LinkItem {
  text: string;
  url: string;
}

export interface ContentVersion {
  version_id: string;
  submission_id: string;
  version_no: number;
  body_text: string;
  media: MediaItem[];
  links: LinkItem[];
  source: 'creator_submit' | 'ai_applied' | 'edited';
  created_by: string;
  created_by_name?: string;
  created_at: string;
}

export type IssueCategory =
  | 'fact_conflict'
  | 'unsupported_claim'
  | 'terminology'
  | 'tone'
  | 'accessibility';

export type IssueSeverity = 'high' | 'medium' | 'low';

export type IssueStatus =
  | 'verified_conflict'
  | 'needs_human_check'
  | 'rule_violation';

export type SuggestionStatus = 'pending' | 'accepted' | 'edited' | 'dismissed';

export interface CorrectionSuggestion {
  suggestion_id: string;
  issue_id: string;
  suggested_text: string;
  rationale: string;
  status: SuggestionStatus;
  final_text?: string;
  dismiss_reason?: string;
  responded_by?: string;
  responded_at?: string;
}

export interface EvidenceItem {
  code: string;
  type: 'guideline' | 'fact' | 'term';
  title?: string;
  text: string;
}

export interface DetectedIssue {
  issue_id: string;
  report_id: string;
  category: IssueCategory;
  severity: IssueSeverity;
  status: IssueStatus;
  confidence: 'high' | 'medium' | 'low';
  excerpt: string;
  start_offset: number;
  end_offset: number;
  evidence_refs: string[];
  evidence_items?: EvidenceItem[];
  explanation: string;
  suggestion?: CorrectionSuggestion;
  source: 'code' | 'ai';
}

export interface AnalysisReport {
  report_id: string;
  version_id: string;
  summary: {
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  model_name: string;
  modelName?: string;
  ai_status: 'completed' | 'ai_unavailable' | 'skipped_external_ai_disabled';
  created_at: string;
  issues: DetectedIssue[];
}

export interface ReviewComment {
  comment_id: string;
  version_id: string;
  author_id: string;
  author_name: string;
  author_role: UserRole;
  issue_id?: string;
  parent_comment_id?: string;
  body: string;
  created_at: string;
}

export interface ApprovalRecord {
  approval_id: string;
  version_id: string;
  reviewer_id: string;
  reviewer_name: string;
  decision: 'approved' | 'changes_requested';
  comment?: string;
  visual_checklist?: {
    logoCorrect: boolean;
    colorsCompliant: boolean;
    imageryAppropriate: boolean;
  };
  decided_at: string;
}

export interface AuditLog {
  log_id: number;
  org_id: string;
  actor_id: string;
  actor_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata?: any;
  created_at: string;
}

export interface FactCheckItem {
  claim: string;
  label: 'Conflicts' | 'Matches' | 'Not covered';
  fact_code?: string;
  fact_statement?: string;
}

export interface LabelledTestCase {
  id: string;
  draft_text: string;
  media?: MediaItem[];
  expected_findings: {
    category: IssueCategory;
    severity: IssueSeverity;
    evidence_code: string;
    status: IssueStatus;
  }[];
  notes: string;
}

export interface DiffChunk {
  type: 'unchanged' | 'inserted' | 'deleted';
  value: string;
}
