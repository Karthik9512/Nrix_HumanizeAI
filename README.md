# Nrix HumanizeAI

This project uses only local NLP. No API key is needed.

## What to do

1. Open terminal in `D:\Data Science Project's\Nrix HumanizeAI`
2. Run:

```bash
npm run install:all
```

3. Install the stronger local transformer model stack:

```bash
npm run install:python
```

4. Create `server/.env` with:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/humanizeai
CLIENT_URL=http://localhost:5173
ENABLE_LOCAL_TRANSFORMER=true
PYTHON_PATH=python
```

5. Create `client/.env` with:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

6. Start backend:

```bash
npm run server
```

7. Start frontend in another terminal:

```bash
npm run client
```

8. Open:

```text
http://localhost:5173
```

## API

- `POST /api/humanize`
- `GET /api/history`
- `POST /api/save`

## Note

The backend now tries the stronger local transformer worker first from `server/python/humanizer_worker.py`.
If the Python model stack is not installed, the app still works by falling back to the built-in local rewrite engine.
