/* ==========================================================================
   MITTSU WRITERS — script.js
   --------------------------------------------------------------------------
   Everything here runs on a small localStorage-backed "DB" module. Every
   read/write to story data goes through DB.* functions. That's deliberate:
   when you're ready to plug in a real backend, you only need to rewrite the
   bodies of the DB.* functions (e.g. swap localStorage calls for fetch()
   calls to your API) — nothing in the render/UI code below needs to change.
   ========================================================================== */

/* ---------------------------------------------------------------------- *
 * 1. DATA MODEL + SEED CONTENT
 * ---------------------------------------------------------------------- */

const GENRES = [
  { id: 'all', label: 'All Stories' },
  { id: 'rom-com', label: 'Rom-Com' },
  { id: 'horror', label: 'Horror' },
  { id: 'fictional', label: 'Fictional' },
  { id: 'feel-good', label: 'Feel Good' },
  { id: 'romance', label: 'Romance' },
  { id: 'action-thriller', label: 'Action and Thriller' },
  { id: 'comedy', label: 'Comedy' },
  { id: 'mystery', label: 'Mystery' },
  { id: 'guesome', label: 'Guesome' },
];

// Small helper: turn a block of text (blank-line separated) into paragraph objects.
function toParagraphs(chapterId, text) {
  return text.trim().split(/\n\s*\n/).map((t, i) => ({
    id: `${chapterId}-p${i + 1}`,
    chapterId,
    content: t.trim(),
    comments: [], // filled from seed comments below, or by readers at runtime
  }));
}

function chapter(storyId, num, title, text, status, daysAgo) {
  const id = `${storyId}-ch${num}`;
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return {
    id, storyId, chapterNumber: num, title,
    content: toParagraphs(id, text),
    publishedDate: d.toISOString(),
    status, // 'published' | 'draft'
  };
}

// Reusable placeholder body for stories whose real chapters haven't been
// uploaded yet — replace the `text` argument in DEFAULT_STORIES below with
// your real chapter content whenever you're ready; nothing else changes.
function placeholderBody(title, mood) {
  return `This is placeholder chapter content for "${title}." Nothing here is final — swap it out any time from the Author Dashboard, or edit the seed data at the top of script.js.

${mood} It's here so the reading interface, the paragraph comments, and the chapter navigation all have something real to click on while the actual manuscript is being finished.

Every paragraph in this chapter can be commented on individually — try clicking the speech-bubble icon beside this one. That feature will work exactly the same once your real story is in place.

When you're ready, replace this text with your actual chapter, keep a blank line between paragraphs, and the rest of the site adjusts itself automatically.`;
}

