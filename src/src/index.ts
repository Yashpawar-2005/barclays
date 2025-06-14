import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';

import Authrouter from './routes/Auth.routes';
import Organisztionrouter from './routes/Organization.routes';
import termsheetRouter from './routes/Termsheet.route';
import filerouter from './routes/File.routes';

import cookieParser from 'cookie-parser';
import Discrepancieroute from './routes/Discrepancie.route';
import router from './routes/emailroutes';
// import termsheet from './routes/Termsheet.route';
const app = express();
const base_url="/api/v1";
// app.options('*', cors())

app.use(cookieParser()); 
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'] 
}));

app.use(express.json());  
app.get("/satyam", (req, res) => {
  console.log("requeest")
  res.send('Hello, aefhuaehfuahWorld!');
});
const port = process.env.PORT || 4000;




app.use(`${base_url}/auth`,Authrouter)
app.use(`${base_url}/organisation`,Organisztionrouter)
app.use(`${base_url}/termsheet`,termsheetRouter)
app.use(`${base_url}/file`,filerouter)
app.use(`${base_url}/discrepancie`,Discrepancieroute)
app.use(`${base_url}/`,router)
// app.use(`${base_url}/termsheet`, termsheetrouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
