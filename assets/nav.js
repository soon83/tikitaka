/*
 * 모바일 내비게이션 드로어 — 우측 슬라이드.
 *
 * HTML 패턴:
 *   - button.nav-toggle  (햄버거 버튼, aria-controls="nav-menu")
 *   - nav.nav-links#nav-menu  (링크 목록 = 드로어 본체)
 *   - .nav-backdrop  (배경 어둡게)
 *
 * body.nav-open 클래스가 열린 상태를 나타냄 — CSS 는 이 클래스로 전환.
 * 링크 클릭 / ESC / 배경 클릭 / 데스크톱 리사이즈 시 자동 닫힘.
 */
(function () {
  var body = document.body;
  var btn = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav-menu');
  var backdrop = document.querySelector('.nav-backdrop');

  if (!btn || !nav) return;

  function open() {
    body.classList.add('nav-open');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', '메뉴 닫기');
  }
  function close() {
    body.classList.remove('nav-open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', '메뉴 열기');
  }
  function toggle() {
    if (body.classList.contains('nav-open')) close();
    else open();
  }

  btn.addEventListener('click', toggle);

  if (backdrop) backdrop.addEventListener('click', close);

  // 드로어 내부 링크를 누르면 자동으로 닫음 (앵커/해시 이동 시 UX 자연스럽게)
  nav.addEventListener('click', function (e) {
    var t = e.target;
    if (t && t.tagName === 'A') close();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && body.classList.contains('nav-open')) close();
  });

  // 모바일 → 데스크톱 리사이즈 시 상태 초기화 (드로어가 떠있을 일 없음)
  var mql = window.matchMedia('(min-width: 681px)');
  var onChange = function (e) { if (e.matches) close(); };
  if (mql.addEventListener) mql.addEventListener('change', onChange);
  else if (mql.addListener) mql.addListener(onChange);
})();
