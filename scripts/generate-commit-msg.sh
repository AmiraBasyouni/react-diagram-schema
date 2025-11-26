#!/bin/bash
# commit_suggest.sh

# Load API key from secure file
if [ -f ~/.anthropic_api_key ]; then
  source ~/.anthropic_api_key
else
  echo "Error: ~/.anthropic_api_key not found. Please create it with ANTHROPIC_API_KEY."
  exit 1
fi

# Get git diff for staged changes
DIFF=$(git diff --cached)

# Escape special characters in DIFF for JSON
ESCAPED_DIFF=$(printf '%s' "$DIFF" | jq -Rs .)

# Prepare prompt for Claude with conventional commits and bullet-list body
PROMPT="Analyze the following git diff for a React project and suggest a commit message in the conventional commits format (e.g., 'feat: description', 'fix: description'). Include a commit body as a dashed list if the changes are complex or involve multiple tasks; otherwise, keep it concise. Return only the commit message text, without markdown, code blocks, or explanations:\n\n$ESCAPED_DIFF"

# Call anthropic API with curl
RESPONSE=$(curl -s https://api.anthropic.com/v1/messages \
  --header "x-api-key: $ANTHROPIC_API_KEY" \
  --header "anthropic-version: 2023-06-01" \
  --header "content-type: application/json" \
  --data "$(jq -n --arg prompt "$PROMPT" '{
    "model": "claude-sonnet-4-20250514",
    "messages": [{"role": "user", "content": $prompt}],
    "max_tokens": 150
}')")

# Extract commit message from response
COMMIT_MSG=$(echo "$RESPONSE" | jq -r '.content[0].text' 2>/dev/null || echo "")

# Check for valid response
if [ -z "$COMMIT_MSG" ] || [ "$COMMIT_MSG" = "null" ]; then
  echo "Error: Failed to retrieve commit message from API."
  echo "Commit Message: $COMMIT_MSG"
  echo "Response: $RESPONSE"
  exit 1
fi

# Display suggested commit message
echo "Suggested commit message:"
echo "$COMMIT_MSG"

# Prompt for confirmation
read -p "Use this message? [y/N]: " CONFIRM
if [ "$CONFIRM" = "y" ]; then
  git commit -s -m "$COMMIT_MSG"
  echo "Commit successful!"
else
  echo "Commit aborted."
fi
