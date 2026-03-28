#!/usr/bin/env python3
import sys
import json
import os
from datetime import datetime

def load_memory(topic):
    path = f"/home/daytona/memories/{topic}.txt"
    try:
        with open(path, 'r') as f:
            return f.read()
    except:
        return None

def fill_form(form_type):
    # For hackathon demo: generate a mock filled form
    about = load_memory("about_eleanor") or "Eleanor"
    health = load_memory("health") or ""

    # Extract name from about (first line)
    name = about.split('\n')[0].split(',')[0] if about else "Eleanor"

    result = f"""
    === {form_type.replace('_', ' ').title()} Application ===
    Applicant: {name}
    Date: {datetime.now().strftime('%Y-%m-%d')}
    Status: Completed (demo)

    Based on your records, you qualify for:
    - Senior Property Tax Exemption
    - Meals on Wheels

    Next steps: Submit this form to the local senior center.
    """
    return result

if __name__ == "__main__":
    form_type = sys.argv[1] if len(sys.argv) > 1 else "senior_housing_assistance"
    output = fill_form(form_type)
    print(output)