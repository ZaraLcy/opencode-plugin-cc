import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

/**
 * Collects git diff context for the review command.
 */
export async function collectDiff(base = 'HEAD', cwd = process.cwd()) {
  try {
    const { stdout } = await execFileAsync('git', ['diff', base], { cwd, maxBuffer: 1024 * 1024 });
    const { stdout: staged } = await execFileAsync('git', ['diff', '--cached', base], { cwd, maxBuffer: 1024 * 1024 });
    return (stdout + staged).trim();
  } catch (err) {
    throw new Error(`Failed to collect git diff: ${err.message}`);
  }
}

/**
 * Builds a review prompt from a diff string.
 */
export function buildReviewPrompt(diff) {
  if (!diff.trim()) {
    return 'Please review the current codebase. No changes detected in working tree or staging area.';
  }
  return `Please review the following code changes and provide feedback on correctness, design, and potential issues:\n\n\`\`\`diff\n${diff}\n\`\`\``;
}