const DEFAULT_STORIES = [
  {
    id: 'libraryverse', title: 'LIBRARYVERSE',
    tagline: 'A shelf of very, very short stories',
    poster: 'assets/posters/libraryverse.jpg',
    description: "It's a collection of so-so-so very very very short stories — the whole shelf in miniature, one blink-length tale after another. Read one on a coffee break, or read them all before the kettle boils.",
    genres: [], type: 'chapters', featuredRank: null,
    likes: 0, votes: 0, shares: 0,
    chapters: [
      chapter('libraryverse', 1, 'The Umbrella Left Behind',
        `Nobody claimed the umbrella by the door for six months. It stood there dripping on days it hadn't even rained, or so the tenants liked to joke.

On the day someone finally took it, it rained for the first time in three weeks. Make of that what you will.`,
        'published', 40),
      chapter('libraryverse', 2, 'Two-Minute Noodles',
        `She used to time her heartbreak the way she timed instant noodles — exactly two minutes, then drain it and move on.

It worked, mostly, until a song came on that took four.`,
        'published', 25),
      chapter('libraryverse', 3, 'The Last Bus',
        `The 9:40 bus was always empty except for the driver, who hummed the same three notes every night, like he was trying to remember the rest of the song.

One night a passenger hummed the fourth note back. The driver didn't turn around, but he smiled the whole way to the depot.`,
        'draft', 2),
    ],
  },
  {
    id: 'super-zero', title: 'SUPER-ZERO',
    tagline: 'Feel Good · Super-hero',
    poster: 'assets/posters/super-zero.jpg',
    description: "A kid who wants to become a super-hero — even when the world keeps handing him zero superpowers and an endless list of reasons to quit. SUPER-ZERO is about what's left when the cape doesn't come with powers attached.",
    genres: [], type: 'chapters', featuredRank: null,
    likes: 0, votes: 0, shares: 0,
    chapters: [
      chapter('super-zero', 1, 'Application Rejected',
        placeholderBody('SUPER-ZERO', 'Every hero origin story starts with a rejection letter — his just happened to be from the actual Hero Registration Office.'),
        'published', 60),
      chapter('super-zero', 2, 'Cape, Size: Small',
        placeholderBody('SUPER-ZERO', 'His mother sewed him a cape out of an old curtain. It didn\'t make him fly. It made him brave enough to try.'),
        'published', 33),
    ],
  },
  {
    id: 'one-day-love', title: 'ONE DAY LOVE',
    tagline: 'A short love story',
    poster: 'assets/posters/one-day-love.jpg',
    description: "One day. That's all it takes for two strangers to almost fall in love — and spend the rest of their lives wondering about the day after.",
    genres: [], type: 'single', featuredRank: null,
    likes: 0, votes: 0, shares: 0,
    chapters: [
      chapter('one-day-love', 1, 'Full Story',
        `They met on the 8:14, which was late, the way it always was, and sat across from each other because every other seat was taken.

"You're reading it upside down," she said, and he wasn't, but he turned the book around anyway, just to see what she'd do next.

By the time the train reached the last stop, they had exchanged exactly one name each, no numbers, and a promise neither of them said out loud to take the same train tomorrow.

He didn't. Neither did she. But for one day, on one train, they had built an entire life together out of nothing but forty minutes and two coffees they never got around to buying.

Some love stories don't need a second day to be real. This one certainly felt like it didn't.`,
        'published', 90),
    ],
  },
  {
    id: 'in-between-us', title: 'IN BETWEEN US',
    tagline: 'Rom-Com Novel · A college love triangle',
    poster: 'assets/posters/in-between-us.jpg',
    description: `WHAT IF LOVE IS ARRANGED...? A college love triangle that slowly spins into pure chaos - on one side, the dreamy Mafia Prince she always wanted straight out of her fantasies, and on the other, the unexpected love she never saw coming. Everything was perfect - until one accidental online message. Their story is anything but ordinary. What began as a simple tale soon turned into a mix of romance, comedy, and unstoppable chaos, stretching from college corridors to the wedding mandap. But when the wedding day finally arrives, she faces the ultimate question: will she choose the love of her dreams or the love that chose her?`,
    genres: [], type: 'chapters', featuredRank: null,
    likes: 0, votes: 0, shares: 0,
    chapters: [
      chapter('in-between-us', 1, 'Wrong Number, Right Person',
        placeholderBody('IN BETWEEN US', 'One accidental online message. That\'s all chaos ever needs to get started.'),
        'published', 120),
      chapter('in-between-us', 2, 'The Mafia Prince Problem',
        placeholderBody('IN BETWEEN US', 'He was everything she said she wanted, straight out of her own fantasies — which was exactly the problem.'),
        'published', 95),
      chapter('in-between-us', 3, 'College Corridors, Wedding Mandap',
        placeholderBody('IN BETWEEN US', 'From lecture halls to wedding halls — nobody warned her the aisle would feel this long.'),
        'draft', 4),
    ],
  },
  {
    id: 'devils-shadow', title: "DEVIL'S SHADOW",
    tagline: 'Coming soon',
    poster: 'assets/posters/devils-shadow.jpg',
    description: "Full description coming soon — some shadows take longer to write than others. Check back after the author fills this in from the Dashboard.",
    genres: [], type: 'chapters', featuredRank: null,
    likes: 0, votes: 0, shares: 0,
    chapters: [
      chapter('devils-shadow', 1, 'Chapter One',
        placeholderBody("DEVIL'S SHADOW", 'Something follows two steps behind — close enough to hear, never close enough to see.'),
        'published', 15),
    ],
  },
  {
    id: 'mansion-house', title: 'MANSION HOUSE',
    tagline: 'Horror · Short story',
    poster: 'assets/posters/mansion-house.jpg',
    description: "A house doesn't remember who built it. It only remembers who never left. MANSION HOUSE is a short story — for now — about the family that moved into the one house on the street nobody else would buy.",
    genres: [], type: 'single', featuredRank: null,
    likes: 0, votes: 0, shares: 0,
    chapters: [
      chapter('mansion-house', 1, 'Full Story',
        `The estate agent called it "characterful," which was the word she used for houses she couldn't otherwise explain.

The family moved in on a Tuesday. By Thursday, the youngest had started setting a fifth place at a table meant for four, and nobody had the nerve to ask her why.

At night the house made the sounds old houses make — except this house made them in the wrong order, the creak before the footstep instead of after.

The mother told herself it was the pipes. She kept telling herself that, right up until the pipes had been replaced and the sound remained exactly the same.

By the end of the month, they stopped calling it "the new house" and started calling it, quietly, just "the house" — the way you stop naming something once you've realized it already has a name of its own.`,
        'published', 70),
    ],
  },
  {
    id: 'bbb', title: 'BBB',
    tagline: 'Coming soon',
    poster: 'assets/posters/bbb.jpg',
    description: "Full description coming soon — the title is the only clue you get for now.",
    genres: [], type: 'chapters', featuredRank: null,
    likes: 0, votes: 0, shares: 0,
    chapters: [
      chapter('bbb', 1, 'Chapter One',
        placeholderBody('BBB', 'Three letters. No explanation yet. That\'s exactly how it\'s supposed to feel.'),
        'draft', 1),
    ],
  },
  {
    id: 'death-road', title: 'DEATH ROAD',
    tagline: 'Survival · A 20 min short story',
    poster: 'assets/posters/death-road.jpg',
    description: "One road. No turning back. A twenty-minute descent into how far the will to live can stretch when there's nowhere left to run but forward.",
    genres: [], type: 'single', featuredRank: null,
    likes: 0, votes: 0, shares: 0,
    chapters: [
      chapter('death-road', 1, 'Full Story',
        `The road had a name once, painted onto a sign that had long since rusted through. Nobody who used it now cared what it used to be called. They only cared that it went one way, and that the way back wasn't a decision anyone got to make twice.

He had eleven kilometers left and a fuel gauge that disagreed. The radio had died an hour ago, mid-sentence, on a warning he hadn't finished hearing.

Somewhere behind him, headlights that weren't his own. Somewhere ahead, nothing but the dark pretending to be a horizon.

He'd made a rule for himself at kilometer three: don't look in the mirror. He broke it at kilometer eight, and immediately understood why he'd made it.

The last stretch of Death Road wasn't the longest. It only felt that way, the way the final page of a book always does — because some part of you doesn't want it to end, even when it's trying to kill you.`,
        'published', 55),
    ],
  },
  {
    id: 'die', title: 'D.I.E - DEATH IN EXERTION',
    tagline: 'Psychological Crime Thriller',
    poster: 'assets/posters/die.jpg',
    description: `In the process of fighting crime in his state, Karna, a police officer, unintentionally stumbles onto an occult group of psychopaths who are followers of a specific 'KING' known as 'THE ALLIGATOR.' Can Karna end the chaos and bring peace to his state while simultaneously facing his horrible past? Will he succeed or die in the process? To find the answer, read "Death in Exertion."`,
    genres: [], type: 'chapters', featuredRank: null,
    likes: 0, votes: 0, shares: 0,
    chapters: [
      chapter('die', 1, 'The First Body',
        placeholderBody('D.I.E - DEATH IN EXERTION', 'Karna had seen bodies before. He had never seen one arranged like an offering.'),
        'published', 150),
      chapter('die', 2, 'Followers of the King',
        placeholderBody('D.I.E - DEATH IN EXERTION', 'Every cult needs a king. This one called him The Alligator, and nobody who said the name out loud said it twice.'),
        'published', 130),
      chapter('die', 3, 'What Karna Left Behind',
        placeholderBody('D.I.E - DEATH IN EXERTION', 'His past had been buried for years. The Alligator, it turned out, was very good at digging.'),
        'published', 100),
    ],
  },
  {
    id: 'midnight-love', title: 'MIDNIGHT LOVE',
    tagline: 'Love Story · A 15 min read',
    poster: 'assets/posters/midnight-love.jpg',
    description: "Why not live in illusions when it's better than reality? MIDNIGHT LOVE is a romantic, feel-good short about choosing the version of love that finally feels like enough — even if it only exists after midnight.",
    genres: [], type: 'single', featuredRank: null,
    likes: 0, votes: 0, shares: 0,
    chapters: [
      chapter('midnight-love', 1, 'Full Story',
        `At midnight, the city stopped pretending to be anything other than what it was — quiet, half-lit, and finally honest.

She met him at the same bench every night, or believed she did, which by then amounted to the same thing. He never arrived early and never arrived late. He simply arrived, the way certain thoughts do right before sleep.

"Real life is overrated," he told her once, and she laughed because she agreed, and because agreeing felt safer than asking what he meant by "real."

They talked about everything and nothing, the way people do when neither of them is entirely sure the other one will still be there tomorrow. Some nights he asked her to stay past midnight. She never did. She was afraid of what the sunrise might take back.

Why live in reality, when the illusion loves you better? MIDNIGHT LOVE never really answers that question. It just lets you sit on the bench a little longer, and decide for yourself.`,
        'published', 200),
    ],
  },
  {
    id: 'kodak', title: 'KODAK',
    tagline: 'Feel Good Drama · A 5 min short story',
    poster: 'assets/posters/kodak.jpg',
    description: "A promise made by a son to his father — and the five minutes it takes to find out if he kept it. KODAK is a short, feel-good drama about memory, distance, and the photographs that hold both together.",
    genres: [], type: 'chapters', featuredRank: null,
    likes: 0, votes: 0, shares: 0,
    chapters: [
      chapter('kodak', 1, 'The Camera on the Shelf',
        `My father kept a camera he never used. It sat on the third shelf of the cupboard, wrapped in a checked cloth that had gone the colour of old tea, and every year on his birthday I asked if I could open it. Every year he said not yet.

It was a Kodak — a real one, film and all, the kind you had to wind by hand and pray over before the shop developed it. He'd bought it the year I was born, he told me once, planning to fill it with pictures of me learning to walk. Somewhere between the hospital and the first steps, life had gotten in the way, and the camera had gone up on that shelf instead, still loaded with a roll of film that had never once seen daylight.

"When you're ready," he used to say, though he never explained ready for what. I stopped asking eventually. Some questions you learn to carry instead of answer.

The week before I left for the city, he took the camera down himself. He didn't hand it to me right away — he just held it, turning it over in his hands like he was reading a letter he'd written a long time ago and forgotten the ending of.

"Finish the roll," he said finally. "Wherever you go. Thirty-six pictures. Bring them back to me and we'll open them together."

I promised him I would. I didn't know yet how long thirty-six pictures could take to fill, or how much life could happen in between the first and the last.`,
        'published', 45),
      chapter('kodak', 2, 'Thirty-Six Frames',
        `This chapter is still being written — check back soon, or peek behind the curtain in the Author Dashboard to see how draft chapters look before they're published.`,
        'draft', 1),
    ],
  },
];

// No comments are pre-seeded — every story genuinely starts at 0 likes,
// 0 votes, 0 shares and 0 comments, since nothing has actually been read yet.
// (Real reader comments accumulate here at runtime and persist via DB.)

/* ---------------------------------------------------------------------- *
 * 2. DB — localStorage-backed persistence layer
 *    (swap the bodies of these functions for real API calls later)
 * ---------------------------------------------------------------------- */

