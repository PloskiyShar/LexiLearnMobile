import * as React from 'react';
import {Button, Platform, Text, View} from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import {useIOSColors} from "src/theme/useIOSColor";

type Props = {
  /** Already-parsed book content as a single HTML string or plain text */
  content: string;
  /** Pixel offset to restore (from store) */
  currentPage?: number;
  totalPages?: number;
  slicedContent: any[]
  /** Called when user long-presses a word */
  onWord?: (word: string) => void;
  /** Background/text colors to match your theme */
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
  const c = useIOSColors()

  const html = React.useMemo(() => {
    // If content is plain text, escape and wrap paragraphs
    const bodyHtml = slicedContent?.[currentPage - 1]
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
    --sz: ${16}px;
    --lh: ${24}px;
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
<body id="container">${bodyHtml}</body>

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
    [onWord, currentPage, onProgress]
  );


  return (
    <>
      <WebView
        ref={ref}
        originWhitelist={['*']}
        source={{ html }}
        onMessage={onMessage}
        // onLoadEnd={onLoadEnd}
        // the following can reduce bounce/zoom issues
        bounces={false}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        decelerationRate={Platform.OS === 'ios' ? 'normal' : undefined}
        // important for iOS dark modes if you keep system colors later
        dataDetectorTypes="none"
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
          if (currentPage === 1 ) return;
          onProgress?.(currentPage - 1);
        }} />
        <Text style={{color: c.tint}}>{currentPage} / {totalPages}</Text>
        <Button title={'Next'} onPress={() => {
          if (currentPage === slicedContent?.length) return;
          onProgress?.(currentPage + 1);
        }} />
      </View>
    </>
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
