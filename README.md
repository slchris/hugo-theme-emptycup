# EmptyCup

The personal blog theme of [半瓶斋 / The Empty Cup](https://blog.plz.ac). A calm, typography-first Hugo theme with bilingual support, a reading-focused article layout, and no front-end framework.

## Features

- Serif headings and a warm paper palette, with a matching dark mode (respects `prefers-color-scheme`, remembers the reader's choice)
- Article layout with a sticky table of contents rail on wide screens and a collapsible TOC on small screens
- Client-side Mermaid diagrams, KaTeX math, code copy / long-block collapse, sortable tables, and a lightweight image lightbox
- Series navigation, previous / next post links, tag and category pages grouped by year
- Multilingual: language switcher, translated UI strings (`i18n/`), hreflang and `x-default`
- SEO: canonical URLs, Open Graph / Twitter cards, JSON-LD (`WebSite` and `BlogPosting`), RSS, sitemap, 404 with `noindex`
- Comments via [utterances](https://utteranc.es/), Google Analytics (GA4), sponsor link — all optional
- Print styles and a skip-to-content link

## Requirements

Hugo **0.158 or newer** (extended edition recommended, so image processing is available).

## Installation

Add the theme as a submodule:

```sh
git submodule add https://github.com/slchris/hugo-theme-emptycup.git themes/empty-cup
```

Then in your site config:

```toml
theme = "empty-cup"
```

## Configuration

The theme reads the same parameter names used by this blog. Only a few are required:

```toml
[params]
  description = "Site description"
  [params.author]
    name = "Your Name"
    link = "https://example.com"
  [params.page]
    [params.page.toc]
      enable = true
    [params.page.code]
      copy = true
      maxShownLines = 10
    [params.page.table]
      sort = true
    [params.page.comment]
      enable = false
      [params.page.comment.utterances]
        enable = true
        repo = "owner/repo"
        issueTerm = "pathname"
```

Optional integrations:

- `params.analytics.enable` + `params.analytics.google.id` — GA4
- `params.page.outdatedArticleReminder.enable` + `reminder` / `warning` (days)
- `params.sponsor` + `params.sponsor.link` — sponsor box
- `params.home.posts.paginate`, `params.section.paginate`, `params.list.paginate` — page sizes
- `params.footer.since`, `params.footer.license` — footer line
- `params.enablePWA` — include `/site.webmanifest` if you provide one

Per-page front matter:

- `toc: true|false` or `toc.enable: true|false`
- `math: true` or `math.enable: true`, or use math delimiters in the content
- `mermaid: true` to force Mermaid on a page (otherwise fences tagged `mermaid` are detected automatically)
- `lightgallery: true` to enable the image lightbox for a page
- `featuredImage` / `featuredImagePreview` for a header image and list thumbnails
- `series`, `series_weight` for series navigation

## Shortcodes

- `{{</* admonition type=note title="Title" open=true */>}}` — note, abstract, info, tip, success, question, warning, failure, danger, bug, example, quote
- `{{</* mermaid */>}}` — Mermaid diagram
- `{{</* rawhtml */>}}` — raw HTML passthrough

Mermaid fenced code blocks are rendered automatically.

## License

MIT — see [LICENSE](LICENSE).
