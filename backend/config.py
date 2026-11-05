import os
from dotenv import load_dotenv

load_dotenv()

META_API_KEY       = os.getenv("GROQ_API_KEY", os.getenv("META_API_KEY", ""))
META_API_BASE_URL  = os.getenv("META_API_BASE_URL", "https://api.groq.com/openai/v1")
MUSE_SPARK_MODEL   = os.getenv("MODEL", "llama-3.3-70b-versatile")
MUSE_CODE_MODEL    = os.getenv("MODEL", "llama-3.3-70b-versatile")
LOOM_SECRET        = os.getenv("LOOM_SECRET", "argus-dev-secret-change-in-prod")
