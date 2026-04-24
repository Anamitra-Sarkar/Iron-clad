import type { VerdictResult } from './useGroq';

export interface VfsTrial {
  trial_id: string;
  timestamp_utc: string;
  metadata: {
    domain: string;
    complexity_word_count: number;
  };
  generation_pipeline: {
    generator_model: 'llama-3.1-8b-instant';
    f_base: string;
    f_opt: string;
    f_pess: string;
  };
  evaluation_trials: [{
    judge_model: string;
    temperature: 0;
    verdict_base: 0 | 1;
    verdict_opt: 0 | 1;
    verdict_pess: 0 | 1;
    computed_metrics: {
      VFS_flag: 0 | 1;
      DVS_opt_flag: 0 | 1;
      DVS_pess_flag: 0 | 1;
    };
  }];
}

const vfsTrialLog: VfsTrial[] = [];

function verdictToBinary(verdict: VerdictResult): 0 | 1 {
  return verdict.status === 'SURVIVES' ? 1 : 0;
}

export function logVfsTrial(params: {
  idea: string;
  domain: string;
  fOpt: string;
  fPess: string;
  verdictBase: VerdictResult;
  verdictOpt: VerdictResult;
  verdictPess: VerdictResult;
  judgeModel: string;
}): void {
  const {
    idea,
    domain,
    fOpt,
    fPess,
    verdictBase,
    verdictOpt,
    verdictPess,
    judgeModel,
  } = params;

  const verdictBaseBinary = verdictToBinary(verdictBase);
  const verdictOptBinary = verdictToBinary(verdictOpt);
  const verdictPessBinary = verdictToBinary(verdictPess);

  const vfsFlag: 0 | 1 =
    verdictBaseBinary !== verdictOptBinary ||
    verdictBaseBinary !== verdictPessBinary ||
    verdictOptBinary !== verdictPessBinary
      ? 1
      : 0;

  const dvsOptFlag: 0 | 1 = verdictOptBinary === 1 && verdictBaseBinary === 0 ? 1 : 0;
  const dvsPessFlag: 0 | 1 = verdictPessBinary === 0 && verdictBaseBinary === 1 ? 1 : 0;

  const trimmedIdea = idea.trim();
  const complexityWordCount = trimmedIdea ? trimmedIdea.split(/\s+/).length : 0;

  const trial: VfsTrial = {
    trial_id: crypto.randomUUID(),
    timestamp_utc: new Date().toISOString(),
    metadata: {
      domain,
      complexity_word_count: complexityWordCount,
    },
    generation_pipeline: {
      generator_model: 'llama-3.1-8b-instant',
      f_base: idea,
      f_opt: fOpt,
      f_pess: fPess,
    },
    evaluation_trials: [{
      judge_model: judgeModel,
      temperature: 0,
      verdict_base: verdictBaseBinary,
      verdict_opt: verdictOptBinary,
      verdict_pess: verdictPessBinary,
      computed_metrics: {
        VFS_flag: vfsFlag,
        DVS_opt_flag: dvsOptFlag,
        DVS_pess_flag: dvsPessFlag,
      },
    }],
  };

  vfsTrialLog.push(trial);
}

export function exportVfsLog(): void {
  const filename = `ironclad-vfs-trials-${Date.now()}.json`;
  const content = JSON.stringify(vfsTrialLog, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function getVfsLogLength(): number {
  return vfsTrialLog.length;
}
