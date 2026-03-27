// backend/prisma/seed.js  –  run: node prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding CodeQuest...');

  const adminHash   = await bcrypt.hash('admin123', 12);
  const studentHash = await bcrypt.hash('student123', 12);

  await prisma.user.upsert({ where:{email:'admin@codequest.in'}, update:{},
    create:{ email:'admin@codequest.in', passwordHash:adminHash, username:'admin', displayName:'Admin', role:'ADMIN', plan:'PREMIUM' }});

  const student = await prisma.user.upsert({ where:{email:'alex@example.com'}, update:{},
    create:{ email:'alex@example.com', passwordHash:studentHash, username:'player_alex', displayName:'Alex', avatarEmoji:'🏃', age:10, role:'STUDENT', plan:'BASIC', xp:820, coins:84, level:5, streakDays:7 }});

  const course = await prisma.course.upsert({ where:{id:'course-web'}, update:{},
    create:{ id:'course-web', title:'Web Builder', emoji:'🌐', description:'Learn HTML & CSS!', color:'#00C8E8', subject:'HTML/CSS', ageGroup:'5-13', order:1, isPublished:true, isLocked:false, totalXp:950 }});

  const sessions = [
    {id:'ses-1',title:'What is HTML?',       type:'VIDEO',   order:1,xpReward:50, coinsReward:5, durationMins:3,hasIde:false},
    {id:'ses-2',title:'Your First Tag',       type:'VIDEO',   order:2,xpReward:60, coinsReward:6, durationMins:4,hasIde:true},
    {id:'ses-3',title:'HTML Tag Reference',   type:'DOCUMENT',order:3,xpReward:30, coinsReward:3, durationMins:2,hasIde:false},
    {id:'ses-4',title:'Quiz: HTML Basics',    type:'QUIZ',    order:4,xpReward:80, coinsReward:8, durationMins:2,hasIde:false},
    {id:'ses-5',title:'Colors & Backgrounds', type:'VIDEO',   order:5,xpReward:70, coinsReward:7, durationMins:5,hasIde:true},
    {id:'ses-6',title:'Code: Style a Page',   type:'CODE',    order:6,xpReward:100,coinsReward:10,durationMins:8,hasIde:true},
    {id:'ses-7',title:'BOSS: Build a Page!',  type:'BOSS',    order:7,xpReward:250,coinsReward:25,durationMins:12,hasIde:true},
  ];
  for(const s of sessions) await prisma.session.upsert({where:{id:s.id},update:{},create:{...s,courseId:course.id,isPublished:true}});

  const qs=[
    {id:'q1',sessionId:'ses-4',question:'Which tag makes the BIGGEST heading?',emoji:'📰',optionA:'<h6>',optionB:'<big>',optionC:'<h1>',optionD:'<heading>',correctAnswer:'C',explanation:'<h1> is biggest!',order:1},
    {id:'q2',sessionId:'ses-4',question:'What does CSS stand for?',emoji:'🎨',optionA:'Cool Style Sheets',optionB:'Cascading Style Sheets',optionC:'Colorful Super Styles',optionD:'Computer Screen Styles',correctAnswer:'B',explanation:'Cascading Style Sheets!',order:2},
    {id:'q3',sessionId:'ses-4',question:'Which tag creates a link?',emoji:'🔗',optionA:'<link>',optionB:'<click>',optionC:'<href>',optionD:'<a>',correctAnswer:'D',explanation:'The <a> anchor tag!',order:3},
    {id:'q4',sessionId:'ses-4',question:'Which CSS property changes text color?',emoji:'🖌️',optionA:'text-color',optionB:'font-color',optionC:'color',optionD:'text-fill',correctAnswer:'C',explanation:"Just 'color: red;'",order:4},
  ];
  for(const q of qs) await prisma.quizQuestion.upsert({where:{id:q.id},update:{},create:q});

  const badges=[
    {id:'b1',emoji:'⭐',name:'First Star',   description:'Complete your first lesson',condition:'complete_first_lesson'},
    {id:'b2',emoji:'🔥',name:'7-Day Fire',   description:'7 day streak!',             condition:'7_day_streak'},
    {id:'b3',emoji:'🏆',name:'Quiz Champ',   description:'100% on a quiz',            condition:'complete_quiz_perfect'},
    {id:'b4',emoji:'🎨',name:'CSS Artist',   description:'Reach level 5',             condition:'reach_level_5'},
    {id:'b5',emoji:'🚀',name:'Speed Coder',  description:'Earn 1000 XP',              condition:'earn_1000_xp'},
    {id:'b6',emoji:'👑',name:'HTML Master',  description:'Complete Web Builder',       condition:'reach_level_10'},
  ];
  for(const b of badges) await prisma.badge.upsert({where:{id:b.id},update:{},create:b});

  for(const sessionId of ['ses-1','ses-2','ses-3','ses-4','ses-5']){
    const s=sessions.find(x=>x.id===sessionId);
    await prisma.progress.upsert({where:{userId_sessionId:{userId:student.id,sessionId}},update:{},
      create:{userId:student.id,sessionId,courseId:course.id,completed:true,stars:3,xpEarned:s.xpReward,coinsEarned:s.coinsReward,completedAt:new Date()}});
  }
  for(const badgeId of ['b1','b2','b3'])
    await prisma.userBadge.upsert({where:{userId_badgeId:{userId:student.id,badgeId}},update:{},create:{userId:student.id,badgeId}});

  console.log('✅ Seed done!  admin@codequest.in/admin123  |  alex@example.com/student123');
}
main().catch(console.error).finally(()=>prisma.$disconnect());
