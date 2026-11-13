import os
from dotenv import load_dotenv

load_dotenv()

META_API_KEY       = os.getenv("GROQ_API_KEY", os.getenv("META_API_KEY", ""))
META_API_BASE_URL  = os.getenv("META_API_BASE_URL", "https://api.groq.com/openai/v1")
MUSE_SPARK_MODEL   = os.getenv("MUSE_SPARK_MODEL", os.getenv("MODEL", "openai/gpt-oss-20b"))
MUSE_CODE_MODEL    = os.getenv("MUSE_CODE_MODEL",  os.getenv("MODEL", "openai/gpt-oss-20b"))
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
