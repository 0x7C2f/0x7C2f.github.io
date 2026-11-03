/* CLI Terminal Engine */
(function (global) {
  'use strict';

  const DEFAULT_FS = {
    '/': {
      type: 'dir',
      children: {
        'about': { type: 'dir', desc: 'About the author' },
        'blog': { type: 'dir', desc: 'Posts and writings' },
        'files': { type: 'dir', desc: 'Curated PDF library' },
        'awesome-pi': { type: 'dir', desc: 'Awesome Pi Coding Agent' },
        'README.md': { type: 'file', content: '0x7C2f — terminal portfolio. Type `help` to list commands.' },
        'about.md': { type: 'file', content: 'Programmer exploring code, commerce, and consciousness.' },
      }
    }
  };

  function CLI(opts) {
    opts = opts || {};
    this.fs = opts.fs || DEFAULT_FS;
    this.cwd = opts.cwd || '/';
    this.history = [];
    this.histIdx = -1;
    this.output = document.getElementById('term-output');
    this.input = document.getElementById('term-input');
    this.promptEl = document.getElementById('term-prompt');
    this.bind();
    this.print('0x7C2f terminal v1.0 — type `help` for commands.', 'dim');
    this.print('', 'dim');
  }

  CLI.prototype.bind = function () {
    const self = this;
    this.input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        const val = self.input.value;
        self.input.value = '';
        self.history.unshift(val);
        self.histIdx = -1;
        self.run(val);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (self.histIdx < self.history.length - 1) {
          self.histIdx++;
          self.input.value = self.history[self.histIdx];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (self.histIdx > 0) {
          self.histIdx--;
          self.input.value = self.history[self.histIdx];
        } else {
          self.histIdx = -1;
          self.input.value = '';
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        self.tabComplete();
      } else if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault();
        self.clear();
      }
    });
    // keep focus
    document.addEventListener('click', function () { self.input.focus(); });
    this.updatePrompt();
  };

  CLI.prototype.updatePrompt = function () {
    this.promptEl.textContent = 'user@0x7C2f:' + this.cwd + '$ ';
  };

  CLI.prototype.print = function (text, cls) {
    cls = cls || 'out';
    const div = document.createElement('div');
    div.className = 'line ' + cls;
    div.textContent = text;
    this.output.appendChild(div);
    this.output.scrollTop = this.output.scrollHeight;
  };

  CLI.prototype.printHTML = function (html, cls) {
    const div = document.createElement('div');
    div.className = 'line ' + (cls || 'out');
    div.innerHTML = html;
    this.output.appendChild(div);
    this.output.scrollTop = this.output.scrollHeight;
  };

  CLI.prototype.clear = function () {
    this.output.innerHTML = '';
  };

  CLI.prototype.run = function (raw) {
    const line = raw.trim();
    // echo command
    this.print(this.promptEl.textContent + line, 'cmd');
    if (!line) return;
    const parts = line.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    const handler = this.commands[cmd];
    if (handler) {
      try { handler.call(this, args); }
      catch (err) { this.print('error: ' + err.message, 'err'); }
    } else {
      this.print(cmd + ': command not found. Type `help`.', 'err');
    }
    this.updatePrompt();
  };

  CLI.prototype.commands = {};

  CLI.prototype.commands.help = function () {
    const cmds = [
      ['help', 'show this help'],
      ['ls', 'list directory contents'],
      ['cd <dir>', 'change directory / navigate'],
      ['cat <file>', 'print file contents'],
      ['pwd', 'print working directory'],
      ['clear', 'clear the screen'],
      ['whoami', 'about the author'],
      ['history', 'command history'],
      ['date', 'current date/time'],
      ['echo <text>', 'print text'],
      ['open <url>', 'open a url in new tab'],
      ['search <q>', 'search the web (duckduckgo)'],
    ];
    this.print('Available commands:', 'info');
    cmds.forEach(function (c) {
      this.print('  ' + c[0].padEnd(16) + c[1], 'out');
    }, this);
  };

  CLI.prototype.commands.ls = function (args) {
    const path = args[0] || this.cwd;
    const node = this.resolve(path);
    if (!node) { this.print('ls: cannot access \'' + path + '\': No such file or directory', 'err'); return; }
    if (node.type !== 'dir') { this.print(path, 'out'); return; }
    const entries = Object.keys(node.children || {});
    if (entries.length === 0) { this.print('(empty)', 'dim'); return; }
    entries.forEach(function (name) {
      const child = node.children[name];
      const cls = child.type === 'dir' ? 'info' : 'out';
      const suffix = child.type === 'dir' ? '/' : '';
      this.print(name + suffix, cls);
    }, this);
  };

  CLI.prototype.commands.cd = function (args) {
    const target = args[0] || '/';
    if (target === '/' || target === '~' || target === 'home') {
      if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') { window.location.href = '/'; return; }
      this.cwd = '/'; this.updatePrompt(); return;
    }
    if (target === '..') {
      if (this.cwd !== '/' && this.cwd.split('/').filter(Boolean).length <= 1) {
        window.location.href = '/'; return;
      }
      const parts = this.cwd.split('/').filter(Boolean);
      parts.pop();
      this.cwd = '/' + parts.join('/');
      if (this.cwd === '') this.cwd = '/';
      this.updatePrompt();
      return;
    }
    // navigation to a real page
    const pages = ['about', 'blog', 'files', 'awesome-pi', 'mcp-servers', 'mcp-usage', 'dead-children', 'doppler'];
    const name = target.replace(/^\//, '').replace(/\/$/, '');
    if (pages.indexOf(name) !== -1) {
      const urlMap = {
        'about': '/about/',
        'blog': '/blog/',
        'files': '/files/',
        'awesome-pi': '/awesome-pi-coding-agent/',
        'mcp-servers': '/mcp-servers-github-pages/',
        'mcp-usage': '/mcp-usage-guide/',
        'dead-children': '/dead-children-currency/',
        'doppler': '/doppler-curve-localization-simulator/',
      };
      this.print('navigating to ' + name + '...', 'dim');
      setTimeout(function () { window.location.href = urlMap[name]; }, 400);
      return;
    }
    const node = this.resolve(target);
    if (!node || node.type !== 'dir') {
      this.print('cd: no such directory: ' + target, 'err');
      return;
    }
    this.cwd = this.join(this.cwd, target);
    this.updatePrompt();
  };

  CLI.prototype.commands.cat = function (args) {
    if (!args[0]) { this.print('cat: missing file operand', 'err'); return; }
    const node = this.resolve(args[0]);
    if (!node) { this.print('cat: ' + args[0] + ': No such file', 'err'); return; }
    if (node.type === 'dir') { this.print('cat: ' + args[0] + ': Is a directory', 'err'); return; }
    this.print(node.content || '', 'out');
  };

  CLI.prototype.commands.pwd = function () {
    this.print(this.cwd, 'out');
  };

  CLI.prototype.commands.clear = function () {
    this.clear();
  };

  CLI.prototype.commands.whoami = function () {
    this.print('0x7C2f — programmer exploring code, commerce, and consciousness.', 'out');
    this.print('stack: arch linux · git · mcp · ai tooling', 'dim');
  };

  CLI.prototype.commands.history = function () {
    this.history.forEach(function (h, i) { this.print('  ' + (i + 1) + '  ' + h, 'dim'); }, this);
  };

  CLI.prototype.commands.date = function () {
    this.print(new Date().toString(), 'out');
  };

  CLI.prototype.commands.search = function (args) {
    if (!args.length) { this.print('search: missing query', 'err'); return; }
    const q = args.join(' ');
    this.print('searching: ' + q, 'dim');
    setTimeout(function () { window.open('https://duckduckgo.com/?q=' + encodeURIComponent(q), '_blank'); }, 300);
  };

  CLI.prototype.commands.open = function (args) {
    if (!args[0]) { this.print('open: missing url', 'err'); return; }
    const url = args[0].startsWith('http') ? args[0] : 'https://' + args[0];
    window.open(url, '_blank');
  };

  CLI.prototype.commands.echo = function (args) {
    this.print(args.join(' '), 'out');
  };

  CLI.prototype.resolve = function (path) {
    const absolute = path.startsWith('/');
    let cur = absolute ? this.fs['/'] : this.resolveCwd();
    if (!cur) return null;
    const parts = path.split('/').filter(Boolean);
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === '.') continue;
      if (parts[i] === '..') {
        // cannot go above root in this simple FS
        continue;
      }
      if (!cur.children || !cur.children[parts[i]]) return null;
      cur = cur.children[parts[i]];
    }
    return cur;
  };

  CLI.prototype.resolveCwd = function () {
    const parts = this.cwd.split('/').filter(Boolean);
    let cur = this.fs['/'];
    for (let i = 0; i < parts.length; i++) {
      if (!cur.children || !cur.children[parts[i]]) return null;
      cur = cur.children[parts[i]];
    }
    return cur;
  };

  CLI.prototype.join = function (cwd, target) {
    if (target.startsWith('/')) return target;
    if (cwd === '/') return '/' + target;
    return cwd + '/' + target;
  };

  CLI.prototype.tabComplete = function () {
    const val = this.input.value;
    const parts = val.split(/\s+/);
    const last = parts[parts.length - 1];
    const node = this.resolve(this.cwd);
    if (!node || !node.children) return;
    const matches = Object.keys(node.children).filter(function (k) { return k.startsWith(last); });
    if (matches.length === 1) {
      parts[parts.length - 1] = matches[0];
      this.input.value = parts.join(' ');
    } else if (matches.length > 1) {
      this.print(matches.join('  '), 'dim');
    }
  };

  // clock
  function startClock() {
    const el = document.getElementById('term-clock');
    if (!el) return;
    function tick() {
      const now = new Date();
      const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      const hh = String(now.getHours()).padStart(2,'0');
      const mm = String(now.getMinutes()).padStart(2,'0');
      const ss = String(now.getSeconds()).padStart(2,'0');
      el.textContent = days[now.getDay()] + ' ' + now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0') + '  ' + hh + ':' + mm + ':' + ss;
    }
    tick();
    setInterval(tick, 1000);
  }

  // ── viewport detection ───────────────────────────────────────
  function detectViewport() {
    const w = window.innerWidth;
    const cls = w < 640 ? 'vp-mobile' : (w < 1024 ? 'vp-tablet' : 'vp-desktop');
    document.body.classList.remove('vp-mobile', 'vp-tablet', 'vp-desktop');
    document.body.classList.add(cls);
    // dynamic viewport height (handles mobile browser chrome + virtual keyboard)
    const vh = (window.visualViewport ? window.visualViewport.height : window.innerHeight);
    document.documentElement.style.setProperty('--vh', vh + 'px');
    // keep input in view when keyboard opens
    const inputRow = document.getElementById('term-input-row');
    if (inputRow && window.visualViewport) {
      const vv = window.visualViewport;
      const offset = window.innerHeight - vv.height - vv.offsetTop;
      if (offset > 0) {
        document.body.style.paddingBottom = offset + 'px';
      } else {
        document.body.style.paddingBottom = '';
      }
    }
  }

  function bindViewport() {
    detectViewport();
    window.addEventListener('resize', detectViewport);
    window.addEventListener('orientationchange', function () { setTimeout(detectViewport, 100); });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', detectViewport);
      window.visualViewport.addEventListener('scroll', detectViewport);
    }
  }

  global.CLI = CLI;
  global.startClock = startClock;
  global.detectViewport = detectViewport;
  global.bindViewport = bindViewport;

  // self-init viewport detection once DOM is available
  function _initViewport() {
    if (typeof bindViewport === 'function') bindViewport();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _initViewport);
  } else {
    _initViewport();
  }
})(window);