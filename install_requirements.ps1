$ErrorActionPreference = "Stop"

# Ensure whisper can build its wheel metadata on Windows/Python 3.11.
python -m pip install --upgrade pip "setuptools<81" wheel
python -m pip install --no-build-isolation -r requirements.txt
