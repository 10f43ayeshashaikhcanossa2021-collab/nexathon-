/**
 * INKLOOM AI - Content Governance Status State Machine (Part C.1)
 * Enforces transition guards, role authorizations, self-approval prevention,
 * and high-severity resolution checks.
 */

import { SubmissionStatus, UserRole, DetectedIssue } from '../types/inkloom';

export type MachineEvent =
  | 'submit_for_analysis'
  | 'analysis_complete'
  | 'analysis_failed'
  | 'send_for_review'
  | 'decision_approve'
  | 'decision_request_changes'
  | 'revert_to_draft';

export interface TransitionContext {
  user_id: string;
  role: UserRole;
  isCreator: boolean;
}

export interface TransitionPayload {
  issues?: DetectedIssue[];
  comment?: string;
  isCurrentVersion?: boolean;
}

export interface TransitionResult {
  ok: boolean;
  nextStatus?: SubmissionStatus;
  errorCode?: string;
  errorMessage?: string;
}

export function transition(
  currentStatus: SubmissionStatus,
  event: MachineEvent,
  context: TransitionContext,
  payload?: TransitionPayload
): TransitionResult {
  // 1. Submit for analysis
  if (event === 'submit_for_analysis') {
    if (currentStatus === 'draft' || currentStatus === 'in_correction' || currentStatus === 'changes_requested') {
      return { ok: true, nextStatus: 'in_analysis' };
    }
    return {
      ok: false,
      errorCode: 'INVALID_TRANSITION',
      errorMessage: `Cannot trigger analysis from status "${currentStatus}".`,
    };
  }

  // 2. Analysis complete
  if (event === 'analysis_complete') {
    if (currentStatus === 'in_analysis') {
      return { ok: true, nextStatus: 'in_correction' };
    }
    return {
      ok: false,
      errorCode: 'INVALID_TRANSITION',
      errorMessage: `Cannot complete analysis while in "${currentStatus}".`,
    };
  }

  // 3. Analysis failed
  if (event === 'analysis_failed') {
    if (currentStatus === 'in_analysis') {
      return { ok: true, nextStatus: 'in_correction' };
    }
    return { ok: false, errorCode: 'INVALID_TRANSITION', errorMessage: 'Invalid state' };
  }

  // 4. Send for review (Part C.2)
  if (event === 'send_for_review') {
    if (currentStatus !== 'in_correction' && currentStatus !== 'draft') {
      return {
        ok: false,
        errorCode: 'INVALID_TRANSITION',
        errorMessage: `Cannot send for review from status "${currentStatus}". Must be in correction.`,
      };
    }

    // Role check: Only creator or admin
    if (context.role !== 'creator' && context.role !== 'admin') {
      return {
        ok: false,
        errorCode: 'UNAUTHORIZED',
        errorMessage: 'Only creators or admins can send content for review.',
      };
    }

    // Guard: Check unresolved high severity findings
    if (payload?.issues) {
      const unresolvedHigh = payload.issues.some((issue) => {
        if (issue.severity !== 'high') return false;
        // If it has a suggestion, it must be accepted, edited, or dismissed with reason
        if (!issue.suggestion) return true;
        if (issue.suggestion.status === 'pending') return true;
        return false;
      });

      if (unresolvedHigh) {
        return {
          ok: false,
          errorCode: 'UNRESOLVED_HIGH_SEVERITY',
          errorMessage: 'All High severity findings must be resolved or justified before sending for review.',
        };
      }
    }

    return { ok: true, nextStatus: 'in_review' };
  }

  // 5. Reviewer Decision: Approve (Part C.3)
  if (event === 'decision_approve') {
    if (currentStatus !== 'in_review') {
      return {
        ok: false,
        errorCode: 'INVALID_TRANSITION',
        errorMessage: `Cannot approve submission in "${currentStatus}" status. Must be in review.`,
      };
    }

    // Role check: Reviewer or admin
    if (context.role !== 'reviewer' && context.role !== 'admin') {
      return {
        ok: false,
        errorCode: 'UNAUTHORIZED',
        errorMessage: 'Only reviewers or administrators can approve content.',
      };
    }

    // Guard: Prevent Self-Approval (Part C.3)
    if (context.isCreator) {
      return {
        ok: false,
        errorCode: 'SELF_APPROVAL_FORBIDDEN',
        errorMessage: 'Self-approval is forbidden. A different reviewer must approve your submission.',
      };
    }

    // Guard: Stale Version
    if (payload?.isCurrentVersion === false) {
      return {
        ok: false,
        errorCode: 'STALE_VERSION',
        errorMessage: 'Decision rejected. The submission has a newer version.',
      };
    }

    return { ok: true, nextStatus: 'approved' };
  }

  // 6. Reviewer Decision: Request Changes
  if (event === 'decision_request_changes') {
    if (currentStatus !== 'in_review') {
      return {
        ok: false,
        errorCode: 'INVALID_TRANSITION',
        errorMessage: `Cannot request changes on submission in "${currentStatus}". Must be in review.`,
      };
    }

    if (context.role !== 'reviewer' && context.role !== 'admin') {
      return {
        ok: false,
        errorCode: 'UNAUTHORIZED',
        errorMessage: 'Only reviewers or administrators can request changes.',
      };
    }

    if (!payload?.comment || payload.comment.trim().length === 0) {
      return {
        ok: false,
        errorCode: 'COMMENT_REQUIRED',
        errorMessage: 'A comment explaining requested changes is mandatory.',
      };
    }

    if (payload?.isCurrentVersion === false) {
      return {
        ok: false,
        errorCode: 'STALE_VERSION',
        errorMessage: 'Decision rejected. The submission has a newer version.',
      };
    }

    return { ok: true, nextStatus: 'changes_requested' };
  }

  // 7. Revert
  if (event === 'revert_to_draft') {
    return { ok: true, nextStatus: 'draft' };
  }

  return {
    ok: false,
    errorCode: 'UNKNOWN_EVENT',
    errorMessage: `Unrecognized event "${event}".`,
  };
}
