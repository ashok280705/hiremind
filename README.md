# HireMind Frontend (Single Runtime)

This Next.js app is the full HireMind runtime:
- recruiter + candidate UI
- API routes under `/api/v1`
- SQLite persistence (`data/hiremind.db`)
- local AI resume parsing/scoring/ranking

No separate Python backend is required.

## Run

```bash
npm install
npm run seed
npm run dev
```

Open http://localhost:3000.

## Environment

Create `.env.local` (or copy from `.env.example`):

```env
NEXT_PUBLIC_API_URL=/api/v1
JWT_SECRET=hiremind-secret-key-change-in-production-32ch
```

## Useful Scripts

```bash
npm run dev
npm run seed
npm run build
npm run start
npm run lint
```

## Notes

- `NEXT_PUBLIC_API_URL` should stay `/api/v1` for same-origin API routing.
- Seeding resets jobs/candidates/interviews and preserves user accounts.

## Docker Compose Deployment

1. Create runtime env file:

```bash
cp .env.example .env
```

2. Start the stack:

```bash
docker compose up -d --build app
```

3. Seed demo data once (or whenever needed):

```bash
docker compose --profile init run --rm seed
```

4. Verify health:

```bash
curl http://localhost:3000/api/v1/health
```

SQLite data is persisted through the named volume `hiremind_data` mounted at `data/`.

## Jenkins Deployment

A ready-to-use Jenkins pipeline is provided in `Jenkinsfile`.

Pipeline flow:

1. Checkout source.
2. Ensure `.env` exists (auto-copies from `.env.example` if missing).
3. Build Docker images with Docker Compose.
4. Run seed service (`--profile init`).
5. Deploy app container.
6. Run health check endpoint.

### Jenkins prerequisites

- Jenkins agent must have Docker Engine + Docker Compose v2.
- Jenkins user must have permission to run Docker.
- Configure SCM webhook/polling as needed.

### Create job

1. In Jenkins, create a Pipeline job.
2. Point SCM to this repository.
3. Set script path to `Jenkinsfile`.
4. Run build.

## Run On EC2 (Ubuntu)

These steps are for Ubuntu-based EC2 images only.

### 1. Security Group

Allow inbound:

- `22` (SSH) from your IP
- `3000` (app) from your IP or public (for quick testing)
- `80` and `443` (if using Nginx + domain)

### 2. Install Docker + Compose

SSH into EC2:

```bash
ssh -i /path/to/your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

Install Docker:

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
	"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
	$(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
docker --version
docker compose version
```

## Run On EC2 (Amazon Linux 2 / Amazon Linux 2023)

If your prompt looks like `ec2-user@...`, you are likely on Amazon Linux, so `apt` will not work.

### 1. Install Docker

Amazon Linux 2023:

```bash
sudo dnf update -y
sudo dnf install -y docker git
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user
newgrp docker
docker --version
```

Amazon Linux 2:

```bash
sudo yum update -y
sudo amazon-linux-extras install docker -y
sudo yum install -y git
sudo service docker start
sudo systemctl enable docker
sudo usermod -aG docker ec2-user
newgrp docker
docker --version
```

### 2. Install Docker Compose v2 plugin

```bash
DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
mkdir -p $DOCKER_CONFIG/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.29.7/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/cli-plugins/docker-compose
chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
docker compose version
```

### 3. Clone and run app

```bash
git clone <YOUR_REPO_URL>
cd Hiremind
cp .env.example .env
```

Edit `.env` and set a strong secret:

```env
JWT_SECRET=<LONG_RANDOM_SECRET>
NEXT_PUBLIC_API_URL=/api/v1
```

Start app + seed:

```bash
docker compose up -d --build app
docker compose --profile init run --rm seed
docker compose ps
curl http://localhost:3000/api/v1/health
```

## Optional: Domain + Nginx Reverse Proxy

If you want `https://yourdomain.com` instead of `:3000`, install Nginx on EC2 and proxy to `127.0.0.1:3000`.

Example `/etc/nginx/sites-available/hiremind`:

```nginx
server {
	listen 80;
	server_name yourdomain.com;

	location / {
		proxy_pass http://127.0.0.1:3000;
		proxy_http_version 1.1;
		proxy_set_header Host $host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
	}
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/hiremind /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Then add TLS with Certbot:

The command below is Ubuntu-based. On Amazon Linux, install Certbot with your distro package manager and equivalent Nginx plugin.

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Jenkins On EC2 (Practical Setup)

If Jenkins is on the same EC2 host as Docker:

1. Install Jenkins.
2. Install Jenkins plugins: Pipeline, Git, Docker Pipeline.
3. Add `jenkins` user to docker group:

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

4. Create Pipeline job using this repo and `Jenkinsfile`.
5. Trigger build after each push (GitHub webhook or polling).

If Jenkins is on a different server, run deployment on an EC2 SSH agent node or use SSH from pipeline into EC2 and run the same `docker compose` commands there.
