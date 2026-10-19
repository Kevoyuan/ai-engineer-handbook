"""Safety tests for scripts/gbrain_stage_source.py; no GBrain/Bun/network required."""
import importlib.util
from pathlib import Path
import subprocess
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "gbrain_stage_source.py"
spec = importlib.util.spec_from_file_location("gbrain_stage_source", SCRIPT)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class StageSourceTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        root = Path(self.tmp.name)
        self.repo = root / "checkout"
        self.mirror = root / "mirror"
        self.repo.mkdir()
        subprocess.run(["git", "init", "--quiet", str(self.repo)], check=True)
        subprocess.run(["git", "-C", str(self.repo), "config", "user.email", "test@example.invalid"], check=True)
        subprocess.run(["git", "-C", str(self.repo), "config", "user.name", "GBrain Test"], check=True)
        (self.repo / "handbook/chapters").mkdir(parents=True)
        (self.repo / "archive/interview").mkdir(parents=True)
        (self.repo / "handbook/chapters/07-context.md").write_text("# Context\nCommitted chapter\n")
        (self.repo / "archive/interview/private.md").write_text("not for export")
        (self.repo / "README.md").write_text("skip me")
        subprocess.run(["git", "-C", str(self.repo), "add", "."], check=True)
        subprocess.run(["git", "-C", str(self.repo), "commit", "-qm", "fixture"], check=True)

    def test_default_dry_run_does_not_write(self):
        plan = module.stage(self.repo, self.mirror, "HEAD", False)
        self.assertFalse(self.mirror.exists())
        self.assertEqual(plan["document_count"], 1)
        self.assertEqual(plan["operations"][0]["status"], "add")

    def test_apply_only_exports_committed_canonical(self):
        chapter = self.repo / "handbook/chapters/07-context.md"
        chapter.write_text("# Context\nUNCOMMITTED SECRET\n")
        module.stage(self.repo, self.mirror, "HEAD", True)
        staged = (self.mirror / "chapters/07-context.md").read_text()
        self.assertIn("Committed chapter", staged)
        self.assertNotIn("UNCOMMITTED SECRET", staged)
        self.assertFalse((self.mirror / "archive").exists())
        self.assertIn("/blob/", staged)
        self.assertTrue((self.mirror / "source-manifest.json").is_file())
        self.assertEqual(module.stage(self.repo, self.mirror, "HEAD", False)["operations"][0]["status"], "unchanged")

    def test_rejects_destination_inside_checkout(self):
        with self.assertRaises(module.StageError):
            module.stage(self.repo, self.repo / ".gbrain", "HEAD", True)

    def test_refuses_modified_staged_file(self):
        module.stage(self.repo, self.mirror, "HEAD", True)
        (self.mirror / "chapters/07-context.md").write_text("local edits")
        with self.assertRaises(module.StageError):
            module.stage(self.repo, self.mirror, "HEAD", True)

    def test_refuses_symlinked_destination_file(self):
        module.stage(self.repo, self.mirror, "HEAD", True)
        target = self.mirror / "chapters/07-context.md"
        target.unlink()
        target.symlink_to(self.repo / "README.md")
        with self.assertRaises(module.StageError):
            module.stage(self.repo, self.mirror, "HEAD", True)

    def test_refuses_symlinked_chapters_directory(self):
        self.mirror.mkdir()
        (self.mirror / "chapters").symlink_to(self.repo / "handbook/chapters", target_is_directory=True)
        with self.assertRaises(module.StageError):
            module.stage(self.repo, self.mirror, "HEAD", True)


if __name__ == "__main__":
    unittest.main()
