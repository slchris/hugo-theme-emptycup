(function () {
  "use strict";

  var root = document.documentElement;
  var body = document.body;

  function currentTheme() {
    var attr = root.getAttribute("data-theme");
    if (attr === "light" || attr === "dark") return attr;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  /* ---------------------------------------------------------------------
     Theme toggle
     --------------------------------------------------------------------- */
  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {}
    if (typeof window.__emptycupLoadComments === "function") {
      window.__emptycupLoadComments();
    }
    rerenderMermaid();
  }

  document.querySelectorAll(".theme-toggle").forEach(function (button) {
    button.addEventListener("click", function () {
      setTheme(currentTheme() === "dark" ? "light" : "dark");
    });
  });

  /* ---------------------------------------------------------------------
     Article layout: wide (with the post list sidebar) / focus reading
     --------------------------------------------------------------------- */
  var layoutToggle = document.querySelector(".layout-toggle");
  if (layoutToggle) {
    function setLayout(reading) {
      if (reading) {
        root.setAttribute("data-layout", "reading");
      } else {
        root.removeAttribute("data-layout");
      }
      layoutToggle.setAttribute("aria-pressed", String(reading));
      try {
        localStorage.setItem("layout", reading ? "reading" : "wide");
      } catch (e) {}
    }
    layoutToggle.setAttribute("aria-pressed", String(root.getAttribute("data-layout") === "reading"));
    layoutToggle.addEventListener("click", function () {
      setLayout(root.getAttribute("data-layout") !== "reading");
    });
  }

  /* ---------------------------------------------------------------------
     Mobile navigation
     --------------------------------------------------------------------- */
  var header = document.querySelector(".site-header");
  var navToggle = document.querySelector(".nav-toggle");
  if (header && navToggle) {
    var setNav = function (open) {
      header.classList.toggle("nav-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
    };
    navToggle.addEventListener("click", function () {
      setNav(!header.classList.contains("nav-open"));
    });
    document.querySelectorAll(".mobile-nav a").forEach(function (link) {
      link.addEventListener("click", function () {
        setNav(false);
      });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setNav(false);
    });
  }

  /* ---------------------------------------------------------------------
     Back to top
     --------------------------------------------------------------------- */
  var backToTop = document.getElementById("back-to-top");
  function updateBackToTop() {
    if (backToTop) backToTop.classList.toggle("visible", window.scrollY > 400);
  }
  window.addEventListener("scroll", updateBackToTop, { passive: true });
  updateBackToTop();

  /* ---------------------------------------------------------------------
     TOC scroll spy
     --------------------------------------------------------------------- */
  var tocLinks = document.querySelectorAll(
    ".toc-rail .toc-content a[href^='#'], .toc-inline .toc-content a[href^='#']"
  );
  if (tocLinks.length && "IntersectionObserver" in window) {
    var byHeading = new Map();
    var headings = [];
    tocLinks.forEach(function (link) {
      var id;
      try {
        id = decodeURIComponent(link.getAttribute("href").slice(1));
      } catch (e) {
        id = link.getAttribute("href").slice(1);
      }
      var heading = id && document.getElementById(id);
      if (!heading) return;
      if (!byHeading.has(heading)) {
        byHeading.set(heading, []);
        headings.push(heading);
      }
      byHeading.get(heading).push(link);
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var links = byHeading.get(entry.target) || [];
          document.querySelectorAll(".toc-content a.active").forEach(function (link) {
            link.classList.remove("active");
          });
          links.forEach(function (link) {
            link.classList.add("active");
          });
        });
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );
    headings.forEach(function (heading) {
      observer.observe(heading);
    });
  }

  /* ---------------------------------------------------------------------
     Code blocks: copy + collapse
     --------------------------------------------------------------------- */
  var copyEnabled = body.getAttribute("data-code-copy") === "true";
  var maxLines = parseInt(body.getAttribute("data-max-code-lines") || "0", 10);
  var expandLabel = body.getAttribute("data-label-expand") || "Expand";
  var collapseLabel = body.getAttribute("data-label-collapse") || "Collapse";

  document.querySelectorAll(".article-body pre:not(.mermaid)").forEach(function (pre) {
    var block = pre.closest(".highlight");
    if (!block) {
      block = document.createElement("div");
      block.className = "code-block";
      pre.parentNode.insertBefore(block, pre);
      block.appendChild(pre);
    }

    if (copyEnabled) {
      var copyButton = document.createElement("button");
      copyButton.type = "button";
      copyButton.className = "copy-code-button";
      copyButton.setAttribute("aria-label", body.getAttribute("data-label-copy") || "Copy code");
      copyButton.innerHTML =
        '<svg class="icon icon-copy" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-copy"/></svg>' +
        '<svg class="icon icon-check" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-check"/></svg>';
      block.appendChild(copyButton);
      copyButton.addEventListener("click", function () {
        var text = pre.innerText;
        var done = function () {
          copyButton.classList.add("copied");
          setTimeout(function () {
            copyButton.classList.remove("copied");
          }, 2000);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, function () {});
        } else {
          var area = document.createElement("textarea");
          area.value = text;
          document.body.appendChild(area);
          area.select();
          try {
            document.execCommand("copy");
            done();
          } catch (e) {}
          document.body.removeChild(area);
        }
      });
    }

    if (maxLines > 0) {
      var lineCount = pre.textContent.replace(/\n$/, "").split("\n").length;
      if (lineCount > maxLines) {
        var style = window.getComputedStyle(pre);
        var lineHeight = parseFloat(style.lineHeight) || 22;
        var collapsedHeight = Math.ceil(lineHeight * maxLines + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom));
        block.classList.add("is-collapsed");
        pre.style.maxHeight = collapsedHeight + "px";
        var expandButton = document.createElement("button");
        expandButton.type = "button";
        expandButton.className = "code-expand-button";
        expandButton.textContent = expandLabel + " (" + lineCount + " lines)";
        block.appendChild(expandButton);
        expandButton.addEventListener("click", function () {
          var collapsed = block.classList.toggle("is-collapsed");
          pre.style.maxHeight = collapsed ? collapsedHeight + "px" : "none";
          expandButton.textContent = collapsed
            ? expandLabel + " (" + lineCount + " lines)"
            : collapseLabel;
        });
      }
    }
  });

  /* ---------------------------------------------------------------------
     Shell command emphasis
     Chroma deliberately leaves external commands (docker, curl, …) as
     plain text. Add a class so they read like commands, not output.
     --------------------------------------------------------------------- */
  function enhanceShellCommands() {
    var selector = [
      "code.language-bash",
      "code.language-shell",
      "code.language-sh",
      "code.language-zsh",
      "code[data-lang='bash']",
      "code[data-lang='shell']",
      "code[data-lang='sh']",
      "code[data-lang='zsh']"
    ].join(",");

    document.querySelectorAll(selector).forEach(function (code) {
      code.querySelectorAll(".line .cl").forEach(function (line) {
        var node = line.firstChild;
        if (!node || node.nodeType !== 3) return;
        var match = node.nodeValue.match(/^(\s*)(?:(\$|>)\s+)?([A-Za-z0-9_./-]+)/);
        if (!match) return;
        var prefix = match[1] + (match[2] ? match[2] + " " : "");
        var command = match[3];
        if (!command || command.charAt(0) === "#") return;
        var span = document.createElement("span");
        span.className = "sh-cmd";
        span.textContent = command;
        node.nodeValue = node.nodeValue.slice(prefix.length + command.length);
        if (prefix) line.insertBefore(document.createTextNode(prefix), node);
        line.insertBefore(span, node);
      });
    });
  }

  /* ---------------------------------------------------------------------
     Sortable tables
     --------------------------------------------------------------------- */
  if (body.getAttribute("data-table-sort") === "true") {
    document.querySelectorAll(".article-body table").forEach(function (table) {
      var headers = table.querySelectorAll("thead th");
      if (!headers.length) return;
      headers.forEach(function (th, index) {
        th.classList.add("sortable");
        var direction = 0;
        th.addEventListener("click", function () {
          direction = direction === 1 ? -1 : 1;
          headers.forEach(function (other) {
            other.removeAttribute("data-sort");
          });
          th.setAttribute("data-sort", direction === 1 ? "asc" : "desc");
          var tbody = table.querySelector("tbody");
          if (!tbody) return;
          var rows = Array.prototype.slice.call(tbody.querySelectorAll("tr"));
          var value = function (row) {
            var cell = row.children[index];
            var text = cell ? cell.textContent.trim() : "";
            var numeric = text.replace(/[^0-9.\-]/g, "");
            if (text !== "" && numeric !== "" && /^[-+]?[0-9.,\s\-]+$/.test(text)) {
              return parseFloat(numeric);
            }
            return text.toLowerCase();
          };
          rows.sort(function (a, b) {
            var va = value(a);
            var vb = value(b);
            if (typeof va === "number" && typeof vb === "number") return (va - vb) * direction;
            return String(va).localeCompare(String(vb)) * direction;
          });
          rows.forEach(function (row) {
            tbody.appendChild(row);
          });
        });
      });
    });
  }

  /* ---------------------------------------------------------------------
     Lightbox
     --------------------------------------------------------------------- */
  if (body.getAttribute("data-lightbox") === "true") {
    var closeLabel = body.getAttribute("data-label-close-image") || "Close image";
    var previewLabel = body.getAttribute("data-label-image-preview") || "Image preview";
    var activeTrigger = null;

    function imageSources(img) {
      var sources = [img.currentSrc || img.src];
      var original = img.getAttribute("data-original");
      if (original) {
        try {
          sources.push(new URL(original, window.location.href).href);
        } catch (e) {}
      }
      return sources;
    }

    function isImageLink(link, img) {
      if (!link) return false;
      var href = link.getAttribute("href");
      if (!href || href.charAt(0) === "#") return false;
      var absolute;
      try {
        absolute = new URL(href, window.location.href).href;
      } catch (e) {
        return false;
      }
      if (imageSources(img).indexOf(absolute) !== -1) return true;
      return /\.(png|jpe?g|webp|gif|svg|avif)(?:[?#]|$)/i.test(absolute);
    }

    function openImage(img, trigger) {
      activeTrigger = trigger || img;
      var overlay = document.createElement("div");
      overlay.className = "lightbox-overlay";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.setAttribute("aria-label", previewLabel);

      var closeButton = document.createElement("button");
      closeButton.type = "button";
      closeButton.className = "lightbox-close";
      closeButton.setAttribute("aria-label", closeLabel);
      closeButton.innerHTML = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-x"/></svg>';

      var large = document.createElement("img");
      large.src = img.getAttribute("data-original") || img.currentSrc || img.src;
      large.alt = img.alt || "";

      overlay.appendChild(closeButton);
      overlay.appendChild(large);
      document.body.appendChild(overlay);
      document.body.classList.add("lightbox-open");

      function close() {
        overlay.remove();
        document.body.classList.remove("lightbox-open");
        document.removeEventListener("keydown", onKey);
        if (activeTrigger && typeof activeTrigger.focus === "function") {
          activeTrigger.focus();
        }
        activeTrigger = null;
      }

      function onKey(event) {
        if (event.key === "Escape") close();
        if (event.key === "Tab") {
          event.preventDefault();
          closeButton.focus();
        }
      }

      overlay.addEventListener("click", close);
      large.addEventListener("click", function (event) {
        event.stopPropagation();
      });
      closeButton.addEventListener("click", function (event) {
        event.stopPropagation();
        close();
      });
      document.addEventListener("keydown", onKey);
      closeButton.focus();
    }

    document.querySelectorAll(".article-body img").forEach(function (img) {
      var link = img.closest("a");
      if (link && !isImageLink(link, img)) return;
      img.style.cursor = "zoom-in";
      if (link) {
        link.addEventListener("click", function (event) {
          event.preventDefault();
          openImage(img, link);
        });
      } else {
        img.addEventListener("click", function () {
          openImage(img, img);
        });
      }
      img.setAttribute("tabindex", "0");
      img.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openImage(img, img);
        }
      });
    });
  }

  /* ---------------------------------------------------------------------
     Mermaid
     --------------------------------------------------------------------- */
  function initMermaid() {
    if (!window.__emptycupMermaid || !window.mermaid) return;
    document.querySelectorAll("pre.mermaid").forEach(function (pre) {
      if (!pre.getAttribute("data-src")) pre.setAttribute("data-src", pre.textContent);
    });
    window.mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: currentTheme() === "dark" ? "dark" : "default"
    });
    var nodes = Array.prototype.slice.call(document.querySelectorAll("pre.mermaid:not([data-processed])"));
    if (nodes.length) {
      window.mermaid.run({ nodes: nodes }).catch(function (error) {
        console.error("mermaid render failed", error);
      });
    }
  }

  function rerenderMermaid() {
    if (!window.__emptycupMermaid || !window.mermaid) return;
    document.querySelectorAll("pre.mermaid").forEach(function (pre) {
      var source = pre.getAttribute("data-src");
      if (!source) return;
      pre.removeAttribute("data-processed");
      pre.textContent = source;
    });
    initMermaid();
  }

  var mermaidLoading = false;
  function loadMermaid() {
    if (!window.__emptycupMermaid || window.mermaid || mermaidLoading) return;
    if (!window.__emptycupMermaidSrc) return;
    mermaidLoading = true;
    var script = document.createElement("script");
    script.async = true;
    script.src = window.__emptycupMermaidSrc;
    if (window.__emptycupMermaidIntegrity) {
      script.integrity = window.__emptycupMermaidIntegrity;
      script.crossOrigin = "anonymous";
    }
    script.onload = function () {
      mermaidLoading = false;
      initMermaid();
    };
    script.onerror = function () {
      mermaidLoading = false;
    };
    document.head.appendChild(script);
  }

  function startMermaid() {
    var nodes = document.querySelectorAll("pre.mermaid");
    if (!nodes.length || !window.__emptycupMermaid) return;
    if (!("IntersectionObserver" in window)) {
      loadMermaid();
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        if (!entries.some(function (entry) { return entry.isIntersecting; })) return;
        observer.disconnect();
        loadMermaid();
      },
      { rootMargin: "600px 0px" }
    );
    nodes.forEach(function (node) {
      observer.observe(node);
    });
  }

  /* ---------------------------------------------------------------------
     KaTeX
     --------------------------------------------------------------------- */
  function renderMath() {
    if (!window.__emptycupMath || typeof window.renderMathInElement !== "function") return;
    var target = document.getElementById("article-body") || document.body;
    window.renderMathInElement(target, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\[", right: "\\]", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false }
      ],
      throwOnError: false
    });
  }

  enhanceShellCommands();
  startMermaid();
  renderMath();
})();
