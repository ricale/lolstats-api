import express from 'express';
import morgan from 'morgan';

import connect from './schema';
import v1Router from './routes/v1';

const app = express();
connect();

app.set('port', process.env.PORT);

app.use(express.json());

app.use('/v1', v1Router);

app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

app.use((err, req, res) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') !== 'production' ? err : {};

  const code = err.status || 500;
  res.status(code).json({
    code,
    message: 'Internal Server Error',
  });
});

app.listen(app.get('port'), () => {
});

// app.set('views', path.join(__dirname, 'views'));
