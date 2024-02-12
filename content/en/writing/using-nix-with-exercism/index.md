+++
title = "Using Nix with Exercism"
date = "2024-02-01"
description = """Want to get really good at programming? Use **Exercism**. Want
to get really good while using your own personal development environment? Use
**Nix**. I'll show you how to manage each **Exercism** track using **Nix
Shells**. I hope it inspires you to try out **Nix** when using **Exercism**."""
+++

> `tl;dr`
>
> I highly recommend you read the whole post, but if you want to get started on
> your own, please read through the documentation for [**Exercism
> CLI**][exercism-cli], [**Nix**][nix], & [**Devshell**][devshell].

[nix]: https://nix.dev/ "Official documentation for getting things done with Nix."

I ❤️ [*Exercism*][exercism] & find myself going there at least once a day. It's a
great nonprofit alternative to other programming exercise platforms such as
*Leetcode* or *CodeSignal* that is open source & 100% free to use for folks
wanting to learn & practice coding exercises. My absolute favorite feature of
*Exercism* is being able to **work on the exercises locally in my own personal
development environment**. This helps me get used to the ergonomics of a
particular programming language along with the necessary tooling around it.

[exercism]: https://exercism.org "Learn, practice and get world-class mentoring
in over 50 languages. 100% free."

Take note that I'm expecting you to have *Nix* & [*`direnv`*][direnv] installed
on your machine. While these aren't necessary at all to use *Exercism*, they are
necessary to have reproducible development environments whenever you work on a
given Exercism track with some light setup.

[direnv]: https://direnv.net "A tool to unclutter your `.profile`."

## Using *Exercism* locally via their CLI

*Exercism* is built around the [*Exercism CLI* tool][exercism-cli]. This lets
you download, test, & submit any exercise from your local environment. Keep in
mind that the The CLI tool doesn't install anything on your environment for the
programming languages in the track though. If you don't want to bother
installing language specific tooling locally, you can use their built in
online code editor.

[exercism-cli]: https://exercism.org/docs/using/solving-exercises/working-locally "Learn how to solve exercises on your local machine"

But I enjoy working on my local machine, **at my own pace**, within my
personalized development environment. When I'm practicing in various languages,
I find myself needing to install the tooling for any specific track. This can be
a problem if you use one version of a tool or language that's different than the
one *Exercism* uses. For me, the best scenario is building a reproducible
environment that can be used for working through *Exercism* exercises. This
environment includes all the necessary tools & languages that I'll need to be
productive locally.

This **very specific edge-case** when using *Exercism* is what lead me to try &
leverage *Nix* development environments for *Exercism's* various language
tracks. This means that I can manage the language & tooling packages as *Nix*
derivations for when I practice without affecting the dependencies I have
installed locally for other projects on my system. As someone who's been slowly
migrating over to *Nix*, **I've been installing dependencies globally less &
less**.

Once you have the *Exercism CLI* installed locally & pull down an exercise,
you'll notice that by default it puts all your exercises within a directory like
`~/Exercism/<language>`. The `<language>` is specific to the language track you
pick. Inside of each `<langauge>` directory lives even more directories for each
downloaded exercise for that given track. The *Exercism CLI* isn't concerned
with what you put inside these `<language>` directories so **this is where we're
going to put your *Nix* & `direnv` files** to get everything working. You can
verify what your Exercism workspace is by running the following command.

```sh { title = "Checking your workspace" verbatim = false}
exercism workspace
```

## Using *Nix* to manage track dependencies

*Nix* has a great feature called the *Nix shell* which allows reproducible
environments for developing software. You can share this across all *Linux*
distributions, *WSL*, & *macOS*.

We'll leverage *Nix* along with how to create reproducible directories for all
of our *Exercism* tracks. I also use `direnv` to integrate *Nix* into
my development environment. While it's not a necessity, it's an important aspect
of how I use *Nix shell* so I'm writing this from the perspective that `direnv`
is installed on your machine & working as expected.

### Using *Nix* `mkShell` to build a track environment

