# Save as: migration_refactor.py
from __future__ import annotations

import argparse
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BACKEND = ROOT / "backend"

MOVE_FILES = [
    ("backend/config.py", "backend/core/config.py"),
    ("backend/extraction/extractor.py", "backend/rag/extractor.py"),
    ("backend/extraction/prompts.py", "backend/rag/prompts.py"),
    ("backend/query/rag.py", "backend/rag/query_engine.py"),
    ("backend/storage/db.py", "backend/db/db.py"),
    ("backend/storage/vector_store.py", "backend/db/vector_store.py"),
    ("backend/storage/chroma_noop_telemetry.py", "backend/db/chroma_noop_telemetry.py"),
    ("backend/storage/__init__.py", "backend/db/__init__.py"),
    ("test_api.py", "backend/tests/test_api.py"),
    ("test_query.py", "backend/tests/test_query.py"),
    ("test_extraction.py", "backend/tests/test_extraction.py"),
    ("test_transcribe.py", "backend/tests/test_transcribe.py"),
]

TARGET_PACKAGES = [
    "backend/api",
    "backend/core",
    "backend/services",
    "backend/models",
    "backend/workers",
    "backend/ingestion",
    "backend/rag",
    "backend/db",
    "backend/tests",
]

IMPORT_REWRITES = [
    ("backend.rag.query_engine", "backend.rag.query_engine"),
    ("backend.rag", "backend.rag"),
    ("backend.rag", "backend.rag"),
    ("backend.db", "backend.db"),
    ("backend.core.config", "backend.core.config"),
]

ROUTES_PATH_REWRITES = [
    ('Path(__file__).parent.parent / "venv"', 'Path(__file__).resolve().parents[2] / "venv"'),
    ('Path(__file__).parent.parent / "venv" / "Lib" / "site-packages"',
     'Path(__file__).resolve().parents[2] / "venv" / "Lib" / "site-packages"'),
    ("sys.path.append(str(Path(__file__).parent.parent))",
     "sys.path.append(str(Path(__file__).resolve().parents[2]))"),
]


def log(msg: str) -> None:
    print(msg)


def write_text(path: Path, text: str, dry_run: bool) -> None:
    if dry_run:
        log(f"[DRY] write {path}")
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")
    log(f"[OK] write {path}")


def remove_file(path: Path, dry_run: bool) -> None:
    if not path.exists():
        return
    if dry_run:
        log(f"[DRY] remove {path}")
        return
    path.unlink()
    log(f"[OK] remove {path}")


def move_file(src_rel: str, dst_rel: str, dry_run: bool) -> None:
    src = ROOT / src_rel
    dst = ROOT / dst_rel

    if not src.exists():
        log(f"[SKIP] missing: {src}")
        return

    if dst.exists():
        log(f"[SKIP] exists: {dst}")
        return

    if dry_run:
        log(f"[DRY] move {src} -> {dst}")
        return

    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(src), str(dst))
    log(f"[OK] move {src} -> {dst}")


def ensure_init(package_dir: Path, dry_run: bool) -> None:
    package_dir.mkdir(parents=True, exist_ok=True)
    init_file = package_dir / "__init__.py"
    if init_file.exists():
        return
    write_text(init_file, "", dry_run)


def migrate_main_to_api(dry_run: bool) -> None:
    src_main = BACKEND / "main.py"
    routes_py = BACKEND / "api" / "routes.py"

    if not src_main.exists():
        raise FileNotFoundError(f"Missing required file: {src_main}")

    routes_text = src_main.read_text(encoding="utf-8")
    for old, new in ROUTES_PATH_REWRITES:
        routes_text = routes_text.replace(old, new)

    write_text(routes_py, routes_text, dry_run)

    main_shim = (
        "from backend.api.routes import app\n\n"
        "__all__ = [\"app\"]\n"
    )
    write_text(src_main, main_shim, dry_run)


def merge_rag_init(dry_run: bool) -> None:
    rag_init = BACKEND / "rag" / "__init__.py"
    text = '"""RAG and extraction/query layer."""\n'
    write_text(rag_init, text, dry_run)

    remove_file(BACKEND / "extraction" / "__init__.py", dry_run)
    remove_file(BACKEND / "query" / "__init__.py", dry_run)


def rewrite_imports(dry_run: bool) -> None:
    for py_file in ROOT.rglob("*.py"):
        parts = set(py_file.parts)
        if {"venv", "__pycache__", ".git"} & parts:
            continue

        original = py_file.read_text(encoding="utf-8")
        updated = original
        for old, new in IMPORT_REWRITES:
            updated = updated.replace(old, new)

        if updated != original:
            write_text(py_file, updated, dry_run)


def remove_empty_dirs(dry_run: bool) -> None:
    obsolete = [
        BACKEND / "extraction",
        BACKEND / "query",
        BACKEND / "storage",
    ]

    for folder in obsolete:
        if not folder.exists():
            continue

        pycache = folder / "__pycache__"
        if pycache.exists():
            if dry_run:
                log(f"[DRY] remove tree {pycache}")
            else:
                shutil.rmtree(pycache, ignore_errors=True)

        try:
            next(folder.iterdir())
            log(f"[KEEP] not empty: {folder}")
        except StopIteration:
            if dry_run:
                log(f"[DRY] rmdir {folder}")
            else:
                folder.rmdir()
                log(f"[OK] rmdir {folder}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Refactor backend folder structure safely.")
    parser.add_argument("--dry-run", action="store_true", help="Show actions without changing files.")
    args = parser.parse_args()

    for rel in TARGET_PACKAGES:
        ensure_init(ROOT / rel, args.dry_run)

    migrate_main_to_api(args.dry_run)

    for src, dst in MOVE_FILES:
        move_file(src, dst, args.dry_run)

    merge_rag_init(args.dry_run)
    rewrite_imports(args.dry_run)
    remove_empty_dirs(args.dry_run)

    log("\nDone.")


if __name__ == "__main__":
    main()