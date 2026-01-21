import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import postsRouter from './routes/posts';
import commentsRouter from './routes/comments';
import usersRouter from './routes/users';
import authRouter from './routes/auth';

const app = express();
const PORT = process.env.PORT || 3002;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/web_dev_assignments';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Posts & Comments API',
    version: '1.0.0',
    description: 'API for managing posts and comments with authentication'
  },
  servers: [
    {
      url: 'http://localhost:3002'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer'
      }
    },
    schemas: {
      PostPayload: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          content: { type: 'string' }
        },
        required: ['title', 'content']
      },
      Post: {
        allOf: [
          { $ref: '#/components/schemas/PostPayload' },
          {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              sender: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          }
        ]
      },
      CommentPayload: {
        type: 'object',
        properties: {
          content: { type: 'string' },
          postId: { type: 'string' }
        },
        required: ['content', 'postId']
      },
      Comment: {
        allOf: [
          { $ref: '#/components/schemas/CommentPayload' },
          {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              sender: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          }
        ]
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  },
  paths: {
    '/post': {
      get: {
        summary: 'List posts',
        parameters: [
          {
            name: 'sender',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by sender id'
          }
        ],
        responses: {
          200: {
            description: 'List of posts',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Post' }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create post',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PostPayload' }
            }
          }
        },
        responses: {
          201: {
            description: 'Post created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Post' }
              }
            }
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/post/{id}': {
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' }
        }
      ],
      get: {
        summary: 'Get post by id',
        responses: {
          200: {
            description: 'Found post',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Post' }
              }
            }
          },
          404: {
            description: 'Not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      },
      put: {
        summary: 'Update post',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PostPayload' }
            }
          }
        },
        responses: {
          200: {
            description: 'Post updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Post' }
              }
            }
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          },
          404: {
            description: 'Not found or not owned',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      },
      delete: {
        summary: 'Delete post',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Post deleted',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Post' }
              }
            }
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          },
          404: {
            description: 'Not found or not owned',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/comment': {
      get: {
        summary: 'List comments',
        parameters: [
          {
            name: 'postId',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by post id'
          }
        ],
        responses: {
          200: {
            description: 'List of comments',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Comment' }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create comment',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CommentPayload' }
            }
          }
        },
        responses: {
          201: {
            description: 'Comment created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Comment' }
              }
            }
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/comment/{id}': {
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' }
        }
      ],
      get: {
        summary: 'Get comment',
        responses: {
          200: {
            description: 'Found comment',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Comment' }
              }
            }
          },
          404: {
            description: 'Not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      },
      put: {
        summary: 'Update comment',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CommentPayload' }
            }
          }
        },
        responses: {
          200: {
            description: 'Comment updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Comment' }
              }
            }
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          },
          404: {
            description: 'Not found or not owned',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      },
      delete: {
        summary: 'Delete comment',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Comment deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    comment: { $ref: '#/components/schemas/Comment' }
                  }
                }
              }
            }
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          },
          404: {
            description: 'Not found or not owned',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    }
  }
};

const swaggerDocs = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: []
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello, TypeScript Express!' });
});

app.use('/post', postsRouter);
app.use('/comment', commentsRouter);
app.use('/user', usersRouter);
app.use('/auth', authRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

if (process.env.NODE_ENV !== 'test') {
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
}

export default app;
