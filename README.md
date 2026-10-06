  # IEEE Day 2026 - Pradyut Parva 3 Event Navigation Website

## 🎉 Welcome!

This is an interactive event navigation system for IEEE Day 2026 at Sri Sairam College of Engineering, Bangalore.

## ✨ Features

- **Location-First Navigation**: Select your entrance and get personalized directions
- **14 Events Across 3 Floors**: Complete event catalog with timing and details
- **Turn-by-Turn Directions**: Step-by-step navigation from any entrance to any event
- **Real-Time Status**: See which events are live, upcoming, or ended
- **Smart Filtering**: Filter by date, category (Technical/Non-Technical), or status
- **Save to Schedule**: Star your favorite events and build your personal schedule
- **Offline Mode**: Works without internet after first load (PWA)
- **Mobile-First Design**: Optimized for phones and tablets
- **"I'm Lost" Helper**: Emergency assistance if you get lost
- **No Registration Required**: Just scan QR and use immediately

## 🚀 How to Use

### For Users:

1. **Scan the QR code** on the event poster
2. **Select your entrance** (Main Entrance 1, 2, or 3)
3. **Browse events** sorted by distance from you
4. **Select an event** to see navigation
5. **Follow directions** to reach the venue

### For Developers:

1. Open `index.html` in a web browser
2. Or host on any web server (GitHub Pages, Netlify, Vercel, etc.)

## 📁 Files Structure

```
ieee day/
├── index.html          # Main HTML file
├── styles.css          # All styling with poster color scheme
├── app.js             # Main application logic
├── data.js            # Event data and venue information
├── manifest.json      # PWA manifest
├── sw.js              # Service Worker for offline mode
└── README.md          # This file
```

## 🎨 Color Scheme

The website uses the exact color palette from the Pradyut Parva 3 poster:

- **Technical Events**: Blue spectrum (#0066CC, #00CCFF)
- **Non-Technical Events**: Purple/Pink spectrum (#6633CC, #FF0099)
- **Accents**: Cyan (#00D4FF), Pink (#FF1493), Yellow (#FFD700)
- **Background**: Dark gradient (#0A1628 to #4a1942)

## 📱 Browser Support

- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (Desktop & Mobile)
- ✅ Samsung Internet
- ✅ All modern browsers

## 🔧 Customization

### To Update Event Data:

Edit `data.js` and modify the `eventsData` object:

```javascript
{
  id: 15,
  name: "NEW EVENT",
  fullName: "New Event Full Name",
  category: "Technical",
  floor: "Ground",
  room: "123",
  date: "2026-10-07",
  startTime: "14:00",
  endTime: "15:00",
  // ... other properties
}
```

### To Change Colors:

Edit CSS variables in `styles.css`:

```css
:root {
  --tech-bright-blue: #0066CC;
  --nontech-hot-pink: #FF0099;
  /* ... other colors */
}
```

### To Add New Routes:

Edit the `routes` object in `data.js` with step-by-step directions.

## 🌐 Deployment

### Option 1: GitHub Pages (Free)
1. Push code to GitHub repository
2. Go to Settings → Pages
3. Select branch and save
4. Access at `https://yourusername.github.io/repo-name/`

### Option 2: Netlify (Free)
1. Drag and drop the `ieee day` folder to Netlify
2. Get instant URL like `https://your-site.netlify.app`

### Option 3: Vercel (Free)
1. Import GitHub repository to Vercel
2. Auto-deploys on every commit

### Option 4: Any Web Server
Upload all files to your web server's public directory.

## 📊 Data Collection (Optional)

The website currently does NOT collect any user data. Everything is stored locally in the browser.

If you want to add analytics:
1. Add Google Analytics or similar (privacy-respecting)
2. Track: most popular events, common routes, peak usage times
3. Use data to improve next year's event

## 🆘 Support

### For Users During Event:
- Use the "🆘 I'm Lost" button in the app
- Call any student coordinator listed in Help section
- Look for volunteers with tablets

### For Developers:
- Check browser console for errors (F12)
- Verify all files are loaded correctly
- Test on multiple devices before event

## 📋 Pre-Event Checklist

- [ ] Test website on multiple devices
- [ ] Verify all 14 events have correct data
- [ ] Print backup QR codes for each room
- [ ] Have 2-3 volunteers with tablets ready
- [ ] Test offline mode (turn off WiFi after loading)
- [ ] Share website link in advance
- [ ] Print paper maps as backup

## 🎯 Event Day Tips

1. **Test WiFi capacity** before events start
2. **Have backup power banks** for volunteers
3. **Monitor for issues** and fix quickly
4. **Collect feedback** for improvements
5. **Take screenshots** of usage for next year

## 📄 License

This project is created for IEEE Day 2026 at Sri Sairam College of Engineering.

## 🙏 Credits

- **Event**: IEEE Day 2026 - Pradyut Parva 3
- **Venue**: Sri Sairam College of Engineering, Anekal, Bangalore
- **Dates**: October 7-8, 2026
- **Theme**: "Ignite | Innovate | Impact"

## 📞 Contact

**Student Coordinators:**
- Mr. Santosh (ECE): 9380147054
- Ms. Sreehitha (ECE): 8095284849
- Mr. Pradish (CSE): 9986592571

---

**Built with ❤️ for IEEE Day 2026**

*A Light of Brilliance* ✨
