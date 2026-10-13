# Starting up with Docker!

### Requirements:

- Docker
- Docker compose

Create a `.env` file at the root of the project following the `.env.example`

After fulfilling the required environment variables, at the source of the project, run

```bash
docker compose up --build
```

Both database and API should be running. To access the API simply follow the link: http://127.0.0.1/3000 (The port can be changed using the `PORT` env variable)
