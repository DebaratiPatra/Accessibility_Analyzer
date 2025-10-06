# Accessibility Analyzer Project

A full-stack web application for analyzing website accessibility using Lighthouse and Axe-core APIs.

## Features

- **Automated Accessibility Testing**: Scan websites using Google Lighthouse and Axe-core
- **Detailed Reports**: View comprehensive accessibility scores and violations
- **Violation Analysis**: Identify and categorize accessibility issues by severity
- **Scan History**: Track all your accessibility scans over time
- **Analytics Dashboard**: View statistics and trends across multiple scans
- **Top Violations Report**: Identify the most common accessibility issues

## Tech Stack

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- Recharts for data visualization
- Lucide React for icons

### Backend
- Node.js with Express
- MongoDB with Mongoose
- Lighthouse API for accessibility scoring
- Axe-core with Puppeteer for violation detection
- Chrome Launcher for headless browser testing

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Chrome/Chromium browser

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/accessibility-analyzer
NODE_ENV=development
```

4. Start MongoDB:
```bash
# On macOS/Linux
mongod

# On Windows
net start MongoDB
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Project Structure

```
accessibility-analyzer/
├── backend/
│   ├── models/
│   │   └── Scan.js              # MongoDB schema for scans
│   ├── routes/
│   │   ├── scanRoutes.js        # Scan API routes
│   │   └── reportRoutes.js      # Report API routes
│   ├── controllers/
│   │   └── scanController.js    # Scan business logic
│   ├── .env                     # Environment variables
│   ├── server.js                # Express server setup
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── pages/
│   │   │   ├── Dashboard.js     # Main dashboard
│   │   │   ├── NewScan.js       # Create new scan
│   │   │   ├── ScanDetails.js   # View scan results
│   │   │   ├── ScanHistory.js   # List all scans
│   │   │   └── Reports.js       # Analytics & reports
│   │   ├── services/
│   │   │   └── api.js           # API service layer
│   │   ├── App.js               # Main app component
│   │   ├── App.css              # Global styles
│   │   └── index.js
│   └── package.json
└── README.md
```

## API Endpoints

### Scans
- `POST /api/scans` - Create a new scan
- `GET /api/scans` - Get all scans (with pagination)
- `GET /api/scans/:id` - Get scan by ID
- `DELETE /api/scans/:id` - Delete a scan

### Reports
- `GET /api/reports/stats` - Get overall statistics
- `GET /api/reports/top-violations` - Get most common violations

## Usage

1. **Start a New Scan**
   - Click "New Scan" in the navigation
   - Enter a website URL (must include http:// or https://)
   - Choose scan type (Lighthouse, Axe-core, or both)
   - Click "Start Scan"

2. **View Scan Results**
   - Scans are processed asynchronously
   - The details page auto-refreshes until complete
   - View accessibility score, violations, and recommendations

3. **Review History**
   - See all past scans in the History page
   - Filter and paginate through results
   - Delete old scans as needed

4. **Analyze Reports**
   - View overall statistics on the Reports page
   - See most common accessibility issues
   - Track trends across multiple scans

## Accessibility Score Interpretation

- **90-100**: Excellent - Site follows accessibility best practices
- **50-89**: Good - Some improvements needed
- **0-49**: Poor - Significant accessibility issues to address

## Violation Severity Levels

- **Critical**: Must fix - blocks access for users with disabilities
- **Serious/Moderate**: Should fix - causes significant barriers
- **Minor**: Nice to fix - causes inconvenience but not blocking

## Important Notes

1. **Automated Testing Limitations**: Automated tools can only detect 30-40% of accessibility issues. Manual testing is essential for full compliance.

2. **WCAG Compliance**: This tool checks against WCAG 2.1 guidelines but does not guarantee full compliance.

3. **Performance**: Large websites may take several minutes to scan completely.

4. **Browser Requirements**: The backend requires Chrome/Chromium to be installed for Lighthouse and Puppeteer to function.

## Troubleshooting

### Backend Issues

**MongoDB Connection Error**:
- Ensure MongoDB is running
- Check the `MONGODB_URI` in `.env`
- Verify MongoDB is accessible on the specified port

**Chrome/Chromium Not Found**:
- Install Chrome or Chromium browser
- On Linux, you may need to install dependencies:
```bash
sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2
```

### Frontend Issues

**Proxy Errors**:
- Ensure backend is running on port 5000
- Check the `proxy` setting in `frontend/package.json`

**CORS Errors**:
- Backend has CORS enabled for all origins in development
- For production, configure specific origins in `server.js`

## Development

### Running in Development Mode

Backend:
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

Frontend:
```bash
cd frontend
npm start    # Hot reload enabled
```

### Building for Production

Frontend:
```bash
cd frontend
npm run build
```

Backend (set environment variables):
```
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
```

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Scheduled scans
- [ ] Export reports to PDF
- [ ] Webhook notifications
- [ ] Comparison between scans
- [ ] Multi-page scanning
- [ ] Custom accessibility rules
- [ ] Email notifications
- [ ] API rate limiting
- [ ] Scan queuing system

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Resources

- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)
- [Axe-core Documentation](https://github.com/dequelabs/axe-core)
- [Web Accessibility Initiative](https://www.w3.org/WAI/)

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review the troubleshooting section

---

Built with ❤️ for a more accessible web