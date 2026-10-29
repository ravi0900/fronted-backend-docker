# Student Grade App - Docker Guide

This project runs a Flask backend and an Express frontend in separate Docker
containers. The frontend serves the grades page on port `3000` and requests
grade data from the backend API on port `4000`.

Fontend and backend image can be found here https://hub.docker.com/r/raviraj12/docker_raviraj-backend/tags

## Application routes

| URL | Purpose |
| --- | --- |
| `http://localhost:3000/` | Frontend page |
| `http://localhost:3000/api` | Frontend route that forwards the request to the backend |
| `http://localhost:4000/` | Backend welcome message |
| `http://localhost:4000/api` | Student grade data returned by Flask |

The browser calls the frontend's `/api` route. The frontend then calls
`${BACKEND_URL}/api`, and returns the backend response to the page.

## Backend Dockerfile

The backend Dockerfile uses `python:alpine3.24` as its base image. It sets `/`
as the working directory, copies the backend files into the image, installs
the packages listed in `requirements.txt`, and starts Flask with
`python3 app.py`. The Flask app listens on `0.0.0.0:4000`, which allows other
containers to reach it.

## Frontend Dockerfile

The frontend Dockerfile uses `node:alpine3.23` as its base image. It sets `/`
as the working directory, copies the frontend files into the image, installs
the dependencies from `package.json` with `npm install`, and starts the server
with `node app.js`.

## Build each image manually

Run these commands from the `Project` directory:

```bash
docker build -t student-grade-backend:latest ./backend
docker build -t student-grade-frontend:latest ./frontend
```

Docker uses each directory as that image's build context. For example,
`./backend` provides the backend Dockerfile, Python requirements, Flask app,
and grade data file.

To run the manually built images together, create a Docker network and start
the backend before the frontend:

```bash
docker network create student-grade-network
docker run -d --name backend-app --network student-grade-network \
  -p 4000:4000 student-grade-backend:latest
docker run -d --name frontend-app --network student-grade-network \
  -e BACKEND_URL=http://backend-app:4000 \
  -p 3000:3000 student-grade-frontend:latest
```

Open `http://localhost:3000` to view the page. On the Docker network, the
frontend reaches the backend by its container name, `backend-app`; `localhost`
inside the frontend container would refer to the frontend container itself.

## Build and run with Docker Compose

The Compose file defines two services, `backend` and `frontend`. Its `build`
paths (`backend` and `frontend`) are relative to the Compose file. Compose
builds a separate image for each service; it does not create one combined
image.

From the `Project` directory:

To build the images and run:

start containers

```bash
docker compose up
```
force to rebuild use --build

```bash
docker compose up --build
```

Leave that command running and open `http://localhost:3000`. To start in the
background instead, use:

```bash
docker compose up --build -d
```

In Compose, the backend is configured with the hostname `backend-app`, and the
frontend's `BACKEND_URL` is set to `http://backend-app:4000`. Compose publishes
the frontend and backend ports to the host as `3000` and `4000`, respectively.
The `depends_on` setting starts the backend before the frontend, but does not
wait for the backend API to become ready.

Useful docker commands:

```bash
docker ps -a
docker compose logs -f
docker exec -it <containerid> <cmd>
docker logs <containerid>
docker inspect <containerid>
```

The current Compose file mounts the source folders at `/app`, but both
Dockerfiles run the copied application from `/`. Those mounts therefore do not
replace the files the containers execute. Rebuild the images after changing
source files for the changes to appear in the containers.