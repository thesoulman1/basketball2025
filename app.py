from flask import Flask, jsonify, request, send_from_directory
import sqlite3
import json

app = Flask(__name__, static_folder='static', static_url_path='')

def get_db_connection():
    conn = sqlite3.connect('basketball.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/api/players', methods=['GET'])
def get_players():
    """Get all players organized by column"""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Get players for each column, ordered by custom_rank
    columns = {}
    for column in ['G', 'F', 'C']:
        cursor.execute('''
            SELECT
                id, name, games_played, fantasy_points_per_game,
                adp, drafted, custom_rank, display_column,
                is_guard, is_forward, is_center,
                points, three_pointers_made, rebounds, assists,
                steals, blocks, turnovers, free_throws_missed, summary,
                separator_below, separator_label
            FROM players
            WHERE display_column = ?
            ORDER BY custom_rank ASC
        ''', (column,))

        players = []
        for row in cursor.fetchall():
            # Build position eligibility string
            positions = []
            if row['is_guard']:
                positions.append('G')
            if row['is_forward']:
                positions.append('F')
            if row['is_center']:
                positions.append('C')

            players.append({
                'id': row['id'],
                'name': row['name'],
                'positions': '/'.join(positions),
                'gamesPlayed': row['games_played'],
                'fantasyPoints': row['fantasy_points_per_game'] * row['games_played'] if row['fantasy_points_per_game'] and row['games_played'] else 0,
                'fantasyPointsPerGame': row['fantasy_points_per_game'],
                'adp': row['adp'],
                'drafted': bool(row['drafted']),
                'customRank': row['custom_rank'],
                'displayColumn': row['display_column'],
                # Extended stats
                'points': row['points'],
                'threePointersMade': row['three_pointers_made'],
                'rebounds': row['rebounds'],
                'assists': row['assists'],
                'steals': row['steals'],
                'blocks': row['blocks'],
                'turnovers': row['turnovers'],
                'freeThrowsMissed': row['free_throws_missed'],
                'summary': row['summary'],
                'separatorBelow': bool(row['separator_below']),
                'separatorLabel': row['separator_label']
            })

        columns[column] = players

    conn.close()
    return jsonify(columns)

@app.route('/api/players/<int:player_id>/draft', methods=['POST'])
def toggle_draft(player_id):
    """Toggle player's drafted status"""
    data = request.json
    drafted = data.get('drafted', False)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE players SET drafted = ? WHERE id = ?', (1 if drafted else 0, player_id))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'drafted': drafted})

@app.route('/api/players/reorder', methods=['POST'])
def reorder_players():
    """Update custom rankings for players after drag and drop"""
    data = request.json
    column = data.get('column')
    player_ids = data.get('playerIds', [])

    conn = get_db_connection()
    cursor = conn.cursor()

    # Update custom_rank for each player in the new order
    for rank, player_id in enumerate(player_ids):
        cursor.execute('UPDATE players SET custom_rank = ? WHERE id = ?', (rank, player_id))

    conn.commit()
    conn.close()

    return jsonify({'success': True})

@app.route('/api/players/<int:player_id>/separator', methods=['POST'])
def update_separator(player_id):
    """Update separator for a player"""
    data = request.json
    has_separator = data.get('hasSeparator', False)
    label = data.get('label', '')

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'UPDATE players SET separator_below = ?, separator_label = ? WHERE id = ?',
        (1 if has_separator else 0, label if has_separator else None, player_id)
    )
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'hasSeparator': has_separator, 'label': label})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
