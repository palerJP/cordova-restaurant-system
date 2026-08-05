# Updated README: add run steps and docker-compose instructions

## Local development (updated)

1. Start Postgres (either locally or via Docker Compose)

- Using Docker Compose (recommended):

  cd cordova-restaurant-system
  docker-compose up -d

- Or create DB locally:

  createdb cordova_restaurants

2. Backend

  cd cordova-restaurant-system/backend
  cp .env.example .env   # optional - we've committed a dev .env already
  npm install
  npm run db:migrate
  npm run db:seed
  npm run dev

Backend will run at http://localhost:4000

3. Frontend

  cd cordova-restaurant-system/frontend
  cp .env.local.example .env.local   # optional - we've committed a dev .env.local already
  npm install
  npm run dev

Frontend will run at http://localhost:3000
