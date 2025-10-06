// Run this file from backend folder: node troubleshoot.js
// This will check if everything is set up correctly

const mongoose = require('mongoose');
const axios = require('axios').default;

console.log('🔍 Accessibility Analyzer - Troubleshooting Tool\n');

async function checkMongoDB() {
  console.log('1️⃣  Checking MongoDB connection...');
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://A_A_user:A_A_password@cluster-accessibilityan.67f7a2s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-accessibilityAnalyzer';
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('   ✅ MongoDB is connected and working!\n');
    await mongoose.connection.close();
    return true;
  } catch (error) {
    console.log('   ❌ MongoDB connection failed!');
    console.log('   Error:', error.message);
    console.log('   💡 Solution: Start MongoDB with "mongod" command\n');
    return false;
  }
}

async function checkBackendServer() {
  console.log('2️⃣  Checking backend server...');
  try {
    const response = await axios.get('http://localhost:5000/api/health', {
      timeout: 3000
    });
    console.log('   ✅ Backend server is running!');
    console.log('   Response:', response.data, '\n');
    return true;
  } catch (error) {
    console.log('   ❌ Backend server is not responding!');
    if (error.code === 'ECONNREFUSED') {
      console.log('   💡 Solution: Start backend with "npm run dev" in backend folder\n');
    } else {
      console.log('   Error:', error.message, '\n');
    }
    return false;
  }
}

async function checkDependencies() {
  console.log('3️⃣  Checking required packages...');
  const required = [
    'express',
    'mongoose',
    'lighthouse',
    '@axe-core/puppeteer',
    'puppeteer',
    'chrome-launcher'
  ];
  
  let allInstalled = true;
  for (const pkg of required) {
    try {
      require.resolve(pkg);
      console.log(`   ✅ ${pkg}`);
    } catch (e) {
      console.log(`   ❌ ${pkg} - NOT INSTALLED`);
      allInstalled = false;
    }
  }
  
  if (!allInstalled) {
    console.log('\n   💡 Solution: Run "npm install" in backend folder\n');
  } else {
    console.log('   ✅ All packages installed!\n');
  }
  
  return allInstalled;
}

function checkEnvironment() {
  console.log('4️⃣  Checking environment variables...');
  require('dotenv').config();
  
  const PORT = process.env.PORT || '5000';
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/accessibility-analyzer';
  
  console.log(`   PORT: ${PORT}`);
  console.log(`   MONGODB_URI: ${MONGODB_URI}`);
  console.log('   ✅ Environment variables loaded!\n');
  
  return true;
}

async function runAllChecks() {
  console.log('=' .repeat(60));
  
  const env = checkEnvironment();
  const deps = await checkDependencies();
  const mongo = await checkMongoDB();
  const server = await checkBackendServer();
  
  console.log('=' .repeat(60));
  console.log('\n📊 SUMMARY:\n');
  
  console.log(`Environment: ${env ? '✅' : '❌'}`);
  console.log(`Dependencies: ${deps ? '✅' : '❌'}`);
  console.log(`MongoDB: ${mongo ? '✅' : '❌'}`);
  console.log(`Backend Server: ${server ? '✅' : '❌'}`);
  
  if (env && deps && mongo && server) {
    console.log('\n🎉 Everything looks good! Your setup is ready.\n');
    console.log('Next steps:');
    console.log('1. Keep backend running');
    console.log('2. Start frontend: cd frontend && npm start');
    console.log('3. Open http://localhost:3000\n');
  } else {
    console.log('\n⚠️  Some issues need to be fixed. Follow the solutions above.\n');
    
    if (!mongo) {
      console.log('🔧 Quick fix for MongoDB:');
      console.log('   - Windows: Run "net start MongoDB" as admin');
      console.log('   - Mac/Linux: Run "mongod" in terminal\n');
    }
    
    if (!server) {
      console.log('🔧 Quick fix for Backend:');
      console.log('   - Run "npm run dev" in backend folder\n');
    }
  }
  
  process.exit(0);
}

runAllChecks();