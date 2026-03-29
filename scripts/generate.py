import os
import json
import base64
import requests
import anthropic
from datetime import datetime

# ── Config ────────────────────────────────────────────────────────────────────
REPO          = os.environ["REPO"]                  # e.g. MellitiYassine/job-template
GH_TOKEN      = os.environ["GH_TOKEN"]
ANTHROPIC_KEY = os.environ["ANTHROPIC_API_KEY"]
JOBS_FILE     = "jobs.txt"
DONE_FILE     = "scripts/done-jobs.txt"
GH_API        = "https://api.github.com"
HEADERS       = {
    "Authorization": f"Bearer {GH_TOKEN}",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
}

# ── GitHub helpers ─────────────────────────────────────────────────────────────

def gh_get(path):
    r = requests.get(f"{GH_API}{path}", headers=HEADERS)
    r.raise_for_status()
    return r.json()

def gh_put(path, payload):
    r = requests.put(f"{GH_API}{path}", headers=HEADERS, json=payload)
    r.raise_for_status()
    return r.json()

def gh_post(path, payload):
    r = requests.post(f"{GH_API}{path}", headers=HEADERS, json=payload)
    r.raise_for_status()
    return r.json()

def get_file_content(path, ref="main"):
    """Return (content_str, sha) for a file in the repo."""
    data = gh_get(f"/repos/{REPO}/contents/{path}?ref={ref}")
    content = base64.b64decode(data["content"]).decode()
    return content, data["sha"]

def create_or_update_file(path, content, message, branch, sha=None):
    payload = {
        "message": message,
        "content": base64.b64encode(content.encode()).decode(),
        "branch": branch,
    }
    if sha:
        payload["sha"] = sha
    gh_put(f"/repos/{REPO}/contents/{path}", payload)

def create_branch(branch_name, from_ref="main"):
    ref_data = gh_get(f"/repos/{REPO}/git/ref/heads/{from_ref}")
    sha = ref_data["object"]["sha"]
    gh_post(f"/repos/{REPO}/git/refs", {
        "ref": f"refs/heads/{branch_name}",
        "sha": sha,
    })
    print(f"✅ Created branch: {branch_name}")

# ── Job picking ────────────────────────────────────────────────────────────────

def pick_next_job():
    jobs_content, _ = get_file_content(JOBS_FILE)
    all_jobs = [j.strip() for j in jobs_content.splitlines() if j.strip()]

    try:
        done_content, _ = get_file_content(DONE_FILE)
        done_jobs = {j.strip().lower() for j in done_content.splitlines() if j.strip()}
    except Exception:
        done_jobs = set()

    for job in all_jobs:
        if job.lower() not in done_jobs:
            return job

    print("🎉 All jobs have been processed!")
    return None

# ── Claude code generation ─────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are an expert Angular 17 developer. 
When given a job name, you return ONLY a valid JSON object (no markdown, no explanation) with this exact shape:

{
  "files": [
    { "path": "relative/path/to/file.ts", "content": "file content here" },
    ...
  ]
}

Rules:
- Use Angular 17 standalone components
- Use Three.js for 3D visuals
- Each component has exactly 3 files: .html, .scss, .ts (no .spec.ts)
- Include app.component.html, app.component.scss, app.component.ts
- Include app.config.ts and main.ts
- Include a basic angular.json, package.json, tsconfig.json, tsconfig.app.json
- Do NOT add any comments to the code
- Return ONLY the JSON object, nothing else
"""

def generate_template(job_name):
    client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)

    prompt = (
        f'I want to create a website template for "{job_name}" using Angular 17 and Three.js. '
        f"It must have 3 files per component (html, scss, ts — no spec.ts files), "
        f"plus app component files. No comments in code. "
        f"Return the complete project as a JSON object with a 'files' array."
    )

    print(f"🤖 Calling Claude for: {job_name}")
    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=8000,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = message.content[0].text.strip()

    # Strip markdown fences if Claude added them
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    data = json.loads(raw)
    return data["files"]

# ── Push files to GitHub ───────────────────────────────────────────────────────

def push_files_to_branch(files, job_name, branch_name):
    for f in files:
        path = f["path"]
        content = f["content"]
        # Check if file already exists on branch (to get sha for update)
        try:
            _, sha = get_file_content(path, ref=branch_name)
        except Exception:
            sha = None
        create_or_update_file(
            path=path,
            content=content,
            message=f"feat: add {path} for {job_name} template",
            branch=branch_name,
            sha=sha,
        )
        print(f"  📄 Pushed: {path}")

def mark_job_done(job_name):
    try:
        done_content, sha = get_file_content(DONE_FILE)
        new_content = done_content.rstrip() + f"\n{job_name}"
    except Exception:
        new_content = job_name
        sha = None

    create_or_update_file(
        path=DONE_FILE,
        content=new_content,
        message=f"chore: mark '{job_name}' as done",
        branch="main",
        sha=sha,
    )
    print(f"✅ Marked as done: {job_name}")

# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    job_name = pick_next_job()
    if not job_name:
        return

    print(f"🚀 Processing job: {job_name}")

    # Sanitize branch name
    branch_name = "template/" + job_name.lower().replace(" ", "-").replace("/", "-")

    # Create branch
    create_branch(branch_name)

    # Generate files via Claude
    files = generate_template(job_name)
    print(f"📦 Claude returned {len(files)} files")

    # Push all files
    push_files_to_branch(files, job_name, branch_name)

    # Mark job as done
    mark_job_done(job_name)

    # Export branch name for Vercel deploy step
    with open(os.environ.get("GITHUB_ENV", "/dev/null"), "a") as f:
        f.write(f"BRANCH_NAME={branch_name}\n")

    print(f"\n✅ Done! Branch ready: {branch_name}")

if __name__ == "__main__":
    main()
