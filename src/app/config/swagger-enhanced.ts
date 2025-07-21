    import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
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

export const setupEnhancedSwagger = (app: Application): void => {
  // Modern ElysiaJS-inspired Swagger UI with enhanced styling
  const customCss = `
    /* Import modern fonts */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
    
    /* Global reset and base styles */
    .swagger-ui {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      background: #ffffff !important;
      color: #1a1a1a !important;
      line-height: 1.6 !important;
    }
    
    /* Hide default elements */
    .swagger-ui .topbar,
    .swagger-ui .scheme-container {
      display: none !important;
    }
    
    /* Container and wrapper */
    .swagger-ui .wrapper {
      max-width: 1200px !important;
      margin: 0 auto !important;
      padding: 0 2rem !important;
    }
    
    /* Header section */
    .swagger-ui .info {
      background: transparent !important;
      padding: 3rem 0 2rem 0 !important;
      margin: 0 !important;
      border: none !important;
      box-shadow: none !important;
    }
    
    .swagger-ui .info .title {
      color: #1a1a1a !important;
      font-size: 2.5rem !important;
      font-weight: 700 !important;
      margin-bottom: 0.5rem !important;
      letter-spacing: -0.025em !important;
    }
    
    .swagger-ui .info .description {
      color: #6b7280 !important;
      font-size: 1.125rem !important;
      font-weight: 400 !important;
      margin-bottom: 2rem !important;
    }
    
    /* Operation blocks */
    .swagger-ui .opblock {
      background: #ffffff !important;
      border: 1px solid #e5e7eb !important;
      border-radius: 12px !important;
      margin: 0 0 1.5rem 0 !important;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
      overflow: hidden !important;
      transition: all 0.2s ease !important;
    }
    
    .swagger-ui .opblock:hover {
      border-color: #d1d5db !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
      transform: translateY(-1px) !important;
    }
    
    /* Method-specific styling */
    .swagger-ui .opblock.opblock-get {
      border-left: 4px solid #10b981 !important;
    }
    
    .swagger-ui .opblock.opblock-post {
      border-left: 4px solid #3b82f6 !important;
    }
    
    .swagger-ui .opblock.opblock-put {
      border-left: 4px solid #f59e0b !important;
    }
    
    .swagger-ui .opblock.opblock-patch {
      border-left: 4px solid #8b5cf6 !important;
    }
    
    .swagger-ui .opblock.opblock-delete {
      border-left: 4px solid #ef4444 !important;
    }
    
    /* Operation summary */
    .swagger-ui .opblock-summary {
      padding: 1.25rem 1.5rem !important;
      background: transparent !important;
      border: none !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      gap: 1rem !important;
    }
    
    .swagger-ui .opblock-summary:hover {
      background: #f8fafc !important;
    }
    
    /* Method badges */
    .swagger-ui .opblock-summary-method {
      border-radius: 6px !important;
      padding: 0.375rem 0.875rem !important;
      font-weight: 600 !important;
      font-size: 0.75rem !important;
      text-transform: uppercase !important;
      letter-spacing: 0.05em !important;
      min-width: 70px !important;
      text-align: center !important;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
    }
    
    .swagger-ui .opblock.opblock-get .opblock-summary-method {
      background: #10b981 !important;
      color: white !important;
    }
    
    .swagger-ui .opblock.opblock-post .opblock-summary-method {
      background: #3b82f6 !important;
      color: white !important;
    }
    
    .swagger-ui .opblock.opblock-put .opblock-summary-method {
      background: #f59e0b !important;
      color: white !important;
    }
    
    .swagger-ui .opblock.opblock-patch .opblock-summary-method {
      background: #8b5cf6 !important;
      color: white !important;
    }
    
    .swagger-ui .opblock.opblock-delete .opblock-summary-method {
      background: #ef4444 !important;
      color: white !important;
    }
    
    /* Path styling */
    .swagger-ui .opblock-summary-path {
      font-family: 'JetBrains Mono', 'Fira Code', monospace !important;
      font-weight: 500 !important;
      color: #374151 !important;
      font-size: 0.875rem !important;
      flex: 1 !important;
    }
    
    .swagger-ui .opblock-summary-description {
      color: #6b7280 !important;
      font-size: 0.875rem !important;
      margin-left: auto !important;
    }
    
    /* Operation details */
    .swagger-ui .opblock-description-wrapper {
      background: #f8fafc !important;
      padding: 2rem !important;
      border-top: 1px solid #e5e7eb !important;
    }
    
    /* Tags */
    .swagger-ui .opblock-tag {
      background: transparent !important;
      border: none !important;
      margin: 3rem 0 1.5rem 0 !important;
      box-shadow: none !important;
    }
    
    .swagger-ui .opblock-tag-section h3 {
      background: transparent !important;
      color: #1a1a1a !important;
      padding: 0 !important;
      margin: 0 0 1.5rem 0 !important;
      font-size: 1.75rem !important;
      font-weight: 600 !important;
      border-bottom: 3px solid #e5e7eb !important;
      padding-bottom: 0.75rem !important;
    }
    
    /* Buttons */
    .swagger-ui .btn {
      border-radius: 8px !important;
      font-weight: 500 !important;
      padding: 0.625rem 1.25rem !important;
      font-size: 0.875rem !important;
      transition: all 0.15s ease !important;
      border: 1px solid transparent !important;
      cursor: pointer !important;
    }
    
    .swagger-ui .btn.authorize {
      background: #3b82f6 !important;
      color: white !important;
      border-color: #3b82f6 !important;
    }
    
    .swagger-ui .btn.authorize:hover {
      background: #2563eb !important;
      border-color: #2563eb !important;
      transform: translateY(-1px) !important;
    }
    
    .swagger-ui .btn.execute {
      background: #10b981 !important;
      color: white !important;
      border-color: #10b981 !important;
    }
    
    .swagger-ui .btn.execute:hover {
      background: #059669 !important;
      border-color: #059669 !important;
      transform: translateY(-1px) !important;
    }
    
    .swagger-ui .btn.try-out__btn {
      background: #6366f1 !important;
      color: white !important;
      border-color: #6366f1 !important;
    }
    
    .swagger-ui .btn.try-out__btn:hover {
      background: #4f46e5 !important;
      border-color: #4f46e5 !important;
    }
    
    .swagger-ui .btn.cancel {
      background: #ef4444 !important;
      color: white !important;
      border-color: #ef4444 !important;
    }
    
    .swagger-ui .btn.cancel:hover {
      background: #dc2626 !important;
      border-color: #dc2626 !important;
    }
    
    /* Parameters */
    .swagger-ui .parameters-container {
      background: #ffffff !important;
      padding: 1.5rem !important;
      border-radius: 8px !important;
      border: 1px solid #e5e7eb !important;
      margin: 1rem 0 !important;
    }
    
    .swagger-ui .parameter__name {
      font-family: 'JetBrains Mono', monospace !important;
      font-weight: 500 !important;
      color: #374151 !important;
    }
    
    .swagger-ui .parameter__type {
      color: #6b7280 !important;
      font-size: 0.75rem !important;
    }
    
    /* Input fields */
    .swagger-ui input[type=text],
    .swagger-ui input[type=password],
    .swagger-ui input[type=email],
    .swagger-ui textarea,
    .swagger-ui select {
      border: 1px solid #d1d5db !important;
      border-radius: 6px !important;
      padding: 0.625rem 0.875rem !important;
      font-size: 0.875rem !important;
      transition: border-color 0.15s ease !important;
      background: white !important;
    }
    
    .swagger-ui input[type=text]:focus,
    .swagger-ui input[type=password]:focus,
    .swagger-ui input[type=email]:focus,
    .swagger-ui textarea:focus,
    .swagger-ui select:focus {
      outline: none !important;
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
    }
    
    /* Response section */
    .swagger-ui .responses-wrapper {
      background: #f8fafc !important;
      border-radius: 8px !important;
      padding: 1.5rem !important;
      margin: 1rem 0 !important;
      border: 1px solid #e5e7eb !important;
    }
    
    .swagger-ui .response-col_status {
      font-family: 'JetBrains Mono', monospace !important;
      font-weight: 600 !important;
    }
    
    /* Code blocks */
    .swagger-ui .highlight-code {
      background: #1f2937 !important;
      border-radius: 8px !important;
      padding: 1.25rem !important;
      border: 1px solid #374151 !important;
    }
    
    .swagger-ui .microlight {
      font-family: 'JetBrains Mono', monospace !important;
      font-size: 0.875rem !important;
      line-height: 1.6 !important;
    }
    
    /* Authorization modal */
    .swagger-ui .modal-ux {
      background: rgba(0, 0, 0, 0.6) !important;
      backdrop-filter: blur(4px) !important;
    }
    
    .swagger-ui .modal-ux-content {
      background: white !important;
      border-radius: 16px !important;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
      border: 1px solid #e5e7eb !important;
    }
    
    /* Scrollbar styling */
    .swagger-ui ::-webkit-scrollbar {
      width: 8px !important;
      height: 8px !important;
    }
    
    .swagger-ui ::-webkit-scrollbar-track {
      background: #f3f4f6 !important;
      border-radius: 4px !important;
    }
    
    .swagger-ui ::-webkit-scrollbar-thumb {
      background: #d1d5db !important;
      border-radius: 4px !important;
    }
    
    .swagger-ui ::-webkit-scrollbar-thumb:hover {
      background: #9ca3af !important;
    }
    
    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .swagger-ui .wrapper {
        padding: 0 1rem !important;
      }
      
      .swagger-ui .info .title {
        font-size: 2rem !important;
      }
      
      .swagger-ui .opblock-summary {
        padding: 1rem !important;
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 0.75rem !important;
      }
      
      .swagger-ui .opblock-summary-method {
        min-width: 60px !important;
        font-size: 0.625rem !important;
      }
    }
  `;

  // Custom HTML with additional styling
  const customHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>🚀 BigSell API - Modern Documentation</title>
        <link rel="stylesheet" type="text/css" href="./swagger-ui-bundle.css" />
        <link rel="icon" type="image/png" href="https://cdn-icons-png.flaticon.com/512/2721/2721297.png" sizes="32x32" />
        <style>
          ${customCss}
        </style>
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="./swagger-ui-bundle.js"></script>
        <script src="./swagger-ui-standalone-preset.js"></script>
        <script>
          window.onload = function() {
            const ui = SwaggerUIBundle({
              url: '/api-docs.json',
              dom_id: '#swagger-ui',
              deepLinking: true,
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
              ],
              layout: "StandaloneLayout",
              persistAuthorization: true,
              displayRequestDuration: true,
              filter: true,
              tryItOutEnabled: true,
              docExpansion: 'none',
              defaultModelsExpandDepth: 2,
              defaultModelExpandDepth: 2,
              displayOperationId: false,
              showExtensions: true,
              showCommonExtensions: true,
            });
          };
        </script>
      </body>
    </html>
  `;

  app.use('/api-docs', swaggerUi.serve);
  app.get('/api-docs', (req, res) => {
    res.send(customHtml);
  });

  // JSON endpoint for the swagger spec
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log('📚 Enhanced Swagger documentation available at: http://localhost:8080/api-docs');
};

export default specs;
