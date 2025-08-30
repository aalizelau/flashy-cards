# CI/CD Deployment Setup

This document explains how to set up automated deployment for Flash Wise Buddy using GitHub Actions.

## Overview

The CI/CD pipeline automates your current manual deployment process:
- Triggers on push to `main` branch
- Runs linting and build tests
- SSH to production server and executes deployment

## Required GitHub Repository Secrets

Set up these secrets in your GitHub repository (Settings > Secrets and variables > Actions):

### Required Secrets

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `DEPLOY_HOST` | Production server IP address | `64.23.144.100` |
| `DEPLOY_USER` | SSH username for the server | `ubuntu` or your username |
| `DEPLOY_SSH_KEY` | Private SSH key for server access | Contents of your private key file |

### Setting Up SSH Key

1. **Generate SSH key pair** (if you don't have one):
   ```bash
   ssh-keygen -t ed25519 -C "github-actions-deploy"
   ```

2. **Add public key to server**:
   ```bash
   # Copy public key to server's authorized_keys
   ssh-copy-id -i ~/.ssh/id_ed25519.pub user@64.23.144.100
   ```

3. **Add private key to GitHub secrets**:
   - Copy the entire private key file content
   - Add as `DEPLOY_SSH_KEY` secret in GitHub

## Server Setup Requirements

Ensure your production server has:

1. **Project directory at `/opt/flashy-cards`** with git repository
2. **Environment variables configured** (as you currently have them)
3. **Docker and Docker Compose installed**
4. **SSH access for deployment user**
5. **Deployment script**: Copy `scripts/deploy.sh` to `/opt/flashy-cards/scripts/`

### Server Deployment Script Setup

1. Copy the deployment script to your server:
   ```bash
   scp scripts/deploy.sh user@64.23.144.100:/opt/flashy-cards/scripts/
   chmod +x /opt/flashy-cards/scripts/deploy.sh
   ```

2. Or commit the script and pull it on the server:
   ```bash
   # On server at /opt/flashy-cards
   git pull
   chmod +x scripts/deploy.sh
   ```

## Workflow Process

1. **Push to main branch** → Triggers deployment
2. **Test stage**: Installs dependencies, runs linting, builds frontend
3. **Deploy stage**: SSH to server, runs `deploy.sh` script
4. **Health checks**: Verifies containers are running
5. **Notifications**: Shows deployment status in GitHub Actions

## Manual Deployment (Fallback)

You can still deploy manually using the new script:

```bash
# On production server
cd /opt/flashy-cards
./scripts/deploy.sh
```

This script performs the same steps as your current manual process but with better error handling and health checks.

## Environment Variables

The pipeline uses your existing environment variable setup on the production server. No additional configuration needed since:

- Docker Compose reads from server's environment
- Variables are already configured on your production server
- No secrets need to be passed from GitHub

## Troubleshooting

### Deployment Fails
1. Check GitHub Actions logs for error details
2. Verify SSH connection: `ssh user@64.23.144.100`
3. Ensure deployment script is executable: `chmod +x deploy.sh`
4. Check Docker logs on server: `docker compose logs`

### SSH Connection Issues
- Verify SSH key is correctly added to GitHub secrets
- Test SSH connection manually
- Check server firewall settings

### Container Startup Issues
- Check Docker logs: `docker compose logs`
- Verify environment variables on server
- Ensure all required services (database, redis) are starting

## Benefits

- **Zero Manual Steps**: Push to main automatically deploys
- **Consistency**: Same deployment process every time  
- **Safety**: Automated testing before deployment
- **Visibility**: Clear deployment status in GitHub
- **Rollback**: Easy to revert using git reset and redeploy