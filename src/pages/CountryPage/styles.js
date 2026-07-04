// src/pages/CountryPage/styles.js

export const PAGE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  :root {
    --cp-g50:#F0FDF4;--cp-g100:#DCFCE7;--cp-g200:#BBF7D0;--cp-g300:#86EFAC;
    --cp-g400:#4ADE80;--cp-g500:#22C55E;--cp-g600:#16A34A;--cp-g700:#15803D;
    --cp-g800:#166534;--cp-g900:#14532D;--cp-g950:#052E16;
    --cp-w:#FFFFFF;--cp-woff:#FAFFFE;--cp-wwarm:#F8FDF9;
    --cp-n900:#0F1B0F;--cp-n800:#1A2E1A;--cp-n700:#2D452D;--cp-n600:#3F5C3F;
    --cp-n500:#5A7A5A;--cp-n400:#7A9E7A;--cp-n300:#A8C5A8;--cp-n200:#D0E3D0;
    --cp-n100:#E8F0E8;--cp-n50:#F4F8F4;
  }

  @keyframes cFadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
  @keyframes cFadeIn{from{opacity:0}to{opacity:1}}
  @keyframes cFadeLeft{from{opacity:0;transform:translateX(-24px)}to{opacity:1;transform:translateX(0)}}
  @keyframes cFadeRight{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
  @keyframes cScale{from{opacity:0;transform:scale(.93)}to{opacity:1;transform:scale(1)}}
  @keyframes cShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  @keyframes cPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.8)}}
  @keyframes cKen{0%{transform:scale(1)}100%{transform:scale(1.08)}}
  @keyframes cGrad{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
  @keyframes cOrb{0%{transform:translate(0,0) scale(1)}33%{transform:translate(20px,-16px) scale(1.04)}66%{transform:translate(-10px,10px) scale(.96)}100%{transform:translate(0,0) scale(1)}}
  @keyframes cBarFill{from{width:0}to{width:var(--bar-w,100%)}}
  @keyframes cFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  @keyframes cSlideDot{0%{width:8px}100%{width:28px}}

  .cp *,.cp *::before,.cp *::after{box-sizing:border-box;margin:0;padding:0}
  .cp{
    font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    background:var(--cp-w);color:var(--cp-n900);
    min-height:100vh;-webkit-font-smoothing:antialiased;
    overflow-x:hidden;
  }

  /* ── Progress ── */
  .cp-prog{position:fixed;top:0;left:0;right:0;height:3px;z-index:9999;pointer-events:none}
  .cp-prog__bar{height:100%;background:linear-gradient(90deg,var(--cp-g600),var(--cp-g400));transform-origin:left;transition:transform .08s linear}

  /* ── Container ── */
  .cp-box{max-width:1400px;margin:0 auto;padding:0 clamp(16px,5vw,32px);width:100%}
  .cp-box--sm{max-width:880px}
  .cp-box--md{max-width:1100px}

  /* ══════════════════════════════════════
     HERO
  ══════════════════════════════════════ */
  .cp-hero{position:relative;height:clamp(480px,72vh,780px);overflow:hidden;display:flex;align-items:flex-end;background:var(--cp-g950)}
  .cp-hero__slides{position:absolute;inset:0}
  .cp-hero__slide{position:absolute;inset:0;opacity:0;transition:opacity 1.2s ease}
  .cp-hero__slide.active{opacity:1}
  .cp-hero__slide img{width:100%;height:100%;object-fit:cover;animation:cKen 14s ease-out forwards}
  .cp-hero__slide--empty{display:grid;place-items:center;background:linear-gradient(145deg,var(--cp-g950),var(--cp-g800))}
  .cp-hero__ov{position:absolute;inset:0;z-index:1;
    background:linear-gradient(180deg,rgba(5,46,22,.12) 0%,rgba(5,46,22,.3) 30%,rgba(5,46,22,.7) 65%,rgba(5,46,22,.95) 100%)}
  .cp-hero__ov2{position:absolute;inset:0;z-index:1;background:radial-gradient(ellipse at 60% 20%,rgba(34,197,94,.08),transparent 60%)}

  .cp-hero__dots{position:absolute;bottom:28px;left:50%;transform:translateX(-50%);display:flex;gap:6px;z-index:10}
  .cp-hero__dot{width:8px;height:8px;border-radius:4px;background:rgba(255,255,255,.35);border:none;cursor:pointer;transition:all .4s;padding:0}
  .cp-hero__dot.active{width:28px;background:var(--cp-g400)}

  .cp-hero__nav{position:absolute;top:0;left:0;right:0;z-index:10;padding:24px 0;background:linear-gradient(180deg,rgba(5,46,22,.5),transparent)}
  .cp-hero__crumbs{display:flex;align-items:center;gap:6px;list-style:none;font-size:12px;font-weight:600;letter-spacing:.06em;flex-wrap:wrap}
  .cp-hero__crumbs li{display:flex;align-items:center;gap:6px;color:rgba(255,255,255,.6)}
  .cp-hero__crumbs li:last-child{color:#fff}
  .cp-hero__crumbs li::after{content:"/";color:rgba(255,255,255,.2)}
  .cp-hero__crumbs li:last-child::after{display:none}
  .cp-hero__crumbs a{color:rgba(255,255,255,.65);text-decoration:none;transition:color .2s}
  .cp-hero__crumbs a:hover{color:var(--cp-g300)}

  .cp-hero__body{position:relative;z-index:5;padding-bottom:clamp(44px,7vh,80px);width:100%}
  .cp-hero__inner{max-width:720px}
  .cp-hero__badge{
    display:inline-flex;align-items:center;gap:8px;
    padding:8px 20px;background:rgba(34,197,94,.15);
    border:1px solid rgba(34,197,94,.25);backdrop-filter:blur(8px);
    border-radius:50px;font-size:11px;font-weight:800;letter-spacing:2px;
    text-transform:uppercase;color:var(--cp-g300);margin-bottom:18px;animation:cFadeIn .5s .3s both}
  .cp-hero__badge-dot{width:6px;height:6px;border-radius:50%;background:var(--cp-g400);animation:cPulse 2s ease-in-out infinite}
  .cp-hero__chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;animation:cFadeIn .5s .4s both}
  .cp-hero__h1{
    font-family:'Playfair Display',Georgia,serif;
    font-size:clamp(40px,7.5vw,88px);font-weight:900;line-height:.95;letter-spacing:-.03em;
    color:#fff;margin-bottom:16px;animation:cFadeUp .8s .5s both;text-shadow:0 3px 24px rgba(0,0,0,.25)}
  .cp-hero__sub{font-size:clamp(14px,1.6vw,17px);line-height:1.75;color:rgba(255,255,255,.8);max-width:540px;margin-bottom:28px;animation:cFadeUp .8s .7s both}
  .cp-hero__meta{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:28px;animation:cFadeUp .8s .85s both}
  .cp-hero__ctas{display:flex;gap:12px;flex-wrap:wrap;animation:cFadeUp .8s 1s both}
  .cp-hero__flag{
    position:absolute;bottom:clamp(24px,4vh,48px);right:clamp(16px,3vw,48px);
    z-index:10;width:68px;height:68px;border:3px solid rgba(255,255,255,.9);
    border-radius:18px;background:rgba(255,255,255,.1);backdrop-filter:blur(12px);
    overflow:hidden;display:grid;place-items:center;font-size:34px;
    box-shadow:0 10px 32px rgba(0,0,0,.35);animation:cScale .6s 1.1s both}
  .cp-hero__flag img{width:100%;height:100%;object-fit:cover}

  /* ══════════════════════════════════════
     CHIPS / BUTTONS
  ══════════════════════════════════════ */
  .cp-chip{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;font-size:11px;font-weight:700;border-radius:50px;white-space:nowrap;letter-spacing:.03em}
  .cp-chip--green{background:var(--cp-g600);color:#fff}
  .cp-chip--gold{background:#d97706;color:#fff}
  .cp-chip--glass{background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.2);backdrop-filter:blur(8px)}
  .cp-chip--dark{background:rgba(15,27,15,.6);color:#fff;backdrop-filter:blur(8px)}
  .cp-chip--soft{background:var(--cp-g50);color:var(--cp-g700);border:1px solid var(--cp-g200)}
  .cp-chip--soft-gray{background:var(--cp-n50);color:var(--cp-n700);border:1px solid var(--cp-n200)}

  .cp-btn{
    display:inline-flex;align-items:center;gap:8px;padding:12px 24px;
    font-family:'Inter',sans-serif;font-size:13px;font-weight:700;
    text-decoration:none;cursor:pointer;border:2px solid transparent;
    border-radius:50px;transition:all .35s cubic-bezier(.4,0,.2,1);white-space:nowrap}
  .cp-btn--primary{background:var(--cp-g600);color:#fff;border-color:var(--cp-g600);box-shadow:0 4px 14px rgba(22,163,74,.28)}
  .cp-btn--primary:hover{background:var(--cp-g700);transform:translateY(-2px);box-shadow:0 8px 24px rgba(22,163,74,.35)}
  .cp-btn--outline{background:transparent;color:var(--cp-n700);border-color:var(--cp-n200)}
  .cp-btn--outline:hover{border-color:var(--cp-g400);color:var(--cp-g700);background:var(--cp-g50);transform:translateY(-2px)}
  .cp-btn--ghost{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.2)}
  .cp-btn--ghost:hover{background:#fff;color:var(--cp-g800);border-color:#fff}
  .cp-btn--white{background:#fff;color:var(--cp-g800);border-color:#fff;box-shadow:0 4px 14px rgba(0,0,0,.1)}
  .cp-btn--white:hover{background:var(--cp-g50);transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.16)}
  .cp-btn--sm{padding:9px 18px;font-size:12px}
  .cp-btn--lg{padding:15px 30px;font-size:14px}
  .cp-btn--full{width:100%;justify-content:center}

  /* ══════════════════════════════════════
     SECTION LABEL & HEADER
  ══════════════════════════════════════ */
  .cp-label{
    display:inline-flex;align-items:center;gap:7px;
    padding:8px 20px;background:var(--cp-g50);border-radius:50px;
    color:var(--cp-g700);font-size:11px;font-weight:800;
    text-transform:uppercase;letter-spacing:2px;margin-bottom:16px;border:1px solid var(--cp-g200)}
  .cp-label--dark{background:rgba(255,255,255,.08);color:var(--cp-g300);border-color:rgba(255,255,255,.1)}
  .cp-shdr{margin-bottom:clamp(28px,4vw,44px)}
  .cp-shdr--c{text-align:center}
  .cp-shdr__h2{
    font-family:'Playfair Display',Georgia,serif;
    font-size:clamp(26px,4.5vw,46px);font-weight:700;
    color:var(--cp-n900);line-height:1.15;margin-bottom:14px}
  .cp-shdr--dark .cp-shdr__h2{color:#fff}
  .cp-shdr__sub{font-size:16px;color:var(--cp-n500);line-height:1.8;max-width:620px}
  .cp-shdr--c .cp-shdr__sub{margin:0 auto}
  .cp-shdr--dark .cp-shdr__sub{color:rgba(255,255,255,.6)}

  /* ══════════════════════════════════════
     STATS BAR
  ══════════════════════════════════════ */
  .cp-stats{background:var(--cp-w);border-bottom:1px solid var(--cp-n100);box-shadow:0 2px 16px rgba(0,0,0,.04);position:sticky;top:0;z-index:200}
  .cp-stats__inner{display:flex;overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none}
  .cp-stats__inner::-webkit-scrollbar{display:none}
  .cp-stat{display:flex;align-items:center;gap:12px;padding:16px 28px;border-right:1px solid var(--cp-n100);white-space:nowrap;flex-shrink:0;transition:background .25s;cursor:default}
  .cp-stat:last-child{border-right:none}
  .cp-stat:hover{background:var(--cp-g50)}
  .cp-stat__ic{width:38px;height:38px;background:var(--cp-g50);color:var(--cp-g700);display:grid;place-items:center;border-radius:12px;flex-shrink:0;border:1px solid var(--cp-g200);transition:all .25s}
  .cp-stat:hover .cp-stat__ic{background:var(--cp-g600);color:#fff;box-shadow:0 3px 10px rgba(22,163,74,.2)}
  .cp-stat__lbl{display:block;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:var(--cp-n400);margin-bottom:2px}
  .cp-stat__val{display:block;font-size:13px;font-weight:700;color:var(--cp-n900)}

  /* ══════════════════════════════════════
     SECTIONS
  ══════════════════════════════════════ */
  .cp-sec{padding:clamp(48px,6vw,80px) 0;position:relative;overflow:hidden}
  .cp-sec--white{background:var(--cp-woff)}
  .cp-sec--soft{background:var(--cp-g50)}
  .cp-sec--warm{background:var(--cp-wwarm)}
  .cp-sec--dark{background:linear-gradient(160deg,var(--cp-n900) 0%,var(--cp-g900) 40%,var(--cp-g800) 100%);background-size:200% 200%;animation:cGrad 12s ease infinite;color:#fff}

  /* ══════════════════════════════════════
     OVERVIEW — split card
  ══════════════════════════════════════ */
  .cp-ov{display:grid;background:var(--cp-w);border:1px solid var(--cp-n100);border-radius:24px;box-shadow:0 6px 24px rgba(0,0,0,.05);overflow:hidden;transition:box-shadow .4s}
  .cp-ov:hover{box-shadow:0 16px 48px rgba(22,163,74,.1)}
  @media(min-width:900px){.cp-ov{grid-template-columns:1fr 1fr}}
  .cp-ov__media{position:relative;min-height:360px;overflow:hidden;background:var(--cp-g950)}
  @media(max-width:899px){.cp-ov__media{aspect-ratio:16/9;min-height:unset}}
  .cp-ov__img{width:100%;height:100%;object-fit:cover;transition:transform 1s ease}
  .cp-ov:hover .cp-ov__img{transform:scale(1.05)}
  .cp-ov__media-ov{position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(5,46,22,.55))}
  .cp-ov__badges{position:absolute;top:16px;left:16px;display:flex;flex-wrap:wrap;gap:6px;z-index:2}
  .cp-ov__flag{position:absolute;bottom:16px;right:16px;width:60px;height:60px;border:3px solid rgba(255,255,255,.9);border-radius:16px;background:rgba(255,255,255,.1);backdrop-filter:blur(12px);overflow:hidden;display:grid;place-items:center;font-size:30px;box-shadow:0 6px 20px rgba(0,0,0,.25);z-index:2}
  .cp-ov__flag img{width:100%;height:100%;object-fit:cover}
  .cp-ov__body{padding:clamp(24px,3.5vw,44px);display:flex;flex-direction:column;gap:18px}
  .cp-ov__eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:var(--cp-g700)}
  .cp-ov__pulse{width:7px;height:7px;border-radius:50%;background:var(--cp-g500);animation:cPulse 2.5s ease-in-out infinite}
  .cp-ov__name{font-family:'Playfair Display',Georgia,serif;font-size:clamp(28px,4vw,48px);font-weight:900;line-height:1.05;color:var(--cp-n900)}
  .cp-ov__tagline{font-size:15px;line-height:1.75;color:var(--cp-n500);max-width:460px}
  .cp-ov__bar{width:48px;height:3px;border-radius:2px;background:linear-gradient(90deg,var(--cp-g500),var(--cp-g400))}
  .cp-ov__meta{display:flex;flex-wrap:wrap;gap:8px}
  .cp-ov__pill{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:var(--cp-g50);border:1px solid var(--cp-g200);color:var(--cp-g700);font-size:12px;font-weight:700;border-radius:50px}
  .cp-ov__actions{display:flex;gap:12px;flex-wrap:wrap;padding-top:16px;border-top:1px solid var(--cp-n100);margin-top:auto}

  /* ══════════════════════════════════════
     SLIDESHOW BLOCK
  ══════════════════════════════════════ */
  .cp-ss{position:relative;border-radius:24px;overflow:hidden;background:var(--cp-g950)}
  .cp-ss__slide{position:absolute;inset:0;opacity:0;transition:opacity 1s ease}
  .cp-ss__slide.active{opacity:1}
  .cp-ss__slide img{width:100%;height:100%;object-fit:cover;transition:transform 8s ease}
  .cp-ss__slide.active img{transform:scale(1.06)}
  .cp-ss__ov{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,46,22,.08) 0%,rgba(5,46,22,.75) 100%)}
  .cp-ss__body{position:absolute;bottom:0;left:0;right:0;padding:clamp(20px,3vw,36px);z-index:3}
  .cp-ss__nav{position:absolute;top:50%;z-index:5;width:36px;height:36px;border-radius:50%;border:none;background:rgba(255,255,255,.15);backdrop-filter:blur(6px);color:#fff;display:grid;place-items:center;cursor:pointer;transition:all .25s;opacity:0}
  .cp-ss:hover .cp-ss__nav{opacity:1}
  .cp-ss__nav:hover{background:var(--cp-g600)}
  .cp-ss__nav--prev{left:14px;transform:translateY(-50%)}
  .cp-ss__nav--next{right:14px;transform:translateY(-50%)}
  .cp-ss__dots{position:absolute;bottom:16px;right:clamp(20px,3vw,36px);display:flex;gap:5px;z-index:5}
  .cp-ss__dot{width:8px;height:8px;border-radius:4px;background:rgba(255,255,255,.35);transition:all .35s}
  .cp-ss__dot.active{width:24px;background:var(--cp-g400)}

  /* ══════════════════════════════════════
     ABOUT 2-COL
  ══════════════════════════════════════ */
  .cp-2col{display:grid;gap:clamp(32px,4vw,64px)}
  @media(min-width:1024px){.cp-2col{grid-template-columns:1fr 380px;align-items:start}}

  .cp-prose{font-size:16px;line-height:1.9;color:var(--cp-n500)}
  .cp-prose p{margin:0 0 18px}
  .cp-prose p:last-child{margin-bottom:0}

  .cp-quote{position:relative;border-left:4px solid var(--cp-g500);padding:24px 28px;background:var(--cp-g50);border-radius:0 20px 20px 0;margin-bottom:28px;overflow:hidden}
  .cp-quote::before{content:"\\201C";font-family:'Playfair Display',serif;font-size:100px;line-height:.8;color:var(--cp-g200);position:absolute;top:4px;left:16px;pointer-events:none}
  .cp-quote p{position:relative;z-index:1;font-family:'Playfair Display',Georgia,serif;font-size:16px;font-style:italic;line-height:1.8;color:var(--cp-n600);padding-top:20px;margin:0}

  /* ── Highlight cards ── */
  .cp-hl-grid{display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr))}
  .cp-hl{display:flex;align-items:flex-start;gap:14px;padding:20px;background:var(--cp-w);border:1px solid var(--cp-n100);border-radius:18px;transition:all .35s;box-shadow:0 1px 6px rgba(0,0,0,.03)}
  .cp-hl:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(22,163,74,.1);border-color:var(--cp-g200)}
  .cp-hl__num{min-width:32px;height:32px;background:var(--cp-g600);color:#fff;font-family:'Playfair Display',serif;font-size:13px;font-weight:700;display:grid;place-items:center;border-radius:10px;flex-shrink:0}
  .cp-hl p{margin:0;font-size:13px;line-height:1.65;color:var(--cp-n600);font-weight:500;padding-top:4px}

  /* ── Sidebar card ── */
  .cp-side{position:sticky;top:72px;display:flex;flex-direction:column;gap:16px}
  .cp-side-card{background:var(--cp-w);border:1px solid var(--cp-n100);border-radius:22px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.04);transition:box-shadow .35s}
  .cp-side-card:hover{box-shadow:0 12px 36px rgba(22,163,74,.1)}
  .cp-side-card__hdr{background:linear-gradient(145deg,var(--cp-g800),var(--cp-g950));padding:26px 24px;color:#fff;position:relative;overflow:hidden}
  .cp-side-card__hdr::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at 80% 100%,rgba(34,197,94,.18),transparent 60%)}
  .cp-side-card__icon{position:relative;z-index:1;width:44px;height:44px;background:rgba(255,255,255,.1);border-radius:14px;display:grid;place-items:center;color:var(--cp-g300);margin-bottom:12px}
  .cp-side-card__h4{position:relative;z-index:1;font-family:'Playfair Display',serif;font-size:18px;font-weight:700;margin-bottom:4px}
  .cp-side-card__desc{position:relative;z-index:1;font-size:12px;color:rgba(255,255,255,.65);line-height:1.6}
  .cp-side-card__body{padding:4px 0}
  .cp-side-card__row{display:flex;align-items:center;gap:12px;padding:12px 20px;border-bottom:1px solid var(--cp-n50);transition:background .2s}
  .cp-side-card__row:last-child{border-bottom:none}
  .cp-side-card__row:hover{background:var(--cp-g50)}
  .cp-side-card__row-ic{width:32px;height:32px;background:var(--cp-g50);color:var(--cp-g700);display:grid;place-items:center;border-radius:10px;flex-shrink:0;border:1px solid var(--cp-g200)}
  .cp-side-card__row-lbl{display:block;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:var(--cp-n400);margin-bottom:1px}
  .cp-side-card__row-val{display:block;font-size:13px;font-weight:700;color:var(--cp-n800)}
  .cp-side-card__btns{padding:18px 20px;display:flex;flex-direction:column;gap:8px;border-top:1px solid var(--cp-n100)}
  .cp-side-card__trust{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--cp-n100)}
  .cp-side-card__trust-item{display:flex;flex-direction:column;align-items:center;gap:5px;padding:14px 6px;background:var(--cp-w);text-align:center;transition:background .2s;cursor:default}
  .cp-side-card__trust-item:hover{background:var(--cp-g50)}
  .cp-side-card__trust-ic{color:var(--cp-g600)}
  .cp-side-card__trust-lbl{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.8px;color:var(--cp-n500)}

  /* ══════════════════════════════════════
     FACTS
  ══════════════════════════════════════ */
  .cp-facts{display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr))}
  .cp-fact{display:flex;align-items:flex-start;gap:14px;padding:20px;background:var(--cp-w);border:1px solid var(--cp-n100);border-radius:18px;transition:all .35s;box-shadow:0 1px 6px rgba(0,0,0,.03)}
  .cp-fact:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(22,163,74,.1);border-color:var(--cp-g200)}
  .cp-fact__ic{width:42px;height:42px;flex-shrink:0;background:var(--cp-g50);color:var(--cp-g700);display:grid;place-items:center;border-radius:12px;border:1px solid var(--cp-g200);transition:all .25s}
  .cp-fact:hover .cp-fact__ic{background:var(--cp-g600);color:#fff;box-shadow:0 3px 10px rgba(22,163,74,.2)}
  .cp-fact__lbl{display:block;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:var(--cp-n400);margin-bottom:4px}
  .cp-fact__val{display:block;font-size:13px;font-weight:700;color:var(--cp-n800);line-height:1.45}

  /* ══════════════════════════════════════
     BEST TIME
  ══════════════════════════════════════ */
  .cp-bt{display:grid;gap:clamp(16px,3vw,28px)}
  @media(min-width:768px){.cp-bt{grid-template-columns:380px 1fr}}
  .cp-bt__hero{background:linear-gradient(145deg,var(--cp-g800),var(--cp-g950));color:#fff;padding:clamp(28px,3.5vw,44px);border-radius:24px;position:relative;overflow:hidden;display:flex;flex-direction:column;gap:14px;box-shadow:0 12px 36px rgba(22,163,74,.18)}
  .cp-bt__hero::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 90% 90%,rgba(34,197,94,.18),transparent 55%)}
  .cp-bt__lbl{position:relative;z-index:1;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--cp-g300);display:inline-flex;align-items:center;gap:6px}
  .cp-bt__val{position:relative;z-index:1;font-family:'Playfair Display',serif;font-size:clamp(20px,2.5vw,28px);font-weight:700;line-height:1.2}
  .cp-bt__note{position:relative;z-index:1;font-size:14px;line-height:1.75;color:rgba(255,255,255,.72);margin:0}
  .cp-bt__cal{background:var(--cp-w);border:1px solid var(--cp-n100);border-radius:24px;padding:clamp(20px,3vw,36px);box-shadow:0 4px 20px rgba(0,0,0,.04)}
  .cp-bt__cal-lbl{display:block;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:var(--cp-n400);margin-bottom:16px}
  .cp-bt__months{display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-bottom:18px}
  @media(max-width:480px){.cp-bt__months{grid-template-columns:repeat(4,1fr)}}
  .cp-bt__mo{display:flex;flex-direction:column;align-items:center;gap:5px;padding:10px 2px;border-radius:12px;font-size:10px;font-weight:800;text-transform:uppercase;transition:all .25s;cursor:default}
  .cp-bt__mo--best{background:var(--cp-g600);color:#fff;box-shadow:0 3px 10px rgba(22,163,74,.25)}
  .cp-bt__mo--avoid{background:#fef2f2;color:#dc2626}
  .cp-bt__mo--ok{background:var(--cp-n50);color:var(--cp-n500)}
  .cp-bt__pip{width:4px;height:4px;border-radius:50%}
  .cp-bt__mo--best .cp-bt__pip{background:rgba(255,255,255,.5)}
  .cp-bt__mo--avoid .cp-bt__pip{background:#dc2626}
  .cp-bt__mo--ok .cp-bt__pip{background:var(--cp-n300)}
  .cp-bt__legend{display:flex;gap:14px;flex-wrap:wrap}
  .cp-bt__legend-item{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:var(--cp-n500)}
  .cp-bt__legend-dot{width:8px;height:8px;border-radius:50%}
  .cp-bt__legend-dot--best{background:var(--cp-g500)}
  .cp-bt__legend-dot--avoid{background:#dc2626}
  .cp-bt__legend-dot--ok{background:var(--cp-n300)}

  /* ══════════════════════════════════════
     ACTIVITIES
  ══════════════════════════════════════ */
  .cp-acts{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(min(100%,150px),1fr))}
  .cp-act{display:flex;flex-direction:column;align-items:center;gap:10px;padding:24px 12px;background:var(--cp-w);border:1px solid var(--cp-n100);border-radius:20px;text-align:center;cursor:default;transition:all .35s;box-shadow:0 1px 6px rgba(0,0,0,.03)}
  .cp-act:hover{transform:translateY(-6px);border-color:var(--cp-g200);box-shadow:0 14px 36px rgba(22,163,74,.12)}
  .cp-act__ring{width:52px;height:52px;background:var(--cp-g50);border:1px solid var(--cp-g200);color:var(--cp-g700);border-radius:50%;display:grid;place-items:center;transition:all .3s}
  .cp-act:hover .cp-act__ring{background:var(--cp-g600);color:#fff;border-color:var(--cp-g600);box-shadow:0 6px 18px rgba(22,163,74,.25);transform:scale(1.1)}
  .cp-act h4{margin:0;font-size:12px;font-weight:700;color:var(--cp-n700);line-height:1.4}

  /* ══════════════════════════════════════
     WILDLIFE
  ══════════════════════════════════════ */
  .cp-wild{display:flex;flex-wrap:wrap;gap:8px}
  .cp-wild__pill{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;background:var(--cp-w);border:1px solid var(--cp-n100);border-radius:50px;font-size:13px;font-weight:600;color:var(--cp-n700);transition:all .35s;cursor:default;box-shadow:0 1px 4px rgba(0,0,0,.03)}
  .cp-wild__pill:hover{border-color:var(--cp-g400);background:var(--cp-g50);color:var(--cp-g800);transform:translateY(-2px);box-shadow:0 6px 18px rgba(22,163,74,.1)}
  .cp-wild__dot{width:7px;height:7px;border-radius:50%;background:var(--cp-g500);flex-shrink:0}

  /* ══════════════════════════════════════
     GALLERY
  ══════════════════════════════════════ */
  .cp-gal{display:grid;gap:4px;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.06)}
  .cp-gal__item{position:relative;aspect-ratio:4/3;overflow:hidden;cursor:pointer;background:var(--cp-n200)}
  .cp-gal__item--hero{grid-column:span 2;grid-row:span 2;aspect-ratio:unset}
  @media(max-width:640px){.cp-gal__item--hero{grid-column:span 1;grid-row:span 1;aspect-ratio:4/3}}
  .cp-gal__item img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
  .cp-gal__item:hover img{transform:scale(1.08)}
  .cp-gal__item-ov{position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(5,46,22,.8));opacity:0;transition:opacity .3s;display:flex;align-items:flex-end;padding:14px}
  .cp-gal__item:hover .cp-gal__item-ov{opacity:1}
  .cp-gal__item-lbl{color:#fff;font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase}

  /* Lightbox */
  .cp-lb{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center}
  .cp-lb__bg{position:absolute;inset:0;background:rgba(5,10,7,.96);backdrop-filter:blur(10px)}
  .cp-lb__close{position:absolute;top:20px;right:20px;z-index:2;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#fff;display:grid;place-items:center;cursor:pointer;transition:background .2s}
  .cp-lb__close:hover{background:rgba(255,255,255,.2)}
  .cp-lb__img{position:relative;z-index:1;max-width:88vw;max-height:80vh;object-fit:contain;border-radius:16px;box-shadow:0 32px 80px rgba(0,0,0,.6)}
  .cp-lb__arr{position:absolute;top:50%;transform:translateY(-50%);z-index:2;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#fff;display:grid;place-items:center;cursor:pointer;transition:all .25s}
  .cp-lb__arr:hover{background:var(--cp-g600);border-color:var(--cp-g600)}
  .cp-lb__arr--p{left:16px}
  .cp-lb__arr--n{right:16px}
  .cp-lb__thumbs{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);z-index:2;display:flex;gap:5px;overflow-x:auto;max-width:90vw;padding:0 8px;scrollbar-width:none}
  .cp-lb__thumbs::-webkit-scrollbar{display:none}
  .cp-lb__thumb{width:48px;height:36px;border-radius:8px;overflow:hidden;border:2px solid transparent;cursor:pointer;flex-shrink:0;opacity:.5;transition:all .25s;background:none;padding:0}
  .cp-lb__thumb.active{border-color:var(--cp-g400);opacity:1}
  .cp-lb__thumb img{width:100%;height:100%;object-fit:cover}

  /* ══════════════════════════════════════
     DESTINATIONS
  ══════════════════════════════════════ */
  .cp-dests-hdr{display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:16px;margin-bottom:clamp(24px,3vw,40px)}
  .cp-dests-grid{display:grid;gap:clamp(16px,2.5vw,24px);grid-template-columns:repeat(auto-fill,minmax(min(100%,310px),1fr))}
  .cp-skel{background:var(--cp-w);border:1px solid var(--cp-n100);border-radius:20px;overflow:hidden}
  .cp-shimmer{background:linear-gradient(90deg,var(--cp-n50) 0%,var(--cp-n200) 50%,var(--cp-n50) 100%);background-size:200% 100%;animation:cShimmer 1.8s ease-in-out infinite}

  /* ══════════════════════════════════════
     GET THERE / MAP
  ══════════════════════════════════════ */
  .cp-gt{display:grid;gap:clamp(16px,3vw,28px)}
  @media(min-width:900px){.cp-gt--map{grid-template-columns:1fr 1fr}}
  .cp-gt__map{border-radius:20px;overflow:hidden;min-height:320px;box-shadow:0 4px 20px rgba(0,0,0,.06);border:1px solid var(--cp-n100)}
  .cp-gt__map iframe{width:100%;height:100%;min-height:320px;border:none}
  .cp-gt__rows{background:var(--cp-w);border:1px solid var(--cp-n100);border-radius:20px;overflow:hidden}
  .cp-gt__row{display:flex;align-items:center;gap:14px;padding:16px 20px;border-bottom:1px solid var(--cp-n50);transition:background .2s}
  .cp-gt__row:last-child{border-bottom:none}
  .cp-gt__row:hover{background:var(--cp-g50)}
  .cp-gt__row-ic{width:38px;height:38px;flex-shrink:0;background:var(--cp-g50);color:var(--cp-g700);display:grid;place-items:center;border-radius:12px;border:1px solid var(--cp-g200)}
  .cp-gt__row-lbl{display:block;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:var(--cp-n400);margin-bottom:2px}
  .cp-gt__row-val{display:block;font-size:13px;font-weight:700;color:var(--cp-n800)}
  .cp-gt__row-sub{display:block;font-size:11px;color:var(--cp-n400);margin-top:1px}

  /* ══════════════════════════════════════
     PRACTICAL INFO
  ══════════════════════════════════════ */
  .cp-prac{display:grid;gap:18px;grid-template-columns:repeat(auto-fill,minmax(min(100%,310px),1fr))}
  .cp-prac-card{background:var(--cp-w);border:1px solid var(--cp-n100);border-radius:22px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.03);transition:all .35s}
  .cp-prac-card:hover{box-shadow:0 12px 36px rgba(22,163,74,.1);transform:translateY(-3px)}
  .cp-prac-card__hdr{display:flex;align-items:center;gap:10px;padding:18px 20px;color:#fff}
  .cp-prac-card__hdr-ic{width:36px;height:36px;background:rgba(255,255,255,.15);border-radius:10px;display:grid;place-items:center;flex-shrink:0}
  .cp-prac-card__hdr-t{font-size:12px;font-weight:800;letter-spacing:.8px;text-transform:uppercase}
  .cp-prac-card__hdr--green{background:linear-gradient(135deg,var(--cp-g600),var(--cp-g700))}
  .cp-prac-card__hdr--amber{background:linear-gradient(135deg,#d97706,#b45309)}
  .cp-prac-card__hdr--blue{background:linear-gradient(135deg,#1d4ed8,#1e3a8a)}
  .cp-prac-card__hdr--purple{background:linear-gradient(135deg,#7c3aed,#5b21b6)}
  .cp-prac-card__body{padding:18px 20px}
  .cp-prac-card__note{font-size:13px;line-height:1.7;color:var(--cp-n500);margin:12px 0 0}
  .cp-prac-card__kv{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--cp-n50);font-size:12px;gap:12px}
  .cp-prac-card__kv:last-child{border-bottom:none}
  .cp-prac-card__kv span:first-child{color:var(--cp-n400);font-weight:600}
  .cp-prac-card__kv span:last-child{color:var(--cp-n800);font-weight:700;text-align:right}
  .cp-prac-card__list{list-style:none;display:flex;flex-direction:column;gap:8px}
  .cp-prac-card__list li{display:flex;align-items:flex-start;gap:8px;font-size:13px;line-height:1.6;color:var(--cp-n600)}
  .cp-prac-card__list li::before{content:"";width:5px;height:5px;background:var(--cp-g500);border-radius:50%;flex-shrink:0;margin-top:6px}
  .cp-prac-card__group{margin-bottom:14px}
  .cp-mini-lbl{display:block;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:var(--cp-n400);margin-bottom:8px}
  .cp-chip-row{display:flex;flex-wrap:wrap;gap:6px}

  /* ══════════════════════════════════════
     TIPS
  ══════════════════════════════════════ */
  .cp-tips{display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr))}
  .cp-tip{display:flex;align-items:flex-start;gap:14px;padding:22px;background:var(--cp-w);border:1px solid var(--cp-n100);border-radius:18px;transition:all .35s;box-shadow:0 1px 6px rgba(0,0,0,.03)}
  .cp-tip:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(22,163,74,.1);border-color:var(--cp-g200)}
  .cp-tip__num{min-width:36px;height:36px;flex-shrink:0;background:var(--cp-g600);color:#fff;font-family:'Playfair Display',serif;font-size:14px;font-weight:700;display:grid;place-items:center;border-radius:10px;box-shadow:0 3px 10px rgba(22,163,74,.2)}
  .cp-tip__txt{font-size:14px;line-height:1.75;color:var(--cp-n600);font-weight:500;padding-top:4px}

  /* ══════════════════════════════════════
     REVIEWS
  ══════════════════════════════════════ */
  .cp-rev-agg{display:flex;gap:clamp(20px,3vw,44px);align-items:center;background:var(--cp-w);border:1px solid var(--cp-n100);border-radius:24px;padding:clamp(24px,3vw,40px);margin-bottom:32px;box-shadow:0 4px 20px rgba(0,0,0,.04);flex-wrap:wrap}
  .cp-rev-agg__score{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;min-width:90px}
  .cp-rev-agg__num{font-family:'Playfair Display',serif;font-size:52px;font-weight:900;line-height:1;color:var(--cp-g600)}
  .cp-rev-agg__stars{display:flex;gap:3px}
  .cp-rev-agg__total{font-size:11px;font-weight:700;color:var(--cp-n400);letter-spacing:.8px}
  .cp-rev-agg__bars{flex:1;min-width:180px;display:flex;flex-direction:column;gap:7px}
  .cp-revbar{display:flex;align-items:center;gap:9px}
  .cp-revbar__lbl{font-size:11px;font-weight:700;color:var(--cp-n500);width:24px}
  .cp-revbar__track{flex:1;height:6px;background:var(--cp-n50);border-radius:50px;overflow:hidden}
  .cp-revbar__fill{height:100%;background:linear-gradient(90deg,var(--cp-g600),var(--cp-g400));border-radius:50px;animation:cBarFill .8s ease both}
  .cp-revbar__pct{font-size:10px;font-weight:700;color:var(--cp-n400);width:30px;text-align:right}

  .cp-revs{display:grid;gap:18px;grid-template-columns:repeat(auto-fill,minmax(min(100%,310px),1fr))}
  .cp-rev{background:var(--cp-w);border:1px solid var(--cp-n100);border-radius:22px;padding:24px;box-shadow:0 2px 10px rgba(0,0,0,.03);transition:all .35s;position:relative;overflow:hidden}
  .cp-rev::before{content:"\\201C";position:absolute;top:14px;right:22px;font-size:64px;font-family:Georgia,serif;color:var(--cp-g100);line-height:1;pointer-events:none}
  .cp-rev:hover{transform:translateY(-4px);box-shadow:0 14px 36px rgba(22,163,74,.1);border-color:var(--cp-g200)}
  .cp-rev__top{display:flex;align-items:center;gap:12px;margin-bottom:14px}
  .cp-rev__avatar{width:42px;height:42px;border-radius:50%;overflow:hidden;background:var(--cp-g100);display:grid;place-items:center;font-size:16px;font-weight:800;color:var(--cp-g700);flex-shrink:0;border:2px solid var(--cp-g200)}
  .cp-rev__avatar img{width:100%;height:100%;object-fit:cover}
  .cp-rev__name{font-size:14px;font-weight:700;color:var(--cp-n900)}
  .cp-rev__meta{font-size:12px;color:var(--cp-n400);margin-top:1px}
  .cp-rev__stars{display:flex;gap:2px;margin-bottom:10px}
  .cp-rev__title{font-family:'Playfair Display',serif;font-size:15px;font-weight:700;font-style:italic;color:var(--cp-n800);margin:0 0 8px;position:relative;z-index:1}
  .cp-rev__body{font-size:14px;line-height:1.8;color:var(--cp-n600);margin:0;position:relative;z-index:1;font-style:italic}
  .cp-rev__foot{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--cp-n400);font-weight:600;margin-top:14px;padding-top:14px;border-top:1px solid var(--cp-n100)}

  /* ══════════════════════════════════════
     FAQ
  ══════════════════════════════════════ */
  .cp-faqs{display:flex;flex-direction:column;gap:10px}
  .cp-faq{background:var(--cp-w);border:1px solid var(--cp-n100);border-radius:18px;overflow:hidden;box-shadow:0 1px 6px rgba(0,0,0,.03);transition:all .25s}
  .cp-faq:hover{border-color:var(--cp-g200)}
  .cp-faq.open{border-color:var(--cp-g300);box-shadow:0 8px 24px rgba(22,163,74,.08)}
  .cp-faq__btn{display:flex;align-items:center;gap:14px;width:100%;padding:20px 22px;background:none;border:none;cursor:pointer;font-family:'Inter',sans-serif;font-size:14px;font-weight:700;color:var(--cp-n800);text-align:left;transition:color .2s}
  .cp-faq.open .cp-faq__btn{color:var(--cp-g700)}
  .cp-faq__num{min-width:30px;height:30px;flex-shrink:0;background:var(--cp-g50);color:var(--cp-g700);border-radius:10px;font-size:11px;font-weight:900;display:grid;place-items:center;font-family:'Playfair Display',serif;border:1px solid var(--cp-g200);transition:all .25s}
  .cp-faq.open .cp-faq__num{background:var(--cp-g600);color:#fff;border-color:var(--cp-g600)}
  .cp-faq__text{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis}
  .cp-faq__tog{width:28px;height:28px;border-radius:50%;background:var(--cp-n50);color:var(--cp-n500);display:grid;place-items:center;flex-shrink:0;transition:all .35s}
  .cp-faq.open .cp-faq__tog{background:var(--cp-g600);color:#fff;transform:rotate(45deg)}
  .cp-faq__ans{max-height:0;overflow:hidden;transition:max-height .4s cubic-bezier(.4,0,.2,1)}
  .cp-faq.open .cp-faq__ans{max-height:500px}
  .cp-faq__ans-inner{padding:0 22px 20px 66px;font-size:14px;line-height:1.85;color:var(--cp-n500)}
  @media(max-width:640px){.cp-faq__ans-inner{padding-left:22px}}

  /* ══════════════════════════════════════
     ALERTS
  ══════════════════════════════════════ */
  .cp-alert{display:flex;align-items:flex-start;gap:14px;padding:18px 20px;border-radius:18px;border:1.5px solid}
  .cp-alert--amber{background:#fffbeb;border-color:#fcd34d;color:#92400e}
  .cp-alert--red{background:#fef2f2;border-color:#fca5a5;color:#991b1b}
  .cp-alert__title{font-size:13px;font-weight:800;margin-bottom:3px}
  .cp-alert__text{font-size:13px;line-height:1.65;opacity:.85}

  /* ══════════════════════════════════════
     CTA BANNER
  ══════════════════════════════════════ */
  .cp-cta{position:relative;overflow:hidden;background:linear-gradient(160deg,var(--cp-n900),var(--cp-g900) 40%,var(--cp-g800));background-size:200% 200%;animation:cGrad 12s ease infinite;padding:clamp(48px,7vw,80px) 0;text-align:center;color:#fff}
  .cp-cta__orbs{position:absolute;inset:0;pointer-events:none;overflow:hidden}
  .cp-cta__orb{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(34,197,94,.08),transparent 70%);animation:cOrb 10s ease-in-out infinite}
  .cp-cta__inner{position:relative;z-index:1;max-width:720px;margin:0 auto;padding:0 clamp(16px,5vw,32px)}
  .cp-cta__h2{font-family:'Playfair Display',Georgia,serif;font-size:clamp(28px,5vw,50px);font-weight:800;line-height:1.12;margin-bottom:18px}
  .cp-cta__desc{font-size:17px;line-height:1.8;color:rgba(255,255,255,.72);max-width:580px;margin:0 auto 36px}
  .cp-cta__btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-bottom:36px}
  .cp-cta__trust{display:flex;gap:24px;justify-content:center;flex-wrap:wrap;border-top:1px solid rgba(255,255,255,.08);padding-top:28px}
  .cp-cta__trust-item{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:1px}

  /* ══════════════════════════════════════
     LOADING / ERROR
  ══════════════════════════════════════ */
  .cp-loading{min-height:100vh;display:grid;place-items:center;background:var(--cp-w)}
  .cp-error{min-height:100vh;display:grid;place-items:center;background:var(--cp-w);padding:20px}
  .cp-error__box{max-width:440px;text-align:center;padding:52px 36px;background:var(--cp-w);border:1px solid #fecaca;border-radius:24px;box-shadow:0 16px 48px rgba(239,68,68,.08)}
  .cp-error__ic{width:72px;height:72px;background:#fef2f2;border-radius:50%;display:grid;place-items:center;margin:0 auto 20px;color:#ef4444}
  .cp-error__h3{font-family:'Playfair Display',serif;font-size:24px;font-weight:700;color:#991b1b;margin-bottom:10px}
  .cp-error__p{font-size:14px;line-height:1.7;color:var(--cp-n500);margin-bottom:28px}
  .cp-error__btns{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}

  /* ══════════════════════════════════════
     RESPONSIVE
  ══════════════════════════════════════ */
  @media(max-width:1023px){.cp-2col{grid-template-columns:1fr!important}}
  @media(max-width:640px){
    .cp-hero__flag{width:56px;height:56px;font-size:28px;border-radius:14px}
    .cp-hero__ctas{flex-direction:column}
    .cp-btn{width:100%;justify-content:center}
    .cp-ov__actions{flex-direction:column}
    .cp-stats__inner{gap:0}
    .cp-stat{padding:12px 16px}
    .cp-cta__btns{flex-direction:column;align-items:center}
    .cp-cta__btns .cp-btn{width:auto}
    .cp-faq__ans-inner{padding-left:22px}
  }
  @media(prefers-reduced-motion:reduce){.cp *,.cp *::before,.cp *::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
`;

export function injectStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("cp-styles")) return;
  const s = document.createElement("style");
  s.id = "cp-styles";
  s.textContent = PAGE_CSS;
  document.head.appendChild(s);
}