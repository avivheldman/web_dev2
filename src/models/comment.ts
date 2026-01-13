import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  content: string;
  sender: string;
  postId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IComment>('Comment', commentSchema);
