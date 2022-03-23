const express = require('express')
const app = express()
const {createPdf}=require('./htmltopdf')
let {data1,data2}= require('./smapleData')
let port = 5050


app.get('/',createPdf )
 


app.listen(port,()=>{
    console.log(`App is listining in http://localgost:${port}`)
})