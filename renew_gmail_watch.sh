#!/bin/bash

# Change to the script directory
cd "$(dirname "$0")"

# Activate virtual environment
source venv/bin/activate

# Run the watch renewal script
python3 check-watch.py

# Deactivate virtual environment
deactivate 