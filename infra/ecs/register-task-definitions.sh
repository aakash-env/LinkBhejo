#!/bin/bash

# Register ECS Task Definitions
# This script registers the task definitions with AWS ECS
# Usage: ./register-task-definitions.sh <ACCOUNT_ID> <REGION> <IMAGE_TAG>

set -e

ACCOUNT_ID=${1:-$(aws sts get-caller-identity --query Account --output text)}
REGION=${2:-us-east-1}
IMAGE_TAG=${3:-latest}

echo "📋 Registering ECS Task Definitions"
echo "Account ID: $ACCOUNT_ID"
echo "Region: $REGION"
echo "Image Tag: $IMAGE_TAG"
echo ""

# Function to register task definition
register_task() {
  local task_file=$1
  local family_name=$2

  echo "🔧 Registering $family_name..."

  # Substitute placeholders in the task definition file
  local temp_file="/tmp/task-def-$family_name.json"
  sed "s/ACCOUNT_ID/$ACCOUNT_ID/g" "$task_file" > "$temp_file"

  # Register the task definition
  aws ecs register-task-definition \
    --cli-input-json file://"$temp_file" \
    --region "$REGION" > /dev/null

  echo "✅ $family_name registered successfully"
  rm -f "$temp_file"
}

# Register all task definitions
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

register_task "$SCRIPT_DIR/migrate-task.json" "linkbhejo-migrate"
register_task "$SCRIPT_DIR/api-task.json" "linkbhejo-api"
register_task "$SCRIPT_DIR/web-task.json" "linkbhejo-web"
register_task "$SCRIPT_DIR/worker-task.json" "linkbhejo-worker"

echo ""
echo "✨ All task definitions registered successfully!"
echo ""
echo "Task definitions:"
aws ecs list-task-definitions --family-prefix linkbhejo --region "$REGION" --query 'taskDefinitionArns[*]' --output text
