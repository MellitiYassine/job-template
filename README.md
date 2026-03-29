# 🤖 Job Template Auto-Generator

Automatically generates an Angular 17 + Three.js website template for one job per day, pushes it to a new branch, and deploys it to Vercel.

---

## 📁 Repo Structure

```
jobs.txt                          ← your list of job names (one per line)
scripts/
  generate.py                     ← main script (called by GitHub Action)
  done-jobs.txt                   ← auto-updated list of processed jobs
.github/
  workflows/
    daily-template.yml            ← GitHub Action (runs daily at 8AM UTC)
```

---

## 🔑 Setup (One Time Only)

### 1. Anthropic API Key
1. Go to https://console.anthropic.com → Sign up
2. Click **API Keys** → **Create Key**
3. Copy the key

### 2. Vercel Token
1. Go to https://vercel.com → Settings → Tokens
2. Create a token named `github-actions`
3. Copy the token

### 3. Vercel Project IDs
Run once locally inside this repo folder:
```bash
npm i -g vercel
vercel login
vercel link
cat .vercel/project.json
```
This gives you `orgId` and `projectId`.

### 4. Add Secrets to GitHub
Go to your repo → **Settings → Secrets and variables → Actions** and add:

| Secret Name         | Value                        |
|---------------------|------------------------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key       |
| `VERCEL_TOKEN`      | Your Vercel token            |
| `VERCEL_ORG_ID`     | From `.vercel/project.json`  |
| `VERCEL_PROJECT_ID` | From `.vercel/project.json`  |

---

## ▶️ Running Manually

Go to your repo → **Actions → Daily Job Template Generator → Run workflow**

---

## 📋 How It Works

1. Reads `jobs.txt` and picks the first job not in `done-jobs.txt`
2. Calls Claude API to generate the full Angular 17 + Three.js project
3. Creates a new branch: `template/job-name`
4. Pushes all generated files to that branch
5. Updates `done-jobs.txt` on main
6. Vercel auto-deploys the branch as a preview URL

---

## ✏️ Adding More Jobs

Just add more lines to `jobs.txt` — one job name per line:
```
chef
architect
nurse
software engineer
...
```