const DB = (() => {
  // v2: bumped so anyone who loaded the earlier version (with sample
  // likes/votes/comments) automatically gets a clean, all-zero reseed
  // instead of keeping stale localStorage data from before.
  const KEY = 'mittsu_writers_db_v2';

  function seedFresh() {
    // Deep-clone the seed data (plain JSON, so this is safe and cheap) so the
    // live db never shares array/object references with DEFAULT_STORIES.
    const stories = JSON.parse(JSON.stringify(DEFAULT_STORIES)).map(s => ({
      ...s,
      likedByUser: false,
      votedByUser: false,
      storyComments: [],
    }));
    return { stories };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* fall through to reseed */ }
    const fresh = seedFresh();
    save(fresh);
    return fresh;
  }

  function save(db) {
    try { localStorage.setItem(KEY, JSON.stringify(db)); }
    catch (e) { console.warn('Could not persist to localStorage', e); }
  }

  let db = load();

  return {
    getStories: () => db.stories,
    getStory: (id) => db.stories.find(s => s.id === id),
    getChapter: (storyId, chapterId) => {
      const s = db.stories.find(s => s.id === storyId);
      return s && s.chapters.find(c => c.id === chapterId);
    },
    persist: () => save(db),
    addStory: (story) => { db.stories.push(story); save(db); },
    updateStory: (id, patch) => {
      const s = db.stories.find(s => s.id === id);
      if (s) Object.assign(s, patch);
      save(db);
    },
    addChapter: (storyId, ch) => {
      const s = db.stories.find(s => s.id === storyId);
      if (s) s.chapters.push(ch);
      save(db);
    },
    updateChapter: (storyId, chapterId, patch) => {
      const s = db.stories.find(s => s.id === storyId);
      const c = s && s.chapters.find(c => c.id === chapterId);
      if (c) Object.assign(c, patch);
      save(db);
    },
    deleteChapter: (storyId, chapterId) => {
      const s = db.stories.find(s => s.id === storyId);
      if (s) s.chapters = s.chapters.filter(c => c.id !== chapterId);
      save(db);
    },
    reorderChapter: (storyId, chapterId, dir) => {
      const s = db.stories.find(s => s.id === storyId);
      if (!s) return;
      const i = s.chapters.findIndex(c => c.id === chapterId);
      const j = dir === 'up' ? i - 1 : i + 1;
      if (j < 0 || j >= s.chapters.length) return;
      [s.chapters[i], s.chapters[j]] = [s.chapters[j], s.chapters[i]];
      s.chapters.forEach((c, idx) => c.chapterNumber = idx + 1);
      save(db);
    },
    save: () => save(db),
  };
})();

/* ---------------------------------------------------------------------- *
 * 3. STATE + SMALL UTILITIES
 * ---------------------------------------------------------------------- */

const State = {
  activeMood: 'all',
  searchQuery: '',
  currentStoryId: null,
  currentChapterId: null,
  activeParagraphId: null,
};

function $(sel, root = document) { return root.querySelector(sel); }
function $all(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

function escapeHTML(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function formatCount(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => t.classList.remove('show'), 2400);
}

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// Generates a tasteful placeholder poster (gradient + initials) as a data URI,
// used whenever a real poster file hasn't been supplied yet at the given path.
const POSTER_PALETTES = [
  ['#c9a24b', '#7a2f22'], ['#7a67ab', '#1c1830'], ['#6f9077', '#12241a'],
  ['#b5503a', '#241213'], ['#8a7550', '#161320'], ['#5b6f9e', '#141a2c'],
];
function generatePlaceholderPoster(title, seedIndex) {
  const [c1, c2] = POSTER_PALETTES[seedIndex % POSTER_PALETTES.length];
  const initials = title.replace(/[^A-Za-z0-9 ]/g, '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="640" viewBox="0 0 480 640">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
    </defs>
    <rect width="480" height="640" fill="${c2}"/>
    <rect width="480" height="640" fill="url(#g)" opacity="0.85"/>
    <circle cx="380" cy="90" r="140" fill="#000" opacity="0.12"/>
    <circle cx="60" cy="560" r="180" fill="#000" opacity="0.15"/>
    <text x="240" y="335" font-family="Georgia, serif" font-size="120" fill="#f1ead9" fill-opacity="0.92" text-anchor="middle" font-weight="700">${initials}</text>
    <text x="240" y="600" font-family="monospace" font-size="16" letter-spacing="4" fill="#f1ead9" fill-opacity="0.55" text-anchor="middle">MITTSU WRITERS</text>
  </svg>`;
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

// Attach this as onerror on every <img data-poster> so a missing real file
// (they don't exist yet — you'll add them under assets/posters/) falls back
// gracefully instead of showing a broken image icon.
function setPosterImg(imgEl, story, index) {
  imgEl.src = story.poster;
  imgEl.alt = story.title + ' poster';
  imgEl.onerror = () => { imgEl.onerror = null; imgEl.src = generatePlaceholderPoster(story.title, index); };
}

function publishedChapters(story) {
  return story.chapters.filter(c => c.status === 'published').slice().sort((a, b) => a.chapterNumber - b.chapterNumber);
}

function totalCommentCount(story) {
  let n = story.storyComments.reduce((a, c) => a + 1 + c.replies.length, 0);
  story.chapters.forEach(ch => ch.content.forEach(p => {
    n += p.comments.reduce((a, c) => a + 1 + c.replies.length, 0);
  }));
  return n;
}

/* ---------------------------------------------------------------------- *
 * 4. NAV / MOBILE MENU / SEARCH BAR / SCROLL REVEAL
 * ---------------------------------------------------------------------- */

window.addEventListener('scroll', () => {
  $('#mainNav').classList.toggle('is-scrolled', window.scrollY > 40);
});

const hamburgerBtn = $('#hamburgerBtn');
const mobileMenu = $('#mobileMenu');
hamburgerBtn.addEventListener('click', () => {
  hamburgerBtn.classList.toggle('open');
  mobileMenu.classList.toggle('open');
  document.body.classList.toggle('locked', mobileMenu.classList.contains('open'));
});
function closeMobileMenu() {
  hamburgerBtn.classList.remove('open');
  mobileMenu.classList.remove('open');
  document.body.classList.remove('locked');
}

$('#searchToggle').addEventListener('click', () => toggleSearch());
function toggleSearch(force) {
  const bar = $('#searchBar');
  const show = force !== undefined ? force : bar.classList.contains('hidden');
  bar.classList.toggle('hidden', !show);
  if (show) { $('#searchInput').focus(); Router.home(() => scrollToId('library')); }
}

function setupRevealObserver() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); });
  }, { threshold: 0.12 });
  $all('.reveal').forEach(el => io.observe(el));
}

/* ---------------------------------------------------------------------- *
 * 5. MOOD FILTERS + LIBRARY GRID
 * ---------------------------------------------------------------------- */

function renderMoodRow() {
  const row = $('#moodRow');
  row.innerHTML = GENRES.map(g =>
    `<button class="mood-chip ${State.activeMood === g.id ? 'active' : ''}" data-mood="${g.id}">${g.label}</button>`
  ).join('');
  $all('.mood-chip', row).forEach(btn => {
    btn.addEventListener('click', () => {
      State.activeMood = btn.dataset.mood;
      renderMoodRow();
      renderLibrary();
    });
  });
}

function storyMatchesQuery(story, q) {
  if (!q) return true;
  q = q.toLowerCase();
  return story.title.toLowerCase().includes(q)
    || 'mittsu writers'.includes(q)
    || story.genres.some(g => g.toLowerCase().includes(q))
    || story.tagline.toLowerCase().includes(q);
}

function renderStoryCard(story, index) {
  const chapters = publishedChapters(story);
  const rankBadge = story.featuredRank ? `<div class="rank-badge">#${story.featuredRank} MOST READ</div>` : '';
  const genreTag = story.genres.length ? `<div class="card-genre">${escapeHTML(story.genres[0])}</div>` : '';
  const editBtn = (typeof Auth !== 'undefined' && Auth.isAuthor())
    ? `<button class="card-edit-btn" data-edit-story="${story.id}" title="Edit this story">✎</button>`
    : '';
  return `
  <article class="story-card" data-id="${story.id}">
    <div class="poster-wrap">
      <img class="poster-img" data-poster>
      <div class="poster-gradient"></div>
      <div class="card-bookmark">
        <svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M6 2h12a1 1 0 0 1 1 1v19l-7-4-7 4V3a1 1 0 0 1 1-1z"/></svg>
      </div>
      ${editBtn}
      ${rankBadge}
      ${genreTag}
    </div>
    <div class="card-body">
      <h3 class="card-title">${escapeHTML(story.title)}</h3>
      <div class="card-tagline">${escapeHTML(story.tagline)}</div>
      <p class="card-desc">${escapeHTML(story.description)}</p>
      <div class="card-stats">
        <span>♡ ${formatCount(story.likes)}</span>
        <span>★ ${formatCount(story.votes)}</span>
        <span>💬 ${formatCount(totalCommentCount(story))}</span>
        <span>${chapters.length} ${story.type === 'single' ? 'part' : 'ch'}${chapters.length === 1 ? '' : 's'}</span>
      </div>
      <button class="card-cta">${story.type === 'single' ? 'Read Story' : 'Start Reading'}</button>
    </div>
  </article>`;
}

function renderLibrary() {
  const grid = $('#storyGrid');
  const stories = DB.getStories();
  const filtered = stories.filter(s => {
    const moodOk = State.activeMood === 'all' || s.genres.includes(State.activeMood);
    return moodOk && storyMatchesQuery(s, State.searchQuery);
  });

  $('#libraryCount').textContent = `${filtered.length} of ${stories.length} stories`;

  if (!filtered.length) {
    const reason = State.searchQuery
      ? `No stories match “${escapeHTML(State.searchQuery)}.”`
      : `No stories tagged for this mood yet — genres are still being assigned from the Dashboard.`;
    grid.innerHTML = `<div class="empty-state">${reason}</div>`;
    return;
  }

  grid.innerHTML = filtered.map((s, i) => renderStoryCard(s, stories.indexOf(s))).join('');
  $all('.story-card', grid).forEach(card => {
    const story = stories.find(s => s.id === card.dataset.id);
    setPosterImg($('[data-poster]', card), story, stories.indexOf(story));
    card.addEventListener('click', () => Router.showDetail(story.id));
  });
  $all('.card-edit-btn', grid).forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      Admin.jumpToEditStory(btn.dataset.editStory);
    });
  });
}

