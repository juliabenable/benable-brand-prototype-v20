import { useEffect, useMemo, useState } from 'react';
import { BRAND, TOTALS, PLATFORM, CREATORS, ALL_POSTS } from '../../data/glowCampaign.js';
import { WRAPPED_COMMENTS, avColor, likeCount, timeAgo } from '../../data/wrappedComments.js';
import { PolaroidPostcard } from '../Postcards.jsx';

/* "Glow Love" wrap — master deck (selected design per slide). 28 Litsea. */

export const fmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`);
const mention = (t) => t.split(/(@[\w.]+)/g).map((p, i) => (p.startsWith('@') ? <span key={i} className="gl-men">{p}</span> : p));
const TT = WRAPPED_COMMENTS.filter((c) => c.p === 'tt');
const IG = WRAPPED_COMMENTS.filter((c) => c.p === 'ig');
const TT_PCT = Math.round((PLATFORM.tiktok / (PLATFORM.tiktok + PLATFORM.reels)) * 100);
const IG_PCT = 100 - TT_PCT;
const CAMPAIGN = "Experience 28 Litsea's Award Winning Body Oil";

/* Real platform logos (same marks used in the core platform) — sized to 1em
   so they scale with the container's font-size and inherit its color. */
const IgGlyph = () => (
  <svg className="gl-plat-svg" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2.2" />
    <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="2.2" />
    <circle cx="17.4" cy="6.6" r="1.4" fill="currentColor" />
  </svg>
);
const TtGlyph = () => (
  <svg className="gl-plat-svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true">
    <path d="M14 3c.3 2.1 1.7 3.7 3.9 4v2.3c-1.4 0-2.7-.4-3.9-1.1v5.6a4.9 4.9 0 1 1-4.9-4.9c.3 0 .5 0 .8.1v2.4a2.5 2.5 0 1 0 1.7 2.4V3H14z" />
  </svg>
);
const PlatGlyph = ({ p }) => (p === 'tt' ? <TtGlyph /> : <IgGlyph />);

/* The Benable brand heart — solid coral-red shape with a soft left→right
   gradient. Used wherever a ♥ would otherwise be inline, so the love mark
   reads as the brand mark, not a generic unicode glyph. */
const BenableHeart = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
    <defs>
      <linearGradient id="benHeart" x1="0%" y1="20%" x2="100%" y2="80%">
        <stop offset="0%" stopColor="#ee4f63" />
        <stop offset="100%" stopColor="#f47488" />
      </linearGradient>
    </defs>
    <path
      d="M12 21.4c-.5 0-1-.2-1.4-.5-3.4-2.5-5.6-5-7-7.4C2.2 11 1.8 9.2 2.1 7.5c.3-1.5 1.2-2.8 2.5-3.6 1.4-.8 3-.9 4.5-.4 1 .3 1.9 1 2.6 1.8.2.2.4.5.5.7.1-.2.3-.5.5-.7.7-.9 1.6-1.5 2.6-1.8 1.5-.5 3.1-.4 4.5.4 1.3.8 2.2 2.1 2.5 3.6.3 1.7-.1 3.5-1.5 6-1.4 2.4-3.6 5-7 7.4-.4.3-.9.5-1.4.5z"
      fill="url(#benHeart)"
    />
  </svg>
);

/* Benable B-mark — squircle (iOS-app-icon style rounded square) with a
   multi-stop pastel gradient (purple → pink → peach + a blue wash from the
   bottom-left) and a stylized white B. We render this inline as SVG instead
   of using the favicon PNG because the favicon is a CIRCLE, while the
   official brand mark sits in a squircle. The gradient stops are tuned to
   match the app icon shipped on benable.com. */
const BenableMark = ({ className, size = 22 }) => (
  <svg className={className} viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
    <defs>
      <linearGradient id="bmkBase" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#b674e8" />
        <stop offset="52%" stopColor="#ec90c2" />
        <stop offset="100%" stopColor="#ffb88a" />
      </linearGradient>
      <linearGradient id="bmkBlue" x1="0%" y1="100%" x2="80%" y2="0%">
        <stop offset="0%" stopColor="#7cc9f0" stopOpacity="0.92" />
        <stop offset="55%" stopColor="#7cc9f0" stopOpacity="0" />
      </linearGradient>
    </defs>
    {/* Squircle — rx 7.5/32 ≈ 23% corner radius, matches iOS app-icon curve */}
    <rect width="32" height="32" rx="7.5" fill="url(#bmkBase)" />
    <rect width="32" height="32" rx="7.5" fill="url(#bmkBlue)" />
    {/* Stylized B — Inter Black, optical-centered, with a subtle curl
        under the lower belly to nod to the official mark's smile detail. */}
    <text
      x="16" y="23.2" textAnchor="middle"
      fontFamily="'Inter', system-ui, sans-serif"
      fontWeight="900" fontSize="21" fill="#fff"
      style={{ letterSpacing: '-0.8px' }}
    >B</text>
    <path
      d="M11.6 21.6 Q16 24.4 20.4 21.6"
      stroke="#fff" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.55"
    />
  </svg>
);

/* count-up that runs once `play` flips true, after an optional delay */
function useCountUp(to, { dec = 0, dur = 1300, delay = 0, play }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!play) return undefined;
    let raf;
    const t0 = performance.now() + delay;
    const tick = (now) => {
      if (now < t0) { raf = requestAnimationFrame(tick); return; }
      let t = Math.min(1, (now - t0) / dur);
      t = 1 - Math.pow(1 - t, 3);
      setVal(to * t);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setVal(to);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [play, to, dur, delay]);
  return val.toFixed(dec);
}
function usePlayOnMount() {
  const [play, setPlay] = useState(false);
  useEffect(() => { const id = requestAnimationFrame(() => setPlay(true)); return () => cancelAnimationFrame(id); }, []);
  return play;
}

/* ---- phone mockup + comment feed (Comments · phone feed) ---- */
function CommentRow({ c, ig }) {
  return (
    <div className="gl-row">
      <span className="gl-row__av" style={{ background: avColor(c.u) }}>{c.u[0].toUpperCase()}</span>
      <div className="gl-row__b">
        <span className="gl-row__u">@{c.u}</span>
        <p className="gl-row__t">{mention(c.t)}</p>
        <div className="gl-row__meta"><span>{timeAgo(c.u)}</span><span>Reply</span></div>
      </div>
      <div className="gl-row__like"><span className={`gl-row__heart ${ig ? '' : 'tt'}`}>{ig ? '♡' : '♥'}</span><small>{likeCount(c.u)}</small></div>
    </div>
  );
}
function Phone({ kind, title, list, className, style }) {
  const ig = kind === 'ig';
  return (
    <div className={`gl-phone ${className || ''}`} style={style}>
      <div className="gl-phone__screen">
        <div className="gl-phone__status"><span>9:41</span><span className="gl-phone__sig"><i /><i /><i /> <b /></span></div>
        <div className="gl-phone__notch" />
        <div className={`gl-feed ${ig ? 'gl-feed--ig' : 'gl-feed--tt'}`}>
          <div className="gl-feed__hd">{title}</div>
          <div className="gl-feed__list">{list.map((c, i) => <CommentRow key={i} c={c} ig={ig} />)}</div>
        </div>
      </div>
    </div>
  );
}

/* ---- floating emoji layer (sides only) ---- */
const EMOJI = [
  { e: '✨', x: '5%', y: '14%', s: 26, d: 0 }, { e: '🥹', x: '94%', y: '34%', s: 30, d: 0.8 },
  { e: '💖', x: '8%', y: '40%', s: 24, d: 0.4 }, { e: '🤩', x: '95%', y: '12%', s: 28, d: 1.2 },
  { e: '⭐', x: '92%', y: '62%', s: 26, d: 0.6 }, { e: '❤️', x: '3%', y: '60%', s: 30, d: 1.5 },
  { e: '🔥', x: '6%', y: '84%', s: 22, d: 1.0 }, { e: '🤍', x: '90%', y: '86%', s: 24, d: 0.3 },
  { e: '✨', x: '96%', y: '50%', s: 20, d: 1.8 }, { e: '🥰', x: '4%', y: '26%', s: 22, d: 0.9 },
];
export function FloatingEmojis() {
  return (
    <div className="gl-emojis" aria-hidden="true">
      {EMOJI.map((m, i) => (
        <span key={i} style={{ left: m.x, top: m.y, fontSize: `${m.s}px`, animationDelay: `${m.d}s` }}>{m.e}</span>
      ))}
    </div>
  );
}

/* ============================ slides ============================ */

/* Cover · intro (no stats, no date — just a warm hand-off into the wrap).
   Carries the brand + campaign-complete breadcrumb in the eyebrow, the
   wrap-intro headline, the instructional subtitle, and the campaign name. */
export function Cover() {
  return (
    <div className="gl-slide gl-slide--center">
      <span className="gl-eyebrow">{BRAND} · Campaign complete</span>
      <h1 className="gl-h1">Your campaign report<br /><span className="gl-accent">is ready.</span></h1>
      <p className="gl-sub">Check out your results and highlights.</p>
      <p className="gl-cover__campaign">{CAMPAIGN}</p>
    </div>
  );
}

/* Reach · brand-awareness reframe.
   Tony's ask: each dot = ONE person, so the heart is many tiny dots.
   Drop the platform chips. Add an editorial CMO-style quote underneath
   to land that this top-of-funnel awareness compounds. */
const HEART = (() => {
  const pts = []; const step = 0.028; let row = 0;
  const sx = 150, sy = 112, cx = 220, cy = 168;
  for (let y = 1.3; y >= -1.28; y -= step, row += 1) {
    const xoff = row % 2 ? step / 2 : 0;
    for (let x = -1.4 + xoff; x <= 1.4; x += step) {
      // Classic implicit heart curve: (x²+y²-1)³ - x²y³ ≤ 0
      if (Math.pow(x * x + y * y - 1, 3) - x * x * Math.pow(y, 3) <= 0) pts.push([cx + x * sx, cy - y * sy, x, y]);
    }
  }
  return pts;
})();
const HEART_DOT = 3;
const PEOPLE_PER_DOT = 1;

export function Reach() {
  const play = usePlayOnMount();
  const total = TOTALS.reach.high;
  return (
    <div className="gl-slide gl-slide--center gl-reach2">
      <span className="gl-eyebrow">Brand awareness</span>
      <h2 className="gl-h2 gl-reach2__h">Over <span className="gl-accent">{fmt(total)} people</span><br />noticed your brand.</h2>
      <div className={`gl-hwrap gl-hwrap--dense ${play ? 'play' : ''}`} aria-hidden="true">
        {HEART.map((p, i) => {
          const d = Math.hypot(p[2], p[3] - 0.15);
          const delay = (d * 620).toFixed(0);
          return (
            <span key={i} className="gl-hd" style={{
              left: `${p[0]}px`, top: `${p[1]}px`, width: `${HEART_DOT}px`, height: `${HEART_DOT}px`,
              animationDelay: `${delay}ms`,
            }} />
          );
        })}
      </div>
      <p className="gl-sub gl-reach2__sub">each dot is one person</p>
      <blockquote className="gl-quote">
        <p className="gl-quote__t">Awareness is the foundation of every marketing funnel. Every impression compounds — they're the seeds of tomorrow's customers.</p>
        <cite className="gl-quote__cite">— Marketing Lab, Brand Growth Report</cite>
      </blockquote>
    </div>
  );
}

/* Engagement · 4 elements — 5× hero + You/Avg bar + ONE hero quote +
   Benable-sourcing takeaway. Collapsed from the earlier 7-element stack
   so each piece has clear hierarchy and the eye lands cleanly. */
const HERO_QUOTE = WRAPPED_COMMENTS.find((c) => c.u === 'linnyboo88') || WRAPPED_COMMENTS[0];
export function Engagement() {
  const play = usePlayOnMount();
  const er = useCountUp(TOTALS.viewER, { dec: 1, dur: 1100, delay: 600, play });
  const on = play ? 'play' : '';
  const SCALE_MAX = 24;
  const youPct = Math.min(100, (TOTALS.viewER / SCALE_MAX) * 100);
  const avgPct = (TOTALS.benchmark / SCALE_MAX) * 100;
  return (
    <div className="gl-slide gl-slide--center gl-eng">
      {/* 1: hero stat */}
      <span className="gl-eyebrow">Engagement rate</span>
      <div className={`gl-five ${on}`}>5×</div>
      <div className="gl-five-sub">the industry benchmark</div>

      {/* 2: bar comparison */}
      <div className={`gl-erbar ${on}`}>
        <div className="gl-erbar__row">
          <span className="gl-erbar__lbl">This campaign</span>
          <span className="gl-erbar__track">
            <span className="gl-erbar__fill gl-erbar__fill--you" style={{ '--w': `${youPct}%` }}>{er}%</span>
          </span>
        </div>
        <div className="gl-erbar__row">
          <span className="gl-erbar__lbl">Avg</span>
          <span className="gl-erbar__track">
            <span className="gl-erbar__fill gl-erbar__fill--avg" style={{ '--w': `${avgPct}%` }}>{TOTALS.benchmark}%</span>
          </span>
        </div>
      </div>

      {/* 3: ONE hero quote (was 4 faces + 3 chip quotes) */}
      <div className="gl-eng-heroq">
        <span className="gl-eng-heroq__av" style={{ background: avColor(HERO_QUOTE.u) }}>{HERO_QUOTE.u[0].toUpperCase()}</span>
        <div className="gl-eng-heroq__body">
          <p className="gl-eng-heroq__t">“{HERO_QUOTE.t}”</p>
          <small className="gl-eng-heroq__meta">@{HERO_QUOTE.u} · {HERO_QUOTE.p === 'tt' ? 'TikTok' : 'Instagram'}</small>
        </div>
      </div>

      {/* 4: bolder takeaway */}
      <p className="gl-eng-takeaway">
        Because of Benable's sourcing and vetting, <b>4 handpicked creators</b> drove <b>over 600 people</b> to like, comment, share, or bookmark.
      </p>
    </div>
  );
}

/* Comments · C — phone feed */
export function Comments() {
  return (
    <div className="gl-slide gl-slide--split">
      <div className="gl-split__text">
        <span className="gl-eyebrow gl-eyebrow--dot">Straight from the source</span>
        <h2 className="gl-h2">{WRAPPED_COMMENTS.length} comments.<br /><span className="gl-accent">All love.</span></h2>
        <p className="gl-sub">Real reactions poured in across your creators' TikToks &amp; Reels — and not one of them was anything but glowing.</p>
        <div className="gl-chips">
          <span className="gl-chip"><span className="gl-chip__ic gl-chip__ic--tt"><TtGlyph /></span><b>{TT.length}</b> TikTok</span>
          <span className="gl-chip"><span className="gl-chip__ic gl-chip__ic--ig"><IgGlyph /></span><b>{IG.length}</b> Instagram</span>
        </div>
        <span className="gl-chip gl-chip--ghost">most-said: <b>“glow”</b> ✨</span>
      </div>
      <div className="gl-split__phones">
        <Phone kind="tt" title="Comments" list={TT} className="gl-phone--back" style={{ '--t': '-6deg' }} />
        <Phone kind="ig" title={`${WRAPPED_COMMENTS.length} comments`} list={WRAPPED_COMMENTS} className="gl-phone--front" style={{ '--t': '4deg' }} />
      </div>
    </div>
  );
}

/* Comments · the wall of love — fixed cards (readable), staggered pop-in. */
const WALL_TILT = ['-2deg', '1.5deg', '-1.2deg', '2deg', '-1.6deg', '1deg'];
export function CommentsWall() {
  const play = usePlayOnMount();
  return (
    <div className={`gl-slide ${play ? 'play' : ''}`}>
      <div className="gl-cnt-head">
        <span className="gl-eyebrow">Real excitement, great engagement</span>
        <h2 className="gl-h2">The <span className="gl-accent">wall of love.</span></h2>
      </div>
      <div className="gl-wall">
        {WRAPPED_COMMENTS.map((c, i) => (
          <div key={i} className="gl-wcard" style={{ '--t': WALL_TILT[i % WALL_TILT.length], '--i': i }}>
            <span className={`gl-wcard__plat ${c.p === 'tt' ? 'tt' : 'ig'}`}><PlatGlyph p={c.p} /></span>
            <div className="gl-wcard__row">
              <span className="gl-wcard__av" style={{ background: avColor(c.u) }}>{c.u[0].toUpperCase()}</span>
              <div className="gl-wcard__b"><div className="gl-wcard__u">@{c.u}</div><div className="gl-wcard__t">{mention(c.t)}</div></div>
            </div>
          </div>
        ))}
      </div>
      <div className="gl-wall__fade" />
    </div>
  );
}

/* Content · soft-square tiles drifting left (marquee), platform-tagged.
   Same platform tag style as the core platform: Reel / TikTok / Story. */
const PLAT_META = {
  TikTok: ['tt', 'TikTok'],
  'IG Reel': ['ig', 'Reel'],
  'IG Story': ['ig', 'Story'],
};
export function Content() {
  // Include stories so every platform tag shows; duplicate the set so the
  // leftward drift loops seamlessly.
  const loop = [...ALL_POSTS, ...ALL_POSTS];
  return (
    <div className="gl-slide gl-content">
      <div className="gl-cnt-head"><span className="gl-eyebrow">A seamless experience</span><h2 className="gl-h2"><span className="gl-accent">{TOTALS.pieces} new pieces</span><br />about your brand.</h2></div>
      <div className="gl-marquee">
        <div className="gl-marquee__track">
          {loop.map((p, i) => {
            const [pc, label] = PLAT_META[p.plat] || PLAT_META.TikTok;
            return (
              <div key={i} className="gl-ctile" aria-hidden={i >= ALL_POSTS.length ? 'true' : undefined}>
                <span className="gl-ctile__img" style={{ backgroundImage: `url(${p.img})` }} />
                <span className={`gl-ctile__plat gl-ctile__plat--${pc}`}><PlatGlyph p={pc} /> {label}</span>
                <span className="gl-ctile__tag">
                  <span className="gl-ctile__av" style={{ backgroundImage: `url(${p.creator.pic})` }} />
                  <span className="gl-ctile__name"><b>{p.creator.name}</b><small>{p.creator.handle}</small></span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* Content · TRUE ROTATING RING (Study 2). Cards placed at equal angles
   around a vertical axis; ring rotates Y; cards billboard to face camera.
   The carousel now contains TWO card types: reel posts AND Benable
   recommendations (see BENABLE_RECS below). */

// Real Benable recommendations submitted by 6 creators for 28 Litsea.
// Asset paths use Vite's BASE_URL so they resolve correctly under the
// repo subpath when deployed to GitHub Pages.
const B = import.meta.env.BASE_URL;
const BENABLE_RECS = [
  {
    id: 'rec-emma',
    title: 'Body Oils — 28 Litsea',
    img: `${B}benable-recs/products/01-emma.png`,
    reviewer: { name: 'Emma Boersma', handle: '@emma_boersma', pic: `${B}benable-recs/creators/01-emma.jpeg` },
    reviewText: "Love this stuff fresh out of the shower it makes it feel like a spa treatment and keeps skin sooo smooth! With no bad ingredients",
  },
  {
    id: 'rec-leea',
    title: 'Top Note Body Oil — Spring Collection',
    img: `${B}benable-recs/products/02-leea.png`,
    reviewer: { name: 'Leea Sarvela', handle: '@leeasarvela', pic: `${B}benable-recs/creators/02-leea.png` },
    reviewText: "makes my skin so hydrated and smells amazing!",
  },
  {
    id: 'rec-lulu',
    title: 'Top Note Body Oil — Spring Collection',
    img: `${B}benable-recs/products/03-lulu.png`,
    reviewer: { name: 'Lulu Lavender', handle: '@lululavender', pic: `${B}benable-recs/creators/03-lulu.jpeg` },
    reviewText: "This body oil is ELITE! The glow that it provides is unreal! I've had so many compliments and I love the lavender one.",
  },
  {
    id: 'rec-marina',
    title: 'Top Note Wild Citrus Body Oil',
    img: `${B}benable-recs/products/04-marina.png`,
    reviewer: { name: 'Marina Larina', handle: '@luckymia_ugc', pic: `${B}benable-recs/creators/04-marina.jpeg` },
    reviewText: "Smells amazing and gives energized vibes 🍋",
  },
  {
    id: 'rec-samantha',
    title: '28 Litsea',
    img: `${B}benable-recs/products/05-samantha.jpeg`,
    reviewer: { name: 'Samantha', handle: '@itssamantha_pxoxo', pic: `${B}benable-recs/creators/05-samantha.jpeg` },
    reviewText: "The most hydrating, non-greasy, almond body oil ever!",
  },
  {
    id: 'rec-ladaysia',
    title: 'Melted Balm',
    img: `${B}benable-recs/products/06-ladaysia.png`,
    reviewer: { name: 'Ladaysia Sturgis', handle: '@xoxowithlovedaisy', pic: `${B}benable-recs/creators/06-ladaysia.png` },
    reviewText: "Your skincare routine just got an upgrade! The Melted Balm by 28 Litsea is the perfect addition to your routine. Soothes and moisturizes — and most importantly, clean ingredients.",
  },
];

const RING_MS = 1300;
const RING_RADIUS = 540; // bigger ring to fit 13 posts + 6 recs without crowding
export function ContentSpotlight() {
  // Mix reel posts + Benable recs into one carousel — both card types
  // ride the same ring, just rendered differently when active.
  const items = useMemo(() => [
    ...ALL_POSTS.map((p) => ({ kind: 'post', data: p })),
    ...BENABLE_RECS.map((r) => ({ kind: 'rec', data: r })),
  ], []);
  const N = items.length;
  const STEP = 360 / N;
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % N), RING_MS);
    return () => clearInterval(id);
  }, [N]);

  return (
    <div className="gl-slide gl-slide--center gl-content2">
      <div className="gl-cnt-head">
        <h2 className="gl-h2 gl-content2__h"><span className="gl-accent">{TOTALS.pieces} new pieces</span> + {BENABLE_RECS.length} Benable picks for your brand.</h2>
      </div>
      <div className="gl-ring-stage">
        <div className="gl-ring" style={{ transform: `rotateY(${-idx * STEP}deg)` }}>
          {items.map((item, i) => {
            const placement = i * STEP;
            const counter = (idx - i) * STEP;
            const isActive = i === idx;
            const transform = `rotateY(${placement}deg) translateZ(${RING_RADIUS}px) rotateY(${counter}deg)`;
            if (item.kind === 'post') {
              const p = item.data;
              const [pcI, labelI] = PLAT_META[p.plat] || PLAT_META.TikTok;
              return (
                <div key={`p${i}`} className={`gl-ring-card ${isActive ? 'on' : ''}`} style={{ transform }}>
                  <span className="gl-ring-card__img" style={{ backgroundImage: `url(${p.img})` }} />
                  <span className={`gl-ring-card__plat gl-ring-card__plat--${pcI}`}><PlatGlyph p={pcI} /> {labelI}</span>
                  <span className="gl-ring-card__tag">
                    <span className="gl-ring-card__av" style={{ backgroundImage: `url(${p.creator.pic})` }} />
                    <span className="gl-ring-card__name"><b>{p.creator.name}</b><small>{p.creator.handle}</small></span>
                  </span>
                </div>
              );
            }
            // Benable recommendation card — clean product card with coral
            // "Benable pick" pill, title, separate creator row, italic
            // review quote underneath.
            const r = item.data;
            return (
              <div key={`r${i}`} className={`gl-ring-card gl-ring-card--rec ${isActive ? 'on' : ''}`} style={{ transform }}>
                <span className="gl-rec__img" style={{ backgroundImage: `url(${r.img})` }}>
                  <span className="gl-rec__badge" aria-label="Benable pick">
                    <BenableHeart /> Pick
                  </span>
                </span>
                <div className="gl-rec__body">
                  <div className="gl-rec__title">{r.title}</div>
                  <div className="gl-rec__creator-row">
                    <span className="gl-rec__av" style={{ backgroundImage: `url(${r.reviewer.pic})` }} />
                    <span className="gl-rec__creator-name">{r.reviewer.handle}</span>
                  </div>
                  <p className="gl-rec__review">“{r.reviewText}”</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="gl-spot__count">{idx + 1} <span>/ {N}</span></div>
    </div>
  );
}

/* Creators · F — campaign outcome (relationships, not a ranking/stat grid).
   Reframed around the dashboard relationship tags: a big "Favorite" badge
   as the hero, with future picks + new finds tagged alongside. */
export function Creators() {
  // Match the dashboard relationship pills (.rel-chip in postcard.css):
  // Favorite → gold "save" chip, Repeat → blue "invite" chip, New find → green.
  const relMeta = {
    Favorite: ['save', '★', 'Favorite'],
    Repeat: ['invite', '↻', 'Future pick'],
    'New find': ['new', '✦', 'New find'],
  };
  const fav = CREATORS.filter((c) => c.rel === 'Favorite');
  const future = CREATORS.filter((c) => c.rel === 'Repeat');
  const finds = CREATORS.filter((c) => c.rel === 'New find');
  const rest = [...future, ...finds];
  return (
    <div className="gl-slide gl-slide--center gl-crew">
      <div className="gl-cnt-head">
        <span className="gl-eyebrow">Relationships, not just reach</span>
        <h2 className="gl-h2">This campaign built <span className="gl-accent">your crew.</span></h2>
      </div>
      <p className="gl-crew__lead">
        You favorited <b>{fav.length}</b>, lined up <b>{future.length}</b> future pick{future.length !== 1 ? 's' : ''}, and found <b>{finds.length}</b> new {finds.length !== 1 ? 'faces' : 'face'}.
      </p>

      {fav.length > 0 && (
        <div className="gl-crew__fav">
          {fav.map((c) => (
            <div key={c.handle} className="gl-favbadge">
              <span className="gl-favbadge__ring"><span className="gl-favbadge__pic" style={{ backgroundImage: `url(${c.pic})` }} /></span>
              <span className="rel-chip rel-chip--save gl-favbadge__chip">★ Favorite</span>
              <b className="gl-favbadge__name">{c.name}</b>
              <small className="gl-favbadge__h">{c.handle}</small>
            </div>
          ))}
        </div>
      )}

      <div className="gl-crew__rest">
        {rest.map((c) => {
          const [variant, icon, label] = relMeta[c.rel] || relMeta.Repeat;
          return (
            <div key={c.handle} className="gl-crewmini">
              <span className="gl-crewmini__pic" style={{ backgroundImage: `url(${c.pic})` }} />
              <span className="gl-crewmini__id"><b>{c.name}</b><small>{c.handle}</small></span>
              <span className={`rel-chip rel-chip--${variant}`}>{icon} {label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* Note from Katie · handwritten postcard, warm first-campaign hand-off. */
export function Katie() {
  return (
    <div className="gl-slide gl-slide--center">
      <span className="gl-eyebrow">A note from Katie</span>
      <div className="gl-postcard">
        <span className="gl-postcard__tape" />
        <p className="gl-postcard__msg">Hi {BRAND} team — what a first campaign. Your creators were genuinely excited about your brand, which we don't always see. We'll keep tuning the experience as we get to know you better. Don't ever hesitate to reach out with feedback, ideas, or anything. Personally so excited to be in this with you. ♥</p>
        <div className="gl-postcard__sign">
          <span className="gl-postcard__av">K</span>
          <div>
            <b>Katie</b>
            <small>Head of Brand Partnerships · your personal concierge</small>
          </div>
        </div>
      </div>
    </div>
  );
}

/* "It's still growing" — this campaign isn't over yet. CMO-style quote
   landing the half-of-the-value-comes-after framing. */
export function StillGrowing() {
  return (
    <div className="gl-slide gl-slide--center gl-grow">
      <span className="gl-eyebrow">And this is just the start</span>
      <h2 className="gl-h2">Your content is <span className="gl-accent">still growing.</span></h2>
      <p className="gl-sub gl-grow__sub">All of this content is less than two weeks old — and it keeps working for you long after the campaign ends.</p>

      {/* Visual proof of the claim — a sparkline showing growth over time
          with a "now" marker that the eye lands on. */}
      <div className="gl-grow__chart" aria-hidden="true">
        <svg viewBox="0 0 600 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="growLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ff6fae" /><stop offset="100%" stopColor="#a06bff" />
            </linearGradient>
            <linearGradient id="growFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(160,107,255,0.32)" />
              <stop offset="100%" stopColor="rgba(160,107,255,0)" />
            </linearGradient>
          </defs>
          {/* area fill under curve */}
          <path d="M0,90 C40,86 70,76 100,68 C130,60 145,55 155,53 L155,100 L0,100 Z" fill="url(#growFill)" opacity="0.6" />
          <path d="M155,53 C200,48 240,36 290,22 C320,14 350,8 600,3 L600,100 L155,100 Z" fill="url(#growFill)" opacity="0.9" />
          {/* curve */}
          <path d="M0,90 C40,86 70,76 100,68 C130,60 145,55 155,53 C200,48 240,36 290,22 C320,14 350,8 600,3"
                stroke="url(#growLine)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* 'now' dashed line + dot */}
          <line x1="155" y1="0" x2="155" y2="100" stroke="rgba(120,80,140,0.5)" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="155" cy="53" r="5" fill="#a06bff" />
          <circle cx="155" cy="53" r="5" fill="none" stroke="#fff" strokeWidth="1.5" />
        </svg>
        <div className="gl-grow__chart-legend">
          <span>launched</span><span className="now">↑ now</span><span>3 months</span>
        </div>
      </div>

      <blockquote className="gl-quote gl-quote--bold">
        <p className="gl-quote__t">Roughly half the value of a creator campaign comes from the months after launch.</p>
        <cite className="gl-quote__cite">— CMO, B2C consumer brand</cite>
      </blockquote>
    </div>
  );
}

/* Final piece-out — sparkle burst on mount + Benable signature footer.
   Pure feel-good moment + optional 'send Katie a note' mini-CTA. */
const SPARKLES_DATA = [
  { kind: 'dot',   top: '18%', left: '14%', size: 6, delay: 0.10, rot: 0 },
  { kind: 'dot',   top: '24%', left: '78%', size: 8, delay: 0.18, rot: 0 },
  { kind: 'dot',   top: '34%', left: '9%',  size: 5, delay: 0.22, rot: 0 },
  { kind: 'dot',   top: '62%', left: '85%', size: 6, delay: 0.32, rot: 0 },
  { kind: 'dot',   top: '74%', left: '18%', size: 4, delay: 0.50, rot: 0 },
  { kind: 'star',  top: '16%', left: '22%', size: 14, delay: 0.14, rot: 14 },
  { kind: 'star',  top: '30%', left: '84%', size: 18, delay: 0.24, rot: -18 },
  { kind: 'star',  top: '68%', left: '10%', size: 12, delay: 0.40, rot: 22 },
  { kind: 'heart', top: '20%', left: '50%', size: 16, delay: 0.06, rot: -8 },
  { kind: 'heart', top: '78%', left: '55%', size: 13, delay: 0.46, rot: 12 },
  { kind: 'star',  top: '80%', left: '88%', size: 11, delay: 0.36, rot: 30 },
];
export function WrapClose() {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);
  return (
    <div className="gl-slide gl-slide--center gl-close2">
      {/* Sparkle burst on mount */}
      <div className="gl-close2__sparkles" aria-hidden="true">
        {SPARKLES_DATA.map((s, i) => {
          const style = { top: s.top, left: s.left, '--delay': `${s.delay}s`, '--rot': `${s.rot}deg` };
          if (s.kind === 'dot') return <span key={i} className="gl-spk gl-spk--dot" style={{ ...style, width: s.size, height: s.size }} />;
          if (s.kind === 'heart') return (
            <svg key={i} className="gl-spk gl-spk--heart" viewBox="0 0 24 24" style={{ ...style, width: s.size, height: s.size }}>
              <path d="M12 21s-7-4.5-9-9.5C1 6 5 3 8 4.5c2 1 3.5 3 4 4 .5-1 2-3 4-4 3-1.5 7 1.5 5 7-2 5-9 9.5-9 9.5z" />
            </svg>
          );
          return (
            <svg key={i} className="gl-spk gl-spk--star" viewBox="0 0 24 24" style={{ ...style, width: s.size, height: s.size }}>
              <path d="M12 2 L14.4 9.6 22 12 L14.4 14.4 12 22 L9.6 14.4 2 12 L9.6 9.6 Z" />
            </svg>
          );
        })}
      </div>

      <span className="gl-eyebrow">{BRAND}</span>
      <h2 className="gl-close2__h">That's a <em className="gl-accent">wrap.</em></h2>
      <p className="gl-close2__sub">Thank you for trusting us with your first campaign.</p>

      {!open && !sent && (
        <button type="button" className="gl-close2__cta" onClick={() => setOpen(true)}>
          Have a question or feedback? Send a note to Katie →
        </button>
      )}
      {open && !sent && (
        <div className="gl-close2__form">
          <textarea
            className="gl-close2__ta"
            placeholder={`What's on your mind, ${BRAND.split(' ')[0]} team?`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            autoFocus
          />
          <div className="gl-close2__row">
            <button type="button" className="gl-close2__cancel" onClick={() => { setOpen(false); setNote(''); }}>Cancel</button>
            <button type="button" className="gl-close2__send" disabled={!note.trim()} onClick={() => setSent(true)}>Send to Katie →</button>
          </div>
        </div>
      )}
      {sent && (
        <p className="gl-close2__sent">Sent to Katie. She'll be in touch. ♥</p>
      )}

      {/* Benable signature footer — brand B-mark (inline squircle SVG, not
          the circular favicon) + wordmark text, closes the loop. */}
      <div className="gl-close2__signature">
        <span>made with</span>
        <BenableHeart className="gl-close2__heart" />
        <span>by</span>
        <BenableMark className="gl-close2__bmark" size={22} />
        <span className="gl-close2__wordmark">Benable</span>
      </div>
    </div>
  );
}

