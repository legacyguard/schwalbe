#!/usr/bin/env bash
set -euo pipefail

# Agent shim: reads docs/_autodoc_context.txt (or generates it),
# calls a configured agent CLI (DOC_AGENT_CMD), and expects lines:
#   DOC_OK: <path>
#   COMMIT_MSG: <message>
# Prints those lines to stdout for hooks/CI to parse.
# Usage:
#   scripts/agent/run-agent.sh [--ci] [--changed "file1 file2 ..."]

CI_MODE=false
CHANGED_ARG=""

while [ $# -gt 0 ]; do
  case "$1" in
    --ci)
      CI_MODE=true
      shift
      ;;
    --changed)
      CHANGED_ARG="${2:-}"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

# Ensure context exists
if [ ! -f docs/_autodoc_context.txt ]; then
  bash scripts/collect_feature_context.sh
fi

# Optional: pass changed file list to the agent via ENV
export DOC_CHANGED_FILES="${CHANGED_ARG}"

# Require DOC_AGENT_CMD to be set to the actual agent command
# Example: export DOC_AGENT_CMD="warp-agent --model=gpt-5" (reads stdin)
# Or: export DOC_AGENT_CMD="openai chat.completions.create --model gpt-4.1-mini --input-file -"
if [ -z "${DOC_AGENT_CMD:-}" ]; then
  echo "No DOC_AGENT_CMD configured; skipping doc generation." 1>&2
  exit 0
fi

# Prepare combined prompt + context input
export DOC_CONTEXT_FILE="docs/_autodoc_context.txt"
PROMPT_FILE="docs/feature_specs/agent_prompt.txt"
COMBINED_INPUT=$(mktemp)
if [ -f "$PROMPT_FILE" ]; then
  # prompt first, then context
  cat "$PROMPT_FILE" "$DOC_CONTEXT_FILE" > "$COMBINED_INPUT"
else
  cp "$DOC_CONTEXT_FILE" "$COMBINED_INPUT"
fi

# Try stdin first; fall back to direct invocation on failure
set +e
OUTPUT=$({ cat "$COMBINED_INPUT" | eval "$DOC_AGENT_CMD"; } 2>/dev/null)
STATUS=$?
set -e

if [ $STATUS -ne 0 ] || [ -z "$OUTPUT" ]; then
  # Fallback: invoke directly (agent should read DOC_CONTEXT_FILE or PROMPT)
  set +e
  OUTPUT=$(eval "$DOC_AGENT_CMD" 2>/dev/null)
  STATUS=$?
  set -e
fi

# Print raw output for debugging in CI if needed
if [ "$CI_MODE" = true ]; then
  echo "$OUTPUT" | tail -n +1
fi

# Extract DOC_OK and COMMIT_MSG lines to stdout (for hooks/CI parsing)
echo "$OUTPUT" | grep -E '^(DOC_OK:|COMMIT_MSG:)' || true

# Cleanup
rm -f "$COMBINED_INPUT" || true