const Library = {
  search(q) {
    State.searchQuery = q;
    renderLibrary();
  }
};

/* ---------------------------------------------------------------------- *
 * 6. ROUTER — switches between home / detail / reader / admin "pages"
 * ---------------------------------------------------------------------- */

const Router = {
  home(after) {
    $('#homeView').classList.remove('hidden');
    ['detailView', 'readerView', 'adminView'].forEach(id => $('#' + id).classList.remove('active'));
    document.body.classList.remove('locked');
    window.scrollTo({ top: 0, behavior: after ? 'auto' : 'smooth' });
    if (after) requestAnimationFrame(after);
  },
  showDetail(storyId) {
    State.currentStoryId = storyId;
    $('#homeView').classList.add('hidden');
    $('#readerView').classList.remove('active');
    $('#adminView').classList.remove('active');
    $('#detailView').classList.add('active');
    Detail.render(storyId);
    window.scrollTo(0, 0);
  },
  showReader(storyId, chapterId) {
    State.currentStoryId = storyId;
    State.currentChapterId = chapterId;
    $('#homeView').classList.add('hidden');
    $('#detailView').classList.remove('active');
    $('#adminView').classList.remove('active');
    $('#readerView').classList.add('active');
    Reader.render(storyId, chapterId);
    window.scrollTo(0, 0);
  },
  showAdmin(afterRender) {
    if (!Auth.requireAuthor()) return;
    $('#homeView').classList.add('hidden');
    $('#detailView').classList.remove('active');
    $('#readerView').classList.remove('active');
    $('#adminView').classList.add('active');
    Admin.render();
    if (afterRender) afterRender();
    window.scrollTo(0, 0);
  },
};

/* ---------------------------------------------------------------------- *
 * 7. STORY DETAIL VIEW
 * ---------------------------------------------------------------------- */

const Detail = {
  render(storyId) {
    const story = DB.getStory(storyId);
    if (!story) return;
    const idx = DB.getStories().indexOf(story);

    setPosterImg($('#detailPoster'), story, idx);
    $('#detailTitle').textContent = story.title;
    $('#detailTagline').textContent = story.tagline;
    $('#detailDesc').textContent = story.description;
    $('#detailGenres').innerHTML = story.genres.length
      ? story.genres.map(g => `<span class="pill">${escapeHTML(g)}</span>`).join('')
      : `<span class="pill">Genre — coming soon</span>`;

    const chapters = publishedChapters(story);
    $('#detailChapters').textContent = chapters.length;
    $('#detailLikes').textContent = formatCount(story.likes);
    $('#detailVotes').textContent = formatCount(story.votes);
    $('#detailShares').textContent = formatCount(story.shares);
    $('#detailComments').textContent = formatCount(totalCommentCount(story));

    $('#likeToggle').classList.toggle('active', story.likedByUser);
    $('#voteToggle').classList.toggle('active', story.votedByUser);

    // Author-only edit affordances, live on the story's own page — no
    // separate hidden panel needed to find them.
    const isAuthor = Auth.isAuthor();
    $('#editStoryBtn').classList.toggle('hidden', !isAuthor);
    $('#manageChaptersBtn').classList.toggle('hidden', !isAuthor);
    $('#editStoryBtn').onclick = () => Admin.jumpToEditStory(story.id);
    $('#manageChaptersBtn').onclick = () => Admin.jumpToChapters(story.id);

    $('#chapterListLabel').textContent = story.type === 'single' ? 'Story' : `Chapters (${chapters.length})`;
    $('#detailChapterList').innerHTML = story.chapters.slice().sort((a, b) => a.chapterNumber - b.chapterNumber).map(c => `
      <div class="chapter-row">
        <span class="c-title">${story.type === 'single' ? escapeHTML(c.title) : `Ch. ${c.chapterNumber} — ${escapeHTML(c.title)}`}${c.status === 'draft' ? '<span class="draft-tag">DRAFT</span>' : ''}</span>
        <span class="c-meta">${new Date(c.publishedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
      </div>`).join('');

    const startBtn = $('#startReadingBtn');
    startBtn.textContent = chapters.length ? 'START READING' : 'NO CHAPTERS YET';
    startBtn.disabled = !chapters.length;
    startBtn.onclick = () => chapters.length && Router.showReader(story.id, chapters[0].id);

    $('#likeToggle').onclick = () => Engage.toggleLike(story.id);
    $('#voteToggle').onclick = () => Engage.toggleVote(story.id);
    $('#shareBtnDetail').onclick = () => Engage.share(story);

    Comments.renderStoryThread(story);
  }
};

/* ---------------------------------------------------------------------- *
 * 8. READER — chapter view + paragraph-level comments
 * ---------------------------------------------------------------------- */

