#!/usr/bin/env bash
THRESHOLD=$(date --date="60 days ago" +"data/%Y%m%d")
cnt=0

for FILE in data/20*.json; do
    if [[ "$FILE" < "$THRESHOLD" ]]; then
        git rm "$FILE"
        ((cnt++))
    fi
done

echo "Removed $cnt files."
