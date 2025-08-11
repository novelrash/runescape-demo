#!/usr/bin/env python3
"""
RuneScape Competition Leaderboard - DEMO VERSION
A containerized demo showcasing the production features with sample data.
"""

import os
import sqlite3
from datetime import datetime, timedelta
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import random

app = Flask(__name__)
app.secret_key = 'demo-secret-key-change-in-production'

# Demo configuration - Use writable directory
DATABASE_DIR = os.environ.get('DATABASE_DIR', '/tmp')
DATABASE = os.path.join(DATABASE_DIR, 'demo_leaderboard.db')
DEMO_MODE = True

def get_db_connection():
    """Get database connection"""
    # Ensure directory exists
    os.makedirs(os.path.dirname(DATABASE), exist_ok=True)
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def check_database_initialized():
    """Check if database has been initialized with tables"""
    try:
        conn = get_db_connection()
        cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='teams'")
        result = cursor.fetchone()
        conn.close()
        return result is not None
    except:
        return False

def init_demo_db():
    """Initialize database with demo data"""
    conn = get_db_connection()
    
    # Create tables
    conn.executescript('''
        DROP TABLE IF EXISTS teams;
        DROP TABLE IF EXISTS competitors;
        DROP TABLE IF EXISTS tiles;
        DROP TABLE IF EXISTS completions;
        DROP TABLE IF EXISTS admin_users;
        
        CREATE TABLE teams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE competitors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            rsn TEXT NOT NULL UNIQUE,
            team_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (team_id) REFERENCES teams (id)
        );
        
        CREATE TABLE tiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            difficulty TEXT DEFAULT 'Medium',
            points INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE completions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            competitor_id INTEGER NOT NULL,
            tile_id INTEGER NOT NULL,
            completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            verified BOOLEAN DEFAULT 1,
            FOREIGN KEY (competitor_id) REFERENCES competitors (id),
            FOREIGN KEY (tile_id) REFERENCES tiles (id),
            UNIQUE(competitor_id, tile_id)
        );
        
        CREATE TABLE admin_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ''')
    
    # Insert demo teams
    teams = [
        ('Iron Warriors',), ('Dragon Slayers',), ('Void Knights',), 
        ('Barrows Brothers',), ('Godwars Legends',), ('Skill Masters',)
    ]
    conn.executemany('INSERT INTO teams (name) VALUES (?)', teams)
    
    # Insert demo competitors
    competitors = [
        ('Zezima', 1), ('Woox', 1), ('B0aty', 2), ('Framed', 2),
        ('Settled', 3), ('J1mmy', 3), ('Torvesta', 4), ('Mammal', 4),
        ('Sick_Nerd', 5), ('Faux', 5), ('Alfie', 6), ('Rargh', 6),
        ('Iron_Hyger', 1), ('UIM_Verf', 2), ('Swampletics', 3),
        ('Rendi', 4), ('Xzact', 5), ('25_Buttholes', 6)
    ]
    conn.executemany('INSERT INTO competitors (rsn, team_id) VALUES (?, ?)', competitors)
    
    # Insert demo tiles with various difficulties
    tiles = [
        ('Complete Dragon Slayer', 'Defeat Elvarg and become a true dragon slayer', 'Easy', 2),
        ('Achieve 99 Woodcutting', 'Reach level 99 in Woodcutting skill', 'Medium', 5),
        ('Complete Monkey Madness II', 'Finish the challenging Monkey Madness II quest', 'Hard', 8),
        ('Obtain Fire Cape', 'Defeat TzTok-Jad and earn the Fire Cape', 'Hard', 10),
        ('Complete Theatre of Blood', 'Successfully complete a Theatre of Blood raid', 'Extreme', 15),
        ('Achieve Base 70 Stats', 'Get all combat stats to level 70+', 'Medium', 6),
        ('Complete Recipe for Disaster', 'Finish the Recipe for Disaster quest series', 'Medium', 7),
        ('Obtain Barrows Gloves', 'Unlock and obtain Barrows Gloves', 'Medium', 5),
        ('Complete Chambers of Xeric', 'Successfully complete a Chambers of Xeric raid', 'Hard', 12),
        ('Achieve 99 Slayer', 'Reach level 99 in Slayer skill', 'Hard', 8),
        ('Complete Inferno', 'Defeat TzKal-Zuk and earn the Infernal Cape', 'Extreme', 25),
        ('Obtain Quest Cape', 'Complete all available quests', 'Hard', 10),
        ('Achieve 2000 Total Level', 'Reach 2000+ total skill level', 'Hard', 8),
        ('Complete Desert Treasure', 'Finish Desert Treasure and unlock Ancient Magicks', 'Medium', 4),
        ('Obtain Void Set', 'Complete Pest Control for full Void equipment', 'Medium', 3),
        ('Complete Barbarian Training', 'Finish all Barbarian Training activities', 'Easy', 2),
        ('Achieve 99 Fishing', 'Reach level 99 in Fishing skill', 'Medium', 4),
        ('Complete Lunar Diplomacy', 'Finish Lunar Diplomacy and unlock Lunar spells', 'Medium', 4),
        ('Obtain Fighter Torso', 'Complete Barbarian Assault for Fighter Torso', 'Medium', 3),
        ('Complete Monkey Madness', 'Finish the original Monkey Madness quest', 'Easy', 3)
    ]
    conn.executemany('INSERT INTO tiles (name, description, difficulty, points) VALUES (?, ?, ?, ?)', tiles)
    
    # Generate random completions for demo
    competitor_ids = list(range(1, 19))  # 18 competitors
    tile_ids = list(range(1, 21))  # 20 tiles
    
    completions = []
    for competitor_id in competitor_ids:
        # Each competitor completes 3-12 random tiles
        num_completions = random.randint(3, 12)
        completed_tiles = random.sample(tile_ids, num_completions)
        
        for tile_id in completed_tiles:
            # Random completion time in the last 30 days
            days_ago = random.randint(0, 30)
            hours_ago = random.randint(0, 23)
            completion_time = datetime.now() - timedelta(days=days_ago, hours=hours_ago)
            completions.append((competitor_id, tile_id, completion_time.isoformat()))
    
    conn.executemany('INSERT INTO completions (competitor_id, tile_id, completed_at) VALUES (?, ?, ?)', completions)
    
    # Create demo admin user (username: demo, password: demo123)
    admin_hash = generate_password_hash('demo123')
    conn.execute('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)', ('demo', admin_hash))
    
    conn.commit()
    conn.close()
    print("✅ Demo database initialized with sample data!")

