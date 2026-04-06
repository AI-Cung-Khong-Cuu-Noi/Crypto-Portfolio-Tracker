import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Crypto Portfolio Tracker API', 
      version: '1.0.0',
      description: 'API Documentation cho ứng dụng Theo dõi Đầu tư Crypto',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    path.join(__dirname, '../routers/*.{ts,js}'),
    path.join(__dirname, './schemas/*.{ts,js}')
  ],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions); 
