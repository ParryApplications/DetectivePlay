# GiveJustice - Detective Mystery Game

A realistic, immersive detective mystery game where users solve complex murder cases using professional investigation techniques.

## 🎯 Features

- **Realistic Investigation Experience**: Professional-grade evidence analysis and deduction
- **Investigation Board**: Visual cork board for connecting clues like real detectives
- **Multi-Language Support**: English, Hindi, Chinese, Korean, and Japanese
- **Audio Narration**: Text-to-speech story narration with playback controls
- **Two Game Modes**:
  - **As Detective**: Solve mysteries independently
  - **Solved Mystery**: Learn from pre-solved cases
- **No Hints System**: Pure deductive reasoning required
- **Responsive Design**: Optimized for desktop/laptop (1024px+)

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Bootstrap 5.3, JavaScript (ES6+)
- **Backend**: Firebase (Firestore, Hosting)
- **Audio**: Web Speech API (with Xenova/Transformers.js support planned)
- **Styling**: Custom CSS with detective noir theme

## 📁 Project Structure

```
DetectivePlay/
├── index.html              # Main application page
├── admin.html              # Admin panel (to be created)
├── css/
│   ├── main.css           # Global styles and variables
│   ├── dashboard.css      # Dashboard/landing page styles
│   ├── mystery.css        # Mystery view styles
│   ├── investigation-board.css  # Board styles
│   ├── cards.css          # Evidence card styles
│   └── admin.css          # Admin panel styles (to be created)
├── js/
│   ├── app.js             # Main application logic
│   ├── firebase-config.js # Firebase configuration
│   ├── language-manager.js # Multi-language support
│   ├── mystery-loader.js  # Mystery content loader
│   ├── card-manager.js    # Evidence card management
│   ├── investigation-board.js # Interactive board
│   ├── audio-player.js    # Text-to-speech narration
│   ├── admin-panel.js     # Admin functionality (to be created)
│   └── utils.js           # Utility functions (to be created)
├── translations/
│   ├── en.json            # English translations
│   ├── hi.json            # Hindi translations (to be created)
│   ├── zh-CN.json         # Chinese translations (to be created)
│   ├── ko.json            # Korean translations (to be created)
│   └── ja.json            # Japanese translations (to be created)
├── assets/
│   ├── images/            # Image assets
│   ├── fonts/             # Custom fonts
│   └── audio/             # Audio files
├── plans/
│   └── detective-game-comprehensive-plan.md
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v14 or higher) - for local development server
- Firebase account
- Modern web browser (Chrome, Safari, Firefox, Edge)

### Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add Project"
   - Follow the setup wizard

2. **Enable Firestore Database**
   - In Firebase Console, go to "Firestore Database"
   - Click "Create Database"
   - Start in production mode
   - Choose a location

3. **Get Firebase Configuration**
   - Go to Project Settings > General
   - Scroll to "Your apps" section
   - Click the web icon (</>)
   - Copy the configuration object

4. **Update Firebase Config**
   - Open `js/firebase-config.js`
   - Replace the placeholder values with your Firebase config:
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_STORAGE_BUCKET",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID"
   };
   ```

5. **Set Firestore Security Rules**
   - Go to Firestore Database > Rules
   - Copy the rules from the plan document
   - Publish the rules

### Local Development

1. **Clone the Repository**
   ```bash
   cd DetectivePlay
   ```

2. **Start a Local Server**
   
   Using Python:
   ```bash
   python -m http.server 8000
   ```
   
   Or using Node.js:
   ```bash
   npx http-server -p 8000
   ```

3. **Open in Browser**
   ```
   http://localhost:8000
   ```

### Adding Mystery Content

Mysteries are stored in Firestore. Use the admin panel or Firebase Console to add mysteries following this structure:

```javascript
{
  title: {
    en: "Mystery Title",
    hi: "रहस्य शीर्षक",
    // ... other languages
  },
  category: "as_detective", // or "solved_mystery"
  difficulty: "medium", // easy, medium, hard
  story: {
    en: "Full story text...",
    // ... other languages
  },
  suspects: [...],
  weapons: [...],
  locations: [...],
  evidence: [...],
  timeline: [...],
  solution: {...},
  is_active: true
}
```

See `plans/detective-game-comprehensive-plan.md` for complete database schema.

## 🎨 Customization

### Color Palette

The app uses CSS variables defined in `css/main.css`:

- `--deep-navy`: #1a1f2e (backgrounds)
- `--charcoal`: #2d3142 (cards, panels)
- `--warm-amber`: #d4a574 (accents)
- `--crimson`: #8b0000 (danger, evidence)
- `--cream`: #f4f1de (text)

### Fonts

- **Headers**: Playfair Display (serif)
- **Body**: Source Sans Pro (sans-serif)
- **Monospace**: Courier Prime (evidence, technical)

## 📱 Browser Support

- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+

**Note**: Mobile devices (< 1024px width) will see a restriction message.

## 🔒 Security

- Firebase security rules restrict write access
- Admin panel requires authentication
- No sensitive user data stored
- HTTPS required for production

## 🚢 Deployment

### Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Hosting**
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Set public directory to `.` (current directory)
   - Configure as single-page app: No
   - Don't overwrite index.html

4. **Deploy**
   ```bash
   firebase deploy --only hosting
   ```

5. **Access Your App**
   - Your app will be available at: `https://YOUR_PROJECT_ID.web.app`

## 📝 To-Do

- [ ] Complete admin panel implementation
- [ ] Add remaining language translations (Hindi, Chinese, Korean, Japanese)
- [ ] Create sample mystery content
- [ ] Implement Xenova/Transformers.js for better audio
- [ ] Add print case file functionality
- [ ] Create user guide/tutorial
- [ ] Add analytics (privacy-focused)
- [ ] Performance optimization
- [ ] Cross-browser testing
- [ ] Accessibility audit

## 🤝 Contributing

This is a personal project. For suggestions or feedback, use the email subscription feature in the app.

## 📄 License

All rights reserved. This project is for educational and portfolio purposes.

## 👤 Author

Created as part of a detective mystery game project.

## 🙏 Acknowledgments

- Inspired by murdle.com
- Film noir aesthetic
- Professional investigation techniques
- Detective fiction genre

## 📞 Support

For issues or questions:
1. Check the comprehensive plan document
2. Review Firebase console for data issues
3. Check browser console for errors
4. Ensure all files are properly uploaded

---

**Version**: 1.0.0  
**Last Updated**: 2026-05-24  
**Status**: In Development