@app.route('/')
def home():
    """Home landing page"""
    return render_template('home.html', demo_mode=DEMO_MODE)

@app.route('/leaderboard')
def index():
    """Main leaderboard page"""
    # Ensure database is initialized
    if not check_database_initialized():
        print("🚀 Initializing demo database...")
        init_demo_db()
    
    conn = get_db_connection()
    
    # Get team standings
    team_standings = conn.execute('''
        SELECT t.name as team_name, t.id as team_id,
               COUNT(DISTINCT c.id) as member_count,
               COALESCE(SUM(tiles.points), 0) as total_points,
               COUNT(DISTINCT comp.id) as total_completions
        FROM teams t
        LEFT JOIN competitors c ON t.id = c.team_id
        LEFT JOIN completions comp ON c.id = comp.competitor_id
        LEFT JOIN tiles ON comp.tile_id = tiles.id
        GROUP BY t.id, t.name
        ORDER BY total_points DESC, total_completions DESC
    ''').fetchall()
    
    # Get individual standings
    individual_standings = conn.execute('''
        SELECT c.rsn, t.name as team_name,
               COALESCE(SUM(tiles.points), 0) as total_points,
               COUNT(comp.id) as completions_count
        FROM competitors c
        LEFT JOIN teams t ON c.team_id = t.id
        LEFT JOIN completions comp ON c.id = comp.competitor_id
        LEFT JOIN tiles ON comp.tile_id = tiles.id
        GROUP BY c.id, c.rsn, t.name
        ORDER BY total_points DESC, completions_count DESC
        LIMIT 15
    ''').fetchall()
    
    # Get recent completions
    recent_completions = conn.execute('''
        SELECT c.rsn, t.name as team_name, tiles.name as tile_name, 
               tiles.points, comp.completed_at
        FROM completions comp
        JOIN competitors c ON comp.competitor_id = c.id
        JOIN teams t ON c.team_id = t.id
        JOIN tiles ON comp.tile_id = tiles.id
        ORDER BY comp.completed_at DESC
        LIMIT 10
    ''').fetchall()
    
    conn.close()
    
    return render_template('demo_index.html', 
                         team_standings=team_standings,
                         individual_standings=individual_standings,
                         recent_completions=recent_completions,
                         demo_mode=DEMO_MODE)

