# Student Grade App - Docker Guide

This project runs a Flask backend and an Express frontend in separate Docker
containers. The frontend serves a student grade submission form on port `3000`
and requests data from the backend API on port `4000`.

Frontend and backend images can be found at
https://hub.docker.com/r/raviraj12/fontend-backend/tags

* Note: pulled backend image should run with env flag
```bash
docker run -p 4000:4000 -e URI=mongodb+srv://mongouri raviraj12/fontend-backend:pybackend-v1
```
* To run both frontend and backend, it should be on same network

## Application routes

| URL | Purpose |
| --- | --- |
| `http://localhost:3000/` | Frontend page |
| `http://localhost:3000/submit` | Frontend proxy for submitting a student grade (POST) |
| `http://localhost:3000/view` | Frontend proxy for viewing submitted grades |
| `http://localhost:4000/` | Backend welcome message |
| `http://localhost:4000/api` | Student grade data returned by Flask |
| `http://localhost:4000/submit` | Saves a student grade (POST) |
| `http://localhost:4000/view` | Returns grades saved in MongoDB |

The page submits `name`, `email`, and `grade` to the frontend's `/submit`
route, which forwards the request to the backend. The page loads submitted
grades from `/view`. Email addresses are checked without regard to letter case:
the form reports duplicates inline, and the backend's unique MongoDB index
enforces the rule even if two submissions arrive at nearly the same time.
The backend requires `URI` to be set in `backend/.env` for its MongoDB
connection. This file is excluded from Docker build contexts; Compose and the
manual `docker run` command pass its values to the container at runtime. The
safe placeholder file `backend/.env.example` is not excluded.

If the database already contains duplicate email addresses (ignoring letter
case), remove or merge those duplicates before starting the backend so it can
create the unique index.

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
  --env-file backend/.env -p 4000:4000 student-grade-backend:latest
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