+++
title = "Labeling Code Blocks in Hugo"
date = "2024-01-26"
description = """Using code blocks in **Hugo** is helpful when you've got to
show some code in your posts. But labeling & highlighing them beyond the syntax
highlighting helps the experience of your readers immensely."""
slug = "labeling-code-blocks-in-hugo"
tags = ["devex", "hugo", "learning"]
+++

The great thing about writing in *Markdown* is that there are two convenient
shortcuts for designating text to be `code`. To write an inline code block, you
wrap text in a single backtick character on either side like the last word of
the previous sentence. Then there's the multi-line code block that us created by
wrapping lines in triple backtick characters. In this post, we'll be focusing
exclusively on how to render these code blocks in *Hugo*.

```sh
echo "hello world"
```

Out of the box, *Hugo* provides a great experience for writing code blocks. For
instance, in the code block above I added the characters `sh` at the end of the
first triple-backticks to enable general *shell* syntax-highlighting.

~~~markdown
```sh
~~~

If you want to learn more about this, read the [official documentation on syntax
highlighting here][docs-syntax].

[docs-syntax]: https://gohugo.io/content-management/syntax-highlighting/#highlighting-in-code-fences

## Striving for a better experience

Now, this experience is already pretty great. But what if we could make it
better? For instance, let's say we want to communicate to the reader that the
code block is for a particular file? We could add a file label to the code
block.

```sh { title = "hello-world.sh" }
#!/bin/bash
set -e
echo "hello world"
```

This was done by passing in a map of key-value pairs after the syntax definition
wrapped in curly quotes. For example above, I have added the following `{
title = "hello-world.sh" }` to the info string to render the label above.

In the official documentation, you can see that there are already some helpful
attributes you can pass in to do things like set up line numbers or even
highlight particular lines. But lets keep going with our questions, how do we
label code blocks that are describing something using code rather than being a
file?

~~~md { title = "The code block for rending the above" verbatim = false hl_lines = [1]}
```sh { title = "hello-world.sh" }
#!/bin/bash
set -e
echo "hello world"
```
~~~

These last two code blocks are what I'm covering in this post. But you'll notice
that there is no attributes in the info string examples that allow you to add a
title to a file. Thankfully, *Hugo* allows us to add our own custom markup for
the rendering of code blocks which can read whatever attributes we'd like to
pass in to add to our markup.

### Using custom render-hooks

A custom render-hook is a way for developers to control how a particular piece
of markup gets rendered. *Hugo* provides a number of these hooks, but we're
going to focus on the [custom code block render hooks][docs-render-hook] for
now. I've been referencing attributes which are a part of the info string of a
code fence. Read through the documentation to learn more about this terminology.

[docs-render-hook]: https://gohugo.io/render-hooks/code-blocks/

We'll start off by creating a file in our `layouts/_default/` directory. You may
need to create a `_markup/` directory if you aren't using render hooks yet. To
start, let's have the contents of the file be the following.

```go-html-template { title = "render-codeblock.html" hl_lines = [3,9,11] }
{{/* this file is exists at `layouts/_default/_markup/` in your Hugo project */}}
<figure class="highlight">
  {{- if transform.CanHighlight .Type }}
  <pre tabindex="0" class="chroma"><code class="language-{{ .Type }}" data-lang="{{ .Type }}">
      {{- with transform.HighlightCodeBlock . -}}
      {{ .Inner }}
      {{- end -}}
    </code></pre>
  {{- else }}
  <pre tabindex="0"><code class="language-{{ .Type }}" data-lang="{{ .Type }}">{{ .Inner }}</code></pre>
  {{- end }}
</figure>
```

Notice the highlighted parts of the code above where the logic takes place to
determine how the code should be rendered. If the `.Type` of the code can be
highlighted by *Chroma* then the code is highlighted. Otherwise, the hook only
renders the `.Inner` content without processing it. This is a good start.

So far, we've only created the ability to use custom render hooks in our *Hugo*
project. The next step here is to utilize the attributes map that gets passed
into the render-hook as part of the info string.

#### Further design considerations

Since we're looking to label our code blocks, we're going to need to add
additional markup. This markup will be where the contents of the title attribute
gets added & a verbatim attribute that acts like a flag to change the title
markup from a file name or a description.

You've seen examples of this earlier in the post with the code blocks using the
`hello-word.sh` label & another code block with the label describing how to
render it right below it.


<details>
<summary>More examples of the types of code blocks we're building</summary>

Below is another example that shows how to create a file with the `echo` command
along with the expected output for the `hello.txt` file. The description of a
code block is above while the code block with a file name is below.

~~~sh { title = "Creating the file _hello.txt_" verbatim = false }
echo "hi, there!" > hello.txt
~~~

```txt { title = "hello.txt"}
hi, there!
```

</details>

#### Customizing your code block render-hook

To start, let's pass in a `title = ""` key-value into the attributes for a code
block. The example below is for the `hello.txt` block from above.

~~~markdown { title = "The info string from above" verbatim = false }
```txt { title = "hello.txt" }
~~~

