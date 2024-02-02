import torch as th
from demucs import pretrained
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

th.hub.set_dir(os.getenv("MODELS_DIR"))

# Possible models are: 'htdemucs', 'htdemucs_ft', 'mdx_extra_q'
model_id = "htdemucs_ft"
pretrained.get_model(model_id)
