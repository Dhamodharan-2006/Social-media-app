const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const dotenv = require('dotenv');        // ✅ import first
dotenv.config();                          // ✅ load env first

const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { initSocket } = require('./socket');

const app = express();
const server = http.createServer(app);

initSocket(server);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    /\.onrender\.com$/,
    /\.vercel\.app$/,
  ],
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/', (req, res) => res.json({
  message: 'SnapGram API Running 🚀',
  version: '1.0.0',
}));

app.use('/api/auth',          require('./routes/authRoutes'));
app.use('/api/users',         require('./routes/userRoutes'));
app.use('/api/posts',         require('./routes/postRoutes'));
app.use('/api/messages',      require('./routes/messageRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/stories',       require('./routes/storyRoutes'));
app.use('/api/admin',         require('./routes/adminRoutes'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Server Error' });
});

// ✅ Only ONE mongoose.connect with correct variable name
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    server.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => {
    console.error('MongoDB error:', err.message);
    process.exit(1);
  });