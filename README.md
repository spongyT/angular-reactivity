# Beispielprojekt zur Veranschaulichung von Angular reactivity

## Start

- Dependencies installieren `npm i --workspaces`
- Backend starten `rum run start:backend` 
- Frontend starten `rum run start:frontend` 

# Backend als Docker-Container starten

- Backend bauen `docker build -t user-service -f backend/Dockerfile ./backend`
- Backend starten `docker run -it -p 8081:8080 user-service`