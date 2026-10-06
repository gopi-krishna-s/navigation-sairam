// IEEE Day 2026 - Pradyut Parva 3 Event Data
// Official Data from Campus Floor Plan & Event Details

const eventsData = {
  events: [
    {
      id: 1,
      number: "01",
      pin: 1,
      name: "HACKNOVA",
      title: "HACKNOVA",
      fullName: "24 Hrs Hackathon",
      category: "technical",
      department: "CSE / ISE",
      day: "Day 1 (Oct 7)",
      time: "12:30 PM - 12:30 PM (+1d)",
      floor: "Ground",
      room: "124",
      roomName: "Seminar Hall 124",
      shortDescription: "24-hour coding marathon to solve real-world problems with innovative solutions.",
      date: "2026-10-07",
      startTime: "12:30",
      endTime: "12:30",
      endDate: "2026-10-08",
      duration: 1440,
      description: "24-hour coding marathon to solve real-world problems with innovative solutions. Teams work continuously to build prototypes, pitch ideas, and compete for top prizes.",
      prizes: true,
      certificates: true,
      faculty: {
        name: "Dr. Rupa Ezhil Arasi, Prof. Nancy Vaish",
        contact: null
      },
      teamLeader: {
        name: "Sakthi shylesh P K",
        contact: "7708139276"
      },
      coordinates: { x: 1044, y: 613, floor: 0 },
      icon: "💻"
    },
    {
      id: 2,
      number: "02",
      pin: 2,
      name: "TECHTREK",
      title: "TECHTREK",
      fullName: "Treasure Hunt",
      category: "non-technical",
      department: "Science & Humanities",
      day: "Day 2 (Oct 8)",
      time: "10:00 AM - 11:30 AM",
      floor: "Ground",
      room: "118",
      roomName: "AV Hall 118",
      shortDescription: "Adventure-filled treasure hunt across the campus uncovering clues.",
      date: "2026-10-08",
      startTime: "10:00",
      endTime: "11:30",
      duration: 90,
      description: "Adventure-filled treasure hunt across the campus. Decipher riddles, navigate mystery checkpoints, and race against time with your squad.",
      prizes: true,
      certificates: true,
      faculty: {
        name: "Prof. G V Raja, Prof. N Santoshkumar",
        contact: null
      },
      teamLeader: {
        name: "Deepak",
        contact: "9042112701"
      },
      coordinates: { x: 1018, y: 877, floor: 0 },
      icon: "🗺️"
    },
    {
      id: 3,
      number: "03",
      pin: 3,
      name: "ROBORUSH",
      title: "ROBORUSH",
      fullName: "Robo Race",
      category: "technical",
      department: "Robotics & Automation",
      day: "Day 2 (Oct 8)",
      time: "12:00 PM - 1:00 PM",
      floor: "Ground",
      room: "E-Yantra",
      roomName: "E-Yantra Lab",
      shortDescription: "High-octane robot racing competition with custom-built robots.",
      date: "2026-10-08",
      startTime: "12:00",
      endTime: "13:00",
      duration: 60,
      description: "Robot racing competition with custom-built robots navigating demanding obstacles and treacherous speed tracks.",
      prizes: true,
      certificates: true,
      faculty: {
        name: "Dr. Madhu",
        contact: null
      },
      teamLeader: {
        name: "Bhavashravan R",
        contact: "9611461970"
      },
      coordinates: { x: 783, y: 1021, floor: 0 },
      icon: "🤖"
    },
    {
      id: 4,
      number: "04",
      pin: 4,
      name: "WEBNOVA",
      title: "WEBNOVA",
      fullName: "Webathon",
      category: "technical",
      department: "ISE",
      day: "Day 1 (Oct 7)",
      time: "12:30 PM - 2:00 PM",
      floor: "Ground",
      room: "119",
      roomName: "Room 119 (ISE Lab)",
      shortDescription: "Speed web development challenge building creative and responsive apps.",
      date: "2026-10-07",
      startTime: "12:30",
      endTime: "14:00",
      duration: 90,
      description: "Web development challenge to create innovative, responsive web applications under time constraints.",
      prizes: true,
      certificates: true,
      faculty: {
        name: "Prof. Selvarani",
        contact: null
      },
      teamLeader: {
        name: "Rohit",
        contact: "7397190780"
      },
      coordinates: { x: 735, y: 828, floor: 0 },
      icon: "🌐"
    },
    {
      id: 5,
      number: "05",
      pin: 5,
      name: "TECHTALK",
      title: "TECHTALK",
      fullName: "Technical Debate",
      category: "technical",
      department: "EEE / General",
      day: "Day 1 (Oct 7)",
      time: "12:30 PM - 1:30 PM",
      floor: "First",
      room: "203",
      roomName: "Room 203",
      shortDescription: "Debate on cutting-edge technological innovations, ethics, and future trends.",
      date: "2026-10-07",
      startTime: "12:30",
      endTime: "13:30",
      duration: 60,
      description: "Debate on the latest technological trends, AI ethics, renewable energy, and future innovations. Defend and dispute critical engineering topics.",
      prizes: true,
      certificates: true,
      faculty: {
        name: "Prof. Kavya",
        contact: null
      },
      teamLeader: {
        name: "Anaya Sha",
        contact: "9164967099"
      },
      coordinates: { x: 621, y: 173, floor: 1 },
      icon: "🎤"
    },
    {
      id: 6,
      number: "06",
      pin: 6,
      name: "MINDX",
      title: "MINDX",
      fullName: "AI vs Human",
      category: "non-technical",
      department: "AI & ML",
      day: "Day 1 (Oct 7)",
      time: "2:00 PM - 3:00 PM",
      floor: "First",
      room: "208",
      roomName: "Room 208",
      shortDescription: "Exciting battle between human lateral thinking and artificial intelligence.",
      date: "2026-10-07",
      startTime: "14:00",
      endTime: "15:00",
      duration: 60,
      description: "Challenge between human intelligence and artificial intelligence. Test intuition, pattern recognition, and lateral thinking against generative systems.",
      prizes: true,
      certificates: true,
      faculty: {
        name: "Dr. Sumathi",
        contact: null
      },
      teamLeader: {
        name: "Thamizhian",
        contact: null
      },
      coordinates: { x: 1143, y: 173, floor: 1 },
      icon: "🧠"
    },
    {
      id: 7,
      number: "07",
      pin: 7,
      name: "TECHNOVA",
      title: "TECHNOVA",
      fullName: "Technical Quiz",
      category: "technical",
      department: "AI & ML / CSE",
      day: "Day 1 (Oct 7)",
      time: "2:00 PM - 3:00 PM",
      floor: "First",
      room: "213",
      roomName: "Room 213",
      shortDescription: "Fast-paced quiz testing deep technical and engineering concepts.",
      date: "2026-10-07",
      startTime: "14:00",
      endTime: "15:00",
      duration: 60,
      description: "Test your technical prowess across computer science, electronics, emerging tech, and IEEE milestones in this buzzer quiz.",
      prizes: true,
      certificates: true,
      faculty: {
        name: "Dr. Sumathi",
        contact: null
      },
      teamLeader: {
        name: "Kavya",
        contact: "7892280126"
      },
      coordinates: { x: 1230, y: 691, floor: 1 },
      icon: "❓"
    },
    {
      id: 8,
      number: "08",
      pin: 8,
      name: "CONNECTX",
      title: "CONNECTX",
      fullName: "Connections",
      category: "non-technical",
      department: "General / CSE",
      day: "Day 1 (Oct 7)",
      time: "3:00 PM - 4:00 PM",
      floor: "First",
      room: "214",
      roomName: "Room 214",
      shortDescription: "Visual clue game finding hidden relationships between diverse concepts.",
      date: "2026-10-07",
      startTime: "15:00",
      endTime: "16:00",
      duration: 60,
      description: "Connect the dots and discover hidden relationships between pictures, songs, pop culture, and cryptic clues.",
      prizes: true,
      certificates: true,
      faculty: {
        name: "Dr. Sumathi",
        contact: null
      },
      teamLeader: {
        name: "Pradish",
        contact: "9986592571"
      },
      coordinates: { x: 1230, y: 854, floor: 1 },
      icon: "🔗"
    },
    {
      id: 9,
      number: "09",
      pin: 9,
      name: "WAVENOVA",
      title: "WAVENOVA",
      fullName: "Antenna Hackathon",
      category: "technical",
      department: "ECE",
      day: "Day 2 (Oct 8)",
      time: "11:30 AM - 1:30 PM",
      floor: "Second",
      room: "303",
      roomName: "Room 303 (ECE IoT Lab)",
      shortDescription: "Hands-on challenge designing and simulating antenna systems for IoT.",
      date: "2026-10-08",
      startTime: "11:30",
      endTime: "13:30",
      duration: 120,
      description: "Design, simulate, and build antenna systems for IoT and wireless communication applications with RF hardware.",
      prizes: true,
      certificates: true,
      faculty: {
        name: "Dr. Ahila A, Dr. Hosanna Princye P",
        contact: null
      },
      teamLeader: {
        name: "Abinaya",
        contact: null
      },
      coordinates: { x: 1181, y: 166, floor: 2 },
      icon: "📡"
    },
    {
      id: 10,
      number: "10",
      pin: 10,
      name: "PIXELVERSE",
      title: "PIXELVERSE",
      fullName: "Photography",
      category: "non-technical",
      department: "Media & Photography",
      day: "Day 2 (Oct 8)",
      time: "11:00 AM - 12:00 PM",
      floor: "Second",
      room: "305",
      roomName: "Room 305",
      shortDescription: "Capture campus life, emotion, and the spirit of IEEE Day.",
      date: "2026-10-08",
      startTime: "11:00",
      endTime: "12:00",
      duration: 60,
      description: "Capture the vibrant essence, architectural perspectives, and candid moments of IEEE Day through your creative lens.",
      prizes: true,
      certificates: true,
      faculty: {
        name: "Prof. Thamaraiselvi",
        contact: null
      },
      teamLeader: {
        name: "Amith Jose C",
        contact: "8748093450"
      },
      coordinates: { x: 1181, y: 272, floor: 2 },
      icon: "📸"
    },
    {
      id: 11,
      number: "11",
      pin: 11,
      name: "PROMPTX",
      title: "PROMPTX",
      fullName: "Prompt War",
      category: "non-technical",
      department: "AI & ML / CSE",
      day: "Day 1 (Oct 7)",
      time: "3:00 PM - 4:00 PM",
      floor: "Second",
      room: "306",
      roomName: "Room 306",
      shortDescription: "Battle of AI prompts — creative prompt craft to produce target outputs.",
      date: "2026-10-07",
      startTime: "15:00",
      endTime: "16:00",
      duration: 60,
      description: "Battle of creative AI prompts. Craft ingenious prompts to match target images, stories, and puzzles under pressure.",
      prizes: true,
      certificates: true,
      faculty: {
        name: "Dr. Anitha V",
        contact: null
      },
      teamLeader: {
        name: "Deekshana N S",
        contact: "9945434968"
      },
      coordinates: { x: 1181, y: 446, floor: 2 },
      icon: "💡"
    },
    {
      id: 12,
      number: "12",
      pin: 12,
      name: "GAMEON",
      title: "GAMEON",
      fullName: "Gaming",
      category: "non-technical",
      department: "Gaming Club",
      day: "Day 1 (Oct 7)",
      time: "11:30 AM - 1:00 PM",
      floor: "Second",
      room: "307",
      roomName: "Room 307",
      shortDescription: "Competitive multiplayer esports gaming tournament across titles.",
      date: "2026-10-07",
      startTime: "11:30",
      endTime: "13:00",
      duration: 90,
      description: "Competitive multiplayer gaming tournament featuring BGMI, FIFA, and Valorant rounds. Prove your reflexes and team coordination.",
      prizes: true,
      certificates: true,
      faculty: {
        name: "Prof. Hemasubraja",
        contact: null
      },
      teamLeader: {
        name: "Deepak",
        contact: "9042112701"
      },
      coordinates: { x: 1181, y: 572, floor: 2 },
      icon: "🎮"
    },
    {
      id: 13,
      number: "13",
      pin: 13,
      name: "CIRCUITX",
      title: "CIRCUITX",
      fullName: "Circuit Debugging",
      category: "technical",
      department: "ECE / EEE",
      day: "Day 2 (Oct 8)",
      time: "10:00 AM - 11:00 AM",
      floor: "Second",
      room: "308",
      roomName: "Room 308 (ECE Department)",
      shortDescription: "Troubleshoot, analyze, and repair breadboard hardware circuits.",
      date: "2026-10-08",
      startTime: "10:00",
      endTime: "11:00",
      duration: 60,
      description: "Debug and fix faulty analogue and digital circuit designs, locate component flaws, and restore intended operation under the clock.",
      prizes: true,
      certificates: true,
      faculty: {
        name: "Prof. Thamaraiselvi",
        contact: null
      },
      teamLeader: {
        name: "Nandhini",
        contact: null
      },
      coordinates: { x: 1181, y: 670, floor: 2 },
      icon: "⚡"
    },
    {
      id: 14,
      number: "14",
      pin: 14,
      name: "CODEX",
      title: "CODEX",
      fullName: "Code Debugging",
      category: "technical",
      department: "CSE / ISE",
      day: "Day 1 (Oct 7)",
      time: "12:30 PM - 1:30 PM",
      floor: "Second",
      room: "325",
      roomName: "Room 325",
      shortDescription: "Detect algorithmic bugs and optimize code snippets in C++, Python, and Java.",
      date: "2026-10-07",
      startTime: "12:30",
      endTime: "13:30",
      duration: 60,
      description: "Find and fix tricky syntax, logic, and runtime bugs in code snippets across multiple programming languages under tight countdown.",
      prizes: true,
      certificates: true,
      faculty: {
        name: "Prof. Selvarani",
        contact: null
      },
      teamLeader: {
        name: "Shreya S",
        contact: "8904796886"
      },
      coordinates: { x: 1038, y: 600, floor: 2 },
      icon: "🐛"
    }
  ],

  // Real Campus Entrances from Map Blueprint
  entrances: [
    {
      id: "entrance1",
      name: "Main Entrance 1",
      description: "Front view - Western primary road entrance",
      floor: "Ground",
      coordinates: { x: 550, y: 576 },
      landmarks: ["Front View / Roadway", "West Pathway", "Direct access to Room 119 and Seminar Hall"]
    },
    {
      id: "entrance2",
      name: "Entrance 2",
      description: "North entrance - Upper campus avenue",
      floor: "Ground",
      coordinates: { x: 918, y: 150 },
      landmarks: ["Northern Avenue", "Direct pathway to EEE Labs and Seminar Hall 124"]
    },
    {
      id: "entrance3",
      name: "Entrance 3",
      description: "South entrance - Behind AV Hall 118",
      floor: "Ground",
      coordinates: { x: 922, y: 989 },
      landmarks: ["AV Hall 118", "Near Physics & Chem Labs", "Cafeteria & E-Yantra Wing"]
    },
    {
      id: "inside",
      name: "Already Inside",
      description: "Central Elevator & SW Foyer",
      floor: "Ground",
      coordinates: { x: 866, y: 756 },
      landmarks: ["Central Elevator (LIFT)", "South-West Stairs", "Female WC"]
    }
  ],

  // Official Facilities from Floor Plan
  facilities: [
    {
      type: "lift",
      name: "Central Elevator (LIFT)",
      floors: ["Ground", "First", "Second"],
      coordinates: { x: 866, y: 756 },
      icon: "🛗"
    },
    {
      type: "steps",
      name: "South-West Staircase",
      floors: ["Ground", "First", "Second"],
      coordinates: { x: 826, y: 749 },
      icon: "🪜"
    },
    {
      type: "steps",
      name: "North-West Staircase",
      floors: ["Ground", "First", "Second"],
      coordinates: { x: 834, y: 368 },
      icon: "🪜"
    },
    {
      type: "steps",
      name: "North-East Staircase",
      floors: ["Ground", "First", "Second"],
      coordinates: { x: 1056, y: 368 },
      icon: "🪜"
    },
    {
      type: "steps",
      name: "South-East Staircase",
      floors: ["Ground", "First", "Second"],
      coordinates: { x: 1063, y: 749 },
      icon: "🪜"
    },
    {
      type: "cafe",
      name: "Cafeteria",
      floor: "Ground",
      coordinates: { x: 590, y: 1115 },
      openHours: "8:00 AM - 8:00 PM",
      icon: "☕"
    },
    {
      type: "library",
      name: "Central Library",
      floor: "First",
      coordinates: { x: 906, y: 617 },
      icon: "📚"
    }
  ],

  // Student Coordinators
  coordinators: [
    { name: "Sakthi shylesh P K", dept: "CSE/ISE", contact: "7708139276" },
    { name: "Deepak", dept: "Science & Hum / Gaming", contact: "9042112701" },
    { name: "Bhavashravan R", dept: "Robotics", contact: "9611461970" },
    { name: "Rohit", dept: "ISE", contact: "7397190780" },
    { name: "Anaya Sha", dept: "EEE", contact: "9164967099" },
    { name: "Kavya", dept: "AI/ML", contact: "7892280126" },
    { name: "Pradish", dept: "CSE", contact: "9986592571" },
    { name: "Amith Jose C", dept: "Media", contact: "8748093450" },
    { name: "Deekshana N S", dept: "AI/ML", contact: "9945434968" },
    { name: "Shreya S", dept: "CSE", contact: "8904796886" }
  ]
};

// Helper function to get event status
function getEventStatus(event) {
  const now = new Date();
  const eventDate = new Date(event.date + 'T' + event.startTime);
  const eventEndDate = event.endDate 
    ? new Date(event.endDate + 'T' + event.endTime)
    : new Date(event.date + 'T' + event.endTime);

  if (now >= eventDate && now <= eventEndDate) {
    return 'live';
  } else if (now < eventDate) {
    const hoursUntil = Math.floor((eventDate - now) / (1000 * 60 * 60));
    const minutesUntil = Math.floor((eventDate - now) / (1000 * 60)) % 60;
    
    if (hoursUntil < 1) {
      return { status: 'upcoming', text: `Starts in ${minutesUntil} min` };
    } else if (hoursUntil < 24) {
      return { status: 'upcoming', text: `Starts in ${hoursUntil}h ${minutesUntil}m` };
    } else {
      return { status: 'upcoming', text: 'Upcoming' };
    }
  } else {
    return 'ended';
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = eventsData;
}