const Reader = {
  render(storyId, chapterId) {
    const story = DB.getStory(storyId);
    const chapters = publishedChapters(story);
    let chapter = chapters.find(c => c.id === chapterId) || chapters[0];
    if (!chapter) return;
    State.currentChapterId = chapter.id;
    State.activeParagraphId = null;

    const shell = $('#readerShell');
    shell.classList.toggle('single-mode', story.type === 'single');

    $('#railStoryTitle').textContent = story.title;
    $('#railStorySub').textContent = `${chapters.length} chapter${chapters.length === 1 ? '' : 's'} · by Mittsu Writers`;
    $('#railChapterList').innerHTML = chapters.map(c => `
      <div class="rail-chapter ${c.id === chapter.id ? 'active' : ''}" data-ch="${c.id}">
        <span class="rc-num">CH. ${String(c.chapterNumber).padStart(2, '0')}</span>
        <span class="rc-title">${escapeHTML(c.title)}</span>
      </div>`).join('');
    $all('.rail-chapter', shell).forEach(el => el.addEventListener('click', () => Router.showReader(story.id, el.dataset.ch)));

    $('#readerKicker').textContent = story.type === 'single' ? story.title : `${story.title} · Chapter ${chapter.chapterNumber} of ${chapters.length}`;
    $('#readerChTitle').textContent = chapter.title;

    $('#paragraphContainer').innerHTML = chapter.content.map((p, i) => `
      <div class="story-paragraph" data-pid="${p.id}">
        <p>${escapeHTML(p.content)}</p>
        <button class="para-comment-btn ${p.comments.length ? 'has-comments' : ''}" data-pid="${p.id}" title="Comment on this paragraph">
          💬 ${p.comments.length ? totalThreadCount(p.comments) : ''}
        </button>
        <div class="inline-comments" id="inline-${p.id}"></div>
      </div>`).join('');

    $all('.para-comment-btn').forEach(btn => btn.addEventListener('click', () => Reader.openParagraphPanel(btn.dataset.pid)));

    const idx = chapters.findIndex(c => c.id === chapter.id);
    const prevBtn = $('#prevChapterBtn'), nextBtn = $('#nextChapterBtn');
    prevBtn.disabled = idx <= 0;
    nextBtn.textContent = idx >= chapters.length - 1 ? 'Finished ✓' : 'Next Chapter →';
    nextBtn.disabled = idx >= chapters.length - 1;
    prevBtn.onclick = () => idx > 0 && Router.showReader(story.id, chapters[idx - 1].id);
    nextBtn.onclick = () => idx < chapters.length - 1 && Router.showReader(story.id, chapters[idx + 1].id);

    $('#readerLikeCount').textContent = formatCount(story.likes);
    $('#readerVoteCount').textContent = formatCount(story.votes);
    $('#readerCommentTotal').textContent = formatCount(totalCommentCount(story));
    $('#readerLike').classList.toggle('active', story.likedByUser);
    $('#readerVote').classList.toggle('active', story.votedByUser);
    $('#readerLike').onclick = () => { Engage.toggleLike(story.id); Reader.render(story.id, chapter.id); };
    $('#readerVote').onclick = () => { Engage.toggleVote(story.id); Reader.render(story.id, chapter.id); };
    $('#readerShare').onclick = () => Engage.share(story);

    $('#storyLevelCommentsReader').innerHTML = `
      <div class="comments-section" style="padding:0; margin:50px 0 0;" id="storyLevelCommentsReaderInner">
        <p class="detail-section-title">Story comments (<span id="readerStoryCommentCount">0</span>)</p>
        <div class="comment-form">
          <div class="avatar">Y</div>
          <textarea class="comment-input" id="readerStoryCommentInput" placeholder="Share your thoughts on this story…" rows="2"></textarea>
        </div>
        <div style="text-align:right; margin:-20px 0 30px;">
          <button class="btn btn-solid btn-sm" onclick="Comments.submitStoryComment(true)">Post comment</button>
        </div>
        <div class="comment-thread" id="readerStoryCommentThread"></div>
      </div>`;
    Comments.renderStoryThread(story, true);

    Reader.closeParagraphPanel();
    Reader.bindProgress();
  },

  openParagraphPanel(pid) {
    State.activeParagraphId = pid;
    $all('.para-comment-btn').forEach(b => b.classList.toggle('active', b.dataset.pid === pid));
    const isMobile = window.innerWidth <= 1020;
    if (isMobile) {
      $all('.inline-comments').forEach(el => el.classList.remove('open'));
      const box = $('#inline-' + pid);
      box.classList.add('open');
      Comments.renderParagraphComments(pid, box);
      box.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    $('#panelEmpty').classList.add('hidden');
    $('#panelActive').classList.remove('hidden');
    const story = DB.getStory(State.currentStoryId);
    const chapter = story.chapters.find(c => c.id === State.currentChapterId);
    const para = chapter.content.find(p => p.id === pid);
    $('#panelQuote').textContent = '“' + para.content.slice(0, 140) + (para.content.length > 140 ? '…' : '') + '”';
    Comments.renderParagraphComments(pid, $('#panelBody'));
  },
  closeParagraphPanel() {
    State.activeParagraphId = null;
    $('#panelActive').classList.add('hidden');
    $('#panelEmpty').classList.remove('hidden');
    $all('.para-comment-btn').forEach(b => b.classList.remove('active'));
  },
  bindProgress() {
    const main = $('.reader-main');
    function onScroll() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0;
      const fill = $('#progressFill');
      if (fill) fill.style.width = pct + '%';
    }
    window.removeEventListener('scroll', Reader._scrollHandler || (() => {}));
    Reader._scrollHandler = onScroll;
    window.addEventListener('scroll', onScroll);
    onScroll();
  }
};

function totalThreadCount(comments) {
  return comments.reduce((a, c) => a + 1 + c.replies.length, 0);
}

/* ---------------------------------------------------------------------- *
 * 9. COMMENTS — story-level + paragraph-level, with like / reply / delete
 * ---------------------------------------------------------------------- */

const CURRENT_USER = 'You';

function commentHTML(c, ctx) {
  const initial = c.username[0].toUpperCase();
  const canDelete = c.username === CURRENT_USER;
  return `
  <div class="comment" data-cid="${c.id}">
    <div class="avatar">${initial}</div>
    <div class="comment-body">
      <div class="comment-head">
        <span class="comment-user">${escapeHTML(c.username)}</span>
        <span class="comment-time">${timeAgo(c.timestamp)}</span>
      </div>
      <p class="comment-text">${escapeHTML(c.content)}</p>
      <div class="comment-actions">
        <button class="like-comment-btn ${c.likedByUser ? 'liked' : ''}" data-cid="${c.id}">♡ ${c.likes}</button>
        <button class="reply-btn" data-cid="${c.id}">↳ Reply</button>
        ${c.replies.length ? `<button class="toggle-replies-btn" data-cid="${c.id}">${c.repliesOpen === false ? 'Show' : 'Hide'} ${c.replies.length} repl${c.replies.length === 1 ? 'y' : 'ies'}</button>` : ''}
        ${canDelete ? `<button class="delete-x" data-cid="${c.id}">Delete</button>` : ''}
      </div>
      <div class="reply-form" id="replyform-${c.id}">
        <input type="text" placeholder="Write a reply…" data-cid="${c.id}">
        <button class="btn btn-solid btn-sm" data-cid="${c.id}">Reply</button>
      </div>
      <div class="replies" style="${c.repliesOpen === false ? 'display:none;' : ''}">
        ${c.replies.map(r => `
          <div class="comment" data-cid="${r.id}">
            <div class="avatar">${r.username[0].toUpperCase()}</div>
            <div class="comment-body">
              <div class="comment-head"><span class="comment-user">${escapeHTML(r.username)}</span><span class="comment-time">${timeAgo(r.timestamp)}</span></div>
              <p class="comment-text">${escapeHTML(r.content)}</p>
              <div class="comment-actions">
                <button class="like-comment-btn ${r.likedByUser ? 'liked' : ''}" data-cid="${r.id}">♡ ${r.likes}</button>
                ${r.username === CURRENT_USER ? `<button class="delete-x" data-cid="${r.id}">Delete</button>` : ''}
              </div>
            </div>
          </div>`).join('')}
      </div>
    </div>
  </div>`;
}

function bindCommentThreadEvents(container, list, onChange) {
  $all('.like-comment-btn', container).forEach(btn => btn.addEventListener('click', () => {
    const c = findComment(list, btn.dataset.cid);
    if (!c) return;
    c.likedByUser = !c.likedByUser;
    c.likes += c.likedByUser ? 1 : -1;
    onChange();
  }));
  $all('.reply-btn', container).forEach(btn => btn.addEventListener('click', () => {
    const f = $('#replyform-' + btn.dataset.cid);
    f.classList.toggle('open');
    if (f.classList.contains('open')) $('input', f).focus();
  }));
  $all('.reply-form button', container).forEach(btn => btn.addEventListener('click', () => {
    const cid = btn.dataset.cid;
    const input = $(`.reply-form input[data-cid="${cid}"]`);
    const text = input.value.trim();
    if (!text) return;
    const c = findComment(list, cid);
    c.replies.push({ id: 'c' + Math.random().toString(36).slice(2, 10), username: CURRENT_USER, content: text, likes: 0, likedByUser: false, timestamp: new Date().toISOString(), replies: [] });
    input.value = '';
    onChange();
  }));
  $all('.toggle-replies-btn', container).forEach(btn => btn.addEventListener('click', () => {
    const c = findComment(list, btn.dataset.cid);
    c.repliesOpen = c.repliesOpen === false ? true : false;
    onChange();
  }));
  $all('.delete-x', container).forEach(btn => btn.addEventListener('click', () => {
    removeCommentById(list, btn.dataset.cid);
    onChange();
  }));
}