/* Recap · D2 — editorial dark (kept defined for reuse, cut from V1 SLIDES) */
export function Recap({ onCta }) {
  const ledger = [
    [`~${fmt(TOTALS.reach.base)}`, 'reach'],
    [`${TOTALS.viewER}%`, 'engagement rate · 5× the average', true],
    [`${TOTALS.engagements}`, 'total engagements'],
    [`${WRAPPED_COMMENTS.length}`, 'comments · all positive'],
    [`${TOTALS.pieces}`, 'pieces of content'],
    [`${TOTALS.creators}`, 'creators'],
  ];
  return (
    <div className="gl-slide gl-recap2">
      <div className="gl-recap2__left">
        <span className="gl-eyebrow">That's a wrap</span>
        <h2 className="gl-recap2__h">{BRAND},<br /><em className="gl-accent">wrapped.</em></h2>
        <p className="gl-recap2__sub">{CAMPAIGN}</p>
        <button className="gl-cta" onClick={onCta}>Launch round two →</button>
      </div>
      <div className="gl-recap2__ledger">
        {ledger.map(([v, l, hero], i) => (
          <div key={i} className={`gl-led ${hero ? 'gl-led--hero' : ''}`}><b>{v}</b><small>{l}</small></div>
        ))}
      </div>
    </div>
  );
}

