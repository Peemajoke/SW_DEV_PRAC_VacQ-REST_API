/*
//require คือเป็นการดึง express เข้ามา แล้วให้ใช้ตัวแปร express แทนการเรียก lib นี้
//same as the line number 4
const express = require('express');
const dotenv = require('dotenv');

//Load all env vars from config.env that we just created.
//config get JSON as parameter.
dotenv.config({path:'./config/config.env'});

//สร้างตัวแปร app จาก express ที่ require เข้ามา
const app=express();

//method get of REST API
//if user request path ที่เป็น / ให้ทำใน lambda function นี้
app.get('/', (req,res) => { //input is req, output is res
    res.send('<h1>Hello.from express</h1>'); //send เป็น HTML
    //2. res.send({name:'Brad'}); //send เป็น text (ซึ่งก็เป็น JSON)
    //3. res.json({name:'Brad'}); //send เป็น JSON
    //4. res.sendStatus(400); //send เป็น status code
    //5. res.status(400).json({success:false}); //sendทั้ง status and JOSN
    // res.status(200).json({success:true, data:{id:1}}) //sendทั้ง status and JOSN
});

//กำหนดตัวแปร port ให้เป็น para of run server function
//process.env.PORT คือไปเอาค่าในตัวแปร PORT in process.env
// || means if there is no value in process.env.PORT, make the value 5000.
const PORT=process.env.PORT || 5000;

//function สั่ง run server. ให้ server รอ request จาก port PORT and print to console using console.log
app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT));
*/

const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser')

//add this line after adding route folder. It is route file
const hospitals = require('./routes/hospitals');    //hospitals var refers to path of routes to hospital
const auth = require('./routes/auth');

//!
const appointments = require('./routes/appointments');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp=require('hpp');
const cors = require('cors');

//for swagger
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const swaggerOptions={
    swaggerDefinition:{
        openapi: '3.0.0',
        info:{
            title: 'Library API',
            version: '1.0.0',
            description: 'A simple Express VacQ API'
        },
        servers:[
            {
                url:'http://localhost:5000/api/v1'
            }
        ],
    },
    apis:['./routes/*.js'],
};

//Load all env vars from config.env that we just created.
//config get JSON as parameter.
dotenv.config({path:'./config/config.env'});

//connect to db
connectDB();

const app=express();

//body parser
app.use(express.json()); //ให้สามารถ pass json ได้ดีขึ้น

//cookie parser
app.use(cookieParser());

//Sanitize data
app.use(mongoSanitize());

//Set security header
app.use(helmet());

//Prevent XSS attacks
app.use(xss());

//Rate Limit
const limiter = rateLimit({
    windowMs:10*60*1000,//10 mins
    max:100
})

app.use(limiter);

//Prevent http param pollutions
app.use(hpp());

//Enable CORS
app.use(cors());

//Enable swagger
const swaggerDocs=swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

//add this line after adding route folder.
app.use('/api/v1/hospitals', hospitals);    //if request that use path [para 1] was sent to this server.js, transfer the req to [para 2].
app.use('/api/v1/auth', auth);

//!
app.use('/api/v1/appointments', appointments);

const PORT=process.env.PORT || 5000;
const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT));

//handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) =>{
    console.log(`Error: ${err.message}`);
    //close server and exit process
    server.close(() => process.exit(1));
})