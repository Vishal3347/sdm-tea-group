# SDM Tea Group LLP – Sultanicherra
## Tea Garden Management System — Complete Setup Guide

---

## 📁 Project Structure

```
sdm-tea-group/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── LabourEntry.js
│   │   ├── ProductionEntry.js
│   │   ├── Buyer.js
│   │   ├── PestReport.js
│   │   ├── IrrigationLog.js
│   │   └── Weather.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── weather.js
│   │   ├── labour.js
│   │   ├── production.js
│   │   ├── buyers.js
│   │   ├── pest.js
│   │   ├── irrigation.js
│   │   └── dashboard.js
│   ├── middleware/
│   │   └── auth.js
│   ├── utils/
│   │   ├── weatherCron.js
│   │   └── cloudinary.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── app/
    │   ├── dashboard/page.js
    │   ├── labour/page.js
    │   ├── production/page.js
    │   ├── buyers/page.js
    │   ├── crop-health/
    │   │   ├── pest/page.js
    │   │   └── irrigation/page.js
    │   ├── settings/users/page.js
    │   ├── login/page.js
    │   ├── layout.js
    │   ├── page.js
    │   └── globals.css
    ├── components/
    │   ├── layout/
    │   │   ├── WeatherHeader.js
    │   │   ├── Sidebar.js
    │   │   └── ProtectedLayout.js
    │   └── ui/
    │       ├── Modal.js
    │       ├── ConfirmDialog.js
    │       └── Pagination.js
    ├── lib/
    │   ├── api.js
    │   └── auth.js
    ├── next.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

---

## 🚀 Local Setup Instructions

### Prerequisites
- Node.js v18+
- npm or yarn
- Git

### Step 1: Clone and install

```bash
# Install backend dependencies
cd sdm-tea-group/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Backend `.env`

```bash
cd sdm-tea-group/backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://...   # From MongoDB Atlas
JWT_SECRET=your_secure_secret_here
JWT_EXPIRES_IN=7d

OPENWEATHER_API_KEY=your_key    # From openweathermap.org
GARDEN_LAT=24.8167
GARDEN_LON=92.3667
GARDEN_NAME=Sultanicherra Tea Garden, Assam

CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

FRONTEND_URL=http://localhost:3000
```

### Step 3: Configure Frontend `.env.local`

```bash
cd sdm-tea-group/frontend
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Step 4: Run both servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open: http://localhost:3000

**Default Login:** admin@sdmtea.com / Admin@SDM2024

---

## 🌿 MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com and create a free account
2. Create a **Free Tier M0 Cluster** (select your region)
3. Under **Security > Database Access**: Create a database user
   - Username: `sdmadmin`
   - Password: strong password
   - Role: `Read and write to any database`
4. Under **Security > Network Access**: Add IP `0.0.0.0/0` (allow all) or your specific IP
5. Click **Connect > Drivers** and copy the connection string
6. Replace `<password>` with your DB password and add `/sdm_tea_group` before `?` in the URI
7. Paste into backend `.env` as `MONGODB_URI`

---

## 🌤️ OpenWeather API Setup

1. Go to https://openweathermap.org and register (free)
2. Go to **My API Keys** and copy your key
3. Paste into backend `.env` as `OPENWEATHER_API_KEY`
4. Update `GARDEN_LAT` and `GARDEN_LON` for your exact garden coordinates
   - Example: Hailakandi, Assam: Lat 24.6819, Lon 92.5623

---

## 📸 Cloudinary Setup

1. Go to https://cloudinary.com and create a free account
2. Go to **Dashboard** and find:
   - Cloud Name
   - API Key
   - API Secret
3. Paste all three into backend `.env`
4. Free tier: 25GB storage, 25GB bandwidth/month

---

## ☁️ Render Deployment (Backend)

1. Push your code to GitHub
2. Go to https://render.com and sign up (free)
3. Click **New > Web Service**
4. Connect your GitHub repo
5. Settings:
   - **Name**: sdm-tea-backend
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
6. Under **Environment Variables**, add all values from your `.env`
7. Set `FRONTEND_URL` to your Vercel URL (see below)
8. Click **Create Web Service**
9. Copy your Render URL (e.g., `https://sdm-tea-backend.onrender.com`)