Next, modify the `render-codeblock.html` template from above to pull in the
attributes if it exists. Use the with `{{- with <context> -}}` function in
*Hugo* to create a block that only renders if that `.title` attribute is passed
in the info string.

```go-html-template { title = "render-codeblock.html" hl_lines = [3, 7] }
{{/* this file is exists at `layouts/_default/_markup/` in your Hugo project */}}
<figure class="highlight">
  {{- with .Attributes.title }}
  <figcaption>
    <span>{{ . | markdownify }}</span>
  </figcaption>
  {{- end }}
  {{- if transform.CanHighlight .Type }}
  <pre tabindex="0" class="chroma"><code class="language-{{ .Type }}" data-lang="{{ .Type }}">
      {{- with transform.HighlightCodeBlock . -}}
      {{ .Inner }}
      {{- end -}}
    </code></pre>
  {{- else }}
  <pre tabindex="0"><code class="language-{{ .Type }}" data-lang="{{ .Type }}">{{ .Inner }}</code></pre>
  {{- end }}
</figure>
```

With this highlighted portion added, you'll have the contents of the title
attribute rendered as markdown inside of the new `<figcaption/>` element. This
covers being able to add a title, but as I mentioned earlier the title should be
styled differently for file names & descriptions of the code block. We'll do
this by adding a new attribute to the info string to make the render-hook aware
if we would like the contents of the `<figcaption/>` taken verbatim or not. I'm
using word verbatim here for the label for the variable because the title can
either be **taken verbatim** or if not then **interpreted as a description**.
Here's the new info string which uses the new verbatim attribute.

~~~txt { title = "The info string using *verbatim*" verbatim = false }
```txt { title = "The info string using *verbatim*" verbatim = false }
~~~

With a new attribute named verbatim, we now modify our code block render-hook to
take this into account like so.

```go-html-template { title = "render-codeblock.html" hl_lines = ["2-5", 9, 11, 13] }
{{/* this file is exists at `layouts/_default/_markup/` in your Hugo project */}}
{{- $isVerbatim := true -}}
{{- if isset .Attributes "verbatim" -}}
{{- $isVerbatim = .Attributes.verbatim -}}
{{- end -}}
<figure class="highlight">
  {{- with .Attributes.title }}
  <figcaption>
    {{- if $isVerbatim -}}
    <span>{{ . }}</span> {{/* As a file name */}}
    {{- else -}}
    <span>{{ . | markdownify }}</span> {{/* As a code description */}}
    {{- end -}}
  </figcaption>
  {{- end }}
  {{- if transform.CanHighlight .Type }}
  <pre tabindex="0" class="chroma"><code class="language-{{ .Type }}" data-lang="{{ .Type }}">
      {{- with transform.HighlightCodeBlock . -}}
      {{ .Inner }}
      {{- end -}}
    </code></pre>
  {{- else }}
  <pre tabindex="0"><code class="language-{{ .Type }}" data-lang="{{ .Type }}">{{ .Inner }}</code></pre>
  {{- end }}
</figure>
```

In the highlighted code above, you'll see that `$isVerbatim` is set to `true` by
default. Then only if `verbatim` is set, do we read its value in the info string
& set it to the `$isVerbatim` variable. Further down in the template, there's an
`if-statement` around whether `$isVerbatim` is `true` or `false`. Here's where
the markup is modified so the label can be presented in two different formats as
either a file name or a code description. I'll leave the styling as an exercise
for the reader.

Thanks for reading this far. I hope that learning a bit more about render-hooks
can help you understand how to improve the experience of your technical readers
by providing some additional information about code blocks. If you build a new
way to render code blocks, {{< mailto email="hi@rog.gr"
subject="I've figured out a cool new way to render code blocks..." >}}reach out
to me via email{{</ mailto >}} to let me know.
