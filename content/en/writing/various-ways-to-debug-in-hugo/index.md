+++
title = "Various ways to debug in Hugo"
date = "2023-03-02"
description = """Writing content & generating websites with **Hugo** can be a
delight when everything is going smoothly. But what if things don't go smoothly?
I'll go over the different ways to work with **Hugo** while debugging its data
structures."""
slug = "various-ways-to-debug-in-hugo"
tags = ["devex", "hugo", "learning", "programming"]
+++

_Hugo_ is a great way to create static websites. Because _Hugo_ uses _Go's_
`html/template` & `text/template` libraries, you'll feel right at home if you've
written those kinds of templates before. While I will be talking about aspects
of these libraries, I am assuming that you have familiarity with _Go_
templating. If not, you can [read _Hugo's_ official documentation on this
here][hugo-tmpl] to get a firm understanding of how templating works.

[hugo-tmpl]: https://gohugo.io/templates/introduction/

While _Hugo_ does provide a helpful error screen if there's an issue in your
variable or function calls within a template, it doesn't help with debugging.

For instance, if you want to see all the methods that a Page object contains in
_Hugo_, you [read the official docs on that here][hugo-page-methods] but that
still requires you to experiment with the values & methods yourself. Debugging
is the practice of getting real-time feedback while the system is running. In
the case of _Hugo_, debugging is about visualizing variables as they're
available in different contexts.

[hugo-page-methods]: https://gohugo.io/methods/page/

## Using templates

The first thing we're going to touch on here is _GO_ templates to wrap calls to
various functions in _Hugo_ that can be used for debugging. The reason for this
is that templates allow us to wrap output in markup that'll help the debugging
process. Templates can help with adding conditional logic to hide and show
information so that it isn't displayed outside of our local development
environment.

A good example of a template to have handy is one I call `debug/printf.html`
within the `layouts/partials/` directory.

```go-html-template { title="l/p/debug/printf.html" }
{{ if site.IsServer }}

<div class="p-4 bg-overlay0 text-red">
  <span class="text-xl">Printing using "%#v"</span>
  <br />
  <code>{{ debug.Dump . }}</code>
</div>

{{ end }}
```

Notice the `site.IsServer` that the HTML is wrapped in. With something like
this, you could leave this on for local development and be sure that it isn't
rendered when compiling your _Hugo_ site. If you really want to be careful, you
could keep the partial commented out like so.

```go-html-template { title="layouts/single.html" }
<!-- other stuff in this file -->
{{/* partial "debug/printf.html" . */}}
<!-- other stuff in this file -->
```

## Using functions

While templates are useful, functions can be quick for rapid debugging when you
don't care about creating a template.

A quick technique you can use to understand the context of a page layout is to
write out `{{ debug.Dump .Page }}` somewhere in a layout file. This prints out
all sorts of useful information about the `.Page` variable that is loaded on
layout pages. Wrap the debug statement in a `<pre/>` block to make it easier to
read.

## Rendering debug data within your debug environment

While debugging websites, you are going to be within your browser's developer
tools. Inside those tools, you have access to the Elements panel. It's easy to
add the debugging information as `<meta/>` tags within the head of your blog
while the server is running in local development.

To do this, add the following code to where your `<head/>` element is defined.

```go-html-template { title="layouts/partials/head.html" }
{{ if site.IsServer -}}
{{ print "<!-- Debug info only available when running a local server -->" | safeHTML }}
{{ partial "debug/meta-tags.html" .Page }}
{{ print "<!-- End debug info -->" | safeHTML -}}
{{- end }}
```

Then within the `layouts/partials/debug/` directory create a file called
`meta-tags.html` with the following contents.

```go-html-template { title="l/p/d/meta-tags.html" }
{{ define "partials/debug/meta-tags.html" -}}
<meta name="hugo-bundle-type" content="{{ .BundleType }}" />
<meta name="hugo-categories" content="{{ .Params.categories }}" />
<meta name="hugo-fuzzy-word-count" content="{{ .FuzzyWordCount }}" />
<meta name="hugo-is-home" content="{{ .IsHome }}" />
<meta name="hugo-is-node" content="{{ .IsNode }}" />
<meta name="hugo-is-page" content="{{ .IsPage }}" />
<meta name="hugo-keywords" content="{{ .Keywords }}" />
<meta name="hugo-kind" content="{{ .Kind }}" />
<meta name="hugo-lastmod" content="{{ .Lastmod }}" />
{{ with .PrevInSection -}}
<meta name="hugo-prev-in-section" content="{{ .RelPermalink }}" />
{{ end -}}
{{ with .NextInSection -}}
<meta name="hugo-next-in-section" content="{{ .RelPermalink }}" />
{{ end -}}

{{ with .File -}}
<meta name="hugo-file-path" content="{{ .Path }}" />
{{ end -}}

{{ range .Aliases -}}
<meta name="hugo-alias" content="{{ . }}" />
{{ end }}

<meta name="hugo-section" content="{{ .Section }}" />
<meta name="hugo-type" content="{{ .Type }}" />

{{ range .Params.tags -}}
<meta name="hugo-tag" content="{{ . }}" />
{{ end }}

{{ range .Ancestors -}}
<meta name="hugo-ancestor" content="{{ .RelPermalink }}" />
{{ end }}

{{ if .Parent -}}
<meta name="hugo-parent" content="{{ .Parent.RelPermalink }}" />
<meta name="hugo-parent-kind" content="{{ .Parent.Kind }}" />
<meta name="hugo-parent-type" content="{{ .Parent.Type }}" />
{{- end }}

{{ range .Pages -}}
<meta name="hugo-child-page-path" content="{{ .RelPermalink }}" />
{{ end }}
{{- end }}
```

Now you can navigate to your local instance of your _Hugo_ site and when you
view the source code, you will see all of the `$.Page` debug information
displayed within `<meta/>` tags in the `<head>` of every page.

This example is perfect to always leave on as it doesn't affect the rendering of
your content and is only visible locally and within your developer tools of your
web browser.
