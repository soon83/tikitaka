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

/*
 * 언어별 앵커 라우팅.
 *
 * 문제: 가격 / 환불 같은 섹션은 EN / KO 양쪽 본문에 각각 존재하지만 id 는
 * 한쪽에만 붙어 있다 (HTML id 중복 불가). 현재 언어가 한국어인데 EN 전용 id
 * 로 점프하면 display:none 된 요소로 점프해 스크롤이 동작하지 않는다.
 *
 * 해결: 양쪽 섹션에 공통으로 `data-anchor="이름"` 을 부여하고, 같은 페이지
 * 내 `#이름` 앵커 클릭을 가로채 현재 보이는(offsetParent 존재) 섹션으로
 * 부드럽게 스크롤. 다른 페이지로 이동하는 `terms.html#이름` 같은 링크는
 * 브라우저 네이티브 이동에 맡기고, 그 페이지 로드 시 hash 를 다시 읽어
 * 동일한 규칙으로 스크롤.
 */
(function () {
  function findVisible(name) {
    var nodes = document.querySelectorAll('[data-anchor="' + name + '"]');
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].offsetParent !== null) return nodes[i];
    }
    // data-anchor 로 못 찾으면 id 로 fallback
    return document.getElementById(name);
  }

  function scrollTo(name) {
    var el = findVisible(name);
    if (!el) return false;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return true;
  }

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a[href]');
    if (!a) return;

    /*
     * 같은 페이지 내 앵커 판단:
     *   1) href 가 "#xxx" 로 시작하는 순수 해시
     *   2) href 가 "index.html#xxx" 같은 형태인데 그 경로가 현재 페이지와
     *      동일한 경우 — 브라우저 기본 동작은 언어 상관없이 첫 id 로만
     *      점프해서 한국어 모드에선 숨겨진 요소로 점프해 스크롤 안 됨.
     *      JS 로 visible 요소를 직접 찾아 스크롤.
     * 위 두 케이스 모두 intercept. 다른 페이지로의 이동은 브라우저 기본
     * 처리에 맡기고, 해당 페이지 로드 시 handleInitialHash 에서 처리.
     */
    var hash = null;
    var href = a.getAttribute('href');
    if (href && href.charAt(0) === '#' && href.length > 1) {
      hash = href.slice(1);
    } else if (a.hash && a.pathname === location.pathname && a.host === location.host) {
      hash = a.hash.slice(1); // '#' 제외
    }

    if (!hash) return;
    if (scrollTo(hash)) {
      e.preventDefault();
      // URL 해시는 유지해서 새로고침 / 공유 시에도 위치 재현 가능하도록
      if (history.replaceState) history.replaceState(null, '', '#' + hash);
    }
  });

  function handleInitialHash() {
    if (!location.hash || location.hash.length < 2) return;
    // 레이아웃 안정화 후 스크롤 (이미지 로딩 등으로 위치가 흔들리지 않도록 약간 지연)
    setTimeout(function () { scrollTo(location.hash.slice(1)); }, 50);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleInitialHash);
  } else {
    handleInitialHash();
  }
})();
