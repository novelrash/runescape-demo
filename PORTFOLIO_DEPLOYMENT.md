# Portfolio Site Demo Deployment Guide 🌐

## 🎯 Deployment Options for Your Portfolio

### Option 1: Free Cloud Hosting (Recommended)

#### **Render.com (Free Tier)**
```yaml
# render.yaml
services:
  - type: web
    name: runescape-competition-demo
    env: docker
    dockerfilePath: ./Dockerfile.demo
    plan: free
    envVars:
      - key: FLASK_ENV
        value: production
```

**Steps:**
1. Push your demo code to GitHub
2. Connect Render to your GitHub repo
3. Deploy automatically from `Dockerfile.demo`
4. Get a free `.onrender.com` URL

#### **Railway.app (Free Tier)**
```dockerfile
# Railway auto-detects Dockerfile.demo
# Just connect your GitHub repo
```

#### **Fly.io (Free Tier)**
```toml
# fly.toml
app = "runescape-demo-yourname"

[build]
  dockerfile = "Dockerfile.demo"

[[services]]
  http_checks = []
  internal_port = 5000
  processes = ["app"]
  protocol = "tcp"
  script_checks = []

  [services.concurrency]
    hard_limit = 25
    soft_limit = 20
    type = "connections"

  [[services.ports]]
    force_https = true
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

  [[services.tcp_checks]]
    grace_period = "1s"
    interval = "15s"
    restart_limit = 0
    timeout = "2s"
```

### Option 2: VPS/Cloud Server

#### **DigitalOcean Droplet ($5/month)**
```bash
# On your droplet
git clone your-repo
cd your-demo-directory
./deploy-demo.sh

# Set up reverse proxy with nginx
sudo apt install nginx
sudo nano /etc/nginx/sites-available/runescape-demo
```

#### **AWS EC2 Free Tier**
```bash
# Use your existing EC2 knowledge
# Deploy alongside your production app on different port
docker run -p 5001:5000 runescape-competition-demo
```

### Option 3: GitHub Pages + Static Version

#### **Convert to Static Demo**
```python
# static-generator.py
import json
from app_demo import app, get_db_connection, init_demo_db

def generate_static_demo():
    with app.app_context():
        # Generate static JSON data
        conn = get_db_connection()
        
        # Export all data as JSON
        data = {
            'teams': [...],
            'players': [...],
            'achievements': [...],
            'completions': [...]
        }
        
        with open('demo-data.json', 'w') as f:
            json.dump(data, f)
```

### Option 4: Embed in Existing Portfolio

#### **iframe Integration**
```html
<!-- In your portfolio HTML -->
<div class="demo-section">
    <h2>RuneScape Competition System Demo</h2>
    <iframe 
        src="https://your-demo.onrender.com" 
        width="100%" 
        height="800px"
        frameborder="0">
    </iframe>
    <p><a href="https://your-demo.onrender.com" target="_blank">Open in new tab</a></p>
</div>
```

#### **Portfolio Integration Button**
```html
<div class="project-card">
    <h3>RuneScape Competition System</h3>
    <p>Full-stack competition management platform with team leaderboards...</p>
    <div class="project-links">
        <a href="https://your-demo.onrender.com" class="demo-btn" target="_blank">
            🎮 Live Demo
        </a>
        <a href="https://github.com/yourusername/repo" class="code-btn" target="_blank">
            📝 View Code
        </a>
    </div>
</div>
```

## 🚀 Step-by-Step: Render.com Deployment

### 1. Prepare Your Repository
```bash
# Create a new GitHub repo for the demo
git init
git add .
git commit -m "Initial demo commit"
git remote add origin https://github.com/yourusername/runescape-demo
git push -u origin main
```

### 2. Deploy on Render
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your demo repository
5. Configure:
   - **Name**: `runescape-competition-demo`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `./Dockerfile.demo`
   - **Plan**: Free
6. Click "Create Web Service"

### 3. Custom Domain (Optional)
```bash
# In Render dashboard
Settings → Custom Domains → Add your-domain.com/demo
```

## 🎨 Portfolio Integration Examples

