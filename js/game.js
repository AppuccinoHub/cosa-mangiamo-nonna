/* Cosa mangiamo, Nonna? — lunch video-call practice. */
(function () {
  "use strict";

  var KEY = "cosa-mangiamo-nonna-v1";
  var NUDGES = [
    { it: "Quasi, tesoro.", en: "So close. Try once more." },
    { it: "Ci sei quasi.", en: "You’re almost there." },
    { it: "Non proprio, amore.", en: "Not quite — have another go." }
  ];
  var EYEBROW = {
    practice: "Listen, then you",
    recall: "Your turn",
    goodbye: "Before you go"
  };

  var state = {
    inputMode: "tap",
    muted: false,
    name: "Arianna",
    phase: "home",
    round: [],
    index: 0,
    card: null,
    options: [],
    tries: 0,
    streak: 0,
    callStars: 0,
    recap: [],
    table: [],
    nudge: null,
    note: "",
    heard: "",
    assistChips: false,
    wrongChoices: new Set(),
    listening: false,
    micBlocked: false,
    recallAnnounced: false,
    startedAt: 0,
    timer: 0,
    praise: null
  };

  var listenGen = 0;
  var listener = null;
  var audioCtx = null;
  var ringTimer = null;

  function $(id) {
    return document.getElementById(id);
  }

  function load() {
    var blank = {
      name: "",
      named: false,
      totalStars: 0,
      callsCompleted: 0,
      bestStars: 0,
      inputMode: "",
      muted: false,
      firstTry: {}
    };
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return blank;
      return Object.assign(blank, JSON.parse(raw));
    } catch (err) {
      return blank;
    }
  }

  function save(profile) {
    try {
      localStorage.setItem(KEY, JSON.stringify(profile));
    } catch (err) {
      /* private mode or full storage */
    }
  }

  function cleanName(raw) {
    var text = String(raw || "")
      .replace(/[\u0000-\u001f]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 18);
    if (!text || !/\p{L}/u.test(text)) return "Arianna";
    return text;
  }

  function initial(name) {
    var chars = Array.from(name || "A");
    return (chars[0] || "A").toUpperCase();
  }

  function formatTime(ms) {
    var total = Math.max(0, Math.floor(ms / 1000));
    var m = Math.floor(total / 60);
    var s = total % 60;
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  function shuffle(list) {
    var copy = list.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function showScreen(name) {
    ["home", "ring", "call", "end"].forEach(function (id) {
      $("screen-" + id).hidden = id !== name;
    });
    state.phase = name === "call" ? state.phase : name;
  }

  function mountScene(hostId) {
    var host = $(hostId);
    var node = $("scene-template").content.firstElementChild.cloneNode(true);
    host.replaceChildren(node);
  }

  function sceneNode(hostId) {
    return document.querySelector("#" + hostId + " .scene");
  }

  function setSceneMood(hostId, mood) {
    var node = sceneNode(hostId);
    if (node && mood) node.dataset.mood = mood;
  }

  function plateFigure(id, just) {
    var fig = document.createElement("figure");
    fig.className = "plate" + (just ? " just-in" : "");
    fig.title = PLATES.label(id);
    var dish = document.createElement("span");
    dish.className = "dish";
    dish.innerHTML = PLATES.svg(id);
    var cap = document.createElement("figcaption");
    cap.textContent = PLATES.label(id);
    fig.append(dish, cap);
    return fig;
  }

  function paintHost(hostId, opts) {
    var scene = sceneNode(hostId);
    if (!scene) return;
    var tavola = scene.querySelector(".tavola");
    var kicker = scene.querySelector(".tavola-kicker");
    var plates = scene.querySelector(".tavola-plates");
    var food = scene.querySelector(".show-food");
    tavola.classList.toggle("is-recap", !!opts.recap);
    kicker.textContent = opts.kicker || "";
    plates.replaceChildren();
    var items = opts.items || [];
    items.forEach(function (id, i) {
      plates.appendChild(plateFigure(id, !!(opts.pop && i === items.length - 1)));
    });
    if (!items.length && opts.empty) {
      var empty = document.createElement("p");
      empty.className = "tavola-empty";
      empty.textContent = opts.empty;
      plates.appendChild(empty);
    }
    if (opts.food) {
      food.hidden = false;
      food.innerHTML = PLATES.svg(opts.food);
      food.setAttribute("aria-hidden", "true");
    } else {
      food.hidden = true;
      food.innerHTML = "";
    }
    var names = items
      .map(function (id) {
        return PLATES.label(id);
      })
      .filter(Boolean)
      .join(", ");
    var label = "Nonna calling from her kitchen in Monte di Procida, Italia";
    if (names) label += ". On the table: " + names + ".";
    scene.setAttribute("aria-label", label);
  }

  function paintCall(pop) {
    var card = state.card;
    paintHost("call-scene", {
      kicker: "La tavola di Nonna",
      items: state.table,
      food: card && card.food ? card.food : "",
      empty: "La tavola è pronta",
      pop: pop
    });
  }

  function paintHome() {
    paintHost("home-scene", {
      kicker: "Pranzo · Monte di Procida",
      items: [],
      empty: "La tavola è pronta"
    });
    paintHost("ring-scene", {
      kicker: "Pranzo · Monte di Procida",
      items: [],
      empty: "La tavola è pronta"
    });
  }

  function burstHearts() {
    var host = $("call-scene").parentElement;
    for (var i = 0; i < 8; i++) {
      var heart = document.createElement("span");
      heart.className = "floater";
      heart.setAttribute("aria-hidden", "true");
      heart.textContent = i % 2 ? "♥" : "✦";
      heart.style.left = 18 + Math.random() * 60 + "%";
      heart.style.color = i % 2 ? "#e2557a" : "#e2ae3a";
      heart.style.animationDelay = i * 0.04 + "s";
      host.appendChild(heart);
      setTimeout(
        (function (node) {
          return function () {
            node.remove();
          };
        })(heart),
        1200
      );
    }
  }

  function audio() {
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function tone(freq, dur, gainValue, delay) {
    var ctx = audio();
    if (!ctx || state.muted) return;
    var t = ctx.currentTime + (delay || 0);
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(gainValue, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  function startRing() {
    stopRing();
    var blip = function () {
      if (state.muted || $("screen-ring").hidden) return;
      tone(523, 0.14, 0.028);
      tone(659, 0.16, 0.024, 0.16);
    };
    blip();
    ringTimer = setInterval(blip, 1700);
  }

  function stopRing() {
    if (ringTimer) clearInterval(ringTimer);
    ringTimer = null;
  }

  function chime() {
    tone(523, 0.1, 0.035);
    tone(659, 0.12, 0.035, 0.09);
    tone(784, 0.18, 0.03, 0.18);
  }

  function soft() {
    tone(392, 0.12, 0.02);
  }

  function spokenLine(text) {
    var raw = String(text).replace(/\s+/g, " ").trim();
    if (/^ciao ciao/i.test(raw)) return raw;
    if (/^ciao,?\s+arianna[.!]?$/i.test(raw)) return "Ciao, Arianna!";
    if (/^ciao,?\s+tesoro[.!]?$/i.test(raw)) return "Ciao, tesoro!";
    return raw;
  }

  function say(text) {
    if (state.muted || !text) return;
    NonnaSpeech.speak(spokenLine(text));
  }

  function announce(text) {
    var live = $("live");
    live.textContent = "";
    setTimeout(function () {
      live.textContent = text;
    }, 30);
  }

  function renderMute() {
    var btn = $("mute-btn");
    btn.setAttribute("aria-pressed", state.muted ? "true" : "false");
    btn.setAttribute("aria-label", state.muted ? "Unmute Nonna" : "Mute Nonna");
    btn.classList.toggle("is-muted", state.muted);
  }

  function syncModeButtons() {
    var canSpeak = NonnaSpeech.supported();
    var speakBtn = $("mode-speak");
    var tapBtn = $("mode-tap");
    speakBtn.disabled = !canSpeak;
    speakBtn.setAttribute("aria-pressed", state.inputMode === "speak" ? "true" : "false");
    tapBtn.setAttribute("aria-pressed", state.inputMode === "tap" ? "true" : "false");
    var note = $("mode-note");
    if (!canSpeak) {
      note.textContent = "This browser can’t use the microphone. Tapping works with no permission.";
    } else if (state.inputMode === "speak") {
      note.textContent = "First Nonna says the foods and you say them back. Later she just asks, and you remember. You can switch to tapping any time.";
    } else {
      note.textContent = "Four Italian lines. Early on, tap what she just said. Later, tap your answer. No microphone needed.";
    }
  }

  function renderWordList() {
    var list = $("word-list");
    list.replaceChildren();
    var seen = {};
    NONNA_VOCAB.cards.forEach(function (card) {
      var say = card.variants[0].say;
      if (seen[say]) return;
      seen[say] = true;
      var li = document.createElement("li");
      var it = document.createElement("span");
      it.lang = "it";
      it.className = "wl-it";
      it.textContent = say;
      var en = document.createElement("span");
      en.className = "wl-en";
      en.textContent = card.phase === "practice" ? "You’ll hear it, then say it again later." : card.english;
      li.append(it, en);
      list.appendChild(li);
    });
  }

  function renderMastered(profile) {
    var wrap = $("mastered-wrap");
    var host = $("mastered");
    var ids = Object.keys(profile.firstTry || {}).filter(function (id) {
      return profile.firstTry[id] > 0;
    });
    wrap.hidden = ids.length === 0;
    host.replaceChildren();
    var seenSay = {};
    ids.forEach(function (id) {
      var card = NONNA_VOCAB.cards.find(function (item) {
        return item.id === id;
      });
      if (!card) return;
      var label = card.variants[0].say.replace(/[.!?]/g, "");
      if (seenSay[label]) return;
      seenSay[label] = true;
      var pill = document.createElement("span");
      pill.className = "pill";
      pill.lang = "it";
      pill.textContent = label;
      host.appendChild(pill);
    });
  }

  function renderHome() {
    var profile = load();
    var named = !!(profile.named && profile.name);
    $("greet-line").hidden = !named;
    $("name-wrap").hidden = named;
    $("change-name").hidden = !named;
    if (named) {
      $("greet-line").textContent = "Ciao, " + profile.name + "!";
    }
    var stars = profile.totalStars || 0;
    $("stars-pill").textContent = stars
      ? stars + (stars === 1 ? " star" : " stars") + " on this phone"
      : "No stars yet — Nonna is waiting";
    var calls = profile.callsCompleted || 0;
    $("calls-line").textContent = calls
      ? calls + (calls === 1 ? " finished call" : " finished calls") + " · best " + (profile.bestStars || 0)
      : "";
    renderMastered(profile);
    syncModeButtons();
  }

  function prepare(card) {
    var variant = card.variants[Math.floor(Math.random() * card.variants.length)];
    return {
      id: card.id,
      kind: card.kind,
      phase: card.phase || "practice",
      food: card.food || "",
      place: card.place || "",
      english: card.english,
      nonna: card.nonna,
      reply: card.reply,
      replyEn: card.replyEn,
      say: variant.say,
      phonetic: variant.phonetic,
      accept: card.accept,
      why: card.why,
      distractors: card.distractors.slice()
    };
  }

  function dealRound() {
    return NONNA_VOCAB.cards.map(prepare);
  }

  function buildOptions(card) {
    var pool = card.distractors.filter(function (phrase) {
      return phrase !== card.say;
    });
    return shuffle([card.say].concat(pool.slice(0, 3)));
  }

  function captionLine() {
    if (!state.card) return "";
    if (state.phase === "feedback" && state.praise) return state.praise.it;
    if (state.phase === "teach") return state.card.say;
    return state.card.nonna;
  }

  function updateCaption() {
    $("subtitle-text").textContent = captionLine();
  }

  function setProgress(doneCount) {
    var pct = state.round.length ? Math.round((doneCount / state.round.length) * 100) : 0;
    $("bar-fill").style.width = pct + "%";
  }

  function setListeningUI(on) {
    var btn = $("mic-btn");
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    $("mic-label").textContent = on ? "Listening… tap to stop" : "Tap to speak";
  }

  function renderStars(stars) {
    var host = $("stars-now");
    host.replaceChildren();
    for (var i = 1; i <= 3; i++) {
      var mark = document.createElement("span");
      mark.className = i <= stars ? "on" : "off";
      mark.textContent = i <= stars ? "★" : "☆";
      host.appendChild(mark);
    }
  }

  function renderChips() {
    var host = $("chips");
    host.replaceChildren();
    state.options.forEach(function (phrase) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "chip" + (phrase.length > 22 ? " wide" : "");
      button.lang = "it";
      button.textContent = phrase;
      if (state.wrongChoices.has(phrase)) {
        button.disabled = true;
        button.classList.add("is-wrong");
      }
      button.addEventListener("click", function () {
        onChip(phrase);
      });
      host.appendChild(button);
    });
  }

  function renderControls() {
    var card = state.card;
    if (!card) return;
    var canSpeak = NonnaSpeech.supported() && !state.micBlocked;
    var speak = state.inputMode === "speak" && canSpeak;
    var answering = state.phase === "answer";
    var teaching = state.phase === "teach";
    var feedback = state.phase === "feedback";

    $("task").hidden = feedback;
    var recall = card.phase === "recall";
    $("task").textContent = teaching
      ? "Tap the phrase to say it back."
      : recall
        ? speak
          ? "Answer her, in Italian."
          : "Tap your answer."
        : speak
          ? "She just said it. Say it back."
          : "Tap what Nonna just said.";

    var showModel = speak && answering && (!recall || state.tries > 0);
    $("model").hidden = !showModel;
    if (showModel) {
      $("model-it").textContent = card.say;
      $("phonetic").textContent = card.phonetic;
    }

    var showHint = (answering && !speak && state.tries > 0) || teaching;
    $("hint").hidden = !showHint;
    if (showHint) $("hint").textContent = "Sounds like " + card.phonetic;

    $("heard-line").hidden = !(state.heard && answering);
    if (state.heard && answering) {
      $("heard-line").textContent = "I heard “" + state.heard.slice(0, 80) + "”.";
    }

    $("note").hidden = !state.note;
    if (state.note) $("note").textContent = state.note;

    $("nudge").hidden = !(answering && state.nudge);
    if (state.nudge) {
      $("nudge-it").textContent = state.nudge.it;
      $("nudge-en").textContent = state.nudge.en;
    }

    $("feedback").hidden = !feedback;

    $("mic-btn").hidden = !(speak && answering);
    var showChips = answering && (!speak || state.assistChips || state.tries > 0);
    $("chips").hidden = !showChips;
    if (showChips) renderChips();

    var showSwitch = answering && (speak || canSpeak);
    if (speak && showChips) showSwitch = false;
    $("switch-btn").hidden = !showSwitch;
    if (showSwitch) $("switch-btn").textContent = speak ? "Or tap a phrase" : "Or speak instead";

    var showHear = (answering || teaching) && (speak || state.tries > 0 || teaching);
    $("hear-btn").hidden = !showHear;
    if (showHear) {
      $("hear-btn").textContent = speak && state.tries === 0 && !teaching ? "Hear it again" : "Hear Nonna say it";
    }

    $("teach-btn").hidden = !teaching;
    if (teaching) {
      $("teach-btn").textContent = card.say;
      $("teach-btn").lang = "it";
    }

    $("next-btn").hidden = !feedback;
    if (feedback) {
      $("next-btn").textContent = state.index >= state.round.length - 1 ? "Hang up" : "Next";
    }
    updateCaption();
  }

  function renderCard(opts) {
    var keepSpeech = opts && opts.keepSpeech;
    invalidateListen();
    if (!keepSpeech) NonnaSpeech.cancel();
    var card = state.round[state.index];
    state.card = card;
    state.phase = "answer";
    state.tries = 0;
    state.nudge = null;
    state.note = "";
    state.heard = "";
    state.assistChips = false;
    state.wrongChoices = new Set();
    state.options = buildOptions(card);
    state.praise = null;
    setSceneMood("call-scene", "smile");
    paintCall(false);
    setProgress(state.index);
    var act = card.kind === "goodbye" ? EYEBROW.goodbye : EYEBROW[card.phase] || EYEBROW.practice;
    $("eyebrow").textContent = act + "  ·  " + (state.index + 1) + " / " + state.round.length;
    $("english").textContent = card.english;
    setListeningUI(false);
    renderControls();
    if (card.phase === "recall" && !state.recallAnnounced) {
      state.recallAnnounced = true;
      say("Adesso dimmi tu.");
    }
    say(card.nonna);
  }

  function invalidateListen() {
    listenGen += 1;
    state.listening = false;
    if (listener) {
      var current = listener;
      listener = null;
      current.abort();
    }
    setListeningUI(false);
  }

  function startListen() {
    invalidateListen();
    var gen = listenGen;
    state.listening = true;
    state.heard = "";
    state.note = "";
    $("note").hidden = true;
    $("heard-line").hidden = true;
    setListeningUI(true);
    listener = NonnaSpeech.listen({
      onPartial: function (text) {
        if (gen !== listenGen) return;
        $("heard-line").hidden = false;
        $("heard-line").textContent = "“" + text.trim().slice(0, 80) + "”";
      },
      onFinal: function (text, alts) {
        if (gen !== listenGen) return;
        state.listening = false;
        listener = null;
        setListeningUI(false);
        handleHeard(text, alts);
      },
      onError: function (code) {
        if (gen !== listenGen) return;
        listener = null;
        state.listening = false;
        setListeningUI(false);
        onMicError(code);
      },
      onEnd: function () {
        if (gen !== listenGen) return;
        if (!state.listening) return;
        state.listening = false;
        listener = null;
        setListeningUI(false);
        state.note = "I didn’t catch that. Try once more?";
        $("note").hidden = false;
        $("note").textContent = state.note;
      }
    });
  }

  function handleHeard(text, alts) {
    if (state.phase !== "answer") return;
    var options = [text].concat(alts || []);
    var hit = "";
    for (var i = 0; i < options.length; i++) {
      if (options[i] && NonnaMatch.matches(options[i], state.card.accept)) {
        hit = options[i];
        break;
      }
    }
    var shown = String(hit || text || "").trim();
    if (!hit && NonnaMatch.normalize(shown).length < 4) {
      state.note = "I didn’t catch that. Come a little closer and try again.";
      $("note").hidden = false;
      $("note").textContent = state.note;
      $("heard-line").hidden = true;
      return;
    }
    if (hit) grade(true, "");
    else grade(false, shown);
  }

  function onMicError(code) {
    if (code === "not-allowed" || code === "service-not-allowed" || code === "audio-capture") {
      forceTap("The microphone isn’t available. Tap a phrase — Nonna doesn’t mind.");
      return;
    }
    if (code === "network") {
      forceTap("This browser needs internet for the mic. Tap a phrase instead.");
      return;
    }
    if (code === "no-speech" || code === "aborted") {
      state.note = "I didn’t catch that. Try again, a little closer to the phone.";
      renderControls();
      return;
    }
    state.assistChips = true;
    state.note =
      code === "timeout"
        ? "The mic went quiet. Try speaking again, or tap a phrase."
        : "The mic hiccuped. You can try again, or tap a phrase.";
    renderControls();
  }

  function forceTap(message) {
    state.micBlocked = true;
    state.inputMode = "tap";
    var profile = load();
    profile.inputMode = "tap";
    save(profile);
    state.note = message;
    state.assistChips = true;
    renderControls();
    announce(message);
  }

  function grade(ok, heard) {
    if (state.phase !== "answer") return;
    invalidateListen();
    if (!ok) {
      state.tries += 1;
      state.streak = 0;
      if (state.tries >= 2) enterTeach();
      else enterRetry(heard || "");
      return;
    }
    var stars = state.tries === 0 ? 3 : 2;
    state.streak = stars === 3 ? state.streak + 1 : 0;
    award(stars);
  }

  function enterRetry(heard) {
    state.nudge = NUDGES[(state.tries - 1) % NUDGES.length];
    state.heard = heard;
    state.note = "";
    state.assistChips = true;
    setSceneMood("call-scene", "hmm");
    soft();
    renderControls();
    say(state.nudge.it);
    announce(state.nudge.it + " " + state.nudge.en);
  }

  function enterTeach() {
    state.phase = "teach";
    state.nudge = null;
    state.note = "";
    state.heard = "";
    setSceneMood("call-scene", "hmm");
    soft();
    renderControls();
    say(state.card.say);
    announce("The phrase is " + state.card.say);
  }

  function addStars(stars, firstTry) {
    var profile = load();
    profile.totalStars = (profile.totalStars || 0) + stars;
    if (firstTry) {
      if (!profile.firstTry) profile.firstTry = {};
      profile.firstTry[state.card.id] = (profile.firstTry[state.card.id] || 0) + 1;
    }
    save(profile);
    state.callStars += stars;
    $("call-stars").textContent = String(state.callStars);
  }

  function placeFood() {
    var id = state.card && state.card.place;
    if (!id || state.table.indexOf(id) !== -1) return false;
    state.table.push(id);
    return true;
  }

  function award(stars) {
    state.phase = "feedback";
    var card = state.card;
    var placed = placeFood();
    var praise = { it: card.reply, en: card.replyEn };
    if (stars === 1) praise = { it: praise.it, en: praise.en + " Now you’ve got it." };
    if (stars === 3 && state.streak >= 3 && card.id !== "bye") {
      praise = { it: praise.it, en: praise.en + " That’s " + state.streak + " in a row." };
    }
    state.praise = praise;
    addStars(stars, stars === 3);
    state.recap.push({ say: card.say, english: card.english, stars: stars });
    setProgress(state.index + 1);
    setSceneMood("call-scene", "love");
    paintCall(placed);
    if (stars === 3 || card.id === "bye") burstHearts();
    if (stars === 1) soft();
    else chime();
    try {
      if (navigator.vibrate) navigator.vibrate(stars === 1 ? 12 : [12, 30, 12]);
    } catch (err) {
      /* ignore */
    }
    renderStars(stars);
    $("praise").textContent = praise.it;
    $("praise-en").textContent = praise.en;
    $("tip").textContent = card.why;
    $("streak").hidden = !(stars === 3 && state.streak >= 3 && card.id !== "bye");
    if (!$("streak").hidden) $("streak").textContent = state.streak + " in a row";
    renderControls();
    say(praise.it);
    announce(praise.it + " " + praise.en);
    $("next-btn").focus();
  }

  function onChip(phrase) {
    if (state.phase !== "answer") return;
    if (state.wrongChoices.has(phrase)) return;
    invalidateListen();
    if (phrase === state.card.say) {
      grade(true, "");
      return;
    }
    state.wrongChoices.add(phrase);
    grade(false, "");
  }

  function onTeach() {
    if (state.phase !== "teach") return;
    award(1);
  }

  function onHear() {
    if (!state.card) return;
    var line = state.phase === "teach" || state.tries > 0 ? state.card.say : state.card.nonna;
    NonnaSpeech.cancel();
    say(line);
  }

  function onSwitch() {
    if (state.phase !== "answer") return;
    if (state.micBlocked && state.inputMode === "tap") return;
    invalidateListen();
    state.inputMode = state.inputMode === "speak" ? "tap" : "speak";
    if (!NonnaSpeech.supported()) state.inputMode = "tap";
    var profile = load();
    profile.inputMode = state.inputMode;
    save(profile);
    state.note = "";
    NonnaSpeech.cancel();
    renderControls();
    say(state.card.nonna);
  }

  function onMic() {
    if ($("mic-btn").hidden || state.phase !== "answer") return;
    if (state.listening) {
      if (listener) listener.stop();
      return;
    }
    startListen();
  }

  function onNext() {
    if (state.phase !== "feedback") return;
    NonnaSpeech.cancel();
    if (state.index >= state.round.length - 1) {
      showSummary();
      return;
    }
    state.index += 1;
    renderCard();
  }

  function startTimer() {
    stopTimer();
    state.startedAt = Date.now();
    var tick = function () {
      $("call-timer").textContent = formatTime(Date.now() - state.startedAt);
    };
    tick();
    state.timer = setInterval(tick, 1000);
  }

  function stopTimer() {
    if (state.timer) clearInterval(state.timer);
    state.timer = 0;
  }

  function cameFromHub() {
    try {
      return new URLSearchParams(window.location.search).get("from") === "hub";
    } catch (err) {
      return false;
    }
  }

  function renderEndActions() {
    var hub = cameFromHub();
    $("next-call").hidden = !hub;
    $("hub-back").hidden = !hub;
    $("hub-soft").hidden = hub;
    $("again-btn").classList.toggle("primary", !hub);
    $("again-btn").classList.toggle("secondary", hub);
  }

  function showSummary() {
    if (state.phase === "done") return;
    state.phase = "done";
    stopTimer();
    invalidateListen();
    NonnaSpeech.cancel();
    var elapsed = formatTime(Date.now() - state.startedAt);
    var profile = load();
    profile.callsCompleted = (profile.callsCompleted || 0) + 1;
    if (state.callStars > (profile.bestStars || 0)) profile.bestStars = state.callStars;
    save(profile);
    setSceneMood("end-scene", "love");
    paintHost("end-scene", {
      kicker: "La tavola della domenica",
      items: state.table.slice(),
      recap: true,
      empty: "The table is still waiting"
    });
    $("end-title").textContent = "Ciao ciao, " + state.name + ".";
    $("end-score").textContent = state.callStars + (state.callStars === 1 ? " star" : " stars");
    $("end-table-line").textContent =
      state.table.length + (state.table.length === 1 ? " dish" : " dishes") + " on the Sunday table";
    $("end-saved").textContent =
      (profile.totalStars || 0) +
      " on this phone · best call " +
      (profile.bestStars || 0) +
      " · " +
      elapsed;
    var perfect = state.callStars === state.round.length * 3;
    $("end-perfect").hidden = !perfect;
    if (perfect) $("end-perfect").textContent = "Every one on the first try. The table is glorious.";
    var list = $("recap");
    list.replaceChildren();
    state.recap.forEach(function (row) {
      var li = document.createElement("li");
      var stars = document.createElement("span");
      stars.className = "recap-stars";
      stars.textContent = "★".repeat(row.stars) + "☆".repeat(3 - row.stars);
      var it = document.createElement("span");
      it.className = "recap-it";
      it.lang = "it";
      it.textContent = row.say;
      var en = document.createElement("span");
      en.className = "recap-en";
      en.textContent = row.english;
      li.append(stars, it, en);
      list.appendChild(li);
    });
    renderEndActions();
    showScreen("end");
    state.phase = "done";
  }

  function hangUp() {
    if ($("leave-dialog").open) $("leave-dialog").close();
    stopRing();
    stopTimer();
    invalidateListen();
    NonnaSpeech.cancel();
    showScreen("home");
    renderHome();
  }

  function onEndRequest() {
    $("leave-body").textContent = state.callStars
      ? "Stars you’ve already earned stay on this phone."
      : "You can call her again whenever you like.";
    if (!$("leave-dialog").open) $("leave-dialog").showModal();
  }

  function beginCall() {
    stopRing();
    audio();
    var profile = load();
    state.name = profile.name || "Arianna";
    state.callStars = 0;
    state.recap = [];
    state.table = [];
    state.streak = 0;
    state.recallAnnounced = false;
    state.micBlocked = false;
    state.inputMode = profile.inputMode === "speak" && NonnaSpeech.supported() ? "speak" : state.inputMode;
    if (!NonnaSpeech.supported()) state.inputMode = "tap";
    state.round = dealRound();
    state.index = 0;
    $("call-stars").textContent = "0";
    $("self-pip").querySelector("span").textContent = initial(state.name);
    showScreen("call");
    state.phase = "answer";
    setSceneMood("call-scene", "smile");
    startTimer();
    say(/arianna/i.test(state.name) ? "Ciao, Arianna! È ora di pranzo." : "Ciao, tesoro! È ora di pranzo.");
    renderCard({ keepSpeech: true });
  }

  function onCallSubmit(event) {
    event.preventDefault();
    var profile = load();
    if (!$("name-wrap").hidden) {
      profile.name = cleanName($("name-input").value);
      profile.named = true;
    } else if (!profile.name) {
      profile.name = "Arianna";
      profile.named = true;
    }
    profile.inputMode = state.inputMode;
    profile.muted = state.muted;
    save(profile);
    state.name = profile.name;
    showScreen("ring");
    setSceneMood("ring-scene", "smile");
    startRing();
  }

  function bind() {
    $("home-form").addEventListener("submit", onCallSubmit);
    $("change-name").addEventListener("click", function () {
      var profile = load();
      $("name-wrap").hidden = false;
      $("greet-line").hidden = true;
      $("change-name").hidden = true;
      $("name-input").value = profile.name || "";
      $("name-input").focus();
    });
    $("mode-speak").addEventListener("click", function () {
      if (!NonnaSpeech.supported()) return;
      state.inputMode = "speak";
      syncModeButtons();
    });
    $("mode-tap").addEventListener("click", function () {
      state.inputMode = "tap";
      syncModeButtons();
    });
    $("decline-btn").addEventListener("click", hangUp);
    $("answer-btn").addEventListener("click", beginCall);
    $("again-btn").addEventListener("click", function () {
      showScreen("ring");
      setSceneMood("ring-scene", "smile");
      startRing();
    });
    $("home-btn").addEventListener("click", hangUp);
    $("end-btn").addEventListener("click", onEndRequest);
    $("stay-btn").addEventListener("click", function () {
      $("leave-dialog").close();
    });
    $("leave-btn").addEventListener("click", hangUp);
    $("mute-btn").addEventListener("click", function () {
      state.muted = !state.muted;
      var profile = load();
      profile.muted = state.muted;
      save(profile);
      if (state.muted) {
        NonnaSpeech.cancel();
        stopRing();
      } else if (!$("screen-ring").hidden) {
        startRing();
      }
      renderMute();
    });
    $("mic-btn").addEventListener("click", onMic);
    $("hear-btn").addEventListener("click", onHear);
    $("switch-btn").addEventListener("click", onSwitch);
    $("teach-btn").addEventListener("click", onTeach);
    $("next-btn").addEventListener("click", onNext);
    document.addEventListener("keydown", function (event) {
      if (event.target && event.target.matches && event.target.matches("input, textarea")) return;
      if (event.key === "Enter" && !$("next-btn").hidden) {
        onNext();
        return;
      }
      if (state.phase === "answer" && !$("chips").hidden) {
        var n = Number(event.key);
        if (n >= 1 && n <= 4) {
          var buttons = $("chips").querySelectorAll("button");
          if (buttons[n - 1] && !buttons[n - 1].disabled) buttons[n - 1].click();
        }
      }
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopRing();
      else if (!$("screen-ring").hidden && !state.muted) startRing();
    });
  }

  function boot() {
    mountScene("home-scene");
    mountScene("ring-scene");
    mountScene("call-scene");
    mountScene("end-scene");
    paintHome();
    paintHost("end-scene", {
      kicker: "La tavola della domenica",
      items: [],
      recap: true,
      empty: "La tavola è pronta"
    });
    var profile = load();
    state.muted = !!profile.muted;
    if (profile.inputMode === "speak" || profile.inputMode === "tap") {
      state.inputMode = profile.inputMode;
    } else {
      state.inputMode = NonnaSpeech.supported() ? "speak" : "tap";
    }
    if (!NonnaSpeech.supported()) state.inputMode = "tap";
    renderMute();
    renderWordList();
    renderHome();
    bind();
    NonnaSpeech.prime();
    showScreen("home");
  }

  boot();
})();
