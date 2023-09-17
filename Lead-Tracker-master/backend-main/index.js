const express = require('express');
const app = express();
const cors = require('cors');
const dotEnv = require('dotenv');
const mongoose = require('mongoose');
const bodyParser=require('body-parser');
const path = require("path");
const cron = require('node-cron');
const Lead = require('./models/leadData');
const sendEmail = require('./middlewares/mailer');

// configure cors
app.use(cors());

// configure express to receive form data from client
// app.use(express.json());
app.use(bodyParser.json({
    limit: '50mb'
  }));
  
  app.use(bodyParser.urlencoded({
    limit: '50mb',
    parameterLimit: 100000,
    extended: true 
  }));

// dotEnv Configuration
dotEnv.config({path : './.env'});

const port = 5000;

// mongoDB Configuration
mongoose.connect(process.env.MONGO_DB_CLOUD_URL, {
    useNewUrlParser : true,
    useUnifiedTopology : true,
    useFindAndModify : false,
    useCreateIndex : true
}).then((response) => {
    console.log('DB Connected');
}).catch((error) => {
    console.error(error);
    process.exit(1); // stop the process if unable to connect to mongodb
});

// simple URL

const myCronJob = async () => {
  console.log('Cron job started!');
  const currentDate = new Date();
  const currentDateString = currentDate.toISOString().slice(0, 10);
  let allLeads = await Lead.find();
  for await (let lead of allLeads) {
    const providedDateString = lead.dueDate.toISOString().slice(0, 10);
    if (currentDateString == providedDateString) {
      await sendEmail(lead.email, lead.name, 'hello');
    }
  }
  console.log('Cron job ended!');
};
const cronSchedule = '0 2 * * *'; 

const scheduledJob = cron.schedule(cronSchedule, myCronJob);
scheduledJob.start();

// router configuration
app.use('/api/users' , require('./router/userDataRouter'));
app.use('/api/leads' , require('./router/leadDataRouter'));

if(process.env.NODE_ENV === 'production'){
    app.use(express.static('client/build'))
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname,  "client/build", "index.html"));
      });
}
// 

app.listen(port, () => {
    console.log(`Express Server is Started at PORT : ${port}`);
});