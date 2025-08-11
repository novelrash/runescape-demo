# RuneScape Competition Demo 🎮

A containerized demo version of the RuneScape Competition Leaderboard system, showcasing core features with sample data.

## 🎯 What This Demo Shows

- **Team Competition System** - 6 teams competing with realistic sample data
- **Individual Player Tracking** - 18 competitors with detailed profiles
- **Achievement System** - 20 achievements across 4 difficulty levels
- **Real-time Leaderboards** - Team standings and individual rankings
- **Player Profiles** - Detailed stats and completion history
- **Responsive Design** - Works on desktop and mobile devices

## 🚀 Quick Start

### Option 1: One-Command Deployment
```bash
./deploy-demo.sh
```

### Option 2: Manual Docker Commands
```bash
# Build the demo
docker build -f Dockerfile.demo -t runescape-competition-demo .

# Run the demo
docker run -p 5000:5000 --name runescape-demo runescape-competition-demo

# Access at http://localhost:5000
```

### Option 3: Docker Compose
```bash
docker-compose -f docker-compose.demo.yml up -d
```

## 📊 Demo Data

The demo includes:

### Teams (6)
- Iron Warriors, Dragon Slayers, Void Knights
- Barrows Brothers, Godwars Legends, Skill Masters

### Players (18)
Famous RuneScape players including:
- Zezima, Woox, B0aty, Framed, Settled, J1mmy
- Torvesta, Mammal, Sick_Nerd, Faux, and more

### Achievements (20)
- **Easy** (2-3 points): Dragon Slayer, Barbarian Training
- **Medium** (4-7 points): 99 Woodcutting, Recipe for Disaster
- **Hard** (8-12 points): Fire Cape, Chambers of Xeric, Quest Cape
- **Extreme** (15-25 points): Theatre of Blood, Inferno

### Sample Completions
- Randomly generated completion data
- Realistic completion patterns
- Recent activity feed

## 🎮 Features Demonstrated

### 🏆 Team Competition
- Real-time team standings
- Member contribution tracking
- Team statistics and progress
- Podium display for top 3 teams

### 👤 Individual Profiles
- Personal achievement history
- Difficulty breakdown statistics
- Points and completion tracking
- Team affiliation display

### 🎯 Achievement System
- Categorized by difficulty
- Point-based scoring system
- Completion tracking
- Filterable achievement list

### 📈 Analytics
- Competition statistics
- Progress tracking
- Performance metrics
- Recent activity feeds

## 🔧 Technical Stack

- **Backend**: Python Flask
- **Database**: SQLite with sample data
- **Frontend**: Responsive HTML/CSS/JavaScript
- **Container**: Docker with health checks
- **Deployment**: Docker Compose ready

## 🌐 API Endpoints

The demo includes a simple API:

```bash
# Get competition statistics
curl http://localhost:5000/api/stats

# Response includes:
# - Total teams, competitors, tiles, completions
# - Demo mode indicator
```

## 📱 Responsive Design

The demo works on:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes

## 🛠️ Development

### Local Development
```bash
# Install dependencies
pip install -r WORKING-requirements.txt

# Run locally
python app_demo.py

# Access at http://localhost:5000
```

### Customization
- Modify `app_demo.py` for functionality changes
- Edit templates in `templates/demo_*.html`
- Update styles in `static/style.css`
- Adjust sample data in the `init_demo_db()` function

## 🐳 Container Details

### Image Information
- **Base**: Python 3.11 slim
- **Size**: ~200MB
- **User**: Non-root app user
- **Health Check**: Built-in API health monitoring

### Volumes
- `/app/data` - SQLite database storage
- Persistent across container restarts

### Environment Variables
- `FLASK_ENV=production`
- `PYTHONUNBUFFERED=1`

## 🔍 Monitoring

### Health Check
```bash
# Check container health
docker ps

# View health check logs
docker inspect runescape-demo | grep Health -A 10
```

### Logs
```bash
# View application logs
docker logs runescape-demo

# Follow logs in real-time
docker logs -f runescape-demo
```

## 🛑 Stopping the Demo

```bash
# Using Docker Compose
docker-compose -f docker-compose.demo.yml down

# Using Docker directly
docker stop runescape-demo
docker rm runescape-demo
```

## 📋 Demo vs Production

| Feature | Demo | Production |
|---------|------|------------|
| Data | Sample/Static | Live/Dynamic |
| Authentication | None | Full admin system |
| Submissions | View only | Real-time submissions |
| Database | SQLite | PostgreSQL/MySQL |
| Scaling | Single container | Multi-container |
| Integrations | None | Discord, APIs |
| Management | Read-only | Full CRUD operations |

## 🎯 Use Cases

Perfect for:
- **Portfolio demonstrations**
- **Feature showcasing**
- **Client presentations**
- **Development testing**
- **System architecture demos**

## 📞 Support

This demo showcases a production-ready competition management system. For information about:
- Custom implementations
- Production deployments
- Feature additions
- Integration services

Please reach out for more details!

---

🎮 **RuneScape Competition Demo** - Built with Flask, Docker, and ❤️