A very quick way to set up a *Nix shell* is to leverage the `mkShell` function
in a `shell.nix` file. This file contains the *Nix* expressions that will allow
you to install the necessary packages. The following example is not considered
reproducible & is subject to change if `nixpkgs` gets updated.

```nix { title = "shell.nix" hl_lines = [4,5,9] }
{ pkgs ? import <nixpkgs> { } }: with pkgs;

mkShell {
  name = "exercism-<language>";
  buildInputs = [
    exercism
    nodejs_20
  ];
  shellHook = ''
  '';
}

```

In this file, you can see highlighted above that the `name` variable should be
set to something that helps you identify the shell. Also the `buildInputs`
variable is set to the packages that you need to work within the track as well.
Also using this method, you can set the `shellHook` variable to a multi-line
string to setup anything in the directory as needed. The `shellHook` is a useful
way to create directories or set environment variables you might need for a
specific track. 

```sh { title = ".envrc" }
use nix
```

And the `.envrc` file used by `direnv` only needs to be told to use *Nix*. It's
very simple & easy to use, but won't include any extra information about the
shell.


### Leveraging *Devshell* for even more customizations

There's an unstable tool by [the folks over at *Numtide*][numtide] called
[*Devshell*][devshell] which I've been using for some of my personal projects.
It's similar to using the `mkShell` function to produce a shell environment, but
rather than pulling in each derivation for the packages you request
individually, it creates a derivation for that specific shell. I like this
better since this derivation is specific to all the necessary things required in
a project & when digging around in `/nix/store` you can get a general
understanding of what's happening. But don't worry, *Devshell* is still using
*Nix* derivations internally so your dependencies are still only installed in a
single place if they are derived from the same source at build-time.

[devshell]: https://numtide.github.io/devshell/ "Devshell: like virtualenv, for every language."
[numtide]: https://numtide.com/ "A NixOS and DevOps consulting company based in Switzerland."

Another great feature of *Devshell* is that it uses [*TOML*][toml] to configure
the environment so other folks using your setup don't necessarily need to know
how to write *Nix* in order to modify packages or the shell environment required
for the *Exercism* track. Through this *TOML* file, you can also configure a
large number of things such as a message-of-the-day, also known as [MOTD][motd],
whenever you change directories into a given track.

[motd]: https://en.wikipedia.org/wiki/Message_of_the_day "The Wikipedia page for MOTD."

[toml]: https://toml.io/ "Homepage for TOML [Tom's Obvious Minimal Language]."

If you're leveraging *Exercism* in a group, or if you'd like some a reminder for
yourself, then having a MOTD is very helpful.

#### My personal recommendations for configuring *Devshell*

Since the tool is considered unstable by *Numtide*, I have some recommendations
based on how I use it. First, it's important to leverage the non-flake version
of the *Devshell*. I suggest this since local *Exercism* tracks are not usually
under version control & to keep the usage of *Nix* as uncomplicated possible.
While I am a fan of *Nix flakes*, I believe it's out of scope this specific
use case. With that in mind, you'll need to create three files to get everything
working inside of the language track directory; `shell.nix`, `devshell.toml`, &
`.envrc`. Below you'll find the base content for these files.

```nix { title = "shell.nix" hl_lines = [3] }
{ system ? builtins.currentSystem }:
let
  src = fetchTarball "https://github.com/numtide/devshell/archive/83cb93d6d063ad290beee669f4badf9914cc16ec.tar.gz";
  devshell = import src { inherit system; };
in
devshell.fromTOML ./devshell.toml
```

Notice the highlighted line above for the `src` variable. This download link
contains the SHA for a specific commit in the `numtide/devshell` repository.
This [the recommended approach][devshell-src] when pulling in *Devshell* as a
non-flake. You don't want to set this as the default branch of the repository
since it could pull in breaking changes.

[devshell-src]: https://numtide.github.io/devshell/getting_started.html#nix-non-flake

```toml { title = "devshell.toml" }
[[commands]]
category = "[cli]"
package = "exercism"

# [devshell]
# name = "exercism-<language>"
```

