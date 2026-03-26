import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT 

app.get('/health', (req, res) => {
    res.json({status:'ok', message:"Backend Running :)"})
})

app.listen(PORT, ()=> {
    console.log(`Server running at port: ${PORT}}`)
})