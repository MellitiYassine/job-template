import os
import json
import base64
import requests
import anthropic

# ── Config ────────────────────────────────────────────────────────────────────
REPO          = os.environ["REPO"]
GH_TOKEN      = os.environ["GH_TOKEN"]
ANTHROPIC_KEY = os.environ["ANTHROPIC_API_KEY"]
JOBS_FILE     = "jobs.txt"
DONE_FILE     = "scripts/done-jobs.txt"
BASE_BRANCH   = "base-angular"
GH_API        = "https://api.github.com"
HEADERS       = {
    "Authorization": f"Bearer {GH_TOKEN}",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
}

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

def create_branch(branch_name, from_ref=BASE_BRANCH):
    try:
        gh_get(f"/repos/{REPO}/git/ref/heads/{branch_name}")
        print(f"Branch already exists, reusing: {branch_name}")
        return
    except Exception:
        pass
    ref_data = gh_get(f"/repos/{REPO}/git/ref/heads/{from_ref}")
    sha = ref_data["object"]["sha"]
    gh_post(f"/repos/{REPO}/git/refs", {
        "ref": f"refs/heads/{branch_name}",
        "sha": sha,
    })
    print(f"Created branch: {branch_name} (from {from_ref})")

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
    print("All jobs have been processed!")
    return None

SYSTEM_PROMPT = """You are an expert Angular 17 developer.
You are given a job name and must return ONLY a valid JSON object with exactly this shape:

{
  "app.component.ts": "full file content here",
  "app.component.html": "full file content here",
  "app.component.scss": "full file content here"
}

Rules:
- Visually impressive, job-themed website using Three.js (already loaded globally as window.THREE)
- Angular 17 standalone component: selector app-root, standalone: true, templateUrl, styleUrl
- Use AfterViewInit and ViewChild to access the canvas and initialize Three.js
- Access Three.js via (window as any).THREE — do NOT import it
- The 3D scene must be job-themed (e.g. flying tools for carpenter, DNA for doctor)
- No comments in code
- Return ONLY the raw JSON object — no markdown, no backticks, no explanation
"""

def generate_template(job_name):
    client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)
    prompt = (
        f'Create an Angular 17 app component for a "{job_name}" themed website. '
        f'Use Three.js (available as (window as any).THREE) for an impressive 3D scene. '
        f'Return only the JSON object with the 3 file contents.'
    )
    print(f"Calling Claude API for: {job_name}")
    message = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=8000,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )
    stop_reason = message.stop_reason
    raw = message.content[0].text.strip()
    print(f"   Stop reason: {stop_reason} | Response: {len(raw)} chars")
    if raw.startswith("```"):
        lines = raw.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        raw = "\n".join(lines).strip()
    return json.loads(raw)

def push_component_files(files, job_name, branch_name):
    file_map = {
        "app.component.ts":   "src/app/app.component.ts",
        "app.component.html": "src/app/app.component.html",
        "app.component.scss": "src/app/app.component.scss",
    }
    for key, repo_path in file_map.items():
        content = files.get(key, "")
        if not content:
            print(f"  WARNING: missing {key}")
            continue
        try:
            _, sha = get_file_content(repo_path, ref=branch_name)
        except Exception:
            sha = None
        create_or_update_file(
            path=repo_path,
            content=content,
            message=f"feat({job_name}): update {key}",
            branch=branch_name,
            sha=sha,
        )
        print(f"  Pushed: {repo_path}")

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
    print(f"Marked as done: {job_name}")

def main():
    job_name = pick_next_job()
    if not job_name:
        return
    print(f"Processing job: {job_name}")
    branch_name = "template/" + job_name.lower().replace(" ", "-").replace("/", "-")
    create_branch(branch_name, from_ref=BASE_BRANCH)
    files = generate_template(job_name)
    print(f"Claude returned {len(files)} files")
    push_component_files(files, job_name, branch_name)
    mark_job_done(job_name)
    with open(os.environ.get("GITHUB_ENV", "/dev/null"), "a") as f:
        f.write(f"BRANCH_NAME={branch_name}\n")
    print(f"\nDone! Branch ready: {branch_name}")

if __name__ == "__main__":
    main()
