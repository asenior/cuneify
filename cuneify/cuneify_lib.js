// Take one transliteration unit and convert to a string, if possible.
function map_one_chunk(sp) {
  var sp_orig = sp;
  sp = replace_accents(sp.toLowerCase());
  if (sp in signlist) {
    if (signlist[sp].length == 1) {
      return signlist[sp];
    } else {
      return '[' + signlist[sp].join('|') + ']';
    }
  }
  sp = map_hex_codepoints(sp_orig);
  return sp;
}

// The header for the cuneify table.
function cuneify_header() {
  var header = "<table class=\"bordered_table\"><tr><th>Transliteration</th><th>Cuneiform</th>";
  header += "<th>Sign list</th>";
  header += '</tr>';
  return header;
}

function transliteration_td(unicode_input) {
  return "<td  class=\"other\">" +
      wrap_with_click_to_copy(escape(unicode_input, false) , escape(unicode_input, true)) + "</td>";
}

function cuneiform_td(font_name, res) {
  const textout = res.join("\\n");
  const textout_html = res.join("<br>");
  return "<td class=\"" + font_name + "\">" + wrap_with_click_to_copy(textout, textout_html) + '</td>';
}

function conversions_to_signlist_html(conversions) {
    // Add a third column to the table with sign list.
  var items = Object.keys(conversions);
  var signlist_html = '';
    // Sort the array based on the second element
    items.sort(function(first, second) {
      return row_sums[second] - row_sums[first];
    });
    for (let item_ind in items) {
      const s = items[item_ind];
      var tabrow = '<td title="No frequency data">' + s + " " + "</td><td>";
      var sign_frac;
      if (s in row_sums) {
	sign_frac = ((100.0 * row_sums[s]/grand_total).toFixed(1));
	tabrow = '<td title="' + sign_frac + '%">' + s + " " + "</td><td>";
      }
      var readings = [];
      for (let r in conversions[s]) {
	var rdg = '<span>' + r + ":" + conversions[s][r] + '</span>';
	if (s in row_sums) {
	  const frac = ((100.0 * sign_counts[s][r]/row_sums[s]).toFixed(1));
	  rdg = '<span title="' + frac +'% of ' + sign_frac + '%">' + r + ":" + conversions[s][r] + '</span>';
	}
	readings.push(rdg);
      }
      tabrow += readings.join(' ') + "</td>";
      signlist_html += "<tr>" + tabrow + "</tr>";
    }
  signlist_html = '<table class="no_bordered_table">' + signlist_html + "</table>";
  return signlist_html;
}


// Go through the text and normalize into an array of lines which are space-separated cuneiform.
// Also construct conversions whcih are counts of cuneiform: reading mappings for the signlist.
function normed_unicode_to_cuneiform_lines(unicode_input) {
  const myinput_normed = text_norm_input(unicode_input);
  var conversions = {};
  var reading_lines = [];
  const split_lines = myinput_normed.split(/\n/);
  for (var j in split_lines) {
    var res_inner = [];
    const splittr = split_lines[j].split(/[- .]/);
    for (var i in splittr) {
      var orig = splittr[i];
      rv = map_one_chunk(orig);
      if (rv) {
        res_inner.push(rv);

	// Construct a dict of signs whose values are dicts of reading: count.
	var key = rv + ":" + orig;
	if (!(rv in conversions)) {
	  conversions[rv] = {};
	}
	if (!(orig in conversions[rv])) {
	  conversions[rv][orig] = 0;
	}
	conversions[rv][orig] += 1;
      }
    }
    reading_lines.push(res_inner.join(" "))
  }
  return [reading_lines, conversions];
}

function reading_to_table_row(myinput, font_name, make_signlist) {
  const unicode_input = translit_to_unicode(myinput);
  return_value = normed_unicode_to_cuneiform_lines(unicode_input);
  const reading_lines = return_value[0];
  const conversions = return_value[1];
  var new_row = "<tr>";
  new_row += transliteration_td(unicode_input);
  new_row += cuneiform_td(font_name, reading_lines);

  var signlist_html = '';
  if (make_signlist) {
    signlist_html = conversions_to_signlist_html(conversions);
  }
  new_row += "<td>" + signlist_html + "</td>";
  new_row += "</tr>";
  return new_row;
}


var grand_total = 0;
var row_sums = {}
// Count all the observations in the sign_counts.
function total_counts() {
  grand_total = 0;
  for (let row_ind in sign_counts) {
    const row = sign_counts[row_ind];
    var total = 0;
    for (let k in row) {
      total += row[k];
    }
    row_sums[row_ind] = total;
    grand_total += total;
  }
}
// Escape the input string for display as HTML.
function escape(translit, newline_to_br) {
  translit = translit.replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/"/g, "&quot;")  // Repeat this just to get highlighting right.
      .replace(/'/g, "&#39;")
      .replace(/'/g, "&#39;");  // Repeat this just to get highlighting right.
  if (newline_to_br) {
    translit = translit.replace(/\n/g, "<br>");
  } else {
    translit = translit.replace(/\n/g, "\\n");
  }
  return translit;
}

function wrap_with_click_to_copy(text, html) {
  return "<a onClick=\"copy_to_clipboard('" + text + "');\" style=\"cursor: pointer; cursor: hand;display: inline-block;\">" + html + "</a>";
}

async function copy_to_clipboard(text) {
  try {
    await   navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
}
