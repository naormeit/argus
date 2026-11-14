import os
from dotenv import load_dotenv

load_dotenv()

# Groq — free-tier LLM for all agents
GROQ_API_KEY       = os.getenv("GROQ_API_KEY", "")
GROQ_API_BASE      = "https://api.groq.com/openai/v1"
GROQ_FAST_MODEL    = os.getenv("GROQ_FAST_MODEL",  "qwen/qwen3.8-27b")        # Scout + Forge
GROQ_SMART_MODEL   = os.getenv("GROQ_SMART_MODEL", "openai/gpt-oss-120b")     # Hunter + Arbiter
LOOM_SECRET        = os.getenv("LOOM_SECRET", "")
DATABASE_URL       = os.getenv("DATABASE_URL", "")
ETHERSCAN_API_KEY  = os.getenv("ETHERSCAN_API_KEY", "")
SUPABASE_JWT_SECRET      = os.getenv("SUPABASE_JWT_SECRET", "")
SUPABASE_PROJECT_REF     = os.getenv("SUPABASE_PROJECT_REF", "ypjldrxxqfsgcicpotcn")
# Stripe — commented out, replaced by Lemon Squeezy
# STRIPE_SECRET_KEY        = os.getenv("STRIPE_SECRET_KEY", "")
# STRIPE_WEBHOOK_SECRET    = os.getenv("STRIPE_WEBHOOK_SECRET", "")
# STRIPE_CREDIT_PRICE_ID   = os.getenv("STRIPE_CREDIT_PRICE_ID", "")
# STRIPE_PRO_PRICE_ID      = os.getenv("STRIPE_PRO_PRICE_ID", "")

# Lemon Squeezy
LS_API_KEY              = os.getenv("LS_API_KEY", "")
LS_WEBHOOK_SECRET       = os.getenv("LS_WEBHOOK_SECRET", "")
LS_STORE_ID             = os.getenv("LS_STORE_ID", "")
LS_CREDITS_VARIANT_ID   = os.getenv("LS_CREDITS_VARIANT_ID", "")  # $9.99 / 10 audits
LS_PRO_VARIANT_ID       = os.getenv("LS_PRO_VARIANT_ID", "")      # $29/month
FRONTEND_URL             = os.getenv("FRONTEND_URL", "https://frontend-eight-theta-43.vercel.app")
GITHUB_APP_ID            = os.getenv("GITHUB_APP_ID", "")
GITHUB_PRIVATE_KEY       = os.getenv("GITHUB_PRIVATE_KEY", "").replace("\\n", "\n")
GITHUB_WEBHOOK_SECRET    = os.getenv("GITHUB_WEBHOOK_SECRET", "")
GITHUB_APP_NAME          = os.getenv("GITHUB_APP_NAME", "argus-auditor")
ADMIN_EMAIL              = os.getenv("ADMIN_EMAIL", "")
