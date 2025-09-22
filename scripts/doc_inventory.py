#!/usr/bin/env python3
"""Documentation inventory utility.

Provides commands to keep docs/_catalog.csv in sync with files under docs/.
"""
from __future__ import annotations

import argparse
import csv
import json
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence, Tuple

REPO_ROOT = Path(__file__).resolve().parents[1]
DOCS_ROOT = REPO_ROOT / "docs"
CATALOG_PATH = DOCS_ROOT / "_catalog.csv"
RULES_PATH = DOCS_ROOT / ".rules.json"
INDEX_PATH = DOCS_ROOT / "INDEX.md"

SUPPORTED_EXTENSIONS = {".md", ".mdx", ".docx", ".json", ".txt", ".rtf"}
DEFAULT_CATEGORY = "30-product"
DEFAULT_LIFECYCLE = "longterm"
VALID_CATEGORIES = [
    "00-meta",
    "10-strategy",
    "20-roadmaps",
    "30-product",
    "40-platform",
    "50-ops",
    "60-status",
    "90-archive",
]
VALID_LIFECYCLES = {"longterm", "status", "archive", "reference"}
CATEGORY_TITLES = {
    "00-meta": "Meta & Guidelines",
    "10-strategy": "Strategy",
    "20-roadmaps": "Roadmaps",
    "30-product": "Product & Experience",
    "40-platform": "Platform & Integrations",
    "50-ops": "Operations & Runbooks",
    "60-status": "Status Tracking",
    "90-archive": "Archive",
}
STATUS_MAX_AGE_DAYS = 90


@dataclass
class CatalogEntry:
    path: Path
    title: str
    category: str
    lifecycle: str
    review_date: str
    tags: str
    notes: str

    @classmethod
    def from_row(cls, row: Dict[str, str]) -> "CatalogEntry":
        return cls(
            path=Path(row["path"]),
            title=row.get("title", ""),
            category=row.get("category", ""),
            lifecycle=row.get("lifecycle", ""),
            review_date=row.get("review_date", ""),
            tags=row.get("tags", ""),
            notes=row.get("notes", ""),
        )

    def to_row(self) -> Dict[str, str]:
        return {
            "path": self.path.as_posix(),
            "title": self.title,
            "category": self.category,
            "lifecycle": self.lifecycle,
            "review_date": self.review_date,
            "tags": self.tags,
            "notes": self.notes,
        }


@dataclass
class Rule:
    name: str
    path_contains: Sequence[str]
    name_contains: Sequence[str]
    stem_equals: Sequence[str]
    directories: Sequence[str]
    extensions: Sequence[str]
    category: Optional[str]
    lifecycle: Optional[str]
    tags: Sequence[str]

    @classmethod
    def from_dict(cls, data: Dict[str, object]) -> "Rule":
        return cls(
            name=str(data.get("name", "unnamed")),
            path_contains=tuple(x.lower() for x in data.get("path_contains", [])),
            name_contains=tuple(x.lower() for x in data.get("name_contains", [])),
            stem_equals=tuple(x.lower() for x in data.get("stem_equals", [])),
            directories=tuple(x.lower() for x in data.get("directories", [])),
            extensions=tuple(x.lower() for x in data.get("extensions", [])),
            category=data.get("category"),
            lifecycle=data.get("lifecycle"),
            tags=tuple(x for x in data.get("tags", [])),
        )

    def matches(self, rel_path: str, stem: str, extension: str, directories: Sequence[str]) -> bool:
        rel_lower = rel_path.lower()
        if self.extensions and extension.lower() not in self.extensions:
            return False
        if self.path_contains and not any(piece in rel_lower for piece in self.path_contains):
            return False
        if self.name_contains and not any(piece in stem.lower() for piece in self.name_contains):
            return False
        if self.stem_equals and stem.lower() not in self.stem_equals:
            return False
        if self.directories and not any(part in self.directories for part in directories):
            return False
        return True


