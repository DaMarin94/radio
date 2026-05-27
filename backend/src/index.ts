import express from "express"
import cors from "cors"
import radioRoutes from "./routes/radioRoutes";

const app = express()

app.use(cors())
app.use(express.json())
app.use("/radios", radioRoutes);

app.get("/health", (_, res) => {
  res.json({
    ok: true,
    service: "radio-backend"
  })
})

const PORT = 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})