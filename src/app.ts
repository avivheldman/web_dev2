import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import postsRouter from './routes/posts';
import commentsRouter from './routes/comments';
import usersRouter from './routes/users';
import authRouter from './routes/auth';

const app = express();
const PORT = process.env.PORT || 3002;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/web_dev_assignments';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello, TypeScript Express!' });
});

app.use('/post', postsRouter);
app.use('/comment', commentsRouter);
app.use('/user', usersRouter);
app.use('/auth', authRouter);

// Connect to MongoDB and start server
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
  });

export default app;