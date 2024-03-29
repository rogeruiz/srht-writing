+++
title = "Apple Interface Style & TUI"
date = "2022-11-23"
description = """**macOS**-based Night mode supported scripting to update
various configurations across different development environment tools including,
**Alacritty**, **Tmux**, **Neovim**, **Starship**, and **Bat**."""
slug = "appleinterfacestyle--tui"
tags = ["automation", "devex", "mac"]
+++

> `tl;dr`
>
> macOS-based Night mode supported scripting to update the configuration across
> different development environment tools including: [Alacritty][alacritty],
> [Tmux][tmux], [Neovim][neovim], [Starship][starship], and [Bat][bat].
>
> [🔗 view the source code](https://git.sr.ht/~rogeruiz/.files/tree/legacy/item/bin/darwin/current_visual_mode)

[alacritty]: https://alacritty.org/
[tmux]: https://github.com/tmux/tmux/wiki
[neovim]: https://neovim.io/
[starship]: https://starship.rs/
[bat]: https://github.com/sharkdp/bat

This post has been cooking for a long time. The ability to switch between visual
modes across all my tooling always felt like an attainable goal but for years it
was outside my periphery because my main tools weren't Unix philosophy aligned.

Here's an excerpt from the original authors.

> Expect the output of every program to become the input to another, as yet
> unknown, program. Don't clutter output with extraneous information. Avoid
> stringently columnar or binary input formats. Don't insist on interactive
> input.
>
> from Ken Thompson and Dennis Ritchie, key proponents of the **Unix
> philosophy**.

I like to reference the Unix philosophy a lot. I recommend reading it every now
and then. It's historic information and the perspective gained from rereading it
is super helpful. I've learned that people aren't aware of the Unix philosophy
by name. I hope showing you how using macOS Night mode to trigger theme changes
across different tools at once helps enforce parts of the Unix philosophy in
modern times.

## The visual problem

When I'm on the computer, I tend to work in Dark themes in my editor and
terminal. For me, these are the same things and expand further to tools like my
multiplexer, command prompt framework, and TUI. The problems I experience are
when I work outside during daylight hours it's almost impossible to work
outside. The display on my laptop is glossy and turns into a reflective surface
when I use my Dark themes.

![My dark theme](./images/my-dark-theme.png)

I use a lot of tools that subscribe to the Unix philosophy to varying degrees.
For a Terminal I've used [iTerm2][iterm2] for almost a decade but I switched to
*Alacritty*. I switched from *OhMyZSH&* to *Starship* for my command prompt. I
used to use Vim but made the big leap to learn *Lua* and *Neovim* earlier this year.
I've made a big switch to *Rust*-based tools like *Bat* to get a different visual
user experience compared to *Cat*.

[iterm2]: https://iterm2.com/

## The configuration problem

My terminal throughout the years has been *iTerm2*. I love the customization and
the attention to detail you find in the configuration. It's a *Mac*-first
application and does a good job of conforming to *Apple's HIG* and still
allowing users to customize it further on their own. It's all accessible with an
intuitive UI-based settings page. Configurations get exported and imported to
*XML* files to make sharing them easy.

![iTerm2 Colors Pane](./images/iterm-color-preferences.png)

## Text-based configurations are better than proprietary ones

The tools I use every day use text based configuration files such as customized
`.conf` files or *Yaml* or *TOML* files. This is super helpful to me to be able to
back these things up in version control.

Even though *iTerm2* allows for exports and imports of configuration, the
interface isn't text-first. It's visual first. Which is great if that's what
you're in to.

> Write programs to handle text streams, because that is a universal interface.
>
> by Peter H. Salus in **A Quarter-Century of Unix** (1994).

### I had to stop using iTerm2 and start using Alacritty

While I've used *iTerm2* for over seven years, I did run in to various
limitations. They were around configuration management. There were times where I
would make an update and I would have to close and open the window for it to
take effect. Other times, I would have to manually enter my theme and tweak my
configuration using the UI editor. While all this worked for me for years, I
needed to try something better. I switched to *Alacritty* and haven't looked back
yet. While it's not as feature-rich as *iTerm2* if you're looking for lots of
features, it does have a text-based configuration written in *Yaml* that updates
the terminal on save.

<img class="w-24 md:w-36 float-right ml-6" src="./images/alacritty-logo.png" alt="Alacritty
logo" />

[➡️ Checkout my Alacritty configuration](https://git.sr.ht/~rogeruiz/.files/tree/legacy/item/alacritty/alacritty.yml).

The *Alacritty* project has stated publicly that they're looking to recreate the
terminal emulation experience and nothing else. That's okay for me as I use
*Tmux* to augment my terminal experience. But as usual, your mileage may vary.
Explore your options. If *Alacritty* interests you then please keep reading.

## Next up, I said what I sed

[➡️ The stream editor `sed`](https://manpages.org/sed).

This little Unix program is the best. I love `sed` and that might be because I
learned regular expressions by learning Pearl and **finding and replacing text**
made me laugh when I realized what the acronym sounded like. F A R T. Editing
text on the fly is so dope. This is how `sed` made its way into this solution. I
hope it makes you realize the same thing.

```bash{title="Using sed to update Alacritty" verbatim=false}
sed -E -i '' \
	"s/^(colors: \*).+$/\1${current_mode}/" \
	~/.alacritty.yml
```

Making sure that I capture the correct part of the key/value pair for what I'm
editing I am able to set it to the `$current_mode` coming from the PLIST *macOS*
sets when triggering Night Mode.

```bash{title="Using sed to update Neovim" verbatim=false}
sed -E -i '' \
	"s/^(set.background = ).+$/\1\"${current_mode}\"/" \
	~/.config/nvim/lua/theme.lua
```

```bash{title="Using sed to update Starship" verbatim=false}
sed -E -i '' \
	"s/^(palette = ).+$/\1\"${current_mode}\"/" \
	~/.config/starship.toml
```

Now there can be an issues where maybe a different name gets used, and that's
okay too. It's easy to just set another variable like `$catppuccin_flavour` and
use it the same way.

```bash{title="Using sed to update Tmux" verbatim=false}
sed -E -i '' \
	"s/^(set -g @catppuccin_flavour ).+$/\1'${catppuccin_flavour}'/" \
	~/.tmux.conf
# source the config so it forces reloading
tmux source-file ~/.tmux.conf
```

Since these configuration files all use the same text-based interface for
configuring the theme, then I am able to use simple Unix tools to edit text
and save the document. The `sed` tool great for just that.

With the `-E` flag, I'm able to run enhanced regular expressions. I do this
because I need to run positional capture to match the key rather than the value
since I don't know what it will be. Or better said, I shouldn't care about
specifics. I should care what I want it to be. I also need to make sure that I
capture the rest of the text in the value after the key's definition too with
`.+$`.

Now since I used parentheses around the key and assignment operator (`=`,
`<space>`, or `:`), I can then use `\1` to place it where it's needed to set the
correct value.

All this and it's clear to see the values of using the Unix philosophy to manage
the APIs between various tooling.

> The notion of "intricate and beautiful complexities" is almost an oxymoron.
> Unix programmers vie with each other for "simple and beautiful" honors — a
> point that's implicit in these rules, but is well worth making overt.
>
> by Doug McIlroy in Eric Steven Raymond's book **The Art of Unix
> Programming**.

## Let's make sure that the code runs on startup

I have a script which I use to prompt me for what shell I'd like to use. By
default, I use *Zsh* with *Tmux*. I call this script `tux` which you can find in
my dot files. Once I've created my custom script, I just had to make sure I
called it from within my startup script. Below is a working example where I
change between light mode and Dark mode using nothing more than the *macOS*
Display preference in the menu bar.

![My terminal changing color themes](./images/light-vs-dark-mode.gif)

## The secret is using AppleInterfaceStyle

I stumbled across the helpful project on GitHub called `plistwatch` which emits
any changes to PLIST files on your system.

[ ➡️ View the source code for `catilac/plistwatch` on GitHub](https://github.com/catilac/plistwatch).

With this tool, I was able to see what property list (PLIST) value was getting
set whenever my Mac transitioned between light and dark modes. The global value
gets set by macOS with the keyword `Dark`. Using a simple If-Statement, I could
set it like so.

```bash{title="A bash If-Statement to check mode" verbatim=false}
if defaults read -g AppleInterfaceStyle &>/dev/null
then
  echo "Dark mode is on."
else
  echo "Light mode is on."
fi
```

The reason it's a simple If-Else-Statement is because there are two modes. This
could change in the future. Apple just writes `Dark` to the PLIST for
`AppleInterfaceStyle` and then deletes it when *macOS* is in light mode.

With this simple check, the CLI tool `sed`, and text-based configuration files,
I was able to have my terminal and tools react to light and dark mode without
needing to download or write much custom code. Cheers 🎉 for the Unix philosophy
still proving useful in 2022.
