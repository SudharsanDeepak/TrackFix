const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./index');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RailTrack AI API',
      version: '1.0.0',
      description: 'National-scale Railway Track Fitting Lifecycle & Predictive Monitoring System API',
      contact: {
        name: 'Ministry of Railways',
        email: 'support@railtrack.gov.in',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api/${config.apiVersion}`,
        description: 'Development server',
      },
      {
        url: `https://api.railtrack.gov.in/api/${config.apiVersion}`,
        description: 'Production server',
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
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            data: {
              type: 'null',
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'ERROR_CODE',
                },
                details: {
                  type: 'object',
                },
              },
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Success message',
            },
            data: {
              type: 'object',
            },
            error: {
              type: 'null',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization',
      },
      {
        name: 'Vendors',
        description: 'Vendor management',
      },
      {
        name: 'QR Codes',
        description: 'QR code generation and fitting management',
      },
      {
        name: 'AI Predictions',
        description: 'AI-powered predictive analytics',
      },
      {
        name: 'Dashboard',
        description: 'Dashboard analytics and statistics',
      },
      {
        name: 'Integration',
        description: 'External system integration (UDM/TMS)',
      },
    ],
  },
  apis: ['./src/modules/*/route.js', './src/routes/index.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
