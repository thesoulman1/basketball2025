import sqlite3
import pandas as pd

# Create database connection
conn = sqlite3.connect('basketball.db')
cursor = conn.cursor()

# Create players table
cursor.execute('''
CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    team TEXT,
    games_played REAL,
    points REAL,
    three_pointers_made REAL,
    rebounds REAL,
    assists REAL,
    steals REAL,
    blocks REAL,
    turnovers REAL,
    free_throws_missed REAL,
    fantasy_points_per_game REAL,
    is_guard INTEGER,
    is_forward INTEGER,
    is_center INTEGER,
    adp REAL,
    summary TEXT,
    drafted INTEGER DEFAULT 0,
    custom_rank INTEGER,
    display_column TEXT,
    separator_below INTEGER DEFAULT 0,
    separator_label TEXT
)
''')

# Read Excel file
df = pd.read_excel('basketball2025_final.xlsx')

# Sort by Fantasy Points Per Game (descending) to ensure proper ordering
df = df.sort_values('Fantasy Points Per Game', ascending=False).reset_index(drop=True)

# Process each player
for idx, row in df.iterrows():
    # Determine position eligibility
    is_guard = 1 if row['Guard'] == 'Y' else 0
    is_forward = 1 if row['Forward'] == 'Y' else 0
    is_center = 1 if row['Center'] == 'Y' else 0

    # Determine display column based on priority: C > G > F
    if is_center:
        display_column = 'C'
    elif is_guard:
        display_column = 'G'
    else:
        display_column = 'F'

    # Calculate total fantasy points (FPG * Games)
    total_fantasy_points = row['Fantasy Points Per Game'] * row['Games Played'] if pd.notna(row['Fantasy Points Per Game']) and pd.notna(row['Games Played']) else 0

    cursor.execute('''
    INSERT INTO players (
        name, games_played, points, three_pointers_made, rebounds, assists,
        steals, blocks, turnovers, free_throws_missed, fantasy_points_per_game,
        is_guard, is_forward, is_center, adp, summary, custom_rank, display_column
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        row['PLAYER'],
        row['Games Played'],
        row['Points'],
        row['3 Pointers Made'],
        row['Rebounds'],
        row['Assists'],
        row['Steals'],
        row['Blocks'],
        row['Turnovers'],
        row['Free Throws Missed'],
        row['Fantasy Points Per Game'],
        is_guard,
        is_forward,
        is_center,
        row['ADP'],
        row['Summary'],
        idx,  # Initial custom rank is the order from Excel (by projected fantasy points)
        display_column
    ))

conn.commit()
conn.close()

print(f"Database initialized with {len(df)} players")