> ⚠️ Free Render instances spin down after 15 min of inactivity. Use UptimeRobot (free) to ping `/api/health` every 14 minutes.

---

## ▲ Vercel Deployment (Frontend)

1. Push your code to GitHub
2. Go to https://vercel.com and sign up (free)
3. Click **Add New Project**
4. Import your GitHub repo
5. Set:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
6. Under **Environment Variables**:
   - `NEXT_PUBLIC_API_URL` = `https://your-render-url.onrender.com/api`
7. Click **Deploy**
8. Your site will be live at `https://sdm-tea-group.vercel.app`

---

## 👥 User Roles

| Permission | Owner (Admin) | Staff |
|-----------|--------------|-------|
| View all modules | ✅ | ✅ |
| Add records | ✅ | ✅ |
| Edit records | ✅ | ❌ |
| Delete records | ✅ | ❌ |
| Manage users | ✅ | ❌ |
| Add/Edit buyers | ✅ | ❌ |

Max 5 total users allowed.

---

## 🔒 Security Features

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens expire in 7 days
- Role-based middleware on all protected routes
- Input validation with express-validator
- CORS restricted to frontend URL
- File uploads limited to 5MB
- Image-only Cloudinary uploads

---

## 📊 API Endpoints

### Auth
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user

### Dashboard
- `GET /api/dashboard` — Today's stats

### Weather
- `GET /api/weather` — Latest weather
- `POST /api/weather/refresh` — Force refresh

### Labour
- `GET /api/labour` — List (paginated)
- `POST /api/labour` — Create
- `PUT /api/labour/:id` — Update (owner)
- `DELETE /api/labour/:id` — Delete (owner)

### Production
- `GET /api/production` — List
- `GET /api/production/chart` — 7-day chart data
- `POST /api/production` — Create
- `PUT /api/production/:id` — Update (owner)
- `DELETE /api/production/:id` — Delete (owner)

### Buyers
- `GET /api/buyers` — List
- `POST /api/buyers` — Create (owner)
- `PUT /api/buyers/:id` — Update (owner)
- `DELETE /api/buyers/:id` — Remove (owner)

### Pest
- `GET /api/pest` — List
- `POST /api/pest` — Create (with image upload)
- `PUT /api/pest/:id` — Update (owner)
- `DELETE /api/pest/:id` — Delete (owner)

### Irrigation
- `GET /api/irrigation` — List
- `POST /api/irrigation` — Create
- `PUT /api/irrigation/:id` — Update (owner)
- `DELETE /api/irrigation/:id` — Delete (owner)

### Users (Owner Only)
- `GET /api/users` — List all users
- `POST /api/users` — Create user
- `PUT /api/users/:id` — Update user
- `DELETE /api/users/:id` — Deactivate user

---

## 🌦️ Weather Alert Logic

| Condition | Alert |
|-----------|-------|
| Rainfall > 7mm/hr | Heavy Rain ⛈️ |
| Humidity < 30% AND Temp > 35°C | Drought Alert 🌵 |
| Wind speed > 15 m/s | Strong Winds 🌬️ |

Weather is fetched every 30 minutes via node-cron and stored in MongoDB.

---

## 🛠️ Tech Stack Summary

| Component | Technology | Hosting |
|-----------|-----------|---------|
| Frontend | Next.js 14, TailwindCSS | Vercel (Free) |
| Backend | Node.js, Express.js | Render (Free) |
| Database | MongoDB Atlas | Atlas Free Tier |
| Auth | JWT + bcrypt | — |
| Weather | OpenWeatherMap API | Free Tier |
| Images | Cloudinary | Free Tier |
| Charts | Chart.js | — |

All free. Zero cost to operate.
