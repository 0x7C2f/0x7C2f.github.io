/* 0x7C2f shared header search module.
   Wires up the shared search input consistently across all section pages.
   No backend assumptions: Enter is a no-op (static host), Escape clears. */
(function () {
  "use strict";
  var input = document.getElementById("search-input");
  if (!input) return;
  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      input.value = "";
    }
    if (e.key === "Enter") {
      e.preventDefault();
    }
  });
  input.addEventListener("focus", function () {
    input.select();
  });
})();