function findComment(list, id) {
  for (const c of list) { if (c.id === id) return c; const r = c.replies.find(r => r.id === id); if (r) return r; }
  return null;
}
function removeCommentById(list, id) {
  const i = list.findIndex(c => c.id === id);
  if (i > -1) { list.splice(i, 1); return; }
  for (const c of list) c.replies = c.replies.filter(r => r.id !== id);
}

const Comments = {
  renderStoryThread(story, isReader) {
    const threadEl = isReader ? $('#readerStoryCommentThread') : $('#storyCommentThread');
    const countEl = isReader ? $('#readerStoryCommentCount') : $('#storyCommentCount');
    if (!threadEl) return;
    const count = story.storyComments.reduce((a, c) => a + 1 + c.replies.length, 0);
    countEl.textContent = count;
    threadEl.innerHTML = story.storyComments.length
      ? story.storyComments.slice().reverse().map(c => commentHTML(c)).join('')
      : `<p style="color:var(--parchment-faint); font-style:italic; font-family:var(--font-display);">No comments yet — be the first to say something.</p>`;
    bindCommentThreadEvents(threadEl, story.storyComments, () => { DB.persist(); Comments.renderStoryThread(story, isReader); });
  },

  submitStoryComment(isReader) {
    const story = DB.getStory(State.currentStoryId);
    const input = isReader ? $('#readerStoryCommentInput') : $('#storyCommentInput');
    const text = input.value.trim();
    if (!text) return;
    story.storyComments.push({ id: 'c' + Math.random().toString(36).slice(2, 10), username: CURRENT_USER, content: text, likes: 0, likedByUser: false, timestamp: new Date().toISOString(), replies: [] });
    input.value = '';
    DB.persist();
    Comments.renderStoryThread(story, isReader);
    if (isReader) { $('#readerCommentTotal').textContent = formatCount(totalCommentCount(story)); }
    else { $('#detailComments').textContent = formatCount(totalCommentCount(story)); }
    toast('Comment posted');
  },

  renderParagraphComments(pid, container) {
    const story = DB.getStory(State.currentStoryId);
    const chapter = story.chapters.find(c => c.id === State.currentChapterId);
    const para = chapter.content.find(p => p.id === pid);
    const isPanel = container.id === 'panelBody';
    container.innerHTML = para.comments.length
      ? para.comments.slice().reverse().map(c => commentHTML(c)).join('')
      : `<p style="color:var(--parchment-faint); font-style:italic; font-family:var(--font-display); font-size:.92rem;">No comments on this paragraph yet.</p>`;
    if (!isPanel) {
      container.innerHTML += `
        <div class="panel-form" style="border:none; padding:12px 0 0;">
          <input type="text" placeholder="Add a comment…" class="mobile-para-input" data-pid="${pid}">
          <button class="mobile-para-send" data-pid="${pid}" aria-label="Post">↑</button>
        </div>`;
      const sendBtn = $('.mobile-para-send', container);
      sendBtn.addEventListener('click', () => {
        const input = $('.mobile-para-input', container);
        Comments.submitParaComment(pid, input.value);
        input.value = '';
      });
    }
    bindCommentThreadEvents(container, para.comments, () => {
      // Liking/replying/deleting inside an already-open panel should update
      // in place — it must NOT trigger a full Reader.render(), which would
      // rebuild the paragraph list and force-close the panel the reader has
      // open. So we only re-render this one comment list plus the small
      // badge/counter bits that reference it.
      DB.persist();
      Comments.renderParagraphComments(pid, container);
      Comments.refreshParaBadge(pid, para);
      Comments.refreshReaderCommentTotal(story);
    });
  },

  // Updates just the 💬 count badge beside a paragraph, without re-rendering
  // the whole chapter (keeps an open comment panel open).
  refreshParaBadge(pid, para) {
    const btn = document.querySelector(`.para-comment-btn[data-pid="${pid}"]`);
    if (!btn) return;
    const count = para.comments.length ? totalThreadCount(para.comments) : '';
    btn.innerHTML = `💬 ${count}`;
    btn.classList.toggle('has-comments', para.comments.length > 0);
  },
  refreshReaderCommentTotal(story) {
    const el = document.getElementById('readerCommentTotal');
    if (el) el.textContent = formatCount(totalCommentCount(story));
    const el2 = document.getElementById('detailComments');
    if (el2 && $('#detailView').classList.contains('active')) el2.textContent = formatCount(totalCommentCount(story));
  },

  submitParaComment(pidArg, textArg) {
    const pid = pidArg || State.activeParagraphId;
    if (!pid) return;
    const input = pidArg ? null : $('#panelInput');
    const text = (textArg !== undefined ? textArg : (input ? input.value : '')).trim();
    if (!text) return;
    const story = DB.getStory(State.currentStoryId);
    const chapter = story.chapters.find(c => c.id === State.currentChapterId);
    const para = chapter.content.find(p => p.id === pid);
    para.comments.push({ id: 'c' + Math.random().toString(36).slice(2, 10), username: CURRENT_USER, content: text, likes: 0, likedByUser: false, timestamp: new Date().toISOString(), replies: [] });
    if (input) input.value = '';
    DB.persist();
    toast('Comment posted');
    Reader.render(story.id, chapter.id);
    Reader.openParagraphPanel(pid);
  },
};

/* ---------------------------------------------------------------------- *
 * 10. ENGAGEMENT — like / vote / share
 * ---------------------------------------------------------------------- */

const Engage = {
  toggleLike(storyId) {
    const s = DB.getStory(storyId);
    s.likedByUser = !s.likedByUser;
    s.likes += s.likedByUser ? 1 : -1;
    DB.persist();
    if ($('#detailView').classList.contains('active')) Detail.render(storyId);
  },
  toggleVote(storyId) {
    const s = DB.getStory(storyId);
    s.votedByUser = !s.votedByUser;
    s.votes += s.votedByUser ? 1 : -1;
    DB.persist();
    if ($('#detailView').classList.contains('active')) Detail.render(storyId);
  },
  share(story) {
    const url = `${location.origin}${location.pathname}#story=${story.id}`;
    const data = { title: `${story.title} — MITTSU WRITERS`, text: story.tagline, url };
    story.shares += 1;
    DB.persist();
    if (navigator.share) {
      navigator.share(data).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => toast('Link copied to clipboard'));
    } else {
      toast(url);
    }
    if ($('#detailView').classList.contains('active')) $('#detailShares').textContent = formatCount(story.shares);
  }
};

/* ---------------------------------------------------------------------- *
 * 11. AUTH — real (frontend-only) login/sign-up, with editing restricted
 *     to a single author account: trilogypublishers2022@gmail.com
 *
 *     There's no server here, so "security" is honest local storage, not a
 *     real guarantee — this is the right shape to swap for real backend
 *     auth (hashed passwords, sessions, JWTs, etc.) later without touching
 *     any of the calling code, since everything goes through Auth.*.
 * ---------------------------------------------------------------------- */

const AUTHOR_EMAIL = 'trilogypublishers2022@gmail.com';
const AUTH_SESSION_KEY = 'mittsu_writers_session';
const AUTH_CREDENTIALS_KEY = 'mittsu_writers_author_credentials'; // the one author account
const AUTH_READERS_KEY = 'mittsu_writers_reader_accounts'; // everyone else (mock, for future backend)

