+++
title = "Table of Contents for your Hugo pages"
date = "2024-02-19"
description = """Setting up table of contents sections in **Hugo** pages can be
as complicated as you'd like. Let's breakdown how I use it to hopefully inspire
you to experiment with this useful feature."""
slug = "table-of-contents-for-your-hugo-pages"
tags = ["hugo", "learning"]
+++

Adding a table of contents, written as TOC from now on, is an important & useful
way to aid your readers' navigation in your content on a single page. A TOC
usually consist of links that point directly the headings in your content that
you're already using to break up your content.

There are a lot of automated ways to implement a TOC in *Markdown* & thankfully
*Hugo* handles this for us with a small configuration change & a page method you
use in your template files.

> `tl;dr`
>
> I cover a lot of stuff here that's specific to [my **Hugo** project][writing].
> A lot of the customization I've done is inspired by the official documentation
> you can find online. I'll link to the documentation that served as the
> technical inspiration for this post so you can learn how to do this on your
> own.
>
> - [Table of contents docs](https://gohugo.io/content-management/toc/)
> - [Shortcode templates docs](https://gohugo.io/templates/shortcode-templates/)
> - [Single page templates docs](https://gohugo.io/templates/single-page-templates/)
> - [Partial templates docs](https://gohugo.io/templates/partials/)

[writing]: https://git.sr.ht/~rogeruiz/writing

## Getting Started

As I mentioned before, leveraging *Hugo* makes this super easy. There are some
configuration options you'll need to set first in your `hugo.toml` file.

```sh { title = "hugo.toml" }
[markup.tableOfContents]
startLevel = 2
endLevel = 6
ordered = false
```

These properties allow you to set what the headings `start` & `end` levels are
for your custom TOC. I recommend using values of `2` & `6` respectively which
covers the whole range of headings that I like to use in my writing since the
title of the content is in a `<h1/>` tag.

Once that's set, you'll be able to use the `PAGE.TableOfContents` method in your
layout *HTML* templates to choose where the TOC will render. Here's an example
for the default `single.html` layout file using the method highlighted below.

[➡️ Here's the official documentation for the TableOfContents method](https://gohugo.io/methods/page/tableofcontents/)

```go-html-template { title = "layouts/_default/single.html" hl_lines = [3] }
{{ define "main" }}
<section>
  {{ .TableOfContents }}
  {{ .Content }}
</section>
{{ end }}
```

With the above *HTML*, the TOC will render above the content for your page. You
can also place any markup you'd like around the method call to further markup
& style *Hugo's* markup for a TOC.

### About *Hugo's* default markup

The *HTML* for this is in the *Hugo* documentation linked above. It is similar
to the following *HTML*. I've added some comments to further explain some parts.

```html { title = "An example of what Hugo outputs" verbatim = false }
<nav id="TableOfContents">
  <ul> <!-- Determined by the `markup.tableOfContents.ordered` configuration option. -->
    <li><a href="#getting-started">Getting Started</a></li>
    <!-- Repeating <li> elements for each heading in the document -->
  </ul>
</nav>
```

## Designing your own TOC

While you style this markup, you should also consider wrapping the generated TOC
in some kind extra markup that makes sense for your content's design. For
instance, I like to use the `<details/>` markup to handle wrap my TOC content so
that the links are hidden initially. There's an example at the top of this post.

 The markup for this is straight-forward & doesn't modify the markup coming in
 from *Hugo*. I wrap my TOC inside of the necessary markup while also adding
 some extra logic in *Go* around when it should display or not. If I write
 something that's shorter than 400 words or if I set `toc = false` in the front
 matter of a post, my TOC doesn't appear.

Here's the *HTML* markup I have for what I described above.

```go-html-template { title = "layouts/_default/single.html" hl_lines = [3,12] }
<!-- More contents above -->

{{ if and (gt .WordCount 400) (ne .Params.toc false) }}

<details class="rsr-toc">
  <summary class="text-sm font-mono">Table of contents</summary>
  <aside class="font-mono prose">
    {{ .TableOfContents }}
  </aside>
</details>

{{ end }}

<!-- More contents below -->
```

Note the `ne` or not equals checking for the `.Page.Params.toc` to not be
equal to `false`. This means that you can disable the TOC but not have to set
the parameter on all your pages. This is **most helpful when** you've got content
already & don't want to modify front matter on old files.

Below are the styles to replace the `<summary/>` details marker across browsers
with an icon from my mono-space font & some minor positional styles for the
`<ul/>` markup coming from the internal *Hugo* TOC markup. I don't bother
modifying the `<li/>` & `<a/>` markup here since I handle that by extending
the styles in my configuration of [*Tailwind's* typography plugin][tw-type] in
the `tailwind.config.js` file.

[tw-type]: https://github.com/tailwindlabs/tailwindcss-typography

```css { title = "style.css" }
/* More contents above */
.rsr-toc > summary {
  list-style: none;
}
.rsr-toc > summary::-webkit-details-marker {
  display: none;
}
.rsr-toc > summary::after {
  content: '  ';
  float: right;
}
.rsr-toc[open] > summary::after {
  content: '  ';
  float: right;
}
.rsr-toc ul {
  @apply list-none pl-2 m-0;
}
/* More contents below */
```

Since the TOC I display is always within a `prose` parent *Tailwind* class, I
use *Tailwind's* typography plugin to extend the default *CSS* styles for
interacting with the `<summary/>` markup & how it animates on open & close as
well.

```js { title = "tailwind.config.js" }
// More content above
"details summary": {
  cursor: 'pointer',
  marginBottom: '-10px',
  transition: 'margin 150ms ease-out',
},
"details[open] summary": {
  marginBottom: '10px',
},
// More content below
```

While this does mean that my styles for TOC are defined across different files,
this works for me as the TOC inherits the styles from the plugin I'm using along
with specific styles that I setup up as a component within *Tailwind*.

### Moving your custom TOC to a partial template

While having it in the `single.html` layout file is okay, we can turn this into
a partial template that we can reuse across other layout files. This is
convenient when you want to same kind of TOC but for different kinds of content
that have their own `single.html` file.

```go-html-template { title = "layouts/partials/toc.html" }
{{ if and (gt .WordCount 400) (ne .Params.toc false) }}

<details class="rsr-toc">
  <summary class="text-sm font-mono">Table of contents</summary>
  <aside class="font-mono prose">
    {{ .TableOfContents }}
  </aside>
</details>

{{ end }}

```

```go-html-template { title = "layouts/writing/single.html" hl_lines = [3] }
{{ define "main" }}
<section>
  {{ partial "toc.html" . }}
  {{ .Content }}
</section>
{{ end }}
```

## Using *shortcodes* templates

Now if you'd like to get your TOC to appear inside your content rather than
outside of it, then using *Hugo's* *shortcodes* are going to be how you achieve
it. Go & create a new *HTML* file named `toc.html` in your project's
`layouts/shortcodes/` directory. You may need to create the `shortcodes/`
directory first.

```go-html-template { title = "layouts/shortcodes/toc.html" }
{{ .Page.TableOfContents }}
```

With that you will be able to add a TOC to any content by using either of the
the syntaxes `{{</* toc */>}}` or `{{%/* toc */%}}` to render the *shortcode*
above. Make sure you add any *HTML* markup you'd like to further customize the
TOC inside the content. This might be different than what is inside your
`toc.html` partial since it's inside your content.

I'm actually using it on this page to render this post's TOC below inside of the
*Markdown* content. It's got a different style & markup than the `<details/>`
design. And with the ability to turn off the `single.html` TOC via front matter,
I can leverage this new TOC via *shortcode* wherever within my content if I want
to bring attention to the topics getting covered in the post.

{{< toc >}}

Thanks for reading this far. I hope this breakdown of how I created the various
TOC for my *Hugo* site inspires you to add one or more to yours as well.
