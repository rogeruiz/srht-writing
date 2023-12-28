+++
title = "Setting up lolcommits"
date = 2016-05-28
description= """
Setting up lolcommits for local selfies from Git commits you make on your
machine using your camera. This is geared at Mac OS X users.
"""
slug = "setting-up-lolcommits"
+++

> `tl;dr`
>
> To get the most from this post, you're gonna need to really read through it.
> But, basically I walk you through how to setup `lolcommits` up for yourself
> locally and automatically post captures to Tumblr.
>
> [➡️ Check out my **rogerisworking** Tumblr](https://rogerisworking.tumblr.com)
>
> [Check out the latest source for `post-commit` script](https://git.sr.ht/~rogeruiz/.files/tree/main/item/dot_git_template/hooks/executable_post-commit)

## Getting started

> This guide makes some assumptions that you're using the terminal to run the
> following commands, and that you're using Mac hardware and software.

Installing `lolcommits` is pretty easy via Ruby Gems. If you've got the `gem`
command on your computer, you can simply run the following command.

```sh

gem install lolcommits
# If you've got permission errors, `sudo` like you mean it ( ie: `sudo !!` )
```

After it installs, you can make sure it's available by running `lolcommits`.

```sh

lolcommits


Do what exactly?
Try: lolcommits --enable   (when in a git repository)
Or:  lolcommits --help
```

Great. Now that the binary is installed and in your `$PATH`, we can focus on
customizing it. I personally use it to post everything I commit as a photo to a
[Tumblr I made specifically][roger-is-working] to [cope with the dehumanizing
aspects of working with computers][humanizing-computer-work].

[roger-is-working]: http://rogerisworking.tumblr.com/ "Roger Is Working"

[humanizing-computer-work]: {{< relref "writing/humanizing-computer-work" >}} "Humanizing computer work"

Feel free to skip around to any of the following sections.

- [Initializing teh lulz](#initializing-teh-lulz)
- [Customizing teh lulz](#customizing-teh-lulz)
- [Configuring teh lulz](#configuring-teh-lulz)
- [Automating teh lulz](#automating-teh-lulz)
- [Setting up your `~/.git_templates/` directory](#setting-up-your-git_templates-directory)
- [Synchronizing your `config.yml` files](#synchronizing-your-configyml-files)

### Initializing teh lulz

To get started you can run `lolcommits --enable` within any git repository you'd
like. This does a few things which **are pretty destructive** if you use the
`post-commit` hook. So make sure you back it up.

```sh

cp .git/hooks/post-commit .git/hooks/post-commit.bak
```

Now you can safely run `lolcommits --enable`.

```sh

lolcommits --enable


installed lolcommit hook to:
  -> $HOME/Developer/<REPO>/.git/hooks/post-commit
(to remove later, you can use: lolcommits --disable)
```

Which will give you the following output inside of `.git/hooks/post-commit`.

```sh

cat .git/hooks/post-commit


#!/bin/sh
### lolcommits hook (begin) ###
if [ ! -d "$GIT_DIR/rebase-merge" ]; then
export LANG="en_US.UTF-8"
export PATH="$HOME/.rvm/rubies/ruby-2.2.2/bin:/usr/local/bin:$PATH"
lolcommits --capture
fi
###  lolcommits hook (end)  ###
```

### Customizing teh lulz

Now that we've got the hook installed, you can make your first commit and see
what it's all about. You'll notice on the `post-commit` file that line 6 is just
a call to `lolcommits --capture`. This is what takes the commit image. It
accepts some additional flags to customize your experience. Feel free to play
around with them.

```sh

lolcommits --help


Usage: lolcommits [-vedclbscpsmwga]
    # shortened for emphasis & brevity
    -c, --capture                    capture lolcommit based on last git commit
    -w, --delay=SECONDS              delay taking of the snapshot by n seconds
        --stealth                    capture image in stealth mode
    -a, --animate=SECONDS            enable animated gif captures with duration (seconds)
        --fork                       fork the lolcommits run
```

Once you run the `--capture` command within a repo with commits, you can see
your lolcommit image by running `lolcommits --browse`. This will open the
`Finder.app` to the folder containing all the lulz. It's useful to keep this
open as you tweak your `lolcommits --capture **` command so you can preview your
changes.

Here's the command I use to capture my lovely commits:

```sh

lolcommits --capture --fork --stealth --delay=3 --animate=5
```

I find that `--fork` allows me to quickly capture commits. The `--stealth` flag
helps me forget it's taking a picture, even though the green light will still
turn on. The `--delay=3` is great so that the iSight camera can focus on you.
Finally, `--animate=5` is what gives me `*.gif` files that I can later upload to
Tumblr. This means I don't get any `*.jpg` files. I personally don't mind losing
them, but if you want you can always run the command twice once without the
`--animate=*` flag.

### Configuring teh lulz

There are [quite a few plugins][lol-plugins] available for `lolcommits` that do
all sorts of fancy things. The one I like to use is the Tumblr plugin, since I
don't want to worry about hosting or theming of my lolcommits.

To configure Tumblr, you just need to follow the prompts after running the
configuration command.

```sh

lolcommits --config -p tumblr
```

Each prompt will walk you through the steps needed to enable the Tumblr
configuration. Once you've successfully configured the plugin, `lolcommits` will
generate a `config.yml` file for you in the `$HOME/.lolcommits/<REPO_NAME>/`
directory. This `config.yml` is what tells `lolcommits` what configurations to
use _after it creates an image_. [You can take a look at the source for the
Tumblr plugin here][lol-tumblr-src].

```sh

cat $HOME/.lolcommits/`echo ${PWD##*/}`/config.yml


---
tumblr:
  enabled: true
  access_token: <REDACTED_SECRET>
  secret: <REDACTED_SECRET>
  tumblr_name: rogerisworking
```

[lol-plugins]: https://github.com/mroth/lolcommits/wiki/Configuring-Plugins "Lolcommits Plugins"
[lol-tumblr-src]: https://github.com/mroth/lolcommits/blob/0d10e21bb72cbf1dee6ce33914b060c102b76dbf/lib/lolcommits/plugins/lol_tumblr.rb "Lolcommits Tumblr Plugin source"

### Automating teh lulz

Once you've gotten a single repository enabled and tweaked to your liking, you
might want to ensure that all of your newly cloned repositories and old
repositories are using `lolcommits` to capture your beautiful selfie. This can
be very time consuming as you'd need to run `lolcommits --enable` within each
repository _and then_ copy over the `config.yml` file into that new folder
within `$HOME/.lolcommits`. Or you could automate it.

Now, this has less to do with `lolcommits` and more to do with `git` itself.
Git's `init` function, which is called on `git clone` and `git init` within a
directory, [supports a template directory][git-scm-init-docs]. This directory
can be anywhere in your system and referenced within your global Git
configuration file ( ie `~/.gitconfig` ).

[git-scm-init-docs]: https://git-scm.com/docs/git-init#_template_directory "Git SCM `git-init` Template directory"

#### Setting up your `~/.git_templates/` directory

To setup your `git_templates/` directory, you can follow these commands:

```sh

mkdir -p $HOME/.git_template/hooks/ && \
git config --global init.templatedir ~/.git_template
```

Once you've configured `git` to recognize the `$HOME/.git_template` directory as
your `git init` template directory, you can copy the `post-commit` file that
`lolcommits` generated in the repository you ran `lolcommits --enable` and
tweaked to your liking above.

```sh

cp -v .git/hooks/post-commit $HOME/.git_template/hooks/post-commit
```

This will insure that `git init` and `git clone` copies over the `post-commit`
file into the repositories `.git/hooks/` directory. Now every repository you
clone or create on your machine will have `lolcommits` enabled by default.

> Fun Fact: This is a feature of `git` and not `lolcommits` so you can
> use it for any other git-hook templates you'd like to copy over into new
> repositories.

#### Synchronizing your `config.yml` files

Once you've created a `config.yml` file that automatically uploads things to
Tumblr, you need to make sure to copy that file over to each directory within
`$HOME/.lolcommits/`. I keep my base `config.yml` at the root-level of the
`$HOME/.lolcommits/` directory and copy it over using the following command
whenever I'm working with a new repository on my machines.

```sh

cp -v $HOME/.lolcommits/config.yml $HOME/.lolcommits/`echo "${PWD##*/}"`/config.yml
```
