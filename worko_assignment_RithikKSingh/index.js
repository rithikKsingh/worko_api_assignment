require('dotenv').config()
const connectDB=require('./config/db.js')
const express=require("express")
const userRoutes=require("./routes/userRoutes.js")
const cookieParser = require('cookie-parser')

const app=express()

const PORT=process.env.PORT;

connectDB();

app.use(cookieParser());
app.use(express.json());

app.use('/api', userRoutes);


app.listen(PORT,()=>{
    console.log(`App running on PORT ${PORT}`)
})

module.exports=app;