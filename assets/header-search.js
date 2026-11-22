/* 0x7C2f shared client-side site search module.
   Provides instant search across pages, blog posts, and PDFs with full
   keyboard navigation (/, ArrowDown, ArrowUp, Enter, Escape). */
(function () {
  "use strict";

  var SITE_INDEX = [
    { title: "Startpage", url: "/", type: "page", keywords: "home startpage search bookmarks" },
    { title: "Blog", url: "/blog/", type: "page", keywords: "posts articles writing" },
    { title: "Files (PDF Library)", url: "/files/", type: "page", keywords: "pdf books downloads library" },
    { title: "About 0x7C2f", url: "/about/", type: "page", keywords: "about author site github links" },
    { title: "Doppler Curve Localization Simulator", url: "/doppler-curve-localization-simulator/", type: "tool", keywords: "doppler acoustic physics simulator" },
    { title: "Fluid Music Visualizer (WebGL)", url: "/fluid-visualizer/", type: "tool", keywords: "fluid webgl simulation music audio visualizer fft" },
    { title: "How to Use the MCP Server Repository List", url: "/mcp-usage-guide/", type: "post", keywords: "mcp api json vscode claude python node" },
    { title: "Can You Run MCP Servers on GitHub Pages?", url: "/mcp-servers-github-pages/", type: "post", keywords: "mcp github pages static hosting typescript" },
    { title: "Dead Children Currency", url: "/dead-children-currency/", type: "post", keywords: "satire economics opportunity cost charity" },
    { title: "1984 (PDF)", url: "/files/1984.pdf", type: "pdf", keywords: "orwell dystopia book" },
    { title: "Avoid the News (PDF)", url: "/files/avoid_the_news.pdf", type: "pdf", keywords: "media news essay" },
    { title: "Children of the Matrix (PDF)", url: "/files/david_icke_children_of_the_matrix.pdf", type: "pdf", keywords: "david icke book" },
    { title: "DDD Update (PDF)", url: "/files/ddd_update.pdf", type: "pdf", keywords: "ddd domain driven design" },
    { title: "DDDOA (PDF)", url: "/files/dddoa.pdf", type: "pdf", keywords: "dddoa document" },
    { title: "How to Do Nothing (PDF)", url: "/files/how_to_do_nothing.pdf", type: "pdf", keywords: "attention economy book" },
    { title: "Jolly Rogers Security Guide for Beginners (PDF)", url: "/files/jolly_rogers_security_guide_for_beginners.pdf", type: "pdf", keywords: "security opsec privacy" },
    { title: "PHP Cookbook (PDF)", url: "/files/php_cookbook.pdf", type: "pdf", keywords: "php programming reference" },
    { title: "Reminiscences of a Stock Operator (PDF)", url: "/files/reminiscences_of_a_stock_operator.pdf", type: "pdf", keywords: "trading markets finance" },
    { title: "The Biggest Secret (PDF)", url: "/files/the_biggest_secret.pdf", type: "pdf", keywords: "book conspiracy" },
    { title: "The Four Agreements (PDF)", url: "/files/the_four_agreements.pdf", type: "pdf", keywords: "philosophy book" },
    { title: "The New Confessions of an Economic Hitman (PDF)", url: "/files/the_new_confessions_of_an_economic_hitman.pdf", type: "pdf", keywords: "economics politics book" }
  ];

  var input = document.getElementById("search-input");
  if (!input) return;

  var container = input.closest(".tui-search");
  if (!container) return;

  var resultsEl = document.createElement("ul");
  resultsEl.className = "tui-search-results";
  resultsEl.id = "search-results";
  resultsEl.setAttribute("role", "listbox");
  resultsEl.hidden = true;
  container.appendChild(resultsEl);

  input.setAttribute("role", "combobox");
  input.setAttribute("aria-autocomplete", "list");
  input.setAttribute("aria-controls", "search-results");
  input.setAttribute("aria-expanded", "false");

  var activeIdx = -1;
  var currentMatches = [];

  function closeResults() {
    resultsEl.hidden = true;
    input.setAttribute("aria-expanded", "false");
    activeIdx = -1;
  }

  function updateSelection() {
    var links = resultsEl.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      links[i].setAttribute("aria-selected", i === activeIdx ? "true" : "false");
    }
    if (activeIdx >= 0 && links[activeIdx]) {
      links[activeIdx].scrollIntoView({ block: "nearest" });
    }
  }

  function render(query) {
    var q = query.trim().toLowerCase();
    if (!q) {
      closeResults();
      return;
    }

    currentMatches = SITE_INDEX.filter(function (item) {
      return (
        item.title.toLowerCase().indexOf(q) !== -1 ||
        item.keywords.toLowerCase().indexOf(q) !== -1 ||
        item.type.toLowerCase().indexOf(q) !== -1
      );
    });

    resultsEl.innerHTML = "";
    activeIdx = currentMatches.length > 0 ? 0 : -1;

    if (currentMatches.length === 0) {
      var emptyLi = document.createElement("li");
      emptyLi.className = "tui-search-empty";
      emptyLi.textContent = "No matching pages or files.";
      resultsEl.appendChild(emptyLi);
    } else {
      currentMatches.slice(0, 8).forEach(function (item, idx) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = item.url;
        a.setAttribute("role", "option");
        a.setAttribute("aria-selected", idx === 0 ? "true" : "false");

        var titleSpan = document.createElement("span");
        titleSpan.className = "tui-search-result-title";
        titleSpan.textContent = item.title;

        var metaSpan = document.createElement("span");
        metaSpan.className = "tui-search-result-meta";
        metaSpan.textContent = "[" + item.type + "] " + item.url;

        a.appendChild(titleSpan);
        a.appendChild(metaSpan);
        li.appendChild(a);
        resultsEl.appendChild(li);
      });
    }

    resultsEl.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }

  input.addEventListener("input", function () {
    render(input.value);
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      input.value = "";
      closeResults();
      input.blur();
      return;
    }
    if (resultsEl.hidden || currentMatches.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        render(input.value);
      }
      return;
    }
    var visibleCount = Math.min(currentMatches.length, 8);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIdx = (activeIdx + 1) % visibleCount;
      updateSelection();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIdx = (activeIdx - 1 + visibleCount) % visibleCount;
      updateSelection();
    } else if (e.key === "Enter") {
      e.preventDefault();
      var target = currentMatches[activeIdx >= 0 ? activeIdx : 0];
      if (target) {
        window.location.href = target.url;
      }
    }
  });

  document.addEventListener("click", function (e) {
    if (!container.contains(e.target)) {
      closeResults();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (
      e.key === "/" &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey &&
      document.activeElement !== input &&
      !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)
    ) {
      e.preventDefault();
      input.focus();
      input.select();
    }
  });
})();
