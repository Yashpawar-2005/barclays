import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Authrouter from './routes/Auth.routes';
import Organisztionrouter from './routes/Organization.routes';
import termsheetrouter from './routes/Termsheet.route';
import filerouter from './routes/File.routes';
dotenv.config();

const app = express();
const base_url="/api/v1";
app.use(cors());
app.use(express.json());  
const port = process.env.PORT || 5000;

app.use(`${base_url}/auth`,Authrouter)
app.use(`${base_url}/organisation`,Organisztionrouter)
app.use(`${base_url}/termsheet`,termsheetrouter)
app.use(`${base_url}/file`,filerouter)
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
