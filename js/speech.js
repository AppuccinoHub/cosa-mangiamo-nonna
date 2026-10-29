/* Nonna's voice: recorded Italian clips first, Web Speech only if a clip is missing.
   Clips are a warm female Italian neural voice (Elsa-style), a little slower. */
(function (root) {
  "use strict";

  /* Keys match clipKey(): lowercase, straight apostrophes, punctuation dropped. */
  var CLIPS = {
    "ciao arianna è ora di pranzo": "audio/ciao-arianna-pranzo.mp3",
    "ciao tesoro è ora di pranzo": "audio/ciao-tesoro-pranzo.mp3",
    "adesso dimmi tu": "audio/adesso-dimmi-tu.mp3",
    "guarda la pizza": "audio/guarda-la-pizza.mp3",
    "sì la pizza": "audio/si-la-pizza.mp3",
    "adesso la pasta": "audio/adesso-la-pasta.mp3",
    "la pasta che buona": "audio/la-pasta-che-buona.mp3",
    "ecco il pane": "audio/ecco-il-pane.mp3",
    "il pane caldo": "audio/il-pane-caldo.mp3",
    "e il formaggio": "audio/e-il-formaggio.mp3",
    "bene il formaggio": "audio/bene-il-formaggio.mp3",
    "guarda la frutta": "audio/guarda-la-frutta.mp3",
    "la frutta fresca": "audio/la-frutta-fresca.mp3",
    "poi la verdura": "audio/poi-la-verdura.mp3",
    "sì la verdura": "audio/si-la-verdura.mp3",
    "dopo il gelato": "audio/dopo-il-gelato.mp3",
    "il gelato dopo": "audio/il-gelato-dopo.mp3",
    "bevi l'acqua": "audio/bevi-l-acqua.mp3",
    "brava l'acqua": "audio/brava-l-acqua.mp3",
    "per me il caffè": "audio/per-me-il-caffe.mp3",
    "il caffè piccolo": "audio/il-caffe-piccolo.mp3",
    "ripeti nonna ho fame": "audio/ripeti-nonna-ho-fame.mp3",
    "ascolta nonna mi piace la pasta": "audio/ascolta-mi-piace.mp3",
    "chiedimi così cosa mangi oggi": "audio/chiedimi-cosi.mp3",
    "te lo ricordi cos'è questo": "audio/te-lo-ricordi.mp3",
    "esatto la pizza": "audio/esatto-la-pizza.mp3",
    "e questo tesoro": "audio/e-questo-tesoro.mp3",
    "sì proprio la pasta": "audio/si-proprio-la-pasta.mp3",
    "e tu hai fame": "audio/e-tu-hai-fame.mp3",
    "allora vieni tesoro": "audio/allora-vieni-tesoro.mp3",
    "la pasta ti piace dimmelo": "audio/la-pasta-ti-piace.mp3",
    "anche a me tesoro": "audio/anche-a-me-tesoro.mp3",
    "adesso chiedimi del pranzo": "audio/adesso-chiedimi.mp3",
    "mi saluti ciao ciao buon appetito": "audio/mi-saluti-ciao.mp3",
    "la pizza": "audio/la-pizza.mp3",
    "la pasta": "audio/la-pasta.mp3",
    "il pane": "audio/il-pane.mp3",
    "il formaggio": "audio/il-formaggio.mp3",
    "la frutta": "audio/la-frutta.mp3",
    "la verdura": "audio/la-verdura.mp3",
    "il gelato": "audio/il-gelato.mp3",
    "l'acqua": "audio/l-acqua.mp3",
    "il caffè": "audio/il-caffe.mp3",
    "nonna mi piace la pasta": "audio/nonna-mi-piace-la-pasta.mp3",
    "nonna ho fame": "audio/nonna-ho-fame.mp3",
    "cosa mangi oggi": "audio/cosa-mangi-oggi.mp3",
    "ciao ciao nonna buon appetito": "audio/ciao-ciao-nonna.mp3",
    bravissima: "audio/bravissima.mp3",
    "esatto tesoro": "audio/esatto-tesoro.mp3",
    perfetto: "audio/perfetto.mp3",
    "proprio così": "audio/proprio-cosi.mp3",
    benissimo: "audio/benissimo.mp3",
    "ora lo sai": "audio/ora-lo-sai.mp3",
    "brava anche a me": "audio/brava-anche-a-me.mp3",
    "vieni a mangiare": "audio/vieni-a-mangiare.mp3",
    "oggi pasta e fagioli": "audio/oggi-pasta-e-fagioli.mp3",
    "buon appetito tesoro": "audio/buon-appetito-tesoro.mp3",
    "quasi tesoro": "audio/quasi-tesoro.mp3",
    "ci sei quasi": "audio/ci-sei-quasi.mp3",
    "non proprio amore": "audio/non-proprio-amore.mp3",
    "ciao arianna": "audio/ciao-arianna.mp3",
    "ciao tesoro": "audio/ciao-tesoro.mp3"
  };

  function clipKey(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[’‘ʼ]/g, "'")
      .replace(/[^a-zàèéìòóù']+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  var player = null;

  function audioEl() {
    if (!player) {
      player = new Audio();
      player.preload = "auto";
      player.setAttribute("playsinline", "");
      player.playsInline = true;
    }
    return player;
  }

  function stopAudio() {
    if (!player) return;
    try {
      player.pause();
    } catch (err) {
      /* ignore */
    }
  }

  function supported() {
    return !!(root.SpeechRecognition || root.webkitSpeechRecognition);
  }

  function prime() {
    try {
      if (root.speechSynthesis) root.speechSynthesis.getVoices();
    } catch (err) {
      /* ignore */
    }
  }

  function pickVoice() {
    if (!root.speechSynthesis) return null;
    var voices = [];
    try {
      voices = root.speechSynthesis.getVoices() || [];
    } catch (err) {
      return null;
    }
    var italian = voices.filter(function (voice) {
      return /^it([-_]|$)/i.test(voice.lang || "");
    });
    var female = italian.filter(function (voice) {
      return !/diego|luca|paolo|giorgio|cosimo|marco|matteo|giuseppe|carlo|enrico|piero|davide|eddy/i.test(voice.name || "");
    });
    var pool = female.length ? female : italian;
    var preferred = pool.find(function (voice) {
      return /elsa|isabella|alice|alessia|elena|silvia|paola|chiara|francesca|federica|emma|flo/i.test(voice.name || "");
    });
    return preferred || pool[0] || null;
  }

  var token = 0;
  var queue = [];
  var pumping = false;

  function cancel() {
    token += 1;
    queue.length = 0;
    pumping = false;
    stopAudio();
    try {
      if (root.speechSynthesis) root.speechSynthesis.cancel();
    } catch (err) {
      /* ignore */
    }
  }

  function playClip(url, myToken) {
    return new Promise(function (resolve) {
      if (!url || myToken !== token) {
        resolve("skipped");
        return;
      }
      var audio = audioEl();
      var settled = false;
      var finish = function (status) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        audio.removeEventListener("ended", onEnd);
        audio.removeEventListener("error", onErr);
        audio.removeEventListener("pause", onPause);
        resolve(status);
      };
      var onEnd = function () {
        finish(myToken === token ? "played" : "skipped");
      };
      var onErr = function () {
        finish("failed");
      };
      var onPause = function () {
        if (myToken !== token) finish("skipped");
      };
      var timer = setTimeout(function () {
        finish(myToken === token ? "played" : "skipped");
      }, 15000);
      audio.addEventListener("ended", onEnd);
      audio.addEventListener("error", onErr);
      audio.addEventListener("pause", onPause);
      audio.src = url;
      var started;
      try {
        started = audio.play();
      } catch (err) {
        finish("failed");
        return;
      }
      if (started && started.catch) {
        started.catch(function () {
          finish("failed");
        });
      }
    });
  }

  function utter(text, myToken) {
    return new Promise(function (resolve) {
      if (!root.speechSynthesis || !text || myToken !== token) {
        resolve();
        return;
      }
      var settled = false;
      var done = function () {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve();
      };
      var utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "it-IT";
      utterance.rate = 0.86;
      utterance.pitch = 0.84;
      var voice = pickVoice();
      if (voice) utterance.voice = voice;
      utterance.onend = done;
      utterance.onerror = done;
      var timer = setTimeout(done, Math.min(9000, 1600 + text.length * 70));
      try {
        root.speechSynthesis.resume();
        root.speechSynthesis.speak(utterance);
      } catch (err) {
        done();
      }
    });
  }

  function speakOne(text, myToken) {
    var url = CLIPS[clipKey(text)];
    if (!url) return utter(text, myToken);
    return playClip(url, myToken).then(function (status) {
      if (status === "failed" && myToken === token) return utter(text, myToken);
    });
  }

  function pump() {
    if (pumping) return;
    var item = queue[0];
    if (!item) return;
    if (item.token !== token) {
      queue.shift();
      item.resolve();
      pump();
      return;
    }
    pumping = true;
    speakOne(item.text, item.token).then(function () {
      pumping = false;
      if (queue[0] === item) queue.shift();
      item.resolve();
      pump();
    });
  }

  function speak(text) {
    if (!text) return Promise.resolve();
    return new Promise(function (resolve) {
      queue.push({ text: text, resolve: resolve, token: token });
      pump();
    });
  }

  function listen(handlers) {
    var Ctor = root.SpeechRecognition || root.webkitSpeechRecognition;
    if (!Ctor) {
      handlers.onError && handlers.onError("unsupported");
      return { stop: function () {}, abort: function () {} };
    }

    var dead = false;
    var rec = null;
    var settled = false;
    var finish = function (fn) {
      if (settled) return;
      settled = true;
      clearTimeout(watchdog);
      fn();
    };

    var wasSpeaking = !!(
      (root.speechSynthesis && root.speechSynthesis.speaking) ||
      (player && !player.paused)
    );
    cancel();

    var watchdog = setTimeout(function () {
      try {
        if (rec) rec.abort();
      } catch (err) {
        /* ignore */
      }
      finish(function () {
        handlers.onError && handlers.onError("timeout");
      });
    }, 12000);

    var startTimer = setTimeout(function () {
      if (dead) return;
      rec = new Ctor();
      rec.lang = "it-IT";
      rec.interimResults = true;
      rec.continuous = false;
      rec.maxAlternatives = 5;

      rec.onresult = function (event) {
        var interim = "";
        var finalText = "";
        var alts = [];
        for (var i = event.resultIndex; i < event.results.length; i++) {
          var result = event.results[i];
          if (result.isFinal) {
            finalText += result[0].transcript;
            for (var j = 0; j < result.length; j++) alts.push(result[j].transcript);
          } else {
            interim += result[0].transcript;
          }
        }
        if (interim && handlers.onPartial) handlers.onPartial(interim);
        if (finalText && handlers.onFinal) handlers.onFinal(finalText, alts);
      };

      rec.onerror = function (event) {
        var code = (event && event.error) || "error";
        if (code === "aborted") {
          finish(function () {});
          return;
        }
        finish(function () {
          handlers.onError && handlers.onError(code);
        });
      };

      rec.onend = function () {
        finish(function () {
          handlers.onEnd && handlers.onEnd();
        });
      };

      try {
        rec.start();
      } catch (err) {
        finish(function () {
          handlers.onError && handlers.onError("start");
        });
      }
    }, wasSpeaking ? 180 : 40);

    return {
      stop: function () {
        dead = true;
        clearTimeout(startTimer);
        try {
          if (rec) rec.stop();
        } catch (err) {
          /* ignore */
        }
      },
      abort: function () {
        dead = true;
        clearTimeout(startTimer);
        clearTimeout(watchdog);
        settled = true;
        try {
          if (rec) rec.abort();
        } catch (err) {
          /* ignore */
        }
      }
    };
  }

  if (root.speechSynthesis) {
    try {
      root.speechSynthesis.addEventListener("voiceschanged", prime);
    } catch (err) {
      /* ignore */
    }
  }

  root.NonnaSpeech = {
    supported: supported,
    prime: prime,
    speak: speak,
    cancel: cancel,
    listen: listen,
    clipKey: clipKey,
    clips: CLIPS
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
