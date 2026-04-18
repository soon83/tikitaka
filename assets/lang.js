/*
 * 언어 토글 — 페이지 간 localStorage 로 선택 유지.
 *
 * HTML 패턴:
 *   - 컨텐츠 섹션을 [lang="en"] 또는 [lang="ko"] 로 감싼다 (HTML 표준 lang 속성)
 *   - 헤더 우상단 두 버튼: [data-set-lang="en"], [data-set-lang="ko"]
 *   - body[data-lang="..."] 셀렉터로 비활성 언어를 CSS 가 숨김
 *
 * 기본값은 영어. 사용자가 한 번 누르면 그 선택이 다른 페이지로도 전파.
 */
(function () {
  var STORAGE_KEY = 'tikitaka-lang';
  var LEGACY_STORAGE_KEY = 'lightkey-lang';
  var DEFAULT = 'en';
  var ALLOWED = ['en', 'ko'];

  function getLang() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      if (!v) {
        // LightKey → TikiTaka 리브랜딩: 이전 키에 저장된 선택 1회성 이관
        var legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacy && ALLOWED.indexOf(legacy) >= 0) {
          localStorage.setItem(STORAGE_KEY, legacy);
          try { localStorage.removeItem(LEGACY_STORAGE_KEY); } catch (_) {}
          v = legacy;
        }
      }
      return ALLOWED.indexOf(v) >= 0 ? v : DEFAULT;
    } catch (_) {
      return DEFAULT;
    }
  }

  function setLang(lang) {
    if (ALLOWED.indexOf(lang) < 0) return;
    document.body.setAttribute('data-lang', lang);
    document.documentElement.setAttribute('lang', lang);
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) {}
    document.querySelectorAll('[data-set-lang]').forEach(function (btn) {
      var active = btn.getAttribute('data-set-lang') === lang;
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      btn.classList.toggle('is-active', active);
    });
  }

  function init() {
    setLang(getLang());
    document.querySelectorAll('[data-set-lang]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setLang(btn.getAttribute('data-set-lang'));
      });
    });
  }

  // body 가 파싱된 직후 즉시 적용 — FOUC 방지
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
