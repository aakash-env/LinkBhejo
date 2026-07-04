# ECS Deployment Guide

## Task Definitions

This directory contains ECS task definition templates for LinkBhejo:

- **migrate-task.json** - One-off task for running Prisma migrations
- **api-task.json** - Fastify API server
- **web-task.json** - Next.js web dashboard
- **worker-task.json** - BullMQ job workers

## Prerequisites

1. AWS CLI installed and configured
2. IAM permissions to register ECS task definitions and run tasks
3. ECR repositories created for `linkbhejo/api`, `linkbhejo/web`, `linkbhejo/worker`
4. ECS Cluster created (e.g., `linkbhejo-prod`)
5. VPC, subnets, and security groups configured
6. RDS PostgreSQL database provisioned
7. ElastiCache Redis cluster provisioned

## Step 1: Build and Push Docker Images

```bash
# Set your AWS account ID and region
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=us-east-1
ECR_REGISTRY=$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Login to ECR
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

# Build and push API image (used for api, worker, and migrate tasks)
docker build -f apps/api/Dockerfile -t $ECR_REGISTRY/linkbhejo/api:latest .
docker push $ECR_REGISTRY/linkbhejo/api:latest

# Build and push Web image
docker build -f apps/web/Dockerfile -t $ECR_REGISTRY/linkbhejo/web:latest .
docker push $ECR_REGISTRY/linkbhejo/web:latest
```

## Step 2: Set Up AWS Secrets Manager

Store all secrets in AWS Secrets Manager with paths like `/linkbhejo/prod/...`:

```bash
# Example: Store DATABASE_URL
aws secretsmanager create-secret \
  --name /linkbhejo/prod/DATABASE_URL \
  --secret-string "postgresql://user:pass@db.example.com:5432/linkbhejo" \
  --region us-east-1
```

**Required secrets:**
- `/linkbhejo/prod/AUTH_SECRET` - NextAuth secret
- `/linkbhejo/prod/DATABASE_URL` - PostgreSQL connection string
- `/linkbhejo/prod/REDIS_URL` - Redis connection string
- `/linkbhejo/prod/ANTHROPIC_API_KEY` - Claude API key
- `/linkbhejo/prod/STRIPE_SECRET_KEY` - Stripe secret
- `/linkbhejo/prod/STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `/linkbhejo/prod/STRIPE_PRO_PRICE_ID` - Stripe PRO plan price ID
- `/linkbhejo/prod/STRIPE_AGENCY_PRICE_ID` - Stripe AGENCY plan price ID
- `/linkbhejo/prod/META_WEBHOOK_VERIFY_TOKEN` - Instagram webhook token
- `/linkbhejo/prod/META_WEBHOOK_SECRET` - Instagram webhook secret
- `/linkbhejo/prod/ENCRYPTION_KEY` - AES-256-GCM encryption key (32 bytes, hex-encoded)
- `/linkbhejo/prod/RESEND_API_KEY` - Email sending API key
- `/linkbhejo/prod/AWS_S3_BUCKET_NAME` - Cloudflare R2 or S3 bucket name

## Step 3: Create CloudWatch Log Groups

```bash
aws logs create-log-group --log-group-name /ecs/linkbhejo-migrate --region us-east-1
aws logs create-log-group --log-group-name /ecs/linkbhejo-api --region us-east-1
aws logs create-log-group --log-group-name /ecs/linkbhejo-web --region us-east-1
aws logs create-log-group --log-group-name /ecs/linkbhejo-worker --region us-east-1

# Set retention (30 days)
for log_group in /ecs/linkbhejo-migrate /ecs/linkbhejo-api /ecs/linkbhejo-web /ecs/linkbhejo-worker; do
  aws logs put-retention-policy --log-group-name $log_group --retention-in-days 30 --region us-east-1
done
```

## Step 4: Register Task Definitions

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=us-east-1

# Make script executable
chmod +x infra/ecs/register-task-definitions.sh

# Register all task definitions
./infra/ecs/register-task-definitions.sh $ACCOUNT_ID $REGION
```

Verify registration:
```bash
aws ecs list-task-definitions --family-prefix linkbhejo --region us-east-1
```

## Step 5: Run Database Migrations

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
CLUSTER_NAME=linkbhejo-prod
REGION=us-east-1

# Get your VPC configuration
SUBNETS="subnet-xxxxx subnet-xxxxx"
SECURITY_GROUP="sg-xxxxx"

# Run migration task
TASK_ARN=$(aws ecs run-task \
  --cluster $CLUSTER_NAME \
  --task-definition linkbhejo-migrate \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNETS],securityGroups=[$SECURITY_GROUP],assignPublicIp=DISABLED}" \
  --overrides '{"containerOverrides":[{"name":"migrate","command":["node","node_modules/.bin/prisma","migrate","deploy"]}]}' \
  --query 'tasks[0].taskArn' \
  --output text \
  --region $REGION)

echo "Migration task: $TASK_ARN"

# Wait for migration to complete
aws ecs wait tasks-stopped \
  --cluster $CLUSTER_NAME \
  --tasks "$TASK_ARN" \
  --region $REGION