const Auth = {
  session: null,

  init() {
    try { this.session = JSON.parse(localStorage.getItem(AUTH_SESSION_KEY)); } catch (e) { this.session = null; }
    Auth.updateNavUI();
  },

  isAuthor() { return !!(this.session && this.session.role === 'author'); },

  // Gate for every editing action (Author Dashboard entry point). Returns
  // true and lets the caller proceed only if logged in as the author.
  requireAuthor() {
    if (Auth.isAuthor()) return true;
    toast('Only the Mittsu Writers account can make changes to a story — log in first.');
    Auth.openAuth('login');
    return false;
  },

  saveSession(session) {
    Auth.session = session;
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    Auth.updateNavUI();
    Auth.refreshCurrentView();
  },
  logout() {
    Auth.session = null;
    localStorage.removeItem(AUTH_SESSION_KEY);
    Auth.updateNavUI();
    toast('Logged out');
    if ($('#adminView').classList.contains('active')) Router.home();
    Auth.refreshCurrentView();
  },
  // Keeps whatever page is currently open in sync with the new auth state —
  // e.g. Edit buttons appearing/disappearing without needing a reload.
  refreshCurrentView() {
    if (!$('#homeView').classList.contains('hidden')) renderLibrary();
    if ($('#detailView').classList.contains('active') && State.currentStoryId) Detail.render(State.currentStoryId);
  },

  updateNavUI() {
    const loggedIn = !!Auth.session;
    const isAuthorNow = loggedIn && Auth.session.role === 'author';
    $('#authButtons').classList.toggle('hidden', loggedIn);
    $('#accountChip').classList.toggle('hidden', !loggedIn);
    $('#dashboardQuickBtn').classList.toggle('hidden', !isAuthorNow);
    const mLogin = $('#mobileLoginBtn'), mSignup = $('#mobileSignupBtn'), mChip = $('#mobileAccountChip'), mDash = $('#mobileDashboardBtn');
    if (mLogin) mLogin.classList.toggle('hidden', loggedIn);
    if (mSignup) mSignup.classList.toggle('hidden', loggedIn);
    if (mChip) mChip.classList.toggle('hidden', !loggedIn);
    if (mDash) mDash.classList.toggle('hidden', !isAuthorNow);
    if (loggedIn) {
      const label = isAuthorNow ? '✎ Mittsu Writers' : Auth.session.email;
      const labelEl = $('#accountLabel'); if (labelEl) labelEl.textContent = label;
      const mLabelEl = $('#mobileAccountLabel'); if (mLabelEl) mLabelEl.textContent = label;
    }
  },

  openAuth(mode) {
    if (Auth.session) { toast(`You're already logged in as ${Auth.session.email}`); return; }
    $('#authModal').classList.remove('hidden');
    document.body.classList.add('locked');
    Auth.renderForm(mode || 'login');
  },
  closeModal() {
    $('#authModal').classList.add('hidden');
    document.body.classList.remove('locked');
  },

  renderForm(mode) {
    const isLogin = mode === 'login';
    $('#authModalContent').innerHTML = `
      <h3>${isLogin ? 'Log in' : 'Sign up'}</h3>
      <p class="modal-sub">${isLogin
        ? 'Welcome back to Mittsu Writers.'
        : 'Create an account to like, vote and comment on stories.'}</p>
      <div class="form-field"><label>Email</label><input type="email" id="authEmail" placeholder="you@example.com" autocomplete="email"></div>
      <div class="form-field"><label>Password</label><input type="password" id="authPassword" placeholder="••••••••" autocomplete="${isLogin ? 'current-password' : 'new-password'}"></div>
      <button class="btn btn-solid btn-block" id="authSubmitBtn">${isLogin ? 'Log in' : 'Create account'}</button>
      <p class="modal-switch">${isLogin ? "New here?" : 'Already have an account?'} <button id="authSwitchBtn">${isLogin ? 'Sign up' : 'Log in'}</button></p>
      <p class="modal-note">Only the Mittsu Writers account can add, edit, or delete stories and chapters. Everyone else can read, like, vote, and comment.</p>
    `;
    $('#authSubmitBtn').addEventListener('click', () => isLogin ? Auth.submitLogin() : Auth.submitSignup());
    $('#authSwitchBtn').addEventListener('click', () => Auth.renderForm(isLogin ? 'signup' : 'login'));
    // let Enter submit the form from either field
    $all('#authModalContent input').forEach(inp => inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') (isLogin ? Auth.submitLogin() : Auth.submitSignup());
    }));
  },

  submitSignup() {
    const email = $('#authEmail').value.trim().toLowerCase();
    const password = $('#authPassword').value;
    if (!email || !password) { toast('Enter an email and password'); return; }

    if (email === AUTHOR_EMAIL) {
      const existing = localStorage.getItem(AUTH_CREDENTIALS_KEY);
      if (existing) { toast('That account already exists — log in instead.'); Auth.renderForm('login'); return; }
      localStorage.setItem(AUTH_CREDENTIALS_KEY, JSON.stringify({ email, password }));
      Auth.saveSession({ email, role: 'author' });
      Auth.closeModal();
      toast('Welcome, Mittsu Writers — taking you to your dashboard.');
      Router.showAdmin();
      return;
    }

    const readers = JSON.parse(localStorage.getItem(AUTH_READERS_KEY) || '[]');
    if (readers.find(u => u.email === email)) { toast('That email is already registered — log in instead.'); Auth.renderForm('login'); return; }
    readers.push({ email, password });
    localStorage.setItem(AUTH_READERS_KEY, JSON.stringify(readers));
    Auth.saveSession({ email, role: 'reader' });
    Auth.closeModal();
    toast('Account created — welcome to Mittsu Writers.');
  },

  submitLogin() {
    const email = $('#authEmail').value.trim().toLowerCase();
    const password = $('#authPassword').value;
    if (!email || !password) { toast('Enter your email and password'); return; }

    if (email === AUTHOR_EMAIL) {
      const stored = JSON.parse(localStorage.getItem(AUTH_CREDENTIALS_KEY) || 'null');
      if (!stored) { toast('No account yet for this email — sign up first.'); Auth.renderForm('signup'); return; }
      if (stored.password !== password) { toast('Incorrect password.'); return; }
      Auth.saveSession({ email, role: 'author' });
      Auth.closeModal();
      toast('Welcome back, Mittsu Writers — taking you to your dashboard.');
      Router.showAdmin();
      return;
    }

    const readers = JSON.parse(localStorage.getItem(AUTH_READERS_KEY) || '[]');
    const u = readers.find(u => u.email === email);
    if (!u) { toast('No account found for that email — sign up first.'); Auth.renderForm('signup'); return; }
    if (u.password !== password) { toast('Incorrect password.'); return; }
    Auth.saveSession({ email, role: 'reader' });
    Auth.closeModal();
    toast('Welcome back.');
  },
};

/* ---------------------------------------------------------------------- *
 * 12. ADMIN / AUTHOR DASHBOARD
 * ---------------------------------------------------------------------- */

