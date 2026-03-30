# Infrastructure Provisioning & Web Server Setup

## Description

Set up the cloud infrastructure where the HealthFitnessPro app lives. Instead of a traditional VM (EC2, DigitalOcean Droplet), we use **Google Cloud Run** — a serverless container platform that eliminates the need to manually provision servers, install web servers, or configure firewall rules.

## Architecture

| Traditional (VM) approach               | Our approach (Cloud Run)                                      |
| --------------------------------------- | ------------------------------------------------------------- |
| Spin up EC2/Droplet manually            | Cloud Run provisions infrastructure automatically             |
| Install & configure Nginx               | FastAPI serves both API and static files                      |
| Configure firewall rules (ports 80/443) | Cloud Run exposes HTTPS by default, no firewall config needed |
| Install Certbot for SSL                 | SSL certificate auto-provisioned by Google                    |
| Manually scale servers                  | Auto-scales from 0 to N instances based on traffic            |

## Why Cloud Run Instead of a VM

1. **No server management** — no SSH, no OS patching, no Nginx configuration in production
2. **Free tier** — 2M requests/month, 180K vCPU-seconds, 360K GiB-seconds
3. **Auto-scaling** — scales to zero when idle (zero cost), scales up under load
4. **Built-in HTTPS** — every deployed service gets a `https://*.run.app` URL with a valid SSL certificate
5. **One command deploy** — `gcloud run deploy` handles building, pushing, and serving

## Infrastructure Components

**Single container** running on Google Cloud Run:

- **Runtime:** Python 3.11 (FastAPI + Uvicorn)
- **Static files:** React build output served by FastAPI from `/app/static`
- **Database:** Supabase PostgreSQL (us-west-2)
- **Region:** `us-central1` (Iowa) — Tier 1 pricing
- **Resources:** 1 vCPU, 512 MiB memory
- **Scaling:** 0 to 1 instances (scale-to-zero enabled)

## Files Modified for Infrastructure

| File                  | Change                                                                        | Purpose                                                             |
| --------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `Dockerfile`          | Set `VITE_API_URL=""`, copy React build to `/app/static`, use `$PORT` env var | Single container that serves both frontend and API                  |
| `app/backend/main.py` | Added `StaticFiles` mount and SPA catch-all route                             | FastAPI serves React app (replaces Nginx in production)             |
| `docker-compose.yml`  | Added `PORT=8000` environment override                                        | Keeps local multi-container dev working alongside Cloud Run changes |
| `nginx.conf`          | Added `proxy_pass` rules for API routes                                       | Local dev only — Nginx forwards API calls to FastAPI container      |

## Secret Management

Sensitive values are stored in **Google Cloud Secret Manager** (not in source code or `.env` files):

| Secret                      | Purpose                           |
| --------------------------- | --------------------------------- |
| `SECRET_KEY`                | JWT token signing                 |
| `XRAPID_API_KEY`            | RapidAPI exercise data            |
| `FATSECRET_CLIENT_ID`       | FatSecret OAuth 2.0 client ID     |
| `FATSECRET_CLIENT_SECRET`   | FatSecret OAuth 2.0 client secret |
| `FATSECRET_CONSUMER_SECRET` | FatSecret OAuth 1.0a signing key  |
| `DATABASE_URL`              | Supabase PostgreSQL connection    |

Non-sensitive configuration is passed as plain environment variables:

| Variable                      | Value   |
| ----------------------------- | ------- |
| `ALGORITHM`                   | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30`    |

## Firewall / Network

Cloud Run handles this automatically:

- **HTTPS (443)** — enabled by default on every service, with a Google-managed SSL certificate
- **HTTP (80)** — automatically redirected to HTTPS
- **No inbound port configuration needed** — Cloud Run only exposes the service URL
- **No Security Groups** — the platform manages network isolation

## Deployment

### Prerequisites

```bash
brew install google-cloud-sdk
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com artifactregistry.googleapis.com
```

### Create Secrets

```bash
echo -n "your-secret-key" | gcloud secrets create SECRET_KEY --data-file=-
echo -n "your-rapidapi-key" | gcloud secrets create XRAPID_API_KEY --data-file=-
echo -n "your-fatsecret-id" | gcloud secrets create FATSECRET_CLIENT_ID --data-file=-
echo -n "your-fatsecret-secret" | gcloud secrets create FATSECRET_CLIENT_SECRET --data-file=-
echo -n "your-consumer-secret" | gcloud secrets create FATSECRET_CONSUMER_SECRET --data-file=-
echo -n "postgresql://..." | gcloud secrets create DATABASE_URL --data-file=-
```

### Grant Access to Secrets

```bash
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format='value(projectNumber)')

for SECRET in SECRET_KEY XRAPID_API_KEY FATSECRET_CLIENT_ID FATSECRET_CLIENT_SECRET FATSECRET_CONSUMER_SECRET DATABASE_URL; do
  gcloud secrets add-iam-policy-binding $SECRET \
    --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
done
```

### Deploy Command

```bash
gcloud run deploy health-fitness-app \
    --source . \
    --region us-central1 \
    --allow-unauthenticated \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 1 \
    --concurrency 80 \
    --set-env-vars "ALGORITHM=HS256,ACCESS_TOKEN_EXPIRE_MINUTES=30" \
    --set-secrets "SECRET_KEY=SECRET_KEY:latest,XRAPID_API_KEY=XRAPID_API_KEY:latest,FATSECRET_CLIENT_ID=FATSECRET_CLIENT_ID:latest,FATSECRET_CLIENT_SECRET=FATSECRET_CLIENT_SECRET:latest,FATSECRET_CONSUMER_SECRET=FATSECRET_CONSUMER_SECRET:latest,DATABASE_URL=DATABASE_URL:latest"
```

## Acceptance Criteria

| Criteria                     | Status                                                                      |
| ---------------------------- | --------------------------------------------------------------------------- |
| Server is reachable via URL  | `https://health-fitness-app-XXXXX-uc.a.run.app` returns the React app       |
| HTTPS with valid certificate | Auto-provisioned by Google Cloud Run                                        |
| HTTP redirects to HTTPS      | Built-in behavior, no configuration needed                                  |
| API endpoints respond        | `/exercises`, `/templates`, `/auth`, etc. return JSON data                  |
| Health check passes          | Cloud Run's built-in health check verifies the container listens on `$PORT` |

## Verification

```bash
curl -I https://health-fitness-app-XXXXX-uc.a.run.app
```

Expected response:

```
HTTP/2 200
```

## Local Development

Local dev still uses the multi-container docker-compose setup:

```bash
docker compose up --build
```

- **Frontend:** `http://localhost:3000` (Nginx)
- **Backend API:** `http://localhost:8000` (FastAPI)
- **API docs:** `http://localhost:8000/docs`
