import swaggerJSDoc from 'swagger-jsdoc';
import { Application } from 'express';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BigSell E-commerce API',
      version: '1.0.0',
      // description: 'A comprehensive e-commerce API built with Express.js and TypeScript',
      contact: {
        name: 'BigSell Team',
        email: 'support@bigsell.com',
      },
      license: {
        name: 'ISC',
      },
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Development server',
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
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const specs = swaggerJSDoc(options);

export const setupScalarSwagger = (app: Application): void => {
  // Scalar API documentation (ElysiaJS style)
  const scalarHtml = `
    <!doctype html>
    <html>
      <head>
        <title>🚀 BigSell API - Modern Documentation</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="https://cdn-icons-png.flaticon.com/512/2721/2721297.png" sizes="32x32" />
      </head>
      <body>
        <script
          id="api-reference"
          data-url="/api-docs.json"
          data-configuration='{
            "theme": "purple",
            "layout": "modern",
            "defaultHttpClient": {
              "targetKey": "javascript",
              "clientKey": "fetch"
            },
            "authentication": {
              "preferredSecurityScheme": "bearerAuth",
              "apiKey": {
                "token": ""
              }
            },
            "spec": {
              "url": "/api-docs.json"
            }
          }'></script>
        <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
      </body>
    </html>
  `;

  app.get('/api-docs', (req, res) => {
    res.send(scalarHtml);
  });

  // JSON endpoint for the swagger spec
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log('📚 Scalar API documentation available at: http://localhost:8080/api-docs');
};

export default specs;
