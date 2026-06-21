import { createApp } from './app.js'

const PORT = Number(process.env.PORT ?? 8080)

const app = createApp()

app.listen(PORT, () => {
  console.log(`ELITE Nuvia API running on http://localhost:${PORT}`)
})
