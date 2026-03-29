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
    print(f"Created branch: {branch_name}")

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

    print("All jobs have been processed!")
    return None

# ── Claude code generation ─────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are an expert Angular 17 developer.
When given a job name, return ONLY a valid JSON object with this exact shape:

{
  "files": [
    { "path": "relative/path/to/file.ts", "content": "file content here" },
    ...
  ]
}

Strict rules:
- Angular 17 standalone components
- Three.js loaded via CDN script tag in index.html (do NOT install via npm)
- Each component: exactly 3 files (.html, .scss, .ts) — no .spec.ts files
- Required files: app.component.html, app.component.scss, app.component.ts, app.config.ts, main.ts, index.html
- Required config: angular.json, package.json, tsconfig.json, tsconfig.app.json
- Keep file content SHORT and functional — avoid verbose boilerplate
- No comments anywhere in the code
- Return ONLY the raw JSON object — no markdown, no backticks, no explanation
"""

def safe_parse_json(raw):
    raw = raw.strip()

    # Strip markdown fences if present
    if raw.startswith("```"):
        lines = raw.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        raw = "\n".join(lines).strip()

    # Strategy 1: direct parse
    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        print(f"   Direct parse failed: {e}")

    # Strategy 2: find last complete file object and close the JSON
    try:
        last_good = raw.rfind('"}')
        if last_good != -1:
            truncated = raw[:last_good + 2] + "\n  ]\n}"
            return json.loads(truncated)
    except (json.JSONDecodeError, ValueError) as e:
        print(f"   Truncation recovery failed: {e}")

    raise ValueError(f"Could not parse Claude response as JSON. First 500 chars:\n{raw[:500]}")

def generate_template(job_name):
    client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)

    prompt = (
        f'Create a website template for "{job_name}" using Angular 17 and Three.js (CDN). '
        f"3 files per component (html, scss, ts). No spec files. No comments. "
        f"Include all required Angular files. Keep content concise. "
        f"Return ONLY the raw JSON object."
    )

    print(f"Calling Claude API for: {job_name}")
    message = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=16000,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )

    stop_reason = message.stop_reason
    raw = message.content[0].text.strip()
    print(f"   Stop reason: {stop_reason} | Response length: {len(raw)} chars")

    if stop_reason == "max_tokens":
        print("   Warning: response was cut off, attempting recovery...")

    data = safe_parse_json(raw)
    return data["files"]

# ── Push files to GitHub ───────────────────────────────────────────────────────

def push_files_to_branch(files, job_name, branch_name):
    for f in files:
        path = f["path"]
        content = f["content"]
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
        print(f"  Pushed: {path}")

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

# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    job_name = pick_next_job()
    if not job_name:
        return

    print(f"Processing job: {job_name}")

    branch_name = "template/" + job_name.lower().replace(" ", "-").replace("/", "-")

    create_branch(branch_name)

    files = generate_template(job_name)
    print(f"Claude returned {len(files)} files")

    push_files_to_branch(files, job_name, branch_name)

    mark_job_done(job_name)

    with open(os.environ.get("GITHUB_ENV", "/dev/null"), "a") as f:
        f.write(f"BRANCH_NAME={branch_name}\n")

    print(f"\nDone! Branch ready: {branch_name}")

if __name__ == "__main__":
    main()
