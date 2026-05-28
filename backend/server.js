// Fix crypto for Node 18
const crypto = require('crypto');
if (!globalThis.crypto) globalThis.crypto = crypto;

const express     = require('express');
const mongoose    = require('mongoose');
const cors        = require('cors');
const http        = require('http');
const dotenv      = require('dotenv');
const helmet      = require('helmet');
const compression = require('compression');
const { initSocket } = require('./socket');

dotenv.config();

const app    = express();
const server = http.createServer(app);

initSocket(server);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/', (req, res) => res.json({ message: 'SnapGram API 🚀', status: 'running' }));

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

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB error:', err.message);
    process.exit(1);
  });