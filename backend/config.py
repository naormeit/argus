import os
from dotenv import load_dotenv

load_dotenv()

# Claude AI — primary LLM for all agents (Phase 6+)
ANTHROPIC_API_KEY  = os.getenv("ANTHROPIC_API_KEY", "")
CLAUDE_MODEL       = os.getenv("CLAUDE_MODEL", "claude-haiku-5-5")       # Scout + Forge
CLAUDE_SMART_MODEL = os.getenv("CLAUDE_SMART_MODEL", "claude-sonnet-4-6") # Hunter + Arbiter
LOOM_SECRET        = os.getenv("LOOM_SECRET", "argus-dev-secret-change-in-prod")
DATABASE_URL       = os.getenv("DATABASE_URL", "")
ETHERSCAN_API_KEY  = os.getenv("ETHERSCAN_API_KEY", "")
SUPABASE_JWT_SECRET      = os.getenv("SUPABASE_JWT_SECRET", "")
STRIPE_SECRET_KEY        = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET    = os.getenv("STRIPE_WEBHOOK_SECRET", "")
STRIPE_CREDIT_PRICE_ID   = os.getenv("STRIPE_CREDIT_PRICE_ID", "")   # $9.99 / 10 audits
STRIPE_PRO_PRICE_ID      = os.getenv("STRIPE_PRO_PRICE_ID", "")       # $29/month
FRONTEND_URL             = os.getenv("FRONTEND_URL", "https://frontend-eight-theta-43.vercel.app")
GITHUB_APP_ID            = os.getenv("GITHUB_APP_ID", "")
GITHUB_PRIVATE_KEY       = os.getenv("GITHUB_PRIVATE_KEY", "").replace("\\n", "\n")
GITHUB_WEBHOOK_SECRET    = os.getenv("GITHUB_WEBHOOK_SECRET", "")
GITHUB_APP_NAME          = os.getenv("GITHUB_APP_NAME", "argus-auditor")
