import mongoose from 'mongoose';

export default () => {
  const connect = () => {
    if(process.env.NODE_ENV !== 'production') {
      mongoose.set('debug', true);
    }

    mongoose.connect(
      'mongodb://root:asdf1234@localhost:27017/admin',
      {dbName: 'lolstats'},
      (error) => {
        if(error) {
          console.error(error);
        } else {
          console.log('success');
        }
      }
    );
  };

  connect();

  mongoose.connection.on('error', error => {
    console.error(error);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('disconnected');
    connect();
  });

  require('./matches');
  require('./summoners');
}
