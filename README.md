# Fantasy Basketball Draft Board 2025

A web application for managing your fantasy basketball draft with drag-and-drop functionality, player tracking, and comprehensive statistics.

## Features

- **Three-column layout**: Players organized into Guards, Forwards, and Centers
- **Player prioritization**: If a player is eligible for multiple positions:
  - Centers (C) > Guards (G) > Forwards (F)
  - Example: A player eligible for F/C appears in the Center column
- **Default sorting**: Players ordered by projected fantasy points (descending)
- **Draft tracking**: Checkbox to mark players as drafted
- **Expandable details**: Click "Details" to view:
  - Fantasy Points Per Game
  - Points, 3-Pointers Made, Rebounds, Assists
  - Steals, Blocks, Turnovers, Free Throws Missed
  - Player summary/notes
- **Drag-and-drop**: Reorder players within their column to set custom rankings
- **SQLite persistence**: All changes saved to database

## Setup and Installation

1. Install required Python packages:
   ```bash
   pip install pandas openpyxl flask
   ```

2. Initialize the database:
   ```bash
   python init_db.py
   ```

3. Start the Flask server:
   ```bash
   python app.py
   ```

4. Open your browser and navigate to:
   ```
   http://127.0.0.1:5000
   ```

## Usage

### Viewing Players
- Players are displayed in three columns: Guards, Forwards, and Centers
- Each card shows:
  - Player name
  - Position eligibility
  - Average Draft Position (ADP)
  - Projected fantasy points (total)
  - Projected games played

### Expanding Player Details
- Click the "Details" button on any player card to see:
  - Full statistical breakdown
  - Player summary and notes

### Marking Players as Drafted
- Check the checkbox next to a player's name
- Drafted players appear grayed out with strikethrough text
- Status is saved to the database automatically

### Custom Rankings
- Click and drag any player card up or down within their column
- Drop the player in the desired position
- Rankings are saved automatically to the database
- Note: Players can only be moved within their assigned column

## Files

- `app.py` - Flask backend server with API endpoints
- `init_db.py` - Database initialization script
- `basketball.db` - SQLite database (created after running init_db.py)
- `static/index.html` - Main HTML page
- `static/styles.css` - Styling and layout
- `static/app.js` - Frontend JavaScript with drag-and-drop functionality
- `basketball2025_final.xlsx` - Source data file

## API Endpoints

- `GET /api/players` - Get all players organized by column
- `POST /api/players/<id>/draft` - Toggle player's drafted status
- `POST /api/players/reorder` - Update custom rankings after drag-and-drop

## Database Schema

The `players` table includes:
- Player information (name, positions)
- Projected stats (games, fantasy points, etc.)
- Detailed stats (points, rebounds, assists, steals, blocks, turnovers, etc.)
- Draft status (drafted flag)
- Custom ranking (for drag-and-drop ordering)
- Display column (G, F, or C)

## Notes

- The application uses the player data from `basketball2025_final.xlsx`
- Players are initially ranked by projected total fantasy points
- Custom rankings persist across sessions
- The app runs in debug mode - suitable for local use