@app.route('/tiles')
def tiles():
    """Tiles overview page"""
    # Ensure database is initialized
    if not check_database_initialized():
        print("🚀 Initializing demo database...")
        init_demo_db()
    
    conn = get_db_connection()
    
    tiles = conn.execute('''
        SELECT tiles.*, 
               COUNT(comp.id) as completion_count,
               GROUP_CONCAT(c.rsn) as completed_by
        FROM tiles
        LEFT JOIN completions comp ON tiles.id = comp.tile_id
        LEFT JOIN competitors c ON comp.competitor_id = c.id
        GROUP BY tiles.id
        ORDER BY tiles.difficulty, tiles.points DESC
    ''').fetchall()
    
    conn.close()
    
    return render_template('demo_tiles.html', tiles=tiles, demo_mode=DEMO_MODE)

@app.route('/teams')
def teams():
    """Teams overview page"""
    # Ensure database is initialized
    if not check_database_initialized():
        print("🚀 Initializing demo database...")
        init_demo_db()
    
    conn = get_db_connection()
    
    teams_data = conn.execute('''
        SELECT t.name, t.id,
               COUNT(DISTINCT c.id) as member_count,
               COALESCE(SUM(tiles.points), 0) as total_points,
               COUNT(DISTINCT comp.id) as total_completions,
               GROUP_CONCAT(c.rsn) as members
        FROM teams t
        LEFT JOIN competitors c ON t.id = c.team_id
        LEFT JOIN completions comp ON c.id = comp.competitor_id
        LEFT JOIN tiles ON comp.tile_id = tiles.id
        GROUP BY t.id, t.name
        ORDER BY total_points DESC
    ''').fetchall()
    
    conn.close()
    
    return render_template('demo_teams.html', teams=teams_data, demo_mode=DEMO_MODE)

@app.route('/competitor/<rsn>')
def competitor_detail(rsn):
    """Individual competitor detail page"""
    # Ensure database is initialized
    if not check_database_initialized():
        print("🚀 Initializing demo database...")
        init_demo_db()
    
    conn = get_db_connection()
    
    competitor = conn.execute('''
        SELECT c.*, t.name as team_name
        FROM competitors c
        LEFT JOIN teams t ON c.team_id = t.id
        WHERE c.rsn = ?
    ''', (rsn,)).fetchone()
    
    if not competitor:
        flash('Competitor not found!', 'error')
        return redirect(url_for('index'))
    
    completions = conn.execute('''
        SELECT tiles.name, tiles.description, tiles.difficulty, 
               tiles.points, comp.completed_at
        FROM completions comp
        JOIN tiles ON comp.tile_id = tiles.id
        WHERE comp.competitor_id = ?
        ORDER BY comp.completed_at DESC
    ''', (competitor['id'],)).fetchall()
    
    stats = conn.execute('''
        SELECT 
            COUNT(*) as total_completions,
            COALESCE(SUM(tiles.points), 0) as total_points,
            COUNT(CASE WHEN tiles.difficulty = 'Easy' THEN 1 END) as easy_count,
            COUNT(CASE WHEN tiles.difficulty = 'Medium' THEN 1 END) as medium_count,
            COUNT(CASE WHEN tiles.difficulty = 'Hard' THEN 1 END) as hard_count,
            COUNT(CASE WHEN tiles.difficulty = 'Extreme' THEN 1 END) as extreme_count
        FROM completions comp
        JOIN tiles ON comp.tile_id = tiles.id
        WHERE comp.competitor_id = ?
    ''', (competitor['id'],)).fetchone()
    
    conn.close()
    
    return render_template('demo_competitor.html', 
                         competitor=competitor, 
                         completions=completions,
                         stats=stats,
                         demo_mode=DEMO_MODE)

@app.route('/api/stats')
def api_stats():
    """API endpoint for statistics"""
    # Ensure database is initialized
    if not check_database_initialized():
        print("🚀 Initializing demo database...")
        init_demo_db()
    
    conn = get_db_connection()
    
    stats = {
        'total_teams': conn.execute('SELECT COUNT(*) FROM teams').fetchone()[0],
        'total_competitors': conn.execute('SELECT COUNT(*) FROM competitors').fetchone()[0],
        'total_tiles': conn.execute('SELECT COUNT(*) FROM tiles').fetchone()[0],
        'total_completions': conn.execute('SELECT COUNT(*) FROM completions').fetchone()[0],
        'demo_mode': DEMO_MODE
    }
    
    conn.close()
    return jsonify(stats)

if __name__ == '__main__':
    # Ensure database is initialized
    if not check_database_initialized():
        print("🚀 Initializing demo database...")
        init_demo_db()
    
    # Run the app
    app.run(host='0.0.0.0', port=5000, debug=False)
