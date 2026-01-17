# .gitignore 設定計画

## 概要
プロジェクトの`.gitignore`を正確に設定し直す。

## 現状の問題点
1. ルートの`.gitignore`が不完全（IDE設定、OS生成ファイル、ruffキャッシュなどが未設定）
2. `backend/.venv/`が別途存在するが、ルートの`.gitignore`でカバーされていない可能性
3. `.claude/`フォルダの扱いが未定義

## 変更対象
- [.gitignore](.gitignore) - ルートのgitignoreを包括的に更新

## 新しい.gitignore内容

```gitignore
# ===========================
# Python
# ===========================
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual environments
.venv/
venv/
ENV/

# Type checkers
.mypy_cache/
.dmypy.json
dmypy.json
.pytype/

# Linters
.ruff_cache/

# Testing
.pytest_cache/
.coverage
htmlcov/
.tox/
.nox/

# ===========================
# Node.js / Frontend
# ===========================
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
.pnpm-store/

# Build output
dist/
dist-ssr/
*.local

# ===========================
# Environment & Secrets
# ===========================
.env
.env.local
.env.*.local
*.pem
google_credentials.json

# ===========================
# IDE & Editors
# ===========================
.idea/
.vscode/
*.swp
*.swo
*~
*.sublime-workspace
*.sublime-project

# ===========================
# OS Generated
# ===========================
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# ===========================
# Project Specific
# ===========================
# Claude Code session files
.claude/

# Test images (keep README only)
# test_images/ は含めない（README.mdを残すため）
```

## 補足
- `frontend/.gitignore`は既に適切に設定されているため変更不要
- `test_images/`はサンプル画像とREADMEを含むため、gitignoreに含めない
- `.claude/`フォルダはClaude Codeのセッション情報なのでignore対象

## 検証方法
1. `git status`で意図したファイルのみがuntrackedになることを確認
2. `git check-ignore -v <path>`で特定パスがignoreされるか確認
