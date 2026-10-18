#!/bin/bash
# Runs AFTER every Edit / Write — Dir Food Admin fast feedback loop.

INPUT="$(cat)"

if command -v jq >/dev/null 2>&1; then
  FILE_PATH="$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)"
else
  FILE_PATH="$(printf '%s' "$INPUT" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("tool_input",{}).get("file_path",""))' 2>/dev/null)"
fi

case "$FILE_PATH" in
  */src/*.ts|*/src/*.tsx) ;;
  *) exit 0 ;;
esac

[ -f "$FILE_PATH" ] || exit 0

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

OUTPUT="$(npx --no-install oxlint "$FILE_PATH" 2>&1)"
STATUS=$?

if [ $STATUS -ne 0 ]; then
  {
    echo "oxlint found problems in $FILE_PATH — fix them before continuing:"
    echo "$OUTPUT" | tail -n 40
  } >&2
  exit 2
fi

exit 0