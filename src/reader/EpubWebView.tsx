import * as React from 'react';
import { Platform } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';

type Props = {
  /** Already-parsed book content as a single HTML string or plain text */
  content: string;
  /** Pixel offset to restore (from store) */
  restoreY?: number;
  /** Called when user long-presses a word */
  onWord?: (word: string) => void;
  /** Called with { y, p } as the reader scrolls; p is 0..1 */
  onProgress?: (payload: { y: number; p: number }) => void;
  /** Background/text colors to match your theme */
  bg?: string;
  fg?: string;
  fontSize?: number;        // e.g. 16
  lineHeight?: number;      // e.g. 24
};

export default function EpubWebView({
                                      content,
                                      restoreY = 0,
                                      onWord,
                                      onProgress,
                                      bg = '#FFFFFF',
                                      fg = '#000000',
                                      fontSize = 16,
                                      lineHeight = 24,
                                    }: Props) {
  const ref = React.useRef<WebView>(null);

  const html = React.useMemo(() => {
    // If content is plain text, escape and wrap paragraphs
    const isLikelyHtml = /<\/?[a-z][\s\S]*>/i.test(content);
    const bodyHtml = isLikelyHtml
      ? content
      : content
        .split(/\n{2,}/)
        .map(p => `<p>${escapeHtml(p).replace(/\n/g, '<br/>')}</p>`)
        .join('');

    return `<!doctype html>
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
    --sz: ${fontSize}px;
    --lh: ${lineHeight}px;
  }
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
</style>
</head>
<body>${bodyHtml}</body>
<script>
(function(){
  const RN = window.ReactNativeWebView;

  function send(type, payload){
    try { RN.postMessage(JSON.stringify({ type, payload })); } catch(e){}
  }

  // --- Long press to select a single word and notify RN ---
  let longTimer = null;
  document.addEventListener('touchstart', (e) => {
    const t = e.targetTouches && e.targetTouches[0];
    longTimer = setTimeout(() => {
      // Expand selection to nearest word if empty
      const sel = window.getSelection();
      if (!sel || sel.toString().trim() === '') {
        const range = document.caretRangeFromPoint
          ? document.caretRangeFromPoint(t.clientX, t.clientY)
          : null;
        if (range && range.startContainer && range.startContainer.nodeType === Node.TEXT_NODE) {
          const txt = range.startContainer.textContent || '';
          const idx = range.startOffset;
          const left = (txt.slice(0, idx).match(/[\\p{L}\\p{N}'’]+$/u) || [''])[0].length;
          const right = (txt.slice(idx).match(/^[\\p{L}\\p{N}'’]+/u) || [''])[0].length;
          const r2 = document.createRange();
          r2.setStart(range.startContainer, idx - left);
          r2.setEnd(range.startContainer, idx + right);
          sel.removeAllRanges(); sel.addRange(r2);
        }
      }
      const word = (window.getSelection() ? window.getSelection().toString() : '').trim();
      if (word) send('word', { word });
      try {
          const s = window.getSelection && window.getSelection();
          if (s && s.removeAllRanges) s.removeAllRanges();
        } catch (e) {}
    }, 500);
  }, { passive: true });

  document.addEventListener('touchend', () => {
    if (longTimer) { clearTimeout(longTimer); longTimer = null; }
  }, { passive: true });

  // --- Progress reporting (throttled with rAF) ---
  function report(){
    const doc = document.documentElement;
    const denom = Math.max(1, doc.scrollHeight - doc.clientHeight);
    const y = doc.scrollTop || document.body.scrollTop || 0;
    const p = y / denom;
    send('progress', { y, p });
  }
  let raf = null;
  window.addEventListener('scroll', () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(report);
  }, { passive: true });

  // --- Restore on first load ---
  window.restoreScroll = function(y){
    document.documentElement.scrollTop = y;
    document.body.scrollTop = y;
    report();
  };

  // Initial report
  report();
})();
</script>
</html>`;
  }, [content, bg, fg, fontSize, lineHeight]);

  const onMessage = React.useCallback(
    (e: WebViewMessageEvent) => {
      try {
        const msg = JSON.parse(e.nativeEvent.data);
        if (msg?.type === 'word' && msg.payload?.word && onWord) {
          onWord(msg.payload.word);
        } else if (msg?.type === 'progress' && msg.payload && onProgress) {
          onProgress(msg.payload);
        }
      } catch {}
    },
    [onWord, onProgress]
  );

  const onLoadEnd = React.useCallback(() => {
    if (restoreY > 0) {
      // call restoreScroll inside the webview
      ref.current?.injectJavaScript(`try{ restoreScroll(${Math.max(0, restoreY)}) }catch(e){} true;`);
    }
  }, [restoreY]);

  return (
    <WebView
      ref={ref}
      originWhitelist={['*']}
      source={{ html }}
      onMessage={onMessage}
      onLoadEnd={onLoadEnd}
      // the following can reduce bounce/zoom issues
      bounces={false}
      showsVerticalScrollIndicator={false}
      decelerationRate={Platform.OS === 'ios' ? 'normal' : undefined}
      // important for iOS dark modes if you keep system colors later
      dataDetectorTypes="none"
    />
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
