#!/usr/bin/env bash
# deploy.sh — build and deploy the Argus backend to Google Cloud Run
# Run this from the backend/ directory.
#
# Prerequisites (do these once):
#   1. Install gcloud CLI: https://cloud.google.com/sdk/docs/install
#   2. gcloud auth login
#   3. gcloud projects create argus-backend-prod --name="Argus Backend"
#      (or pick any project ID)
#   4. gcloud config set project argus-backend-prod
#   5. gcloud services enable run.googleapis.com artifactregistry.googleapis.com
#   6. gcloud artifacts repositories create argus \
#        --repository-format=docker --location=us-central1
#   7. gcloud auth configure-docker us-central1-docker.pkg.dev

set -euo pipefail

PROJECT_ID="argus-backend-prod"          # change if you used a different project ID
REGION="us-central1"
REPO="us-central1-docker.pkg.dev/${PROJECT_ID}/argus"
IMAGE="${REPO}/argus-backend:latest"
SERVICE_NAME="argus-backend"

echo "→ Building image..."
docker build -t "${IMAGE}" .

echo "→ Pushing image..."
docker push "${IMAGE}"

echo "→ Deploying to Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --image="${IMAGE}" \
  --region="${REGION}" \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --timeout=3600 \
  --concurrency=80 \
  --min-instances=1 \
  --max-instances=10 \
  --memory=1Gi \
  --cpu=1 \
  --set-env-vars="\
DATABASE_URL=${DATABASE_URL},\
GROQ_API_KEY=${GROQ_API_KEY},\
LOOM_SECRET=${LOOM_SECRET},\
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY},\
STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET},\
STRIPE_CREDITS_PRICE_ID=${STRIPE_CREDITS_PRICE_ID},\
STRIPE_PRO_PRICE_ID=${STRIPE_PRO_PRICE_ID},\
SUPABASE_URL=${SUPABASE_URL},\
SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY},\
FRONTEND_URL=${FRONTEND_URL},\
ETHERSCAN_API_KEY=${ETHERSCAN_API_KEY},\
MAX_CONCURRENT_AUDITS=10"

echo ""
echo "✓ Deployed! Service URL:"
gcloud run services describe "${SERVICE_NAME}" \
  --region="${REGION}" --format="value(status.url)"
