document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------
  // Elements
  // -------------------------------------------------------
  const jaInput = document.getElementById('ja-input');
  const translateBtn = document.getElementById('translate-btn');
  const enResultContainer = document.getElementById('en-result-container');
  const enResultText = document.getElementById('en-result-text');
  const speakTranslatedBtn = document.getElementById('speak-translated-btn');

  const enInput = document.getElementById('en-input');
  const speakInputBtn = document.getElementById('speak-input-btn');

  const startSpeechBtn = document.getElementById('start-speech-btn');
  const speechBtnText = document.getElementById('speech-btn-text');
  const waveform = document.getElementById('waveform');
  const speechResultContainer = document.getElementById('speech-result-container');
  const speechResultText = document.getElementById('speech-result-text');
  const speechFeedback = document.getElementById('speech-feedback');
  const speechNotSupported = document.getElementById('speech-not-supported');

  // -------------------------------------------------------
  // Speed pills setup
  // -------------------------------------------------------
  document.querySelectorAll('.speed-pills').forEach(group => {
    const targetId = group.dataset.target;
    const hiddenInput = document.getElementById(targetId);
    group.querySelectorAll('.pill').forEach(pill => {
      pill.addEventListener('click', () => {
        group.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        hiddenInput.value = pill.dataset.value;
      });
    });
  });

  // -------------------------------------------------------
  // Speech Synthesis
  // -------------------------------------------------------
  const synth = window.speechSynthesis;
  let voices = [];

  function loadVoices() {
    voices = synth.getVoices();
  }
  loadVoices();
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
  }

  function speak(text, rate) {
    if (!text) return;
    synth.cancel();
    const utterThis = new SpeechSynthesisUtterance(text);
    const enVoice = voices.find(v => v.lang.startsWith('en-US') && v.name.includes('Google'))
      || voices.find(v => v.lang.startsWith('en-US'))
      || voices.find(v => v.lang.startsWith('en'));
    if (enVoice) utterThis.voice = enVoice;
    utterThis.lang = 'en-US';
    utterThis.rate = parseFloat(rate);
    synth.speak(utterThis);
  }

  // -------------------------------------------------------
  // Elementary-school-level English simplifier
  // -------------------------------------------------------
  function simplifyEnglish(text) {
    // 1. Expand contractions first (for clearer elementary reading)
    const contractions = [
      [/\bmustn't\b/gi, 'must not'],
      [/\bshouldn't\b/gi, 'should not'],
      [/\bwouldn't\b/gi, 'will not'],
      [/\bcouldn't\b/gi, 'cannot'],
      [/\bwon't\b/gi, 'will not'],
      [/\bdoesn't\b/gi, 'does not'],
      [/\bdidn't\b/gi, 'did not'],
      [/\bisn't\b/gi, 'is not'],
      [/\baren't\b/gi, 'are not'],
      [/\bwasn't\b/gi, 'was not'],
      [/\bweren't\b/gi, 'were not'],
      [/\bI've\b/g, 'I have'],
      [/\bI'll\b/g, 'I will'],
      [/\bI'd\b/g, 'I'],
      [/\bhe's\b/gi, 'he is'],
      [/\bshe's\b/gi, 'she is'],
      [/\bthey're\b/gi, 'they are'],
      [/\bwe're\b/gi, 'we are'],
      [/\byou're\b/gi, 'you are'],
      [/\bthere's\b/gi, 'there is'],
      [/\bthat's\b/gi, 'that is'],
      [/\bwhat's\b/gi, 'what is'],
      [/\bwhere's\b/gi, 'where is'],
      [/\bwho's\b/gi, 'who is'],
      [/\bhow's\b/gi, 'how is'],
    ];
    let result = text;
    contractions.forEach(([pattern, replacement]) => {
      result = result.replace(pattern, m => {
        const isCapitalized = m[0] === m[0].toUpperCase() && m[0] !== m[0].toLowerCase();
        return isCapitalized
          ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
          : replacement;
      });
    });

    // 2. Simplify grammar patterns
    const grammarRules = [
      // "be going to" → "will"
      [/\b(am|is|are)\s+going\s+to\b/gi, 'will'],
      // "would like to" → "want to"
      [/\bwould\s+like\s+to\b/gi, 'want to'],
      // "would like" → "want"
      [/\bwould\s+like\b/gi, 'want'],
      // "have/has/had been + V-ing" → "was V-ing"
      [/\b(?:have|has|had)\s+been\s+(\w+ing)\b/gi, 'was $1'],
      // "in order to" → "to"
      [/\bin\s+order\s+to\b/gi, 'to'],
      // "due to the fact that" → "because"
      [/\bdue\s+to\s+the\s+fact\s+that\b/gi, 'because'],
      // "as a result of" → "because of"
      [/\bas\s+a\s+result\s+of\b/gi, 'because of'],
      // "in spite of" → "even though"
      [/\bin\s+spite\s+of\b/gi, 'even though'],
      // "might" → "may"
      [/\bmight\b/gi, 'may'],
      // "shall" → "will"
      [/\bshall\b/gi, 'will'],
      // "could" (not followed by "have") → "can"
      [/\bcould\b(?!\s+have)/gi, 'can'],
      // "it is necessary to" → "you need to"
      [/\bit\s+is\s+necessary\s+to\b/gi, 'you need to'],
      // "it is important to" → "it is good to"
      [/\bit\s+is\s+important\s+to\b/gi, 'it is good to'],
      // "it is possible to" → "you can"
      [/\bit\s+is\s+possible\s+to\b/gi, 'you can'],
      // "for the purpose of" → "to"
      [/\bfor\s+the\s+purpose\s+of\b/gi, 'to'],
    ];
    grammarRules.forEach(([pattern, replacement]) => {
      result = result.replace(pattern, m => {
        const isCapitalized = m[0] === m[0].toUpperCase() && m[0] !== m[0].toLowerCase();
        const replaced = m.replace(pattern, replacement);
        return isCapitalized
          ? replaced.charAt(0).toUpperCase() + replaced.slice(1)
          : replaced;
      });
    });

    // 3. Vocabulary: replace complex words with simple ones
    const vocabMap = [
      // Verbs
      ['purchase', 'buy'],
      ['acquire', 'get'],
      ['obtain', 'get'],
      ['receive', 'get'],
      ['require', 'need'],
      ['desire', 'want'],
      ['wish', 'want'],
      ['assist', 'help'],
      ['aid', 'help'],
      ['support', 'help'],
      ['comprehend', 'understand'],
      ['realize', 'know'],
      ['reside', 'live'],
      ['inhabit', 'live'],
      ['consume', 'eat'],
      ['construct', 'make'],
      ['manufacture', 'make'],
      ['create', 'make'],
      ['produce', 'make'],
      ['attempt', 'try'],
      ['endeavor', 'try'],
      ['commence', 'start'],
      ['begin', 'start'],
      ['conclude', 'finish'],
      ['complete', 'finish'],
      ['observe', 'see'],
      ['view', 'see'],
      ['witness', 'see'],
      ['communicate', 'talk'],
      ['converse', 'talk'],
      ['depart', 'leave'],
      ['discover', 'find'],
      ['locate', 'find'],
      ['select', 'choose'],
      ['prefer', 'like'],
      ['enjoy', 'like'],
      ['appreciate', 'like'],
      ['permit', 'let'],
      ['allow', 'let'],
      ['inform', 'tell'],
      ['notify', 'tell'],
      ['request', 'ask'],
      ['inquire', 'ask'],
      ['respond', 'answer'],
      ['reply', 'answer'],
      ['utilize', 'use'],
      ['employ', 'use'],
      ['demonstrate', 'show'],
      ['display', 'show'],
      ['proceed', 'go'],
      ['arrive', 'come'],
      ['return', 'go back'],
      ['remove', 'take off'],
      ['eliminate', 'take away'],
      ['prevent', 'stop'],
      ['protect', 'keep safe'],
      ['prepare', 'get ready'],
      ['improve', 'get better'],
      ['increase', 'go up'],
      ['decrease', 'go down'],
      ['remember', 'remember'],
      ['forget', 'forget'],
      ['imagine', 'think of'],
      ['explain', 'tell about'],
      ['describe', 'tell about'],
      ['decide', 'choose'],
      // Adjectives
      ['difficult', 'hard'],
      ['challenging', 'hard'],
      ['straightforward', 'easy'],
      ['excellent', 'great'],
      ['wonderful', 'great'],
      ['fantastic', 'great'],
      ['amazing', 'great'],
      ['terrible', 'bad'],
      ['awful', 'bad'],
      ['horrible', 'bad'],
      ['enormous', 'very big'],
      ['huge', 'very big'],
      ['gigantic', 'very big'],
      ['tiny', 'very small'],
      ['minuscule', 'very small'],
      ['beautiful', 'pretty'],
      ['gorgeous', 'pretty'],
      ['frightening', 'scary'],
      ['terrifying', 'scary'],
      ['joyful', 'happy'],
      ['delighted', 'happy'],
      ['unhappy', 'sad'],
      ['furious', 'very mad'],
      ['exhausted', 'very tired'],
      ['starving', 'very hungry'],
      ['intelligent', 'smart'],
      ['clever', 'smart'],
      ['fortunate', 'lucky'],
      ['unfortunate', 'unlucky'],
      ['curious', 'interested'],
      ['excited', 'happy'],
      ['nervous', 'worried'],
      ['anxious', 'worried'],
      ['polite', 'nice'],
      ['kind', 'nice'],
      ['generous', 'nice'],
      // Nouns
      ['automobile', 'car'],
      ['vehicle', 'car'],
      ['photograph', 'photo'],
      ['image', 'picture'],
      ['residence', 'home'],
      ['dwelling', 'home'],
      ['occupation', 'job'],
      ['profession', 'job'],
      ['companion', 'friend'],
      ['instructor', 'teacher'],
      ['issue', 'problem'],
      ['solution', 'answer'],
      ['concept', 'idea'],
      ['information', 'news'],
      ['location', 'place'],
      ['destination', 'place'],
      ['journey', 'trip'],
      ['vacation', 'holiday'],
      ['celebration', 'party'],
      ['competition', 'game'],
      ['examination', 'test'],
      ['beverage', 'drink'],
      // Adverbs / Conjunctions
      ['extremely', 'very'],
      ['incredibly', 'very'],
      ['however', 'but'],
      ['therefore', 'so'],
      ['thus', 'so'],
      ['consequently', 'so'],
      ['additionally', 'also'],
      ['furthermore', 'also'],
      ['moreover', 'also'],
      ['although', 'but'],
      ['nevertheless', 'but'],
      ['frequently', 'a lot'],
      ['immediately', 'right now'],
      ['instantly', 'right now'],
      ['currently', 'now'],
      ['presently', 'now'],
      ['previously', 'before'],
      ['formerly', 'before'],
      ['subsequently', 'after that'],
      ['afterward', 'after that'],
      ['perhaps', 'maybe'],
      ['possibly', 'maybe'],
      ['certainly', 'for sure'],
      ['definitely', 'for sure'],
    ];

    vocabMap.forEach(([complex, simple]) => {
      result = result.replace(new RegExp(`\\b${complex}\\b`, 'gi'), m => {
        const isCapitalized = m[0] === m[0].toUpperCase() && m[0] !== m[0].toLowerCase();
        return isCapitalized
          ? simple.charAt(0).toUpperCase() + simple.slice(1)
          : simple;
      });
    });

    // 4. Capitalize the start of each sentence and standalone "I"
    // Capitalize standalone "i" → "I"
    result = result.replace(/\bi\b/g, 'I');
    // Capitalize the first letter of the whole string
    result = result.charAt(0).toUpperCase() + result.slice(1);
    // Capitalize after ". ", "? ", "! "
    result = result.replace(/([.?!]\s+)([a-z])/g, (_, punct, letter) => punct + letter.toUpperCase());

    return result;
  }

  // -------------------------------------------------------
  // Translation
  // -------------------------------------------------------
  async function translateJaToEn(text) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('error');
      const data = await res.json();
      const translated = data[0].map(s => s[0]).join('');
      return simplifyEnglish(translated);
    } catch {
      return 'Sorry, translation failed. Please try again.';
    }
  }

  // -------------------------------------------------------
  // Section 1 — Translate
  // -------------------------------------------------------
  translateBtn.addEventListener('click', async () => {
    const text = jaInput.value.trim();
    if (!text) { jaInput.focus(); return; }

    translateBtn.textContent = '翻訳中...';
    translateBtn.disabled = true;
    enResultContainer.classList.add('hidden');

    const result = await translateJaToEn(text);

    translateBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8l6 6"/><path d="M4 14l6-6 2-2"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="M22 22l-5-10-5 10"/><path d="M14 18h6"/></svg> 英語に翻訳する`;
    translateBtn.disabled = false;

    enResultText.textContent = result;
    enResultContainer.classList.remove('hidden');
    alignFourLinesBackground(enResultText);
  });

  speakTranslatedBtn.addEventListener('click', () => {
    const text = enResultText.textContent;
    const rate = document.getElementById('speed-1').value;
    speak(text, rate);
  });

  // -------------------------------------------------------
  // Section 2 — Read aloud
  // -------------------------------------------------------
  speakInputBtn.addEventListener('click', () => {
    const text = enInput.value.trim();
    if (!text) { enInput.focus(); return; }
    const rate = document.getElementById('speed-2').value;
    speak(text, rate);
  });

  // -------------------------------------------------------
  // Section 3 — Speech recognition
  // -------------------------------------------------------
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    startSpeechBtn.classList.add('hidden');
    speechNotSupported.classList.remove('hidden');
  } else {
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;

    let isRecording = false;

    function startRecording() {
      isRecording = true;
      startSpeechBtn.classList.add('recording');
      speechBtnText.textContent = 'タップして停止';
      waveform.classList.add('active');
      speechResultContainer.classList.add('hidden');
      speechFeedback.textContent = '';
      recognition.start();
    }

    function stopRecording() {
      isRecording = false;
      startSpeechBtn.classList.remove('recording');
      speechBtnText.textContent = 'マイクをおして話す';
      waveform.classList.remove('active');
      recognition.stop();
    }

    startSpeechBtn.addEventListener('click', () => {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    });

    recognition.addEventListener('result', (e) => {
      const transcript = Array.from(e.results)
        .map(r => r[0].transcript)
        .join('');
      speechResultText.textContent = transcript;
      speechResultContainer.classList.remove('hidden');

      if (e.results[0].isFinal) {
        const confidence = Math.round(e.results[0][0].confidence * 100);
        if (confidence >= 75) {
          speechFeedback.style.color = '#10B981';
          speechFeedback.textContent = `✅ よく聞き取れました！ (認識度: ${confidence}%)`;
        } else if (confidence >= 50) {
          speechFeedback.style.color = '#F97316';
          speechFeedback.textContent = `🔄 もう少しゆっくり話してみよう (認識度: ${confidence}%)`;
        } else {
          speechFeedback.style.color = '#EF4444';
          speechFeedback.textContent = `🎤 もう一度はっきり話してみよう (認識度: ${confidence}%)`;
        }
      }
    });

    recognition.addEventListener('end', () => {
      if (isRecording) stopRecording();
    });

    recognition.addEventListener('error', (e) => {
      stopRecording();
      if (e.error === 'no-speech') {
        speechFeedback.style.color = '#F97316';
        speechFeedback.textContent = '🎤 声が聞き取れませんでした。マイクに向かって話してみよう。';
        speechResultContainer.classList.remove('hidden');
      }
    });
  }
});

/**
 * Build & align a 4-line English-notebook background for the given element.
 * Line positions are derived from ACTUAL glyph metrics of the loaded font:
 *   Line 1 (grey) – top of 'k'  (ascender)
 *   Line 2 (grey) – top of 'e'  (x-height / upper line)
 *   Line 3 (red)  – baseline    (bottom of all lowercase letters)
 *   Line 4 (grey) – bottom of 'y' (descender)
 */
function alignFourLinesBackground(el) {
  requestAnimationFrame(() => {
    const style = window.getComputedStyle(el);
    const lineHeight = parseFloat(style.lineHeight);  // 60
    const fontSize = parseFloat(style.fontSize);    // 30

    if (!lineHeight || !fontSize) return;

    // 1. Measure the real CSS baseline via a DOM trick
    const pin = document.createElement('span');
    pin.style.cssText =
      'display:inline-block;vertical-align:baseline;' +
      'width:0;height:0;overflow:hidden;pointer-events:none;';
    el.appendChild(pin);
    const elR = el.getBoundingClientRect();
    const pinR = pin.getBoundingClientRect();
    el.removeChild(pin);
    if (elR.height === 0) return;

    const baseline = pinR.bottom - elR.top;   // px from element top

    // 2. Measure glyph heights with Canvas API
    const cv = document.createElement('canvas');
    const ctx = cv.getContext('2d');
    ctx.font = `bold ${fontSize}px ${style.fontFamily}`;
    ctx.textBaseline = 'alphabetic';

    const mk = ctx.measureText('k');
    const me = ctx.measureText('e');
    const my = ctx.measureText('y');

    const kAsc = (mk.actualBoundingBoxAscent != null) ? mk.actualBoundingBoxAscent : fontSize * 0.69;
    const eAsc = (me.actualBoundingBoxAscent != null) ? me.actualBoundingBoxAscent : fontSize * 0.50;
    const yDesc = (my.actualBoundingBoxDescent != null) ? my.actualBoundingBoxDescent : fontSize * 0.22;

    // 3. Compute positions within the 60px tile
    const cy = lineHeight;    // 60
    const red = cy * 0.70;     // 42 px (JS aligns this to the actual baseline)

    const l1 = red - kAsc;    // top of k
    const l2 = red - eAsc;    // top of e
    const l4 = red + yDesc;   // bottom of y

    // 4. Build a 1px-line gradient
    const px = (p) => Math.max(0, Math.min(cy, p));
    const seg = (p, color) =>
      `transparent ${px(p - 0.5)}px,${color} ${px(p)}px,` +
      `${color} ${px(p + 1)}px,transparent ${px(p + 1.5)}px`;

    const grad =
      `linear-gradient(${seg(l1, '#c9d6e3')},${seg(l2, '#c9d6e3')},` +
      `${seg(red, '#f87171')},${seg(l4, '#c9d6e3')})`;

    el.style.backgroundImage = grad;
    el.style.backgroundSize = `100% ${cy}px`;
    el.style.backgroundRepeat = 'repeat-y';

    // 5. Shift so the red line sits exactly at the text baseline
    el.style.backgroundPositionY = (baseline - red) + 'px';
  });
}