def load_rules() -> List[Rule]:
    if not RULES_PATH.exists():
        return []
    try:
        data = json.loads(RULES_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError as err:
        raise SystemExit(f"Failed to parse {RULES_PATH}: {err}")
    if not isinstance(data, list):
        raise SystemExit(f"Rules file must contain a list, got {type(data)}")
    return [Rule.from_dict(item) for item in data]


def iter_doc_files() -> Iterable[Path]:
    for path in DOCS_ROOT.rglob("*"):
        if not path.is_file():
            continue
        if path == RULES_PATH or path == INDEX_PATH:
            continue
        if path == DOCS_ROOT / "README.md":
            continue
        if path.name.startswith(".") and path.name not in {".rules.json", ".gitkeep"}:
            continue
        if path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            continue
        yield path


def load_catalog() -> Dict[str, CatalogEntry]:
    if not CATALOG_PATH.exists():
        return {}
    entries: Dict[str, CatalogEntry] = {}
    with CATALOG_PATH.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            if not row.get("path"):
                continue
            entry = CatalogEntry.from_row(row)
            entries[entry.path.as_posix()] = entry
    return entries


def write_catalog(entries: Iterable[CatalogEntry]) -> None:
    rows = sorted((entry.to_row() for entry in entries), key=lambda item: item["path"])
    fieldnames = ["path", "title", "category", "lifecycle", "review_date", "tags", "notes"]
    with CATALOG_PATH.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)


def extract_title(path: Path) -> str:
    if path.suffix.lower() not in {".md", ".mdx"}:
        return path.stem
    try:
        with path.open(encoding="utf-8") as handle:
            for line in handle:
                stripped = line.strip()
                if stripped.startswith("#"):
                    return stripped.lstrip("# ")
    except UnicodeDecodeError:
        return path.stem
    return path.stem


def classify(path: Path, rules: Sequence[Rule]) -> Tuple[str, str, List[str]]:
    rel_path = path.relative_to(DOCS_ROOT).as_posix()
    stem = path.stem
    extension = path.suffix.lower()
    directories = [part.lower() for part in path.relative_to(DOCS_ROOT).parts[:-1]]
    for rule in rules:
        if rule.matches(rel_path, stem, extension, directories):
            category = rule.category or DEFAULT_CATEGORY
            lifecycle = rule.lifecycle or DEFAULT_LIFECYCLE
            tags = list(rule.tags)
            return category, lifecycle, tags
    return DEFAULT_CATEGORY, DEFAULT_LIFECYCLE, []


def parse_date(value: str) -> Optional[date]:
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        return None


def command_scan(args: argparse.Namespace) -> int:
    catalog = load_catalog()
    rules = load_rules()
    missing = []
    for path in iter_doc_files():
        rel = path.relative_to(DOCS_ROOT).as_posix()
        if rel in catalog:
            continue
        category, lifecycle, tags = classify(path, rules)
        missing.append(
            {
                "path": rel,
                "title": extract_title(path),
                "category": category,
                "lifecycle": lifecycle,
                "tags": ",".join(tags),
            }
        )
    if not missing:
        print("No uncatalogued documents found.")
        return 0
    print("Uncatalogued documents:")
    for item in missing:
        print(
            f"- {item['path']} | title='{item['title']}' | category={item['category']} | lifecycle={item['lifecycle']} | tags={item['tags']}"
        )
    return 1


def command_update(args: argparse.Namespace) -> int:
    catalog = load_catalog()
    rules = load_rules()
    new_entries: List[CatalogEntry] = []
    for path in iter_doc_files():
        rel = path.relative_to(DOCS_ROOT).as_posix()
        if rel in catalog:
            continue
        category, lifecycle, tags = classify(path, rules)
        entry = CatalogEntry(
            path=Path(rel),
            title=extract_title(path),
            category=category,
            lifecycle=lifecycle,
            review_date=date.today().isoformat() if lifecycle != "archive" else "",
            tags=",".join(tags),
            notes="",
        )
        new_entries.append(entry)
        catalog[rel] = entry
    if not new_entries:
        print("Catalog already up to date.")
        return 0
    write_catalog(catalog.values())
    print(f"Added {len(new_entries)} entries to {CATALOG_PATH}.")
    return 0


