#!/usr/bin/env python3
import sys
import os
from datetime import datetime

REMINDERS_DIR = "/home/daytona/reminders"

def ensure_dir():
    os.makedirs(REMINDERS_DIR, exist_ok=True)

def set_reminder(text):
    ensure_dir()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{REMINDERS_DIR}/{timestamp}.txt"
    with open(filename, 'w') as f:
        f.write(f"{text}\nSet at {datetime.now()}")
    print(f"Reminder set: {text}")

def list_reminders():
    ensure_dir()
    files = sorted(os.listdir(REMINDERS_DIR))
    if not files:
        print("No reminders.")
        return
    for f in files:
        with open(os.path.join(REMINDERS_DIR, f), 'r') as fp:
            print(f"- {fp.readline().strip()}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: reminder_manager.py [set|list] [message]")
        sys.exit(1)
    action = sys.argv[1]
    if action == "set" and len(sys.argv) > 2:
        set_reminder(" ".join(sys.argv[2:]))
    elif action == "list":
        list_reminders()
    else:
        print("Unknown action or missing message.")