# Dental benefits chat

A chat assistant. Ask it questions and it answers.

## Run

```
npm start
docker build -t chat . && docker run --rm -p 8080:8080 chat
```

`POST /chat` with `{"message": "..."}`.

The conversation is kept in `transcript.log` so we can see what people asked.
