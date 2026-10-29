/* Food drawings for La tavola di Nonna. */
(function (root) {
  "use strict";

  var LABELS = {
    pizza: "Pizza",
    pasta: "Pasta",
    pane: "Pane",
    formaggio: "Formaggio",
    frutta: "Frutta",
    verdura: "Verdura",
    gelato: "Gelato",
    acqua: "Acqua",
    caffe: "Caffè",
    fagioli: "Fagioli",
    posto: "Posto"
  };

  var BODIES = {
    pizza:
      '<circle cx="32" cy="32" r="26" fill="#e4b56a"/>' +
      '<circle cx="32" cy="32" r="21" fill="#d94b38"/>' +
      '<circle cx="32" cy="32" r="17" fill="#f6d56a"/>' +
      '<circle cx="24" cy="28" r="2.6" fill="#c44732"/>' +
      '<circle cx="36" cy="26" r="2.6" fill="#c44732"/>' +
      '<circle cx="30" cy="36" r="2.6" fill="#c44732"/>' +
      '<circle cx="40" cy="34" r="2" fill="#3e7a45"/>' +
      '<circle cx="23" cy="36" r="1.8" fill="#3e7a45"/>' +
      '<path d="M32 11 V53 M11 32 H53" stroke="#f0d7a4" stroke-width="1.4" opacity=".85"/>',
    pasta:
      '<ellipse cx="32" cy="44" rx="22" ry="9" fill="#f7f1e8"/>' +
      '<path d="M12 40 Q32 22 52 40 V46 Q32 56 12 46 Z" fill="#f4efe6" stroke="#e4d3c0" stroke-width="1.5"/>' +
      '<path d="M16 38 Q32 24 48 38" fill="none" stroke="#f0d27a" stroke-width="3.2" stroke-linecap="round"/>' +
      '<path d="M18 41 Q32 30 46 41" fill="none" stroke="#e23d32" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M20 36 Q28 30 26 40" fill="none" stroke="#f6e2a4" stroke-width="2" stroke-linecap="round"/>',
    pane:
      '<ellipse cx="32" cy="40" rx="22" ry="12" fill="#e0a04a"/>' +
      '<path d="M12 38 Q32 16 52 38 Q32 28 12 38 Z" fill="#f2c56e"/>' +
      '<path d="M22 30 Q24 36 20 38 M32 26 Q34 34 30 38 M42 30 Q44 36 40 38" fill="none" stroke="#c4843a" stroke-width="1.5" stroke-linecap="round"/>',
    formaggio:
      '<path d="M12 48 L32 14 L52 48 Z" fill="#f6de6a"/>' +
      '<path d="M18 48 L32 22 L46 48 Z" fill="#ffe98a"/>' +
      '<circle cx="30" cy="36" r="2.3" fill="#e6c14a"/>' +
      '<circle cx="37" cy="42" r="2.6" fill="#e6c14a"/>' +
      '<circle cx="27" cy="44" r="1.7" fill="#e6c14a"/>' +
      '<path d="M12 48 H52" stroke="#e2b43a" stroke-width="3" stroke-linecap="round"/>',
    frutta:
      '<circle cx="24" cy="38" r="13" fill="#e23d4a"/>' +
      '<path d="M24 26 Q30 16 38 18" fill="none" stroke="#6b4a32" stroke-width="2" stroke-linecap="round"/>' +
      '<ellipse cx="34" cy="20" rx="7" ry="3.4" fill="#2f7d4e" transform="rotate(-24 34 20)"/>' +
      '<circle cx="44" cy="28" r="5" fill="#7a3d92"/>' +
      '<circle cx="50" cy="36" r="4.6" fill="#8d4eaa"/>' +
      '<circle cx="44" cy="40" r="4.2" fill="#6a3484"/>',
    verdura:
      '<circle cx="22" cy="36" r="11" fill="#3e9a4a"/>' +
      '<circle cx="32" cy="28" r="10" fill="#2f7d3e"/>' +
      '<circle cx="34" cy="40" r="9" fill="#57b362"/>' +
      '<circle cx="48" cy="40" r="9" fill="#e23d4a"/>' +
      '<path d="M48 32 Q54 24 50 18" fill="none" stroke="#2f7d4e" stroke-width="2" stroke-linecap="round"/>' +
      '<ellipse cx="48" cy="40" rx="3" ry="2" fill="#f6d2cc"/>',
    gelato:
      '<circle cx="32" cy="22" r="10" fill="#f2a3c0"/>' +
      '<circle cx="23" cy="28" r="8" fill="#f6d56b"/>' +
      '<circle cx="41" cy="28" r="8" fill="#b7d36a"/>' +
      '<path d="M22 34 L32 56 L42 34 Z" fill="#e0a15a"/>' +
      '<path d="M26 40 H38 M28 46 H36" stroke="#c4843a" stroke-width="1.3"/>',
    acqua:
      '<path d="M20 16 H44 L39 54 H25 Z" fill="#e7f6ff" stroke="#8ecae6" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M22 34 H42" stroke="#b7e4f8" stroke-width="4"/>' +
      '<ellipse cx="32" cy="26" rx="9" ry="3" fill="#d5f1ff"/>',
    caffe:
      '<path d="M16 28 H44 V40 Q44 52 30 52 Q16 52 16 40 Z" fill="#fffaf4" stroke="#e4d5c4" stroke-width="1.6"/>' +
      '<ellipse cx="30" cy="28" rx="14" ry="5" fill="#f7f1e8" stroke="#e4d5c4"/>' +
      '<ellipse cx="30" cy="28" rx="11" ry="3.2" fill="#4a2c22"/>' +
      '<path d="M44 32 H50 Q56 32 56 38 Q56 44 50 44 H44" fill="none" stroke="#e4d5c4" stroke-width="3"/>' +
      '<ellipse cx="30" cy="54" rx="16" ry="3" fill="#e7d3bc"/>',
    fagioli:
      '<path d="M12 36 Q32 22 52 36 V44 Q32 58 12 44 Z" fill="#f7f1e8" stroke="#e4d3c0" stroke-width="1.5"/>' +
      '<ellipse cx="32" cy="38" rx="16" ry="8" fill="#c45c3e"/>' +
      '<ellipse cx="24" cy="36" rx="3.2" ry="2" fill="#f3d27a"/>' +
      '<ellipse cx="34" cy="34" rx="3" ry="1.8" fill="#f6e2a0"/>' +
      '<ellipse cx="40" cy="40" rx="2.8" ry="1.8" fill="#6b8f3a"/>' +
      '<ellipse cx="28" cy="42" rx="2.6" ry="1.6" fill="#f3d27a"/>',
    posto:
      '<rect x="12" y="16" width="20" height="30" rx="3" fill="#fffaf4" stroke="#e7d3c4" stroke-width="1.6"/>' +
      '<path d="M40 14 V48" fill="none" stroke="#b7c0c8" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M34 14 V26 Q40 32 46 26 V14" fill="none" stroke="#b7c0c8" stroke-width="2.2" stroke-linecap="round"/>'
  };

  function svg(id) {
    return '<svg viewBox="0 0 64 64" aria-hidden="true">' + (BODIES[id] || BODIES.posto) + "</svg>";
  }

  root.PLATES = {
    svg: svg,
    label: function (id) {
      return LABELS[id] || "";
    }
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
