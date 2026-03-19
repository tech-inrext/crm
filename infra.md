# Staging Environment Setup Guide

This document outlines the standard operating procedure (SOP) for spinning up a fresh staging environment for the Inrext dashboard. 

Because we provision a new EC2 instance for each fresh staging deployment, a few manual steps are required to route traffic correctly before our GitHub Actions pipeline takes over.

## ⚙️ How It Works Under the Hood

When you initiate a staging deployment, two main components work together:

1. **Infrastructure Provisioning (`.infra/staging.sh`):** This bash script runs directly on the new EC2 instance. It installs essential dependencies (Node.js 20, PM2, Redis, Nginx), configures the Nginx reverse proxy, and automatically provisions an SSL certificate using Let's Encrypt (Certbot) in non-interactive mode.
2. **Deployment Pipeline (`setup-ec2.yml`):** This is a manually triggered GitHub Action. It takes the IP address of your new server, connects securely via SSH, uploads the infrastructure script, executes it, and then prepares and uploads the Next.js runtime bundle to be served by PM2.

---

## 🚀 Step-by-Step Setup Guide

### Step 1: Create a New EC2 Instance on AWS
1. Log into the AWS Management Console and navigate to **EC2**.
2. Click **Launch Instance**.
3. **OS:** Select **Ubuntu** (Latest LTS is recommended).
4. **Key Pair:** Select the existing staging key pair (the one associated with the GitHub Secrets).
5. **Network Settings:** Ensure the attached Security Group allows inbound traffic for:
   * **SSH** (Port 22)
   * **HTTP** (Port 80)
   * **HTTPS** (Port 443)
6. Launch the instance.

### Step 2: Copy the Public IP
1. Once the instance state shows as `Running`, click on the Instance ID.
2. Locate the **Public IPv4 address** in the instance summary.
3. Copy this IP address to your clipboard.

### Step 3: Update DNS in Hostinger
Let's Encrypt requires the domain to point to the server before it can issue an SSL certificate. 

1. Log into your **Hostinger** dashboard and navigate to your DNS / Zone Editor for `inrext.com`.
2. Locate the `A Record` for the subdomain **`staging-dashboard`**.
3. Edit the record and replace the old IP address with the **new EC2 Public IP** you copied in Step 2.
4. Save the changes. 
   > **Note:** DNS propagation can take a few minutes. You can verify the update has taken effect by running `ping staging-dashboard.inrext.com` in your local terminal until it returns the new IP.

### Step 4: Run the GitHub Actions Workflow
1. Navigate to the **Actions** tab in this GitHub repository.
2. In the left sidebar, click on the **Setup EC2 Instance** workflow.
3. Click the **Run workflow** dropdown button on the right side of the screen.
4. Paste the **new EC2 Public IP address** into the `ec2_host` input field.
5. Click **Run workflow**.

### Verify Deployment
Once the GitHub Action completes successfully, navigate to `https://staging-dashboard.inrext.com`. The secure, live staging environment should be up and running!