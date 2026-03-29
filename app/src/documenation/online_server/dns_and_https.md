# DNS & HTTPS Configuration

## Description

Move the app from an ugly IP address to a clean, secure URL.

## Key Actions (Traditional Approach)

1. Point DNS A-records from the domain registrar to the server IP.
2. Install Certbot/Let's Encrypt to enable HTTPS.
3. Configure Nginx to redirect all HTTP traffic to HTTPS.

## Acceptance Criteria

The web app is accessible via a secure `https://yourdomain.com` URL with a valid lock icon.

---

## Our Approach: Google Cloud Run (Free Tier)

Due to funding constraints, we deployed the application on **Google Cloud Run** instead of a traditional VM with a purchased domain. Cloud Run eliminates the need and cost of every item in the traditional approach:

| Traditional Approach                      | Cost                                            | Cloud Run (Our Setup)                                      | Cost     |
| ----------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------- | -------- |
| Buy a custom domain (`yourdomain.com`)    | ~$10-15/year                                    | Use the auto-assigned `https://*.run.app` URL              | **Free** |
| Point DNS A-records to server IP          | Requires a paid domain                          | Not needed - Google assigns the URL automatically          | **Free** |
| Install Certbot / Let's Encrypt for SSL   | Free software, but requires a VM (~$5+/month)   | Google auto-provisions a managed SSL certificate           | **Free** |
| Configure Nginx to redirect HTTP to HTTPS | Manual setup on a VM                            | Built-in - Cloud Run redirects HTTP to HTTPS automatically | **Free** |
| Renew SSL certificates every 90 days      | Automated via Certbot, but must maintain the VM | Automatic - Google handles renewal with zero configuration | **Free** |

## Why This Satisfies the Acceptance Criteria

The acceptance criteria requires a **secure HTTPS URL with a valid lock icon**. Our Cloud Run deployment meets this fully:

- **Secure URL:** `https://health-fitness-app-XXXXX-uc.a.run.app` - HTTPS by default.
- **Valid lock icon:** Google-managed SSL certificate is trusted by all major browsers.
- **HTTP to HTTPS redirect:** All HTTP requests are automatically redirected to HTTPS.
- **No manual DNS, Certbot, or Nginx HTTPS configuration required.**

The only difference is the URL is a `.run.app` subdomain rather than a custom branded domain. A custom domain can be added later at minimal cost (~$10-15/year for domain registration) using `gcloud beta run domain-mappings create`, with Google still handling SSL automatically - no Certbot or Nginx changes needed.