### Modern Portfolio Card
```html
<div class="project-showcase">
    <div class="project-image">
        <img src="demo-screenshot.png" alt="RuneScape Competition Demo">
        <div class="project-overlay">
            <a href="https://your-demo.onrender.com" class="demo-link">
                <i class="fas fa-external-link-alt"></i> Live Demo
            </a>
        </div>
    </div>
    <div class="project-info">
        <h3>Competition Management System</h3>
        <p>Full-stack Flask application with team competitions, real-time leaderboards, and achievement tracking.</p>
        <div class="tech-stack">
            <span class="tech">Python</span>
            <span class="tech">Flask</span>
            <span class="tech">SQLite</span>
            <span class="tech">Docker</span>
        </div>
    </div>
</div>
```

### Interactive Demo Section
```html
<section class="demo-section">
    <h2>🎮 Interactive Demo</h2>
    <p>Experience the full competition management system with sample data:</p>
    
    <div class="demo-features">
        <div class="feature">
            <h4>🏆 Team Competition</h4>
            <p>6 teams competing with real-time standings</p>
        </div>
        <div class="feature">
            <h4>👤 Player Profiles</h4>
            <p>Individual stats and achievement tracking</p>
        </div>
        <div class="feature">
            <h4>🎯 Achievement System</h4>
            <p>20 achievements across 4 difficulty levels</p>
        </div>
    </div>
    
    <a href="https://your-demo.onrender.com" class="cta-button" target="_blank">
        Launch Demo →
    </a>
</section>
```

## 📊 Analytics & Monitoring

### Add Analytics to Demo
```html
<!-- In demo templates -->
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Monitor Demo Usage
```python
# Add to app_demo.py
from datetime import datetime
import json

@app.before_request
def log_request():
    if request.endpoint:
        # Log demo usage
        log_data = {
            'timestamp': datetime.now().isoformat(),
            'endpoint': request.endpoint,
            'user_agent': request.headers.get('User-Agent', ''),
            'ip': request.remote_addr
        }
        # Store in simple log file or send to analytics
```

## 🔒 Security Considerations

### Demo-Specific Security
```python
# In app_demo.py
@app.before_request
def demo_security():
    # Rate limiting for demo
    if request.remote_addr in rate_limit_exceeded():
        return "Demo rate limit exceeded", 429
    
    # Block certain paths
    blocked_paths = ['/admin', '/api/admin']
    if request.path in blocked_paths:
        return "Not available in demo", 403
```

### Environment Variables
```bash
# For production demo deployment
DEMO_MODE=true
FLASK_ENV=production
DATABASE_URL=sqlite:///demo.db
ANALYTICS_ID=your-analytics-id
```

## 📱 Mobile Optimization

### Responsive Demo Banner
```css
.demo-banner {
    position: sticky;
    top: 0;
    z-index: 1000;
    background: linear-gradient(135deg, #ff6b35, #f7931e);
    color: white;
    padding: 10px;
    text-align: center;
    font-weight: bold;
}

@media (max-width: 768px) {
    .demo-banner {
        font-size: 0.9em;
        padding: 8px;
    }
}
```

## 🎯 Portfolio SEO

### Meta Tags for Demo
```html
<meta name="description" content="Interactive demo of RuneScape Competition Management System - Flask, Python, Docker">
<meta name="keywords" content="Flask, Python, Competition Management, Leaderboard, Docker, Portfolio">
<meta property="og:title" content="RuneScape Competition Demo">
<meta property="og:description" content="Full-stack competition management system with team leaderboards">
<meta property="og:image" content="https://your-demo.onrender.com/static/demo-preview.png">
```

## 🚀 Quick Start Commands

```bash
# 1. Deploy to Render (easiest)
git push origin main  # Render auto-deploys

# 2. Deploy to Railway
railway login
railway link
railway up

# 3. Deploy to Fly.io
flyctl launch
flyctl deploy

# 4. Local testing
./deploy-demo.sh
```

## 💡 Pro Tips

1. **Screenshot Generator**: Create automated screenshots of your demo for portfolio
2. **Demo Analytics**: Track which features visitors use most
3. **Loading States**: Add loading animations for better UX
4. **Error Handling**: Graceful fallbacks for demo failures
5. **Cache Strategy**: Use CDN for static assets
6. **Performance**: Optimize images and minimize bundle size

---

Choose the deployment method that best fits your portfolio setup and budget! 🚀
