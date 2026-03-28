// backend/prisma/seed-master.js
// MASTER SEED — wipes all course/session/quiz data then rebuilds from scratch.
// Run: node prisma/seed-master.js
//
// Keeps existing user accounts intact.
// Creates: admin user, "Build Your First Website" course (13 sessions, 10 quiz Qs), badges.

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Clearing old course/session/quiz data...');
  // Delete in dependency order (children first)
  await prisma.progress.deleteMany({});
  await prisma.userBadge.deleteMany({});
  await prisma.quizQuestion.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.badge.deleteMany({});
  console.log('✅ Cleared.\n');

  // ─── Admin user ───────────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where:  { email: 'admin@codequest.in' },
    update: { passwordHash: adminHash, role: 'ADMIN', plan: 'PREMIUM' },
    create: {
      email: 'admin@codequest.in', passwordHash: adminHash,
      username: 'admin', displayName: 'Admin',
      role: 'ADMIN', plan: 'PREMIUM',
    },
  });
  console.log('👤 Admin user ready  →  admin@codequest.in / admin123');

  // ─── Badges ───────────────────────────────────────────────────
  const badges = [
    { id:'b1', emoji:'⭐', name:'First Star',   description:'Complete your first lesson', condition:'complete_first_lesson' },
    { id:'b2', emoji:'🔥', name:'7-Day Fire',   description:'7 day streak!',              condition:'7_day_streak' },
    { id:'b3', emoji:'🏆', name:'Quiz Champ',   description:'100% on a quiz',             condition:'complete_quiz_perfect' },
    { id:'b4', emoji:'🎨', name:'CSS Artist',   description:'Reach level 5',              condition:'reach_level_5' },
    { id:'b5', emoji:'🚀', name:'Speed Coder',  description:'Earn 1000 XP',               condition:'earn_1000_xp' },
    { id:'b6', emoji:'👑', name:'HTML Master',  description:'Complete a full course',     condition:'reach_level_10' },
  ];
  for (const b of badges) await prisma.badge.create({ data: b });
  console.log(`🏅 ${badges.length} badges created`);

  // ─── Course ───────────────────────────────────────────────────
  const course = await prisma.course.create({
    data: {
      id:          'course-website-builder',
      title:       'Build Your First Website',
      emoji:       '🌐',
      description: 'Go from zero to a live website! Learn HTML & CSS — build real pages, style them beautifully, and publish your site on the internet.',
      color:       '#FF6B35',
      subject:     'HTML/CSS',
      ageGroup:    '8-14',
      order:       1,
      isPublished: true,
      isLocked:    false,
      totalXp:     1340,
    },
  });
  console.log(`📚 Course created: "${course.title}"`);

  // ─── Sessions ─────────────────────────────────────────────────
  const sessions = [
    // Week 1 — HTML Foundations
    {
      id: 'bfw-s1', order: 1, type: 'VIDEO',
      title: 'The Internet + Your First HTML File',
      durationMins: 25, xpReward: 80, coinsReward: 8,
      isPublished: true, hasIde: true,
      missionText: 'Watch the video! Then look at the editor — find the <h1> tag and change "Hello World!" to YOUR name. Hit ▶ Run and see your name on screen! 🎉',
      starterCode: `<!DOCTYPE html>
<html>
<head>
  <title>My First Page</title>
</head>
<body>

  <h1>Hello World!</h1>
  <p>I am learning HTML at CodeQuest! 🚀</p>

</body>
</html>`,
    },
    {
      id: 'bfw-s2', order: 2, type: 'VIDEO',
      title: 'HTML Tags — Headings, Links & Images',
      durationMins: 30, xpReward: 80, coinsReward: 8,
      isPublished: true, hasIde: true,
      missionText: 'Add all 6 heading sizes, a paragraph about yourself, a clickable link to your favourite website, and an image. Hit Run after each one!',
    },
    {
      id: 'bfw-s3', order: 3, type: 'CODE',
      title: 'Lists, Tables & Organising Your Page',
      durationMins: 30, xpReward: 120, coinsReward: 12,
      isPublished: true, hasIde: true,
      missionText: 'Build a bullet list of your favourite games, a numbered top-3, and a 2-column table. Wrap each section in a div.',
      starterCode: `<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>

  <h1>My Favourite Things</h1>

  <!-- Task 1: Add an unordered list with at least 4 favourite games -->


  <!-- Task 2: Add an ordered list — your personal top 3 -->


  <!-- Task 3: Add a table with 2 columns (Game | Why I Like It) and 3 rows -->


</body>
</html>`,
      solutionCode: `<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>

  <h1>My Favourite Things</h1>

  <div>
    <h2>My Favourite Games</h2>
    <ul>
      <li>Minecraft</li>
      <li>Subway Surfers</li>
      <li>Ludo</li>
      <li>Among Us</li>
    </ul>
  </div>

  <div>
    <h2>My Top 3</h2>
    <ol>
      <li>Minecraft — best game ever</li>
      <li>Pizza — best food ever</li>
      <li>Coding — best skill ever</li>
    </ol>
  </div>

  <div>
    <h2>Game vs Why I Like It</h2>
    <table>
      <tr><th>Game</th><th>Why I Like It</th></tr>
      <tr><td>Minecraft</td><td>You can build anything</td></tr>
      <tr><td>Subway Surfers</td><td>Fast and exciting</td></tr>
      <tr><td>Ludo</td><td>Fun with family</td></tr>
    </table>
  </div>

</body>
</html>`,
    },
    {
      id: 'bfw-s4', order: 4, type: 'QUIZ',
      title: 'Quiz: HTML Fundamentals',
      durationMins: 10, xpReward: 100, coinsReward: 10,
      isPublished: true, hasIde: false,
    },
    // Week 2 — CSS
    {
      id: 'bfw-s5', order: 5, type: 'VIDEO',
      title: 'CSS — Colors, Fonts & Backgrounds',
      durationMins: 30, xpReward: 80, coinsReward: 8,
      isPublished: true, hasIde: true,
      missionText: 'Add a <style> tag, change heading colors with hex codes, pick a Google Font, and set a background color on body. Run after each change!',
    },
    {
      id: 'bfw-s6', order: 6, type: 'VIDEO',
      title: 'The Box Model — Spacing, Borders & Sizing',
      durationMins: 30, xpReward: 80, coinsReward: 8,
      isPublished: true, hasIde: true,
      missionText: 'Add padding to paragraphs, margin to headings, a border and border-radius to your image, and set a width. Make everything breathe!',
    },
    {
      id: 'bfw-s7', order: 7, type: 'CODE',
      title: 'Cards, Buttons & Your Page Header',
      durationMins: 35, xpReward: 120, coinsReward: 12,
      isPublished: true, hasIde: true,
      missionText: 'Fill in the empty CSS classes — .header, .card, .btn, .btn:hover — then Run to see your styled page come to life!',
      starterCode: `<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f0f0f0; margin: 0; }

    /* Style the .header div */
    .header { }

    /* Style the .card div */
    .card { }

    /* Style the .btn button */
    .btn { }

    /* Hover effect */
    .btn:hover { }
  </style>
</head>
<body>

  <!-- Add your header div here -->


  <!-- Add a card div (with h3 and p inside) -->


  <!-- Add a button with class="btn" -->


</body>
</html>`,
      solutionCode: `<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f0f0f0; margin: 0; }
    .header { background-color: #1A237E; color: white; padding: 60px 40px; text-align: center; }
    .header h1 { color: white; }
    .header p  { color: #90CAF9; font-size: 18px; }
    .card { background-color: white; border: 1px solid #ddd; border-radius: 12px;
            padding: 20px; width: 280px; margin: 20px auto;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
    .btn { background-color: #FF6B35; color: white; padding: 12px 24px;
           border: none; border-radius: 8px; font-size: 16px; cursor: pointer;
           display: block; margin: 20px auto; font-family: inherit; }
    .btn:hover { background-color: #e55a25; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Hi, I'm Alex!</h1>
    <p>Learning to build websites at CodeQuest!</p>
    <button class="btn">See My Work</button>
  </div>
  <div class="card">
    <h3>Minecraft</h3>
    <p>My all-time favourite game. You can build anything!</p>
  </div>
  <button class="btn">Click Me!</button>
</body>
</html>`,
    },
    {
      id: 'bfw-s8', order: 8, type: 'QUIZ',
      title: 'Quiz: CSS Styling',
      durationMins: 10, xpReward: 100, coinsReward: 10,
      isPublished: true, hasIde: false,
    },
    // Week 3 — Layout
    {
      id: 'bfw-s9', order: 9, type: 'CODE',
      title: 'Flexbox — Alignment Made Easy',
      durationMins: 35, xpReward: 120, coinsReward: 12,
      isPublished: true, hasIde: true,
      missionText: 'Add display:flex, justify-content:center, and gap:20px to .card-row so all three cards sit side by side. Then add flex-wrap:wrap for bonus points!',
      starterCode: `<!DOCTYPE html>
<html>
<head>
  <title>Flexbox Practice</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f0f0f0; padding: 20px; }
    .card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #ddd; width: 200px; }

    /* Make these 3 cards sit side by side */
    .card-row { }
  </style>
</head>
<body>

  <!-- Wrap these 3 cards in a div with class="card-row" -->
  <div class="card"><h3>🎮 Minecraft</h3><p>Build anything!</p></div>
  <div class="card"><h3>🍕 Pizza</h3><p>Best food ever.</p></div>
  <div class="card"><h3>💻 Coding</h3><p>Learning HTML & CSS!</p></div>

</body>
</html>`,
      solutionCode: `<!DOCTYPE html>
<html>
<head>
  <title>Flexbox Practice</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f0f0f0; padding: 20px; }
    .card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #ddd; width: 200px; }
    .card-row { display: flex; justify-content: center; align-items: center; gap: 20px; flex-wrap: wrap; }
  </style>
</head>
<body>
  <div class="card-row">
    <div class="card"><h3>🎮 Minecraft</h3><p>Build anything!</p></div>
    <div class="card"><h3>🍕 Pizza</h3><p>Best food ever.</p></div>
    <div class="card"><h3>💻 Coding</h3><p>Learning HTML & CSS!</p></div>
  </div>
</body>
</html>`,
    },
    {
      id: 'bfw-s10', order: 10, type: 'VIDEO',
      title: 'Navigation Bar + Multiple Pages',
      durationMins: 35, xpReward: 80, coinsReward: 8,
      isPublished: true, hasIde: true,
      missionText: 'Add a <nav> bar at the top of your page with Home, About, Contact links. Style it dark with white text and a hover color change using Flexbox.',
    },
    {
      id: 'bfw-s11', order: 11, type: 'CODE',
      title: 'About Page + Contact Form',
      durationMins: 30, xpReward: 120, coinsReward: 12,
      isPublished: true, hasIde: true,
      missionText: 'Build a two-column About section (photo left, text right using Flexbox) and a styled contact form with name, email, message, and a submit button.',
      starterCode: `<!DOCTYPE html>
<html>
<head>
  <title>About Me</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; background: #f8f9fa; }

    /* Two-column layout using flexbox */
    .about-section { }

    .about-image img { }

    /* Stacked form fields */
    .contact-form { }

    .contact-form input,
    .contact-form textarea { }
  </style>
</head>
<body>

  <div class="about-section">
    <div class="about-image">
      <img src="https://via.placeholder.com/260x260" alt="Profile photo">
    </div>
    <div class="about-text">
      <h1>About Me</h1>
      <p>Write something about yourself here...</p>
    </div>
  </div>

  <form class="contact-form">
    <!-- Add label + input for Name, Email, Message, and a Submit button -->
  </form>

</body>
</html>`,
      solutionCode: `<!DOCTYPE html>
<html>
<head>
  <title>About Me</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; background: #f8f9fa; }
    .about-section { display: flex; gap: 40px; align-items: center; padding: 60px 40px; background: white; }
    .about-image img { width: 260px; border-radius: 12px; }
    .contact-form { display: flex; flex-direction: column; gap: 12px;
      max-width: 500px; margin: 40px auto; padding: 40px;
      background: white; border-radius: 12px; border: 1px solid #ddd; }
    .contact-form label { font-weight: bold; color: #333; }
    .contact-form input, .contact-form textarea {
      padding: 12px; border: 1px solid #ccc; border-radius: 6px;
      font-size: 16px; font-family: inherit; }
    .contact-form textarea { height: 120px; }
    .submit-btn { background: #1A237E; color: white; padding: 12px;
      border: none; border-radius: 8px; font-size: 16px; cursor: pointer; }
    .submit-btn:hover { background: #283593; }
  </style>
</head>
<body>
  <div class="about-section">
    <div class="about-image"><img src="https://via.placeholder.com/260x260" alt="Profile photo"></div>
    <div class="about-text">
      <h1>About Me</h1>
      <p>Hi! I'm learning HTML and CSS at CodeQuest — this is my first real website!</p>
    </div>
  </div>
  <form class="contact-form">
    <label>Your Name</label><input type="text" placeholder="Enter your name">
    <label>Your Email</label><input type="email" placeholder="Enter your email">
    <label>Your Message</label><textarea placeholder="Type your message..."></textarea>
    <button type="submit" class="submit-btn">Send Message 🚀</button>
  </form>
</body>
</html>`,
    },
    // Week 4 — Polish + Launch
    {
      id: 'bfw-s12', order: 12, type: 'DOCUMENT',
      title: 'Responsive Design — Mobile Ready!',
      durationMins: 35, xpReward: 60, coinsReward: 6,
      isPublished: true, hasIde: false,
      docContent: `# 📱 Responsive Design — Looks Good on Every Screen

## Why Does This Matter?

More than **half of all internet browsing happens on phones**. If your site only looks good on a laptop, you're losing half your visitors the moment they open it on their phone.

Responsive design means your website **automatically adjusts** to look great on any screen — phone, tablet, or desktop.

---

## Step 1 — The Viewport Meta Tag

Add this inside the **<head>** of every HTML file:

\`\`\`html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
\`\`\`

Without it, mobile browsers zoom out and squish your entire page.

---

## Step 2 — Media Queries

A **media query** is CSS that only applies when certain conditions are true.

Add this at the **bottom** of your CSS:

\`\`\`css
@media (max-width: 600px) {
  .card-row {
    flex-direction: column;
    align-items: center;
  }
  .about-section {
    flex-direction: column;
  }
  img {
    max-width: 100%;
  }
}
\`\`\`

Everything inside those curly braces **only activates on phone-sized screens**.

---

## Step 3 — Testing Without a Phone

Drag the preview panel narrower to see your media queries activate!

---

## ✅ Mobile Checklist

- [ ] Viewport meta tag on all pages
- [ ] Media query at the bottom of your CSS
- [ ] Cards stack vertically on phones
- [ ] Images don't overflow
- [ ] Text is readable on small screens
- [ ] Nothing is cut off or overflowing

---

## 💡 Pro Tip

Set a **max-width** on body so your site doesn't stretch too wide on huge monitors:

\`\`\`css
body {
  max-width: 1100px;
  margin: 0 auto;
}
\`\`\`
`,
    },
    {
      id: 'bfw-s13', order: 13, type: 'BOSS',
      title: '🏆 BOSS: Build & Launch Your Website!',
      durationMins: 60, xpReward: 300, coinsReward: 30,
      isPublished: true, hasIde: true,
      missionText: `🎯 FINAL BOSS — Your Complete Personal Website

Build a fully polished website with everything you've learned:

✅ A header section with your name and a tagline
✅ Navigation bar with at least 3 links
✅ 3 styled cards in a Flexbox row
✅ An About section (two-column layout)
✅ A styled contact form
✅ Responsive design with a media query
✅ A Google Font applied to the whole page
✅ Consistent colors and spacing throughout`,
      starterCode: `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Your Name]'s Website</title>
  <!-- Paste your Google Fonts link here -->
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background: #f8f9fa; }

    .navbar { }
    .navbar ul { }
    .navbar a { }
    .navbar a:hover { }

    .header { }

    .card-row { }
    .card { }

    .btn { }
    .btn:hover { }

    @media (max-width: 600px) {
      /* Add mobile styles here */
    }
  </style>
</head>
<body>

  <nav class="navbar">
    <ul>
      <li><a href="#">Home</a></li>
      <li><a href="#">About</a></li>
      <li><a href="#">Contact</a></li>
    </ul>
  </nav>

  <div class="header">
    <h1>Hi, I'm [Your Name]!</h1>
    <p>Your tagline here...</p>
    <button class="btn">See My Work ↓</button>
  </div>

  <div class="card-row">
    <!-- Add 3 cards here -->
  </div>

</body>
</html>`,
      solutionCode: `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alex's Website</title>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Nunito', sans-serif; background: #f8f9fa; max-width: 1100px; margin: 0 auto; }
    .navbar { background: #1A237E; padding: 0 40px; }
    .navbar ul { display: flex; list-style: none; }
    .navbar a { color: white; text-decoration: none; padding: 16px 20px; display: block; font-weight: 700; }
    .navbar a:hover { background: #283593; }
    .header { background: linear-gradient(135deg,#1A237E,#283593); color: white;
      padding: 80px 40px; text-align: center; display: flex; flex-direction: column;
      align-items: center; gap: 16px; }
    .header h1 { font-size: 48px; }
    .header p  { font-size: 18px; color: #90CAF9; }
    .btn { background: #FF6B35; color: white; padding: 14px 32px; border: none;
      border-radius: 8px; font-size: 16px; cursor: pointer; font-family: inherit; font-weight: 800; }
    .btn:hover { background: #e55a25; }
    .card-row { display: flex; justify-content: center; gap: 24px; flex-wrap: wrap; padding: 60px 40px; }
    .card { background: white; border: 1px solid #e0e0e0; border-radius: 16px; padding: 24px;
      width: 260px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .card h3 { color: #1A237E; margin-bottom: 8px; }
    @media (max-width: 600px) {
      .card-row { padding: 30px 20px; }
      .header { padding: 40px 20px; }
      .header h1 { font-size: 32px; }
      .navbar ul { flex-direction: column; }
    }
  </style>
</head>
<body>
  <nav class="navbar">
    <ul>
      <li><a href="#">Home</a></li>
      <li><a href="#">About</a></li>
      <li><a href="#">Contact</a></li>
    </ul>
  </nav>
  <div class="header">
    <h1>Hi, I'm Alex! 👋</h1>
    <p>I'm learning to build websites at CodeQuest!</p>
    <button class="btn">See My Work ↓</button>
  </div>
  <div class="card-row">
    <div class="card"><h3>🎮 Minecraft</h3><p>My all-time favourite game!</p></div>
    <div class="card"><h3>🍕 Pizza</h3><p>Greatest food ever invented.</p></div>
    <div class="card"><h3>💻 Coding</h3><p>Building real websites!</p></div>
  </div>
</body>
</html>`,
    },
  ];

  for (const s of sessions) {
    await prisma.session.create({ data: { ...s, courseId: course.id } });
  }
  console.log(`✅ ${sessions.length} sessions created`);

  // ─── Quiz Questions ───────────────────────────────────────────
  const quizQuestions = [
    // HTML Quiz (session bfw-s4)
    { id:'bfw-q1', sessionId:'bfw-s4', order:1, emoji:'📝',
      question:'What does HTML stand for?',
      optionA:'HyperText Making Language', optionB:'High Transfer Markup Language',
      optionC:'HyperText Markup Language', optionD:'Hyper Transfer Making Language',
      correctAnswer:'C', explanation:'HTML = HyperText Markup Language — it uses tags to label and structure content!' },
    { id:'bfw-q2', sessionId:'bfw-s4', order:2, emoji:'📰',
      question:'Which tag makes the BIGGEST heading?',
      optionA:'<h6>', optionB:'<big>', optionC:'<heading>', optionD:'<h1>',
      correctAnswer:'D', explanation:'<h1> is the biggest! Headings go from h1 (biggest) to h6 (smallest).' },
    { id:'bfw-q3', sessionId:'bfw-s4', order:3, emoji:'🔗',
      question:'Which tag creates a clickable link?',
      optionA:'<link>', optionB:'<click>', optionC:'<href>', optionD:'<a>',
      correctAnswer:'D', explanation:'The <a> anchor tag creates links! Use href to set the destination.' },
    { id:'bfw-q4', sessionId:'bfw-s4', order:4, emoji:'🖼️',
      question:'What does the "src" attribute on an img tag do?',
      optionA:'Sets the image size', optionB:'Sets the image style',
      optionC:'Sets the alt text', optionD:'Tells the browser where to find the image',
      correctAnswer:'D', explanation:'"src" means source — it tells the browser the URL of the image to show!' },
    { id:'bfw-q5', sessionId:'bfw-s4', order:5, emoji:'⌨️',
      question:'In HTML, pressing Enter creates a new paragraph. True or false?',
      optionA:'True — Enter always creates a new line', optionB:'True — but only inside body',
      optionC:'False — you need a <p> or <br> tag', optionD:'False — you need a <newline> tag',
      correctAnswer:'C', explanation:'HTML ignores Enter! You need <p> for paragraphs or <br> for a line break.' },
    // CSS Quiz (session bfw-s8)
    { id:'bfw-q6', sessionId:'bfw-s8', order:1, emoji:'🎨',
      question:'What does CSS stand for?',
      optionA:'Computer Style Sheets', optionB:'Cascading Style Sheets',
      optionC:'Creative Style Sheets', optionD:'Colorful Style Sheets',
      correctAnswer:'B', explanation:'CSS = Cascading Style Sheets — it controls how HTML elements look!' },
    { id:'bfw-q7', sessionId:'bfw-s8', order:2, emoji:'🖌️',
      question:'Which CSS property changes text color?',
      optionA:'text-color', optionB:'font-color', optionC:'color', optionD:'text-fill',
      correctAnswer:'C', explanation:"Just 'color: red;' — simple! Use a name or hex code like #FF5733." },
    { id:'bfw-q8', sessionId:'bfw-s8', order:3, emoji:'📦',
      question:'What does "padding" do in CSS?',
      optionA:'Adds space OUTSIDE the element', optionB:'Adds a border',
      optionC:'Changes the font size', optionD:'Adds space INSIDE the element',
      correctAnswer:'D', explanation:'Padding adds space inside — between content and its border. Margin is outside!' },
    { id:'bfw-q9', sessionId:'bfw-s8', order:4, emoji:'↔️',
      question:'Which CSS makes elements line up side by side?',
      optionA:'display: block', optionB:'position: side',
      optionC:'display: flex', optionD:'float: side',
      correctAnswer:'C', explanation:'display: flex turns a container into a Flexbox — children line up side by side!' },
    { id:'bfw-q10', sessionId:'bfw-s8', order:5, emoji:'⭕',
      question:'What does "border-radius: 50%" do to a square image?',
      optionA:'Makes it 50% smaller', optionB:'Rotates it 50 degrees',
      optionC:'Adds a 50px border', optionD:'Makes it a circle',
      correctAnswer:'D', explanation:'border-radius: 50% rounds corners so much that a square becomes a perfect circle!' },
  ];

  for (const q of quizQuestions) {
    await prisma.quizQuestion.create({ data: q });
  }
  console.log(`✅ ${quizQuestions.length} quiz questions created`);

  console.log('\n🎉 Done! Your platform is ready.');
  console.log('   Login: admin@codequest.in / admin123');
  console.log('   Course: "Build Your First Website" — 13 sessions, fully published\n');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
