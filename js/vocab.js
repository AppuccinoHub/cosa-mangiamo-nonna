/* Lunch call script for Cosa mangiamo, Nonna?
   Act 1 (practice): Nonna says the word or phrase, Arianna says it back.
   Act 2 (recall): Nonna asks, and Arianna says those same words again. */
(function (root) {
  "use strict";

  var FOOD = {
    pizza: {
      say: "La pizza.",
      phonetic: "lah PEET-sah",
      accept: ["la pizza", "pizza", "una pizza", "della pizza", "pizza margherita", "una pizza margherita", "margherita", "una margherita", "la margherita"],
      distractors: ["La pasta.", "Il gelato.", "Il caffè."],
      why: "Pizza is the same word in Italian. La means “the,” so la pizza is “the pizza.”"
    },
    pasta: {
      say: "La pasta.",
      phonetic: "lah PAHS-tah",
      accept: ["la pasta", "pasta", "una pasta", "della pasta", "spaghetti", "gli spaghetti", "lo spaghetti", "maccheroni", "pastasciutta", "la pastasciutta"],
      distractors: ["La pizza.", "Il pane.", "La frutta."],
      why: "Pasta is the dish. Spaghetti is one kind of pasta, so that word counts too."
    },
    pane: {
      say: "Il pane.",
      phonetic: "eel PAH-neh",
      accept: ["il pane", "pane", "del pane", "un pane", "un pezzo di pane", "il panino", "panino", "un panino"],
      distractors: ["Il formaggio.", "La verdura.", "Il gelato."],
      why: "Pane means bread. Il is “the” for a masculine word like pane."
    },
    formaggio: {
      say: "Il formaggio.",
      phonetic: "eel for-MAH-joh",
      accept: ["il formaggio", "formaggio", "del formaggio", "un formaggio", "formaggi", "mozzarella", "la mozzarella"],
      distractors: ["Il pane.", "La pizza.", "Il caffè."],
      why: "Formaggio means cheese. The double g sounds like the j in “joke.”"
    },
    frutta: {
      say: "La frutta.",
      phonetic: "lah FROOT-tah",
      accept: ["la frutta", "frutta", "della frutta", "un frutto", "frutto", "i frutti", "mela", "la mela", "mele"],
      distractors: ["La verdura.", "Il gelato.", "Il pane."],
      why: "Frutta means fruit, the whole bowl of it. One piece is un frutto."
    },
    verdura: {
      say: "La verdura.",
      phonetic: "lah ver-DOO-rah",
      accept: ["la verdura", "verdura", "verdure", "le verdure", "della verdura", "insalata", "l'insalata", "un'insalata", "contorno"],
      distractors: ["La frutta.", "La pasta.", "L'acqua."],
      why: "Verdura means vegetables. Verdure is the plural, and that counts too."
    },
    gelato: {
      say: "Il gelato.",
      phonetic: "eel jeh-LAH-toh",
      accept: ["il gelato", "gelato", "un gelato", "del gelato", "gelati", "i gelati"],
      distractors: ["Il caffè.", "La frutta.", "La pizza."],
      why: "Gelato is Italian ice cream. The g is soft, like the j in “gel.”"
    },
    acqua: {
      say: "L'acqua.",
      phonetic: "LAHK-kwah",
      accept: ["l'acqua", "acqua", "dell'acqua", "un'acqua", "un bicchiere d'acqua", "un bicchiere di acqua", "acqua naturale", "dell acqua"],
      distractors: ["Il caffè.", "Il gelato.", "La frutta."],
      why: "Acqua means water. L’acqua uses L’ because acqua starts with a vowel."
    },
    caffe: {
      say: "Il caffè.",
      phonetic: "eel kaf-FEH",
      accept: ["il caffè", "caffè", "caffe", "il caffe", "un caffè", "un caffe", "del caffè", "espresso", "un espresso", "un caffè espresso"],
      distractors: ["L'acqua.", "Il gelato.", "Il formaggio."],
      why: "Caffè means coffee. The stress sits on the last syllable: caf-FÈ."
    }
  };

  var PHRASE = {
    hungry: {
      say: "Nonna, ho fame!",
      phonetic: "NON-nah oh FAH-meh",
      accept: ["nonna ho fame", "ho fame", "ho tanta fame", "nonna ho tanta fame", "ho fame nonna", "nonna ho molta fame", "ho molta fame"],
      distractors: ["Nonna, mi piace la pasta!", "Cosa mangi oggi?", "Il pane."],
      why: "Ho fame means “I’m hungry.” Fame is hunger — not the English word famous."
    },
    like: {
      say: "Nonna, mi piace la pasta!",
      phonetic: "NON-nah mee PYAH-cheh lah PAHS-tah",
      accept: ["nonna mi piace la pasta", "mi piace la pasta", "mi piace pasta", "nonna mi piace pasta", "a me piace la pasta", "mi piace la pasta nonna", "nonna a me piace la pasta"],
      distractors: ["Nonna, ho fame!", "Cosa mangi oggi?", "La pizza."],
      why: "Mi piace means “I like it.” You said her name, then the food you love."
    },
    ask: {
      say: "Cosa mangi oggi?",
      phonetic: "KOH-zah MAHN-jee OH-jee",
      accept: ["cosa mangi oggi", "cosa mangi oggi nonna", "nonna cosa mangi oggi", "che cosa mangi oggi", "che mangi oggi", "cosa mangia oggi", "nonna che cosa mangi oggi", "oggi cosa mangi"],
      distractors: ["Nonna, ho fame!", "Nonna, mi piace la pasta!", "La pasta."],
      why: "Cosa mangi oggi? asks “What are you eating today?” Oggi means today."
    },
    bye: {
      say: "Ciao ciao, Nonna! Buon appetito!",
      phonetic: "CHOW chow, NON-nah! bwon ahp-peh-TEE-toh",
      accept: ["ciao ciao nonna buon appetito", "ciao ciao buon appetito", "ciao nonna buon appetito", "buon appetito nonna", "buon appetito", "nonna buon appetito", "ciao ciao nonna", "ciao ciao nonna e buon appetito"],
      distractors: ["Grazie, Nonna", "A domani, Nonna", "Buonanotte, Nonna"],
      why: "Buon appetito is what you say before a meal — enjoy your food. Ciao ciao is the double goodbye."
    }
  };

  function food(id, phase, extra) {
    var base = FOOD[id];
    return {
      id: extra.id,
      kind: "food",
      phase: phase,
      food: id,
      place: extra.place || "",
      english: extra.english,
      nonna: extra.nonna,
      reply: extra.reply,
      replyEn: extra.replyEn,
      variants: [{ say: base.say, phonetic: base.phonetic }],
      accept: base.accept,
      why: base.why,
      distractors: base.distractors
    };
  }

  function phrase(id, phase, extra) {
    var base = PHRASE[id];
    return {
      id: extra.id,
      kind: extra.kind || "sentence",
      phase: phase,
      food: extra.food || "",
      place: extra.place || "",
      english: extra.english,
      nonna: extra.nonna,
      reply: extra.reply,
      replyEn: extra.replyEn,
      variants: [{ say: base.say, phonetic: base.phonetic }],
      accept: base.accept,
      why: base.why,
      distractors: base.distractors
    };
  }

  var cards = [
    food("pizza", "practice", {
      id: "pizza",
      place: "pizza",
      english: "She sees pizza. Say it back.",
      nonna: "Guarda, la pizza!",
      reply: "Sì, la pizza!",
      replyEn: "Yes, pizza!"
    }),
    food("pasta", "practice", {
      id: "pasta",
      place: "pasta",
      english: "She sees pasta. Say it back.",
      nonna: "Adesso la pasta.",
      reply: "La pasta, che buona!",
      replyEn: "Pasta — so good!"
    }),
    food("pane", "practice", {
      id: "pane",
      place: "pane",
      english: "She sees bread. Say it back.",
      nonna: "Ecco il pane.",
      reply: "Il pane, caldo.",
      replyEn: "The bread is warm."
    }),
    food("formaggio", "practice", {
      id: "formaggio",
      place: "formaggio",
      english: "She sees cheese. Say it back.",
      nonna: "E il formaggio.",
      reply: "Bene, il formaggio.",
      replyEn: "Good — the cheese."
    }),
    food("frutta", "practice", {
      id: "frutta",
      place: "frutta",
      english: "She sees fruit. Say it back.",
      nonna: "Guarda la frutta.",
      reply: "La frutta, fresca.",
      replyEn: "The fruit is fresh."
    }),
    food("verdura", "practice", {
      id: "verdura",
      place: "verdura",
      english: "She sees vegetables. Say it back.",
      nonna: "Poi la verdura.",
      reply: "Sì, la verdura.",
      replyEn: "Yes, the vegetables."
    }),
    food("gelato", "practice", {
      id: "gelato",
      place: "gelato",
      english: "She sees ice cream. Say it back.",
      nonna: "Dopo, il gelato.",
      reply: "Il gelato, dopo.",
      replyEn: "Ice cream, after lunch."
    }),
    food("acqua", "practice", {
      id: "acqua",
      place: "acqua",
      english: "She sees water. Say it back.",
      nonna: "Bevi l'acqua.",
      reply: "Brava, l'acqua.",
      replyEn: "Good — the water."
    }),
    food("caffe", "practice", {
      id: "caffe",
      place: "caffe",
      english: "She sees coffee. Say it back.",
      nonna: "Per me, il caffè.",
      reply: "Il caffè, piccolo.",
      replyEn: "A little coffee, for her."
    }),
    phrase("hungry", "practice", {
      id: "hungry",
      place: "posto",
      english: "Say it with her: Grandma, I'm hungry!",
      nonna: "Ripeti: Nonna, ho fame!",
      reply: "Vieni a mangiare!",
      replyEn: "Come and eat!"
    }),
    phrase("like", "practice", {
      id: "like",
      english: "Say it with her: Grandma, I like pasta!",
      nonna: "Ascolta: Nonna, mi piace la pasta!",
      reply: "Brava! Anche a me!",
      replyEn: "Me too. I love it."
    }),
    phrase("ask", "practice", {
      id: "ask",
      place: "fagioli",
      english: "Ask it with her: What are you eating today?",
      nonna: "Chiedimi così: cosa mangi oggi?",
      reply: "Oggi pasta e fagioli!",
      replyEn: "Today, pasta and beans."
    }),
    food("pizza", "recall", {
      id: "pizza2",
      english: "She holds it up. What is it? You said this earlier.",
      nonna: "Te lo ricordi? Cos'è questo?",
      reply: "Esatto, la pizza!",
      replyEn: "Exactly — pizza!"
    }),
    food("pasta", "recall", {
      id: "pasta2",
      english: "And this one? You already named it.",
      nonna: "E questo, tesoro?",
      reply: "Sì, proprio la pasta!",
      replyEn: "Yes, that's pasta."
    }),
    phrase("hungry", "recall", {
      id: "hungry2",
      english: "She asks if you're hungry. Tell her, the way you practiced.",
      nonna: "E tu, hai fame?",
      reply: "Allora vieni, tesoro!",
      replyEn: "Then come, darling."
    }),
    phrase("like", "recall", {
      id: "like2",
      english: "Does she like pasta? Tell her you do, in a full sentence.",
      nonna: "La pasta ti piace? Dimmelo.",
      reply: "Anche a me, tesoro!",
      replyEn: "Me too, darling."
    }),
    phrase("ask", "recall", {
      id: "ask2",
      english: "Ask what she's eating. You practiced this question.",
      nonna: "Adesso chiedimi del pranzo.",
      reply: "Oggi pasta e fagioli!",
      replyEn: "Today, pasta and beans."
    }),
    phrase("bye", "practice", {
      id: "bye",
      kind: "goodbye",
      english: "Say goodbye, and wish her a good meal.",
      nonna: "Mi saluti? Ciao ciao, buon appetito!",
      reply: "Buon appetito, tesoro!",
      replyEn: "Enjoy your meal, darling."
    })
  ];

  root.NONNA_VOCAB = { cards: cards };
})(typeof globalThis !== "undefined" ? globalThis : this);
