const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const session = require('express-session');
const passport = require('./config/passport');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const { apiLimiter } = require('./middlewares/rateLimiter');
const requestLogger = require('./middlewares/requestLogger');
const { correlationIdMiddleware } = require('./utils/correlationId');
const logger = require('./utils/logger');
const { NotFoundError } = require('./utils/errors');
const config = require('./config');

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginOpenerPolicy: false, // Disable COOP entirely to allow OAuth popups
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
}));

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow all origins dynamically (including Capacitor's https://localhost)
      callback(null, true);
    },
    credentials: true,
    maxAge: 86400,
  })
);

app.use(compression({
  threshold: 1024,
  level: 6,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(mongoSanitize());
app.use(xss());

app.set('trust proxy', 1);

app.use(
  session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.env === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(correlationIdMiddleware);

app.use(requestLogger);

app.use((req, _res, next) => {
  logger.debug('Incoming request', {
    correlationId: req.correlationId,
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(apiLimiter);

app.use(routes);

app.all('*', (req, _res, _next) => {
  throw new NotFoundError(`Route ${req.originalUrl} not found`);
});

app.use(errorHandler);

module.exports = app;
