import os
from dotenv import load_dotenv

load_dotenv()

META_API_KEY       = os.getenv("META_API_KEY", "")
META_API_BASE_URL  = os.getenv("META_API_BASE_URL", "https://api.llama.com/v1")
MUSE_SPARK_MODEL   = os.getenv("MUSE_SPARK_MODEL", "Llama-4-Maverick-17B-128E-Instruct-FP8")
MUSE_CODE_MODEL    = os.getenv("MUSE_CODE_MODEL",  "Llama-4-Maverick-17B-128E-Instruct-FP8")
LOOM_SECRET        = os.getenv("LOOM_SECRET", "argus-dev-secret-change-in-prod")
