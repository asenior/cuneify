// Mostly the UI parts of cuneify.
// Most of the work is done in cuneify_lib.js

var stored_rows = "";

function to_cuneiform() {
  const make_signlist = document.getElementById("make_signlist").checked;
  const myinput = document.getElementById("translit").value;
  const font_name = document.getElementById("font_name").value;
  const new_row = reading_to_table_row(myinput, font_name, make_signlist);
  stored_rows = new_row + stored_rows;
  const header = cuneify_header();
  var myoutput = document.getElementById("output");
  myoutput.innerHTML = header +
      '<h3>Cuneiform</h3>' + stored_rows + "</table>";
  // conditionally_copy_to_clipboard(textout);
}

function on_load() {
  total_counts();
}

function clear_output() {
  var myoutput = document.getElementById("output");
  stored_rows = "";
  myoutput.innerHTML = "<table></table>";
  clear_input();
}
function clear_input() {
  var myinput = document.getElementById("translit");
  myinput.value = "";
}
function inject_sample_text() {
  var myinput = document.getElementById("translit");
  myinput.innerHTML = "e\u2082.gal {m}a\u0161-\u0161ur-pap-a \u0161id a\u0161-\u0161ur-ni-\u0161it {d}bad u {d}ma\u0161 na-ra-am {d}a-nim u {d}da-gan ka-\u0161u-u\u0161 dingir{me\u0161} gal{me\u0161}";
}



function return_events(event) {
  // 13 is the keycode for "enter"
  if (event.keyCode == 13 && !event.shiftKey) {
    to_cuneiform();
  }
  if (event.keyCode == 13 && event.shiftKey) {
  }
}
async function conditionally_copy_to_clipboard(text) {
  var checkBox = document.getElementById("autocopy");
  if (checkBox.checked) {
    copy_to_clipboard(text)
  }
}
