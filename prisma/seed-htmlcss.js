// backend/prisma/seed-htmlcss.js
// Run: node prisma/seed-htmlcss.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌐 Seeding "Build Your First Website" course...');

  const course = await prisma.course.upsert({
    where:  { id: 'course-website-builder' },
    update: {},
    create: {
      id:          'course-website-builder',
      title:       'Build Your First Website',
      emoji:       '🌐',
      description: 'Go from zero to a live website in 12 sessions! Learn HTML & CSS — build real pages, style them beautifully, and launch your site on the internet.',
      color:       '#1565C0',
      subject:     'HTML/CSS',
      ageGroup:    '8-14',
      order:       2,
      isPublished: true,
      isLocked:    false,
      totalXp:     1340,
    }
  });

  // ─── Sessions ────────────────────────────────────────────────
  const sessions = [
    // ── Week 1: HTML Foundations ──────────────────────────────
    {
      id: 'bfw-s1', order: 1, type: 'VIDEO',
      title: 'The Internet + Your First HTML File',
      durationMins: 25, xpReward: 80, coinsReward: 8,
      isPublished: true, hasIde: false,
      missionText: 'Watch the video, then create your first index.html file with the full skeleton — DOCTYPE, html, head, title, and body. Add your name inside an h1 tag and open it in a browser!',
    },
    {
      id: 'bfw-s2', order: 2, type: 'VIDEO',
      title: 'HTML Tags — Headings, Links & Images',
      durationMins: 30, xpReward: 80, coinsReward: 8,
      isPublished: true, hasIde: true,
      missionText: 'Add real content to your page: use all 6 heading sizes, write a paragraph about yourself, add a clickable link to your favourite website, and drop in an image.',
    },
    {
      id: 'bfw-s3', order: 3, type: 'CODE',
      title: 'Lists, Tables & Organising Your Page',
      durationMins: 30, xpReward: 120, coinsReward: 12,
      isPublished: true, hasIde: true,
      missionText: 'Build a bullet list of your favourite games, a numbered top-3 list, and a 2-column table. Wrap each section in a div to organise your page.',
      starterCode: `<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>

  <h1>My Favourite Things</h1>

  <!-- Task 1: Add an unordered list with at least 4 favourite games -->


  <!-- Task 2: Add an ordered list with your personal top 3 -->


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
      <tr>
        <th>Game</th>
        <th>Why I Like It</th>
      </tr>
      <tr>
        <td>Minecraft</td>
        <td>You can build anything</td>
      </tr>
      <tr>
        <td>Subway Surfers</td>
        <td>Fast and exciting</td>
      </tr>
      <tr>
        <td>Ludo</td>
        <td>Fun with family</td>
      </tr>
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
    // ── Week 2: CSS ───────────────────────────────────────────
    {
      id: 'bfw-s5', order: 5, type: 'VIDEO',
      title: 'CSS — Colors, Fonts & Backgrounds',
      durationMins: 30, xpReward: 80, coinsReward: 8,
      isPublished: true, hasIde: true,
      missionText: 'Create a styles.css file, link it to your HTML, change heading colors using hex codes, pick a Google Font, and set a background color on the body.',
    },
    {
      id: 'bfw-s6', order: 6, type: 'VIDEO',
      title: 'The Box Model — Spacing, Borders & Sizing',
      durationMins: 30, xpReward: 80, coinsReward: 8,
      isPublished: true, hasIde: true,
      missionText: 'Add padding to paragraphs, margin to headings, a border and border-radius to your image, and set a width. Make everything breathe — no more cramped pages!',
    },
    {
      id: 'bfw-s7', order: 7, type: 'CODE',
      title: 'Cards, Buttons & Your Page Header',
      durationMins: 35, xpReward: 120, coinsReward: 12,
      isPublished: true, hasIde: true,
      missionText: 'Build a styled card with class="card", create a button with a hover color change, and build a header section with your name, a tagline, and the button.',
      starterCode: `<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f0f0f0;
      margin: 0;
    }

    /* Style the .header div */
    .header {

    }

    /* Style the .card div */
    .card {

    }

    /* Style the .btn button */
    .btn {

    }

    /* Hover effect for .btn */
    .btn:hover {

    }
  </style>
</head>
<body>

  <!-- Add your header div here -->


  <!-- Add your card div here (with an h3 and p inside) -->


  <!-- Add a button with class="btn" here -->


</body>
</html>`,
      solutionCode: `<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f0f0f0;
      margin: 0;
    }
    .header {
      background-color: #1A237E;
      color: white;
      padding: 60px 40px;
      text-align: center;
    }
    .header h1 { color: white; }
    .header p  { color: #90CAF9; font-size: 18px; }
    .card {
      background-color: white;
      border: 1px solid #dddddd;
      border-radius: 12px;
      padding: 20px;
      width: 280px;
      margin: 20px auto;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .btn {
      background-color: #FF6B35;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      display: block;
      margin: 20px auto;
      font-family: inherit;
    }
    .btn:hover { background-color: #e55a25; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Hi, I'm Alex!</h1>
    <p>I am learning to build websites. This is my first one!</p>
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
    // ── Week 3: Layout ────────────────────────────────────────
    {
      id: 'bfw-s9', order: 9, type: 'CODE',
      title: 'Flexbox — Alignment Made Easy',
      durationMins: 35, xpReward: 120, coinsReward: 12,
      isPublished: true, hasIde: true,
      missionText: 'Wrap your three cards in a div with class="card-row". Add display: flex, justify-content: center, and gap: 20px. Make all three cards sit side by side!',
      starterCode: `<!DOCTYPE html>
<html>
<head>
  <title>Flexbox Practice</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f0f0f0; padding: 20px; }
    .card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      border: 1px solid #ddd;
      width: 200px;
    }

    /* Add .card-row styles here to put cards side by side */
    .card-row {

    }
  </style>
</head>
<body>

  <!-- Wrap these 3 cards in a div with class="card-row" -->
  <div class="card">
    <h3>🎮 Minecraft</h3>
    <p>Build anything you can imagine!</p>
  </div>
  <div class="card">
    <h3>🍕 Pizza</h3>
    <p>Best food ever invented.</p>
  </div>
  <div class="card">
    <h3>💻 Coding</h3>
    <p>Learning to build real websites!</p>
  </div>

</body>
</html>`,
      solutionCode: `<!DOCTYPE html>
<html>
<head>
  <title>Flexbox Practice</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f0f0f0; padding: 20px; }
    .card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      border: 1px solid #ddd;
      width: 200px;
    }
    .card-row {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }
  </style>
</head>
<body>
  <div class="card-row">
    <div class="card">
      <h3>🎮 Minecraft</h3>
      <p>Build anything you can imagine!</p>
    </div>
    <div class="card">
      <h3>🍕 Pizza</h3>
      <p>Best food ever invented.</p>
    </div>
    <div class="card">
      <h3>💻 Coding</h3>
      <p>Learning to build real websites!</p>
    </div>
  </div>
</body>
</html>`,
    },
    {
      id: 'bfw-s10', order: 10, type: 'VIDEO',
      title: 'Navigation Bar + Multiple Pages',
      durationMins: 35, xpReward: 80, coinsReward: 8,
      isPublished: true, hasIde: true,
      missionText: 'Add a nav bar to the top of your page with Home, About, and Contact links. Style it with a dark background, white text, and a hover effect using Flexbox.',
    },
    {
      id: 'bfw-s11', order: 11, type: 'CODE',
      title: 'About Page + Contact Form',
      durationMins: 30, xpReward: 120, coinsReward: 12,
      isPublished: true, hasIde: true,
      missionText: 'Build a two-column About layout (photo on the left, text on the right using Flexbox) and a styled contact form with name, email, message fields and a submit button.',
      starterCode: `<!DOCTYPE html>
<html>
<head>
  <title>About Me</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; background: #f8f9fa; }

    /* Style .about-section using flexbox */
    .about-section {

    }

    /* Style the image inside .about-image */
    .about-image img {

    }

    /* Style .contact-form */
    .contact-form {

    }

    /* Style inputs and textarea inside .contact-form */
    .contact-form input,
    .contact-form textarea {

    }
  </style>
</head>
<body>

  <!-- Two-column about section -->
  <div class="about-section">
    <div class="about-image">
      <img src="https://via.placeholder.com/260x260" alt="Profile photo">
    </div>
    <div class="about-text">
      <h1>About Me</h1>
      <p>Write something real about yourself here...</p>
    </div>
  </div>

  <!-- Contact form — add label + input for Name, Email, Message + Submit button -->
  <form class="contact-form">

  </form>

</body>
</html>`,
      solutionCode: `<!DOCTYPE html>
<html>
<head>
  <title>About Me</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; background: #f8f9fa; }
    .about-section {
      display: flex;
      gap: 40px;
      align-items: center;
      padding: 60px 40px;
      background: white;
    }
    .about-image img {
      width: 260px;
      border-radius: 12px;
    }
    .contact-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 500px;
      margin: 40px auto;
      padding: 40px;
      background: white;
      border-radius: 12px;
      border: 1px solid #ddd;
    }
    .contact-form label { font-weight: bold; color: #333; }
    .contact-form input,
    .contact-form textarea {
      padding: 12px;
      border: 1px solid #ccc;
      border-radius: 6px;
      font-size: 16px;
      font-family: inherit;
    }
    .contact-form textarea { height: 120px; }
    .submit-btn {
      background: #1A237E;
      color: white;
      padding: 12px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      font-family: inherit;
    }
    .submit-btn:hover { background: #283593; }
  </style>
</head>
<body>
  <div class="about-section">
    <div class="about-image">
      <img src="https://via.placeholder.com/260x260" alt="Profile photo">
    </div>
    <div class="about-text">
      <h1>About Me</h1>
      <p>Hi! I'm Alex, a 10-year-old who loves coding, Minecraft, and pizza. I'm learning HTML and CSS at CodeQuest — this is my first real website!</p>
    </div>
  </div>
  <form class="contact-form">
    <label>Your Name</label>
    <input type="text" placeholder="Enter your name">
    <label>Your Email</label>
    <input type="email" placeholder="Enter your email">
    <label>Your Message</label>
    <textarea placeholder="Type your message here..."></textarea>
    <button type="submit" class="submit-btn">Send Message 🚀</button>
  </form>
</body>
</html>`,
    },
    // ── Week 4: Polish + Launch ───────────────────────────────
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

Add this line to the **\`<head>\`** of every HTML file:

\`\`\`html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
\`\`\`

Without it, mobile browsers zoom out and squish your entire page. This one line stops that.

---

## Step 2 — Media Queries

A **media query** is CSS that only applies when certain conditions are true. Think of it like: *"only apply this CSS when the screen is narrower than 600px."*

Add this at the **bottom** of your styles.css:

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
  .contact-form {
    margin: 20px;
    padding: 20px;
  }
}
\`\`\`

Everything inside those curly braces **only activates on phone-sized screens**.

---

## Step 3 — Testing Without a Phone

Your browser has a built-in phone simulator:

1. Right click your page → **Inspect**
2. Click the **phone icon** at the top left of DevTools
3. Pick any device from the dropdown
4. Resize the window and watch your media queries activate!

---

## Quick Reference

| Property | What it does on mobile |
|----------|------------------------|
| \`flex-direction: column\` | Stacks cards vertically instead of side by side |
| \`max-width: 100%\` | Images never overflow their container |
| \`flex-direction: column\` on navbar | Stacks nav links vertically |

---

## ✅ Mobile Checklist

- [ ] Viewport meta tag on all pages
- [ ] Media query block at the bottom of styles.css
- [ ] Cards stack vertically on phones
- [ ] Images don't overflow
- [ ] Text is big enough to read
- [ ] Nav links work on a small screen
- [ ] Nothing is cut off or overflowing

---

## 💡 Pro Tip

Set a **max-width** on your body so your site doesn't stretch too wide on huge monitors:

\`\`\`css
body {
  max-width: 1100px;
  margin: 0 auto;
}
\`\`\`

This keeps content centred and readable on widescreen displays.
`,
    },
    {
      id: 'bfw-s13', order: 13, type: 'BOSS',
      title: 'BOSS: Build + Launch Your Website! 🚀',
      durationMins: 60, xpReward: 300, coinsReward: 30,
      isPublished: true, hasIde: true,
      missionText: `🎯 FINAL BOSS — Your Complete Personal Website

Build a fully polished website with everything you have learned:

✅ A header section with your name and a tagline
✅ Navigation bar with at least 3 links
✅ 3 styled cards in a Flexbox row
✅ An About section (two-column layout)
✅ A styled contact form
✅ Responsive design using a media query
✅ A Google Font applied to the whole page
✅ Consistent colors and spacing throughout

When you finish — upload to GitHub Pages and share your live URL with the world!`,
      starterCode: `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Your Name]'s Website</title>
  <!-- Paste your Google Fonts link here -->
  <style>
    /* Reset */
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background: #f8f9fa; }

    /* Nav bar */
    .navbar { }
    .navbar ul { }
    .navbar a { }
    .navbar a:hover { }

    /* Header */
    .header { }

    /* Cards */
    .card-row { }
    .card { }

    /* Button */
    .btn { }
    .btn:hover { }

    /* Mobile */
    @media (max-width: 600px) {

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
    body { font-family: 'Nunito', sans-serif; background: #f8f9fa; }

    .navbar { background: #1A237E; padding: 0 40px; }
    .navbar ul { display: flex; list-style: none; gap: 10px; }
    .navbar a { color: white; text-decoration: none; padding: 16px 20px; display: block; font-weight: 700; }
    .navbar a:hover { background: #283593; }

    .header {
      background: linear-gradient(135deg, #1A237E, #283593);
      color: white; padding: 80px 40px;
      text-align: center;
      display: flex; flex-direction: column;
      align-items: center; gap: 16px;
    }
    .header h1 { font-size: 48px; color: white; }
    .header p  { font-size: 18px; color: #90CAF9; }

    .btn {
      background: #FF6B35; color: white;
      padding: 14px 32px; border: none;
      border-radius: 8px; font-size: 16px;
      cursor: pointer; font-family: inherit; font-weight: 800;
    }
    .btn:hover { background: #e55a25; }

    .card-row {
      display: flex; justify-content: center;
      gap: 24px; flex-wrap: wrap;
      padding: 60px 40px;
    }
    .card {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 16px; padding: 24px;
      width: 260px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    .card h3 { color: #1A237E; margin-bottom: 8px; font-size: 20px; }

    @media (max-width: 600px) {
      .card-row { flex-direction: column; align-items: center; padding: 30px 20px; }
      .header { padding: 40px 20px; }
      .header h1 { font-size: 32px; }
      .navbar ul { flex-direction: column; }
      .navbar a { padding: 12px 20px; }
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
    <p>I'm a 10-year-old coder learning to build real websites!</p>
    <button class="btn">See My Work ↓</button>
  </div>
  <div class="card-row">
    <div class="card">
      <h3>🎮 Minecraft</h3>
      <p>My all-time favourite game. You can build literally anything you can imagine!</p>
    </div>
    <div class="card">
      <h3>🍕 Pizza</h3>
      <p>The greatest food ever invented. Especially with extra cheese.</p>
    </div>
    <div class="card">
      <h3>💻 Coding</h3>
      <p>I'm learning HTML and CSS at CodeQuest — and I want to build apps one day!</p>
    </div>
  </div>
</body>
</html>`,
    },
  ];

  for (const s of sessions) {
    await prisma.session.upsert({
      where:  { id: s.id },
      update: {},
      create: { ...s, courseId: course.id },
    });
  }
  console.log(`✅ ${sessions.length} sessions created`);

  // ─── Quiz Questions ──────────────────────────────────────────

  const htmlQuiz = [
    {
      id: 'bfw-q1', sessionId: 'bfw-s4', order: 1,
      question: 'What does HTML stand for?',
      emoji: '📝',
      optionA: 'HyperText Making Language',
      optionB: 'High Transfer Markup Language',
      optionC: 'HyperText Markup Language',
      optionD: 'Hyper Transfer Making Language',
      correctAnswer: 'C',
      explanation: 'HTML stands for HyperText Markup Language — it uses tags to label and structure content on a webpage!',
    },
    {
      id: 'bfw-q2', sessionId: 'bfw-s4', order: 2,
      question: 'Which tag makes the BIGGEST heading?',
      emoji: '📰',
      optionA: '<h6>',
      optionB: '<big>',
      optionC: '<heading>',
      optionD: '<h1>',
      correctAnswer: 'D',
      explanation: '<h1> is the biggest heading! Headings go from h1 (biggest) to h6 (smallest).',
    },
    {
      id: 'bfw-q3', sessionId: 'bfw-s4', order: 3,
      question: 'Which tag creates a clickable link?',
      emoji: '🔗',
      optionA: '<link>',
      optionB: '<click>',
      optionC: '<href>',
      optionD: '<a>',
      correctAnswer: 'D',
      explanation: 'The <a> anchor tag creates links! Use the href attribute to set where it goes.',
    },
    {
      id: 'bfw-q4', sessionId: 'bfw-s4', order: 4,
      question: 'What does the "src" attribute on an img tag do?',
      emoji: '🖼️',
      optionA: 'Sets the image size',
      optionB: 'Sets the image style',
      optionC: 'Sets the alt text',
      optionD: 'Tells the browser where to find the image',
      correctAnswer: 'D',
      explanation: '"src" means source — it tells the browser the file name or URL of the image to show!',
    },
    {
      id: 'bfw-q5', sessionId: 'bfw-s4', order: 5,
      question: 'In HTML, pressing Enter creates a new paragraph. True or false?',
      emoji: '⌨️',
      optionA: 'True — Enter always creates a new line',
      optionB: 'True — but only inside the body tag',
      optionC: 'False — you need a <p> or <br> tag',
      optionD: 'False — you need a <newline> tag',
      correctAnswer: 'C',
      explanation: 'HTML ignores Enter key presses! You need a <p> tag for paragraphs or <br> for a line break.',
    },
  ];

  const cssQuiz = [
    {
      id: 'bfw-q6', sessionId: 'bfw-s8', order: 1,
      question: 'What does CSS stand for?',
      emoji: '🎨',
      optionA: 'Computer Style Sheets',
      optionB: 'Cascading Style Sheets',
      optionC: 'Creative Style Sheets',
      optionD: 'Colorful Style Sheets',
      correctAnswer: 'B',
      explanation: 'CSS stands for Cascading Style Sheets — it controls how HTML elements look on screen!',
    },
    {
      id: 'bfw-q7', sessionId: 'bfw-s8', order: 2,
      question: 'Which CSS property changes text color?',
      emoji: '🖌️',
      optionA: 'text-color',
      optionB: 'font-color',
      optionC: 'color',
      optionD: 'text-fill',
      correctAnswer: 'C',
      explanation: "Just 'color: red;' — simple! Use a color name or a hex code like #FF5733.",
    },
    {
      id: 'bfw-q8', sessionId: 'bfw-s8', order: 3,
      question: 'What does "padding" do in CSS?',
      emoji: '📦',
      optionA: 'Adds space OUTSIDE the element',
      optionB: 'Adds a border around the element',
      optionC: 'Changes the font size',
      optionD: 'Adds space INSIDE the element',
      correctAnswer: 'D',
      explanation: 'Padding adds space inside an element — between the content and its border. Margin is space outside!',
    },
    {
      id: 'bfw-q9', sessionId: 'bfw-s8', order: 4,
      question: 'Which CSS makes elements line up side by side?',
      emoji: '↔️',
      optionA: 'display: block',
      optionB: 'position: side',
      optionC: 'display: flex',
      optionD: 'float: side',
      correctAnswer: 'C',
      explanation: 'display: flex turns a container into a Flexbox — its children line up side by side by default!',
    },
    {
      id: 'bfw-q10', sessionId: 'bfw-s8', order: 5,
      question: 'What does "border-radius: 50%" do to a square image?',
      emoji: '⭕',
      optionA: 'Makes it 50% smaller',
      optionB: 'Rotates it 50 degrees',
      optionC: 'Adds a 50px border',
      optionD: 'Makes it a circle',
      correctAnswer: 'D',
      explanation: 'border-radius: 50% rounds the corners so much that a square becomes a perfect circle!',
    },
  ];

  for (const q of [...htmlQuiz, ...cssQuiz]) {
    await prisma.quizQuestion.upsert({ where: { id: q.id }, update: {}, create: q });
  }
  console.log('✅ 10 quiz questions created');
  console.log('\n🎉 "Build Your First Website" course is ready!');
  console.log('   Run: node prisma/seed-htmlcss.js');
}

main().catch(console.error).finally(() => prisma.$disconnect());
