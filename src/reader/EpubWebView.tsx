import * as React from 'react';
import { Button, Platform, Text, View } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { useIOSColors } from 'src/theme/useIOSColor';
import {Level, useVocab} from "src/store/vocab";

type Props = {
  content: string;
  currentPage?: number;
  totalPages?: number;
  slicedContent: string[];
  onWord?: (word: string) => void;
  onProgress?: (page: number) => void;
  bg?: string;
  fg?: string;
};

export default function EpubWebView({
                                      content,
                                      onProgress,
                                      onWord,
                                      currentPage = 1,
                                      totalPages = 1,
                                      slicedContent,
                                      bg = '#FFFFFF',
                                      fg = '#000000',
                                    }: Props) {
  const ref = React.useRef<WebView>(null);
  const c = useIOSColors();

  // ---- Pull vocab levels from Zustand and serialize a lean map: { lemma: level }
  const items = useVocab(s => s.items);
  const vocabMap = React.useMemo(() => {
    const out: Record<string, Level> = {};
    // keep it small: only keep entries that are explicitly set
    for (const k in items) {
      const lv = items[k]?.level;
      if (lv !== undefined && lv !== null) out[k] = lv as Level;
    }
    return out;
  }, [items]);

  const html = React.useMemo(() => {
    const pageHtml = slicedContent?.[currentPage - 1] ?? '';
    // If plaintext, paragraphize
    const bodyHtml = pageHtml
      .split(/\n{2,}/)
      .map(p => `<p>${escapeHtml(p).replace(/\n/g, '<br/>')}</p>`)
      .join('');

    // Serialize vocab as JSON for the page
    const VOCAB_JSON = JSON.stringify(vocabMap); // { "word": level, ... }

    return `<html class="${isDarkHex(bg) ? 'dark' : 'light'}">
<html>
<head>
<meta charset="utf-8" />
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
/>
<style>
:root {
  --bg: ${bg};
  --fg: ${fg};
  --sz: ${16}px;
  --lh: ${24}px;

  /* base hues (iOS palette) */
  --lv0: 255,59,48;   /* red    */
  --lv1: 255,149,0;   /* orange */
  --lv2: 255,204,0;   /* yellow */
  --lv3: 52,199,89;   /* green  */
  --lv4: 52,199,89;   /* same as lv3 */
  
  --tintA: ${isDarkHex(bg) ? 0.24 : 0.16};
  --ringA: ${isDarkHex(bg) ? 0.36 : 0.28};
}

/* Word chip — neutral defaults */
.w {
  border-radius: 8px;
  padding: 0 3px;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
  color: var(--fg); /* keep paragraph color */
}

/* ---------- LIGHT MODE ---------- */
html.light .lv0 { background: rgba(var(--lv0), .24); box-shadow: inset 0 0 0 1px rgba(var(--lv0), .55); }
html.light .lv1 { background: rgba(var(--lv1), .22); box-shadow: inset 0 0 0 1px rgba(var(--lv1), .50); }
html.light .lv2 { background: rgba(var(--lv2), .22); box-shadow: inset 0 0 0 1px rgba(var(--lv2), .48); }
html.light .lv3 { background: rgba(var(--lv3), .22); box-shadow: inset 0 0 0 1px rgba(var(--lv3), .50); }
html.light .lv4 { background: rgba(var(--lv4), .001); box-shadow: inset 0 0 0 1px rgba(var(--lv4), 0); }

/* ---------- DARK MODE ---------- */
/* In dark, use a *lighter* fill + subtle white inner stroke for readability */
html.dark .lv0 { background: rgba(var(--lv0), .36); box-shadow: inset 0 0 0 1px rgba(255,255,255,.18); }
html.dark .lv1 { background: rgba(var(--lv1), .34); box-shadow: inset 0 0 0 1px rgba(255,255,255,.18); }
html.dark .lv2 { background: rgba(var(--lv2), .34); box-shadow: inset 0 0 0 1px rgba(255,255,255,.18); }
html.dark .lv3 { background: rgba(var(--lv3), .34); box-shadow: inset 0 0 0 1px rgba(255,255,255,.18); }
html.dark .lv4 { background: rgba(var(--lv4), .001); box-shadow: inset 0 0 0 1px rgba(255,255,255, 0); }

/* Don’t color inside links/code */
.lv4 { background: transparent; box-shadow: none; }
html.dark .w { text-shadow: 0 1px 0 rgba(0,0,0,.35); }

  html, body {
    background: var(--bg);
    color: var(--fg);
    margin: 0; 
    padding: 0;
    -webkit-text-size-adjust: 100%;
  }
  body {
    padding: 16px 16px 48px 16px;
    font-size: var(--sz);
    line-height: var(--lh);
    font-family: -apple-system, system-ui, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif;
  }
  p { margin: 0 0 16px 0; }
  ::selection { background: rgba(255, 204, 0, .35); }
  
  /* Gapless word highlight */
  .w {
    display: inline;              /* make sure it’s inline, not inline-block */
    line-height: inherit;
    border-radius: 6px;
    padding: 0;               /* tiny pad just for a soft edge */
    margin: 0 -0.35px;             /* pull neighbors slightly in to kill visible gaps */
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
    color: var(--fg);
  }
  
  /* tighten joins between consecutive wrapped tokens (e.g., word + punctuation) */
  .w + .w { margin-left: -0.5px; }


  .lv0 { background: rgba(var(--lv0), var(--tintA)); box-shadow: inset 0 0 0 0.5px rgba(var(--lv0), var(--ringA)); }
  .lv1 { background: rgba(var(--lv1), var(--tintA)); box-shadow: inset 0 0 0 0.5px rgba(var(--lv1), var(--ringA)); }
  .lv2 { background: rgba(var(--lv2), var(--tintA)); box-shadow: inset 0 0 0 0.5px rgba(var(--lv2), var(--ringA)); }
  .lv3 { background: rgba(var(--lv3), var(--tintA)); box-shadow: inset 0 0 0 0.5px rgba(var(--lv3), var(--ringA)); }
  .lv4 { background: rgba(var(--lv4), var(--tintA)); box-shadow: inset 0 0 0 0.5px rgba(var(--lv4), var(--ringA)); }

  /* Avoid coloring inside links/code/etc. Adjust as needed. */
  a .w, code .w, pre .w { background: transparent; box-shadow: none; }
</style>
</head>
<body id="container">${bodyHtml}</body>

<script>
(function(){  
  const RN = window.ReactNativeWebView;
  const VOCAB = ${VOCAB_JSON}; // { lemma -> level }

  function send(type, payload){
    try { RN.postMessage(JSON.stringify({ type, payload })); } catch(e){}
  }

  // Normalize tokens to your lemma keys
  function norm(s){
    return (s || '')
      .toLowerCase()
      .normalize('NFC'); // keep it simple; your store keys are lowercase
  }

  // Regex to capture words (letters/numbers & apostrophes)
  const WORD_RE = /[\\p{L}\\p{N}'’]+/gu;

  // Wrap text nodes under container <p> elements
  function wrapWords(root){
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        // skip if parent already a word span
        const p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        const tag = p.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'CODE' || tag === 'PRE') return NodeFilter.FILTER_REJECT;
        if (p.classList && p.classList.contains('w')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const toProcess = [];
    while (walker.nextNode()) toProcess.push(walker.currentNode);

    for (const textNode of toProcess) {
      const text = textNode.nodeValue;
      let lastIndex = 0;
      const frag = document.createDocumentFragment();

      for (const match of text.matchAll(WORD_RE)) {
          const i = match.index || 0;
          const j = i + match[0].length;
        
          if (i > lastIndex) frag.appendChild(document.createTextNode(text.slice(lastIndex, i)));
        
          const raw = match[0];
          const key = norm(raw);
          const level = VOCAB[key];
        
          const span = document.createElement('span');
          // always wrap the token
          span.className = 'w' + (typeof level === 'number' ? (' lv' + level) : '');
          span.dataset.k = key;
          span.textContent = raw;
          frag.appendChild(span);
        
          lastIndex = j;
        }

      // trailing text
      if (lastIndex < text.length) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex)));
      }

      textNode.parentNode && textNode.parentNode.replaceChild(frag, textNode);
    }
  }

  // Initial wrap once DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('container');
    if (container) wrapWords(container);
  });
})();
</script>
</html>`;
  }, [content, bg, fg, currentPage]);


  const onMessage = React.useCallback(
    (e: WebViewMessageEvent) => {
      try {
        const msg = JSON.parse(e.nativeEvent.data);
        if (msg?.type === 'word' && msg.payload?.word && onWord) {
          onWord(msg.payload.word);
        }
      } catch {}
    },
    [onWord]
  );

  const [docReady, setDocReady] = React.useState(false);

  // when page changes, reset readiness (optional but clean)
  React.useEffect(() => { setDocReady(false); }, [currentPage]);

  React.useEffect(() => {
    if (!docReady || !ref.current) return;

    // vocabMap is already lean: { lemma: level }
    const js = `
    (function(){
      var VOCAB = ${JSON.stringify(vocabMap)};
      var nodes = document.querySelectorAll('span.w');
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        var k = el.dataset.k;
        var lv = VOCAB[k];
        if (lv === undefined || lv === null) continue;
        el.className = 'w lv' + lv; // lv4 stays transparent via CSS
      }
      true;
    })();
  `;
    ref.current.injectJavaScript(js);
  }, [vocabMap, docReady]);

  return (
    <>
      <WebView
        ref={ref}
        originWhitelist={['*']}
        source={{ html }}
        onMessage={onMessage}
        onLoadEnd={() => {
          setDocReady(true);
          // kick a first recolor pass using current map
          const js = `
    (function(){
      var VOCAB = ${JSON.stringify(vocabMap)};
      var nodes = document.querySelectorAll('span.w');
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i], lv = VOCAB[el.dataset.k];
        if (lv === undefined) continue;
        el.className = 'w lv' + lv;
      }
      true;
    })();
  `;
          ref.current?.injectJavaScript(js);
        }}

        bounces={false}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        decelerationRate={Platform.OS === 'ios' ? 'normal' : undefined}
        dataDetectorTypes="none"
        injectedJavaScriptBeforeContentLoaded={`
  (function(){
    if (window.__WORD_LOOKUP__) return;
    window.__WORD_LOOKUP__ = true;

    const RN = window.ReactNativeWebView;
    const WORD_RE = /[\\p{L}\\p{N}'’]+/u;

    function send(type, payload){
      try { RN.postMessage(JSON.stringify({ type, payload })); } catch(e){}
    }

    function closestWordEl(node){
      while (node && node.nodeType === 1) { // ELEMENT_NODE
        if (node.classList && node.classList.contains('w')) return node;
        node = node.parentElement;
      }
      return null;
    }

    function norm(s){ return (s||'').normalize('NFC'); }

    function getWordFromPoint(x, y){
      const range = document.caretRangeFromPoint
        ? document.caretRangeFromPoint(x, y)
        : null;
      if (!range || !range.startContainer) return null;

      // If we pressed on a wrapped word, use it directly
      const el = closestWordEl(range.startContainer.nodeType === Node.ELEMENT_NODE
        ? range.startContainer
        : range.startContainer.parentElement);
      if (el && el.textContent) {
        return { word: norm(el.textContent), key: el.dataset ? el.dataset.k : undefined };
      }

      // Otherwise expand within the text node
      if (range.startContainer.nodeType !== Node.TEXT_NODE) return null;
      const txt = range.startContainer.textContent || '';
      const idx = range.startOffset;

      // Find left & right word boundaries around idx
      let L = idx, R = idx;
      while (L > 0 && WORD_RE.test(txt[L-1])) L--;
      while (R < txt.length && WORD_RE.test(txt[R])) R++;

      const token = txt.slice(L, R);
      if (!token || !WORD_RE.test(token)) return null;
      return { word: norm(token), key: undefined };
    }

    let longTimer = null;
    document.addEventListener('touchstart', (e) => {
      const t = e.targetTouches && e.targetTouches[0];
      if (!t) return;

      longTimer = setTimeout(() => {
        // Always compute the full word from the touch point
        const res = getWordFromPoint(t.clientX, t.clientY);
        if (res && res.word) {
          send('word', { word: res.word, key: res.key });
        }
        // Clear selection to avoid partial subsequent selections
        try {
          const s = window.getSelection && window.getSelection();
          if (s && s.removeAllRanges) s.removeAllRanges();
        } catch (e) {}
      }, 500);
    }, { passive: true });

    document.addEventListener('touchend', () => {
      if (longTimer) { clearTimeout(longTimer); longTimer = null; }
    }, { passive: true });
  })();
  true;
`}
      />
      <View style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: c.background,
      }}>
        <Button title={'Prev'} onPress={() => {
          if (currentPage === 1) return;
          onProgress?.(currentPage - 1);
        }} />
        <Text style={{ color: c.tint }}>{currentPage} / {totalPages}</Text>
        <Button title={'Next'} onPress={() => {
          if (currentPage === slicedContent?.length) return;
          onProgress?.(currentPage + 1);
        }} />
      </View>
    </>
  );
}

/** Utilities */
function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function isDarkHex(hex: string) {
  // crude luminance check for bg to decide tint strength
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  // perceived luminance
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return L < 128;
}
