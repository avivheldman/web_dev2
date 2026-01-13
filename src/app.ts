import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import postsRouter from './routes/posts';
import commentsRouter from './routes/comments';

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/web_dev_assignments';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello, TypeScript Express!' });
});

app.use('/post', postsRouter);
app.use('/comment', commentsRouter);