const Admin = {
  switchTab(tab) {
    $all('.admin-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    $all('.admin-panel').forEach(p => p.classList.toggle('active', p.id === 'adminPanel-' + tab));
    if (tab === 'chapters') Admin.populateStorySelect();
  },
  render() {
    Admin.renderStoryList();
    Admin.populateStorySelect();
  },
  // Jumps straight from a story's own page into its edit form — this is
  // the "edit my story directly on the website" entry point.
  jumpToEditStory(id) {
    Router.showAdmin(() => {
      Admin.switchTab('newstory');
      Admin.editStory(id);
    });
  },
  jumpToChapters(id) {
    Router.showAdmin(() => {
      Admin.switchTab('chapters');
      $('#chapterStorySelect').value = id;
      Admin.loadChapterManager(id);
    });
  },
  renderStoryList() {
    const stories = DB.getStories();
    $('#adminStoryCount').textContent = stories.length;
    $('#adminStoryList').innerHTML = stories.map((s, i) => `
      <div class="admin-story-row">
        <img data-poster-admin="${i}" alt="">
        <span class="name">${escapeHTML(s.title)}</span>
        <span class="stats-mini">
          <span>${s.chapters.length} ch</span>
          <span>♡ ${s.likes}</span>
          <span>★ ${s.votes}</span>
          <span>💬 ${totalCommentCount(s)}</span>
        </span>
        <div class="row-actions">
          <button title="Edit" data-edit="${s.id}">✎</button>
          <button title="View" data-view="${s.id}">↗</button>
        </div>
      </div>`).join('');
    stories.forEach((s, i) => setPosterImg($(`[data-poster-admin="${i}"]`), s, i));
    $all('[data-edit]').forEach(b => b.addEventListener('click', () => Admin.editStory(b.dataset.edit)));
    $all('[data-view]').forEach(b => b.addEventListener('click', () => Router.showDetail(b.dataset.view)));
  },
  editStory(id) {
    const s = DB.getStory(id);
    $('#storyFormHeading').textContent = 'Edit story';
    $('#editStoryId').value = id;
    $('#f-title').value = s.title;
    $('#f-tagline').value = s.tagline;
    $('#f-poster').value = s.poster;
    $('#f-type').value = s.type;
    $('#f-desc').value = s.description;
    Admin.switchTab('newstory');
  },
  resetStoryForm() {
    $('#storyFormHeading').textContent = 'Add a new story';
    $('#editStoryId').value = '';
    ['f-title', 'f-tagline', 'f-poster', 'f-desc'].forEach(id => $('#' + id).value = '');
    $('#f-type').value = 'chapters';
  },
  saveStory() {
    const id = $('#editStoryId').value;
    const title = $('#f-title').value.trim();
    if (!title) { toast('Give the story a title first'); return; }
    const tagline = $('#f-tagline').value.trim() || 'New story';
    const poster = $('#f-poster').value.trim() || 'assets/posters/untitled.jpg';
    const type = $('#f-type').value;
    const description = $('#f-desc').value.trim() || 'Description coming soon.';

    if (id) {
      DB.updateStory(id, { title, tagline, poster, type, description });
      toast('Story updated');
    } else {
      const newId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
      DB.addStory({ id: newId, title, tagline, poster, description, genres: [], type, featuredRank: null, likes: 0, votes: 0, shares: 0, likedByUser: false, votedByUser: false, storyComments: [], chapters: [] });
      toast('Story added — now add chapters from the Chapters tab');
    }
    Admin.resetStoryForm();
    Admin.render();
    renderLibrary();
    Admin.switchTab('stories');
  },

  populateStorySelect() {
    const stories = DB.getStories();
    const sel = $('#chapterStorySelect');
    const current = sel.value;
    sel.innerHTML = `<option value="">— choose a story —</option>` + stories.map(s => `<option value="${s.id}">${escapeHTML(s.title)}</option>`).join('');
    if (current && stories.find(s => s.id === current)) sel.value = current;
  },
  loadChapterManager(storyId) {
    const card = $('#chapterManagerCard');
    if (!storyId) { card.style.display = 'none'; return; }
    card.style.display = 'block';
    const s = DB.getStory(storyId);
    $('#chapterManagerStoryName').textContent = s.title;
    Admin.resetChapterForm();
    Admin.renderChapterEditorList(storyId);
  },
  renderChapterEditorList(storyId) {
    const s = DB.getStory(storyId);
    const chapters = s.chapters.slice().sort((a, b) => a.chapterNumber - b.chapterNumber);
    $('#chapterEditorList').innerHTML = chapters.map((c, i) => `
      <div class="chapter-editor-row">
        <div class="ce-info">
          <strong>Ch. ${c.chapterNumber} — ${escapeHTML(c.title)}</strong>
          <span class="status-badge ${c.status}">${c.status}</span>
        </div>
        <button class="btn btn-sm" data-up="${c.id}" ${i === 0 ? 'disabled' : ''}>↑</button>
        <button class="btn btn-sm" data-down="${c.id}" ${i === chapters.length - 1 ? 'disabled' : ''}>↓</button>
        <button class="btn btn-sm" data-publish="${c.id}">${c.status === 'published' ? 'Unpublish' : 'Publish'}</button>
        <button class="btn btn-sm" data-edit-ch="${c.id}">Edit</button>
        <button class="btn btn-sm delete-x" data-delete-ch="${c.id}">Delete</button>
      </div>`).join('') || `<p style="color:var(--parchment-faint);">No chapters yet — add the first one below.</p>`;

    $all('[data-up]').forEach(b => b.addEventListener('click', () => { DB.reorderChapter(storyId, b.dataset.up, 'up'); Admin.renderChapterEditorList(storyId); }));
    $all('[data-down]').forEach(b => b.addEventListener('click', () => { DB.reorderChapter(storyId, b.dataset.down, 'down'); Admin.renderChapterEditorList(storyId); }));
    $all('[data-publish]').forEach(b => b.addEventListener('click', () => {
      const c = s.chapters.find(c => c.id === b.dataset.publish);
      DB.updateChapter(storyId, c.id, { status: c.status === 'published' ? 'draft' : 'published' });
      Admin.renderChapterEditorList(storyId); renderLibrary(); toast('Chapter status updated');
    }));
    $all('[data-edit-ch]').forEach(b => b.addEventListener('click', () => Admin.editChapter(storyId, b.dataset.editCh)));
    $all('[data-delete-ch]').forEach(b => b.addEventListener('click', () => {
      if (confirm('Delete this chapter? This cannot be undone.')) {
        DB.deleteChapter(storyId, b.dataset.deleteCh);
        Admin.renderChapterEditorList(storyId); renderLibrary(); toast('Chapter deleted');
      }
    }));
  },
  editChapter(storyId, chapterId) {
    const c = DB.getChapter(storyId, chapterId);
    $('#chapterFormHeading').textContent = 'Edit chapter';
    $('#editChapterId').value = chapterId;
    $('#ch-title').value = c.title;
    $('#ch-status').value = c.status;
    $('#ch-content').value = c.content.map(p => p.content).join('\n\n');
  },
  resetChapterForm() {
    $('#chapterFormHeading').textContent = 'Add a chapter';
    $('#editChapterId').value = '';
    $('#ch-title').value = '';
    $('#ch-status').value = 'published';
    $('#ch-content').value = '';
  },
  saveChapter() {
    const storyId = $('#chapterStorySelect').value;
    if (!storyId) { toast('Pick a story first'); return; }
    const title = $('#ch-title').value.trim();
    const content = $('#ch-content').value.trim();
    if (!title || !content) { toast('Add both a chapter title and content'); return; }
    const status = $('#ch-status').value;
    const editId = $('#editChapterId').value;
    const s = DB.getStory(storyId);

    if (editId) {
      DB.updateChapter(storyId, editId, { title, status, content: toParagraphs(editId, content) });
      toast('Chapter updated');
    } else {
      const num = s.chapters.length + 1;
      const id = `${storyId}-ch${num}-${Date.now().toString(36)}`;
      DB.addChapter(storyId, { id, storyId, chapterNumber: num, title, content: toParagraphs(id, content), publishedDate: new Date().toISOString(), status });
      toast('Chapter added');
    }
    Admin.resetChapterForm();
    Admin.renderChapterEditorList(storyId);
    renderLibrary();
  },
};

/* ---------------------------------------------------------------------- *
 * 13. INIT
 * ---------------------------------------------------------------------- */

function init() {
  Auth.init();
  renderMoodRow();
  renderLibrary();
  setupRevealObserver();

  const instaHref = 'https://instagram.com/mittsu_writers';
  $('#instaLink').href = instaHref;
  $('#instaLinkFooter').href = instaHref;

  window.addEventListener('resize', () => {
    // keep desktop/mobile comment UI in sync if the viewport crosses the breakpoint
    if (State.activeParagraphId && $('#readerView').classList.contains('active')) {
      Reader.openParagraphPanel(State.activeParagraphId);
    }
  });

  // basic deep-link support: mittsuwriters.com/#story=kodak
  const hashMatch = location.hash.match(/story=([\w-]+)/);
  if (hashMatch && DB.getStory(hashMatch[1])) Router.showDetail(hashMatch[1]);
}

document.addEventListener('DOMContentLoaded', init);
