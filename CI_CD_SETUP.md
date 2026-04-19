# CI/CD Setup Guide for AWS EC2 Deployment

## Overview

This project uses GitHub Actions to build and deploy to AWS EC2.

### Workflow Files

| File | Purpose | Trigger |
|------|---------|---------|
| `.github/workflows/ci.yml` | Lint, Test, Build | Every push to any branch |
| `.github/workflows/cd.yml` | Deploy to EC2 | Push to main branch |

---

## Prerequisites

### 1. AWS Setup (Already Completed)

- [x] AWS IAM User created with ECR + EC2 access
- [x] ECR Repository created
- [x] EC2 instance running

### 2. GitHub Secrets (Already Added)

Verify these secrets are in **GitHub Repo → Settings → Secrets and variables → Actions**:

| Secret | Value |
|--------|-------|
| `AWS_ACCESS_KEY_ID` | IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |
| `AWS_ECR_REGISTRY` | ECR URL (e.g., `123456789.dkr.ecr.ap-southeast-2.amazonaws.com/ecommerce`) |
| `AWS_REGION` | `ap-southeast-2` |
| `EC2_HOST` | Your EC2 public IP |
| `EC2_SSH_KEY` | Private key content |
| `EC2_USERNAME` | `ubuntu` or `ec2-user` |

---

## Manual Steps Required Before First Deployment

### Step 1: Copy .env.prod to EC2

You need to manually copy your `.env.prod` file to EC2:

```bash
# On your LOCAL terminal
scp -i your-key.pem .env.prod ubuntu@3.27.44.161:/home/ubuntu/ecommerce/.env.prod
```

### Step 2: Ensure Docker & Docker Compose on EC2

If not already installed, SSH into EC2 and run:

```bash
# Install Docker
sudo apt update && sudo apt install -y docker.io

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

### Step 3: Copy Project Files to EC2 (First Time Only)

```bash
# Copy project files to EC2
scp -i your-key.pem -r . ubuntu@3.27.44.161:/home/ubuntu/ecommerce/
scp -i your-key.pem docker-compose.prod.yml ubuntu@3.27.44.161:/home/ubuntu/ecommerce/
scp -i your-key.pem -r docker ubuntu@3.27.44.161:/home/ubuntu/ecommerce/
scp -i your-key.pem -r backend ubuntu@3.27.44.161:/home/ubuntu/ecommerce/
```

---

## How CI/CD Works

### CI Pipeline (ci.yml)

```
Push Code → Lint (flake8, black, isort) → Test (Django check, smoke test) → Build Docker → Push to ECR
```

**Runs on:** Every push to any branch

**Jobs:**
1. **lint** - Python code style checks
2. **test** - Django system check + smoke test (health endpoint)
3. **build-backend** - Build Docker image + push to AWS ECR
4. **build-frontend** - Build React frontend + upload artifacts

### CD Pipeline (cd.yml)

```
Merge to Main → Build Docker → Push to ECR → SSH to EC2 → Deploy
```

**Runs on:** Push to main branch (after CI passes)

**Steps:**
1. Build and push Docker image to ECR
2. Download frontend artifacts
3. SSH into EC2
4. Pull latest Docker images
5. Deploy frontend static files
6. Restart Docker containers
7. Health check

---

## First Deployment Steps

### 1. Push to GitHub (Triggers CI)

```bash
git add .
git commit -m "Add CI/CD pipeline"
git push origin main
```

### 2. Check CI Status

Go to **GitHub Repo → Actions** to see CI running.

### 3. After CI Passes, Merge to Main

This triggers CD (deploy to EC2).

### 4. Verify Deployment

```bash
# Check if application is running
curl http://3.27.44.161/api/health/
```

---

## Troubleshooting

### Issue: .env.prod not found on EC2

```bash
# Copy .env.prod to EC2
scp -i your-key.pem .env.prod ubuntu@EC2_IP:/home/ubuntu/ecommerce/.env.prod
```

### Issue: Docker not installed

```bash
# SSH into EC2 and install
sudo apt update && sudo apt install -y docker.io
```

### Issue: Deployment fails

```bash
# SSH into EC2 and check logs
ssh -i your-key.pem ubuntu@EC2_IP
docker-compose logs backend
```

### Issue: Health check fails

```bash
# Check if container is running
docker ps

# Check container logs
docker logs ecommerce_backend_prod
```

---

## Security Notes

1. **Never commit `.env.prod` to git** - It's in `.gitignore`
2. **Use `.env.prod.aws` template** - Copy and fill in your values
3. **Rotate secrets regularly** - Especially after team changes

---

## Files Created

```
.github/workflows/
├── ci.yml    # CI pipeline
└── cd.yml    # CD pipeline

.env.prod.aws  # Template for AWS deployment
```

---

## Next Steps After CI/CD Works

To enable HTTPS (production):

1. Get SSL certificate (Let's Encrypt or AWS ACM)
2. Update nginx.conf with SSL config
3. Update .env.prod:
   ```
   SECURE_SSL_REDIRECT=1
   SECURE_HSTS_SECONDS=31536000
   SESSION_COOKIE_SECURE=1
   CSRF_COOKIE_SECURE=1
   ```
4. Restart containers

---

## Support

If deployment fails, check:
1. GitHub Actions logs (Repo → Actions → Click workflow)
2. EC2 container logs: `docker-compose logs`
3. EC2 health: `curl http://EC2_IP/api/health/`