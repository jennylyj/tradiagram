#!/usr/bin/env bash

TZ="Etc/GMT-8"
THRESHOLD=$(date --date="60 days ago" +"public/data/%Y%m%d.json")
cnt=0

for FILE in public/data/20*.json; do
    if [[ "$FILE" < "$THRESHOLD" ]]; then
        git rm "$FILE"
        ((cnt++))
    fi
done

echo "Removed $cnt files."
