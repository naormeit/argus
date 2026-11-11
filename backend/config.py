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
