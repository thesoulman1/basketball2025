import sqlite3

# Connect to the database
conn = sqlite3.connect('basketball.db')
cursor = conn.cursor()

# Check current status
print("Current status of De'Aaron Fox:")
cursor.execute("SELECT name, is_guard, is_forward, is_center, display_column FROM players WHERE name LIKE '%Fox%'")
result = cursor.fetchone()
if result:
    print(f"Name: {result[0]}")
    print(f"is_guard: {result[1]}")
    print(f"is_forward: {result[2]}")
    print(f"is_center: {result[3]}")
    print(f"display_column: {result[4]}")
else:
    print("Player not found")

# Update De'Aaron Fox to have guard eligibility and move to guards column
print("\nUpdating De'Aaron Fox...")
cursor.execute("""
    UPDATE players
    SET is_guard = 1, display_column = 'G'
    WHERE name LIKE '%Fox%'
""")
conn.commit()

# Verify the update
print("\nUpdated status of De'Aaron Fox:")
cursor.execute("SELECT name, is_guard, is_forward, is_center, display_column FROM players WHERE name LIKE '%Fox%'")
result = cursor.fetchone()
if result:
    print(f"Name: {result[0]}")
    print(f"is_guard: {result[1]}")
    print(f"is_forward: {result[2]}")
    print(f"is_center: {result[3]}")
    print(f"display_column: {result[4]}")

conn.close()
print("\nUpdate completed successfully!")