def command_audit(args: argparse.Namespace) -> int:
    catalog = load_catalog()
    rules = load_rules()
    catalog_paths = set(catalog.keys())
    filesystem_paths = {path.relative_to(DOCS_ROOT).as_posix() for path in iter_doc_files()}

    missing_files = sorted(path for path in catalog_paths - filesystem_paths)
    uncatalogued = sorted(path for path in filesystem_paths - catalog_paths)

    invalid_categories = []
    stale_reviews = []
    lifecycle_age_flags = []
    duplicates = []
    title_counts = Counter(entry.title for entry in catalog.values() if entry.title)
    for entry in catalog.values():
        if entry.category and entry.category not in VALID_CATEGORIES:
            invalid_categories.append(entry.path.as_posix())
        review_dt = parse_date(entry.review_date)
        if review_dt and review_dt < date.today():
            stale_reviews.append(entry.path.as_posix())
        if entry.lifecycle == "status":
            registered = parse_date(entry.review_date)
            if registered:
                age = (date.today() - registered).days
                if age > STATUS_MAX_AGE_DAYS:
                    lifecycle_age_flags.append((entry.path.as_posix(), age))
        if title_counts[entry.title] > 1:
            duplicates.append(entry.path.as_posix())

    if missing_files:
        print("Catalog references missing files:")
        for path in missing_files:
            print(f"- {path}")
        print()
    if uncatalogued:
        print("Files not present in catalog:")
        for path in uncatalogued:
            category, lifecycle, tags = classify(DOCS_ROOT / path, rules)
            print(f"- {path} (suggested category={category}, lifecycle={lifecycle}, tags={','.join(tags)})")
        print()
    if invalid_categories:
        print("Entries with invalid categories:")
        for path in sorted(invalid_categories):
            print(f"- {path}")
        print()
    if stale_reviews:
        print("Entries past their review date:")
        for path in sorted(stale_reviews):
            print(f"- {path}")
        print()
    if lifecycle_age_flags:
        print("Status documents older than threshold:")
        for path, age in lifecycle_age_flags:
            print(f"- {path} ({age} days since review)")
        print()
    dup_paths = set(duplicates)
    if dup_paths:
        print("Duplicate titles detected:")
        for path in sorted(dup_paths):
            print(f"- {path}")
        print()

    if not any([missing_files, uncatalogued, invalid_categories, stale_reviews, lifecycle_age_flags, dup_paths]):
        print("No audit findings.")
        return 0
    return 1


def command_markdown_index(args: argparse.Namespace) -> int:
    catalog = load_catalog()
    if not catalog:
        print("Catalog is empty; nothing to index.")
        return 1
    grouped: Dict[str, List[CatalogEntry]] = defaultdict(list)
    for entry in catalog.values():
        grouped[entry.category or DEFAULT_CATEGORY].append(entry)
    lines: List[str] = ["# Documentation Index", ""]
    for category in VALID_CATEGORIES:
        entries = sorted(grouped.get(category, []), key=lambda item: item.path.as_posix())
        if not entries:
            continue
        lines.append(f"## {CATEGORY_TITLES.get(category, category)} ({category})")
        lines.append("")
        lines.append("| Path | Title | Lifecycle | Tags | Review | Notes |")
        lines.append("| --- | --- | --- | --- | --- | --- |")
        for entry in entries:
            rel = entry.path.as_posix()
            title = entry.title or rel
            lifecycle = entry.lifecycle or ""
            tags = entry.tags or ""
            review = entry.review_date or ""
            notes = entry.notes or ""
            lines.append(f"| `{rel}` | {title} | {lifecycle} | {tags} | {review} | {notes} |")
        lines.append("")
    INDEX_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote index to {INDEX_PATH}")
    return 0


def ensure_catalog_header() -> None:
    if CATALOG_PATH.exists():
        return
    fieldnames = ["path", "title", "category", "lifecycle", "review_date", "tags", "notes"]
    with CATALOG_PATH.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Manage documentation inventory metadata.")
    subparsers = parser.add_subparsers(dest="command")

    scan_parser = subparsers.add_parser("scan", help="List uncatalogued documents")
    scan_parser.set_defaults(func=command_scan)

    update_parser = subparsers.add_parser("update", help="Add uncatalogued documents to the catalog")
    update_parser.set_defaults(func=command_update)

    audit_parser = subparsers.add_parser("audit", help="Validate catalog entries against the filesystem")
    audit_parser.set_defaults(func=command_audit)

    index_parser = subparsers.add_parser("markdown-index", help="Generate docs/INDEX.md from the catalog")
    index_parser.set_defaults(func=command_markdown_index)

    return parser


def main(argv: Optional[Sequence[str]] = None) -> int:
    ensure_catalog_header()
    parser = build_parser()
    args = parser.parse_args(argv)
    if not getattr(args, "command", None):
        parser.print_help()
        return 1
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