# Check exit code
EXIT_CODE=$(aws ecs describe-tasks \
  --cluster $CLUSTER_NAME \
  --tasks "$TASK_ARN" \
  --query 'tasks[0].containers[0].exitCode' \
  --output text \
  --region $REGION)

if [ "$EXIT_CODE" != "0" ]; then
  echo "❌ Migration failed (exit $EXIT_CODE)"
  
  # View logs
  TASK_NAME=${TASK_ARN##*/}
  aws logs tail /ecs/linkbhejo-migrate --follow --region $REGION
  exit 1
fi

echo "✅ Migrations completed successfully"
```

## Step 6: Start Application Services

```bash
CLUSTER_NAME=linkbhejo-prod
REGION=us-east-1
SUBNETS="subnet-xxxxx subnet-xxxxx"
SECURITY_GROUP="sg-xxxxx"

# Run API task
aws ecs run-task \
  --cluster $CLUSTER_NAME \
  --task-definition linkbhejo-api:1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNETS],securityGroups=[$SECURITY_GROUP],assignPublicIp=ENABLED}" \
  --region $REGION

# Run Worker task(s) - scale as needed
for i in {1..2}; do
  aws ecs run-task \
    --cluster $CLUSTER_NAME \
    --task-definition linkbhejo-worker:1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$SUBNETS],securityGroups=[$SECURITY_GROUP],assignPublicIp=DISABLED}" \
    --region $REGION
done

# Run Web task
aws ecs run-task \
  --cluster $CLUSTER_NAME \
  --task-definition linkbhejo-web:1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNETS],securityGroups=[$SECURITY_GROUP],assignPublicIp=ENABLED}" \
  --region $REGION
```

## Using ECS Services (Recommended for Production)

Instead of running one-off tasks, use ECS Services for automatic restart and scaling:

```bash
# Create API service
aws ecs create-service \
  --cluster linkbhejo-prod \
  --service-name linkbhejo-api \
  --task-definition linkbhejo-api:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx,subnet-xxxxx],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
  --region us-east-1

# Create Worker service (scale up as needed)
aws ecs create-service \
  --cluster linkbhejo-prod \
  --service-name linkbhejo-worker \
  --task-definition linkbhejo-worker:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx,subnet-xxxxx],securityGroups=[sg-xxxxx],assignPublicIp=DISABLED}" \
  --region us-east-1

# Create Web service
aws ecs create-service \
  --cluster linkbhejo-prod \
  --service-name linkbhejo-web \
  --task-definition linkbhejo-web:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx,subnet-xxxxx],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
  --region us-east-1
```

## Monitoring

View logs:
```bash
# API logs
aws logs tail /ecs/linkbhejo-api --follow --region us-east-1

# Worker logs
aws logs tail /ecs/linkbhejo-worker --follow --region us-east-1

# Migration logs
aws logs tail /ecs/linkbhejo-migrate --follow --region us-east-1
```

List running tasks:
```bash
aws ecs list-tasks --cluster linkbhejo-prod --region us-east-1
```

Describe task:
```bash
aws ecs describe-tasks --cluster linkbhejo-prod --tasks $TASK_ARN --region us-east-1
```

## Troubleshooting

### TaskDefinition not found
```bash
# Ensure task definitions are registered
aws ecs list-task-definitions --family-prefix linkbhejo --region us-east-1

# If not registered, run register script
./infra/ecs/register-task-definitions.sh $ACCOUNT_ID us-east-1
```

### Task fails to start
1. Check CloudWatch logs
2. Verify security group allows container port access
3. Verify IAM role has permissions
4. Check task definition image URI is correct

### Secrets Manager permission denied
Ensure the ECS task execution role has these permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:/linkbhejo/prod/*"
    }
  ]
}
```

## GitHub Actions CI/CD Integration

Add to `.github/workflows/deploy.yml`:

```yaml
- name: Register ECS Task Definitions
  run: |
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    chmod +x infra/ecs/register-task-definitions.sh
    ./infra/ecs/register-task-definitions.sh $ACCOUNT_ID us-east-1
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

- name: Run Database Migrations
  run: |
    CLUSTER_NAME=linkbhejo-prod
    REGION=us-east-1
    SUBNETS=${{ secrets.ECS_SUBNETS }}
    SECURITY_GROUP=${{ secrets.ECS_SECURITY_GROUP }}
    
    TASK_ARN=$(aws ecs run-task \
      --cluster $CLUSTER_NAME \
      --task-definition linkbhejo-migrate \
      --launch-type FARGATE \
      --network-configuration "awsvpcConfiguration={subnets=[$SUBNETS],securityGroups=[$SECURITY_GROUP],assignPublicIp=DISABLED}" \
      --overrides '{"containerOverrides":[{"name":"migrate","command":["node","node_modules/.bin/prisma","migrate","deploy"]}]}' \
      --query 'tasks[0].taskArn' \
      --output text \
      --region $REGION)
    
    aws ecs wait tasks-stopped --cluster $CLUSTER_NAME --tasks "$TASK_ARN" --region $REGION
    
    EXIT_CODE=$(aws ecs describe-tasks --cluster $CLUSTER_NAME --tasks "$TASK_ARN" --query 'tasks[0].containers[0].exitCode' --output text --region $REGION)
    if [ "$EXIT_CODE" != "0" ]; then exit 1; fi
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```
