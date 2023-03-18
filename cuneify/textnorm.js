const replacements = {
  '\u2081': '1',
  '\u2082': '2',
  '\u2083': '3',
  '\u2084': '4',
  '\u2085': '5',
  '\u2086': '6',
  '\u2087': '7',
  '\u2088': '8',
  '\u2089': '9',
  '\u2080': '0',
  '\u2093': 'x',
  //'\t': ' ',
  '\u2308': '[',
  '\u2309': ']',
  '\u02f9': '[',  // 761
  '\u02fa': ']',
  '\u2e22': '[',  // 11810
  '\u2e23': ']',
  '\u01c0': '|',
  '\u00d7': 'x',
  '\u2019': '\'', // variant apostrophe
  '\u02bc': '\'', // variant apostrophe
  '\u2013': '-',  // en dash
  '\u2014': '-', // em dash
};

function make_matcher_re(replacements_dict) {
  var matcherstr = "";
  for (let k in replacements_dict) {
    matcherstr = matcherstr  + k;
  }
  return RegExp("["+matcherstr + "]", "g");
}
// Convert all vowels with accents to vowels and number suffixes.
var accent_to_number = {
  "\u00e1": ["a", 2],  // a acute
  "\u00e0": ["a", 3],  // a grave
  "\u00e2": ["a", 4],  // a circumflex
  "\u00e9": ["e", 2],  // e acute
  "\u00e8": ["e", 3],  // e grave
  "\u00ea": ["e", 4],  // e circumflex
  "\u00ed": ["i", 2],  // i acute
  "\u00ec": ["i", 3],  // i grave
  "\u00ee": ["i", 4],  // i circumflex
  "\u00fa": ["u", 2],  // u acute
  "\u00f9": ["u", 3],  // u grave
  "\u00fb": ["u", 4],  // u circumflex
  "\u1e2b": ["h", ''],  // h with breve below
}
const accentmatcher = make_matcher_re(accent_to_number)
const matcher = make_matcher_re(replacements)

const to_unicode = {
  //      "aa": '\u0101',
  //        "ii": '\u012b',
  //          "uu": '\u016b',
  "sz":    "\u0161",
  "SZ":    "\u0160",
  "s,":    "\u1e63",
  "S,":    "\u1e62",
  "t,":    "\u1e6d",
  "T,":    "\u1e6c",
  "j":    "\u011d",
  "J":    "\u011c",
  //"h":    "\u1e2b",
};

var to_unicodestr = "";
for (let k in to_unicode) {
  to_unicodestr = to_unicodestr + "|" + k;
}
const to_unicode_re = new RegExp("("+to_unicodestr.substring(1) + ")", "g");

function translit_to_unicode(s) {
  // Substitute ascii with unicode.
  s = s.replace(to_unicode_re, function (m) {
    return to_unicode[m];
  });
  return s;
}

function text_norm_input(s) {
  // Substitute unicode subscripts, damage markers.
  s = s.replace(matcher, function (m) {
    return replacements[m];
  });
  // Remove edit markers- angle or square brackets, and underscore.
  s = s.replace(/[_<>\]\[]/g, "");
  // Replace punctuation with spaces.
  s = s.replace(/[{}\t*,;?()]/g, " ");
  s = s.replace(/!/g, " ! ");
  s = s.replace(/  +/g, " ");
  return s;
}

// Replace all accents with the corresponding vowel and add the digit suffix.
// Takes one reading at a time.
function replace_accents(sp) {
  if (accentmatcher.test(sp)) {
    for (let acc in accent_to_number) {
      if (sp.includes(acc)) {
	sp = sp.replace(acc, accent_to_number[acc][0])  + accent_to_number[acc][1];
      }
    }
  }
  return sp;
}

function map_hex_codepoints(sp) {
  if (sp.startsWith('0x')) {
    // Convert from UTF-16 to UCS-2
    // cf https://mathiasbynens.be/notes/javascript-encoding
    // Reverse is C = (H - 0xD800) * 0x400 + L - 0xDC00 + 0x10000
    var spi = parseInt(sp, 16);
    var high = Math.floor((spi - 0x10000) / 0x400) + 0xD800
    var low = (spi - 0x10000) % 0x400 + 0xDC00
    return String.fromCharCode(high) + String.fromCharCode(low);
  }
  return sp;
}