/* Thank-yous · sent notes (message + wax-seal/envelope) + CTA for the rest */
const THANKED = [
  { c: CREATORS[0], msg: 'Sam — your glow routine stopped the scroll. Thank you 💛' },
  { c: CREATORS[1], msg: 'Lulu, that body-oil glow was unreal. So grateful 🌿' },
];
const UNTHANKED = [CREATORS[2], CREATORS[3]];
export function Thanks() {
  return (
    <div className="gl-slide gl-slide--center glt">
      <div className="gl-cnt-head">
        <span className="gl-eyebrow">Thank-yous</span>
        <h2 className="gl-h2">You sent <span className="gl-accent">{THANKED.length} notes</span> of love.</h2>
      </div>
      <div className="glt-cards">
        {THANKED.map(({ c, msg }, i) => (
          <span key={c.handle} className="glt-polaroid" style={{ '--t': i % 2 ? '3deg' : '-3deg' }}>
            <PolaroidPostcard
              photos={c.posts.map((p) => p.img)}
              platform={c.posts[0]?.plat}
              brandName={BRAND}
              message={msg}
              signoff={`— ${BRAND}`}
            />
          </span>
        ))}
      </div>
      <div className="glt-cta">
        <div className="glt-cta__avs">{UNTHANKED.map((c) => <span key={c.handle} style={{ backgroundImage: `url(${c.pic})` }} />)}</div>
        <div className="glt-cta__txt">
          <b>{UNTHANKED.length} still to thank</b>
          <small>{UNTHANKED.map((c) => c.name.split(' ')[0]).join(' & ')} haven't heard from you yet</small>
        </div>
        <button type="button" className="gl-cta glt-cta__btn">Send a thank-you →</button>
      </div>
    </div>
  );
}

/* V1 order (Tony pass): cover → content (early hook) → reach → engagement
   → wall of love → Katie → still growing → that's a wrap.
   Creators, thanks polaroids, and the recap-stats slide are cut from V1. */
export const SLIDES = [
  { key: 'cover', grad: 'dark', dark: true, Body: Cover },
  // Content exploration: one-at-a-time spotlight crossfade.
  // Swap back to `Body: Content` to return to the marquee/drift version.
  { key: 'content', grad: 'f', Body: ContentSpotlight },
  { key: 'reach', grad: 'b', Body: Reach },
  // Engagement is the one slide that keeps the floating emojis.
  { key: 'engagement', grad: 'c', emoji: true, Body: Engagement },
  { key: 'comments-wall', grad: 'e', Body: CommentsWall },
  { key: 'note', grad: 'a', Body: Katie },
  { key: 'growing', grad: 'h', Body: StillGrowing },
  { key: 'wrapclose', grad: 'dark', dark: true, Body: WrapClose },
];