The above file is a generic `devshell.toml` which includes the `exercism` CLI
tool in your path along with an option to set the name for the *Devshell*. You
can read more from [the official documentation on the schema][devshell-schema].

<details>
<summary>ℹ️ Take note when reading the documentation linked above.</summary>

##### Understanding how to read the *Devshell* modules schema

You'll need to understand how the *Nix* types & values translate to the
specification in the *TOML* schema. For instance, the `devshell.motd` property
accepts a string. In *Nix*, a string can be a single line using double-quotes
(`"`) or a multi-line string using two single-quotes (`''`). In *Toml*,
multi-line strings use three double-quotes (`"""`) to designate start & end of
the value that's a multi-line string.

</details>

[devshell-schema]: https://numtide.github.io/devshell/modules_schema.html "The Devshell schema."

```sh { title = ".envrc" }
export DIRENV_WARN_TIMEOUT=10s

if nix flake show &> /dev/null; then
  use flake
else
  use nix
fi
```

And for the last file, `.envrc`, your copy of `direnv` will read this file &
either use *Nix* or *Nix flake* for setting up you shell.

##### Setting up a MOTD for your reproducible shell

Another thing to keep in mind is what kind of MOTD you'd like to set. By
default, *Devshell* has a helpful one that includes a call to the built-in
`menu` command that shows you the commands for the packages you've installed
under the `[[commands]]` list. You can customize this to include things like
links to documentation or anything you'd like. It's a string that can include
sub-shells to get output from commands.

```Nix {title = "The default MOTD" verbatim = false}
''
  {202}🔨 Welcome to devshell{reset}
  $(type -p menu &>/dev/null && menu)
''
```

I like to customize mine a bit more so I include both a `name` and `motd`
property on the `[devshell]` object in the `devshell.toml` file. Below is an
excerpt of the `devshell.toml` file I'm use for the JavaScript track.

```toml { title = "devshell.toml" }
[devshell]
name = "exercism-javascript"
motd = """
{16}🐝 Welcome to your {underline}JavaScript{reset}{16} Exercism track{reset}
$(type -p menu &>/dev/null && menu)
"""
```

## Tying *Nix* & *Exercism* together

So as I mentioned above, the `~Exercism/<language>` directory is the best place
to add your *Nix* files around configuring your shell environment. With
`direnv`, once you change into the `<language>` directory you will have
everything installed for that specific track. If you chose using *Devshell*,
you'll also have your customized message-of-the-day as well.

```sh { title = "Navigating into the JS track" verbatim = false }
cd ~/Exercism/javascript
direnv: loading ~/Exercism/javascript/.envrc
direnv: using nix
  🐝 Welcome to your JavaScript Exercism track

[[cli]]

  exercism - A Go based command line tool for exercism.io

[[general commands]]

  menu     - prints this menu

[[language]]

  node     - Event-driven I/O framework for the V8 JavaScript engine

[[linting]]

  vale     - A syntax-aware linter for prose built with speed and extensibility in mind

direnv: export +DEVSHELL_DIR +IN_NIX_SHELL +NIXPKGS_PATH +PRJ_DATA_DIR +PRJ_ROOT +name -TMPDIR ~PATH ~XDG_DATA_DIRS
```

This is a delightful user-experience that allows you to install whatever number
of packages accessible in the directory for the language track.

## Using this knowledge for other projects besides *Exercism* tracks

As you may have been able to tell by now, this is useful outside of using
*Exercism*. In fact, I use *Nix* to manage most of my OS on *macOS* and *NixOS*,
along with my configuration files & home directory, & this extended to my
personal project development environments as well using *Devshell*.

*Nix* is a lot to dive into all at once, but like most things it can be
approached in small pieces. As a *Nix* user, you're encouraged to manage
everything using *Nix*. But do so as you learn more and more *Nix*. Once you're
comfortable using it, you might not be able to help yourself! Thanks for reading
& I hope this helps you as much as it helped me when it comes to using
*Exercism* locally using *Nix*.
