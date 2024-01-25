+++
draft = true
title = "Using TouchID with Tmux"
date = "2024-01-23"
description = """As I transition my dotfiles configurations over to **Nix** away
from **Homebrew** & **Chezmoi**, I found myself elevating my priviledges a lot
more than usual. Having to type my password so much lead me question my path a
bit. But then I learned about using **TouchID** for **Sudo**, but quickly found
that it didn't work in **Tmux**."""
+++

> `tl;dr`
> 
> This post is going to cover how to I setup **TouchID** for **Sudo** commands
> in **Tmux** using **Nix**. But there are ways to do this without Nix at all
> that you'll need to maintain manually. I'll cover those too, but if you want
> to read how to do it yourself read the following helpful posts on this
> subject.
> 
> [➡️ Enabling **TouchID** authorization for Sudo on *macOS High Sierra*][derflounder]
>
> [➡️ *GitHub* pam_reattach repository][pam_reattach]

[derflounder]: https://derflounder.wordpress.com/2017/11/17/enabling-touch-id-authorization-for-sudo-on-macos-high-sierra/
[pam_reattach]: https://github.com/fabianishere/pam_reattach

I started using *Nix* while my laptop was at the *Apple* repair center earlier
in the month. It started with *NixOS* and an old *Dell Chromebook*, then quickly
moving into using *Home Manager*. When I eventually got my laptop back, I liked
*Nix* so much that I decided to learn `nix-darwin`. 

This is a long-winded way of saying that I went down the *Nix* rabbit-hole 🐰🕳️,
**yet that journey is for another post**. For folks unfamiliar with *Nix* it's
three-letters that refer to a number of different things. There's the operating
system, package manager, & the language. I'll be covering using all three in my
dot-files to get *TouchID* working when authenticating in a terminal or inside
of *Tmux*.

> ⚠️ **My solution here** is based on other's code that might soon be merged
> upstream. This means you will greatly simplify the solution presented here.
> Because of that, I'll be showing how to enable thing first before diving
> deeper into how.
>
> [➡️ Add option to pam module to use pam_reattach **#662**](https://github.com/LnL7/nix-darwin/pull/662)

## What file manages this?

The file `/etc/pam.d/sudo` manages *Sudo* for your *Mac*. Since 2017, you've
been able to modify this file to get *TouchID* support for any *Sudo* actions.
It's an important file that *Apple* resets during major *macOS* system updates.
So you'll need to edit it after upgrades. In this file, you will need to add the
following line to enable *TouchID*.

```
auth       sufficient     pam_tid.so
```

With that done, you'll now have *TouchID* support within your favorite terminal
emulators. You won't even need to restart your system. You will need elevated
privileges and that'll be the last time you'll need to enter your password
rather than use *TouchID* when running commands as `root`.

That's great! But it doesn't work inside of *Tmux* 😢. Similar to how [`pbpaste`
and `pbcopy` need to be **reattached**][reattach-to-user-namespace] for *Tmux*
sessions, you will need to also reattach *Privileged Access Management (PAM)* to
*Tmux* sessions in order to get things working. Thankfully, there's already a
project to do just this! It's available through all the package managers such as
*Homebrew*, *MacPorts*, or *Nixpkgs* via *Nix Darwin*. Once you have the *PAM*
module `pam_reattach` installed & placed / linked in either `/usr/lib/pam/` or
`/usr/local/lib/pam`, you can then can add the following line to enable
*TouchID* in *Tmux* sessions.

[reattach-to-user-namespace]: https://github.com/ChrisJohnsen/tmux-MacOSX-pasteboard

```
auth       optional       pam_reattach.so ignore_ssh
```

It's important to remember to have the file linked in the appropriate directory.
If you want to install it somewhere differently, you'll need to use the full
path to the `pam_reattach.so` file. This is especially true on *M1 Macs* because
*Homebrew* uses `/opt/homebrew/` on those systems. I also added `ignore_ssh` to
avoid prompting for a touch when connected via SSH.

## Leveraging *Nix* with *Nix Darwin*

So if you're still with me, let's use *Nix* to manage the changes that need to
be made to this file. This is convenient as you can use this to setup your
*macOS* system easily with the necessary *TouchID* settings to get it working
for *Sudo* commands. The *Nix* community is great and they have folks working on
solutions to this right now. I was able to find patch change on *GitHub* that I
integrated into my personal configuration file. It's something more to maintain,
but it's also working for me now rather than having to wait for upstream to
integrate the changes into *Nix Darwin*. 

### Using what's already in upstream

Since 2022, you've been able to use *Nix Darwin* with the `security = { pam = {
enableSudoTouchIdAuth } }` option in *Nix*. So to enable *TouchID* for your
*Mac* may be as simple to as adding the following option to your *Nix*
configuration.

```nix
{ ... }:
{
  security.pam.enableSudoTouchIdAuth = true;
}
```

With this, you just need to run `darwin-rebuild switch` to set the following
line in your `/etc/pam.d/sudo`:

```
auth       sufficient     pam_tid.so # nix-darwin enableSudoTouchIdAuth
```

This is done with using the `sed` command. You can check out the *Nix* file if
you're curious how the changes are being handled.

[➡️ *Nix Darwin* using `sed` to modify `/etc/pam.d/sudo` in
place][gh-pam.nix-using-sed]

[gh-pam.nix-using-sed]: https://github.com/LnL7/nix-darwin/blob/1e706ef323de76236eb183d7784f3bd57255ec0b/modules/security/pam.nix#L18-L37

Again this is where you can stop reading if you don't care about supporting
*Tmux*. Using *Nix* to add the `pam_tid.so` line from above is great too because
you don't have to worry about making any errors and are able to turn it on or
off easily if you need to.

### Extending *Sudo* with a custom *PAM* module using patches

Now, if you're still with me then that's great news! The less great news is that
as the time of this writing there is no configuration option for *Nix Darwin*
which is named `enablePamReattach`. That would be great if there were. And there
might be soon with the **#662** pull request. I hope it gets merged in soon. But
it made me think. Couldn't I just extend things on my end using *Nix*?

[➡️ Add option to pam module to use pam_reattach **#662**](https://github.com/LnL7/nix-darwin/pull/662)

And the answer is yes! Installing `pam_reattach` is easy enough with *Nix* by
adding it to the packages you're installing. Once you have that, you can create
a module that you import into your configuration. I saved this in my *Nix Flake*
configuration at `module/security/pam.nix`. I'll link to the complete file if
you just want the code. Below, I'll go into detail breaking up the code with
some explanations which is useful if you're new to the *Nix* language.

[➡️ My manually-maintained `module/security/pam.nix` file from **#662**](https://git.sr.ht/~rogeruiz/.files.nix/tree/a16d8f6f737fc702e2f866d795a9b90dd51e9f7d/item/module/security/pam.nix)

#### Creating a *Nix* expression 

This first part setups up the function that is considered a *Nix* module. Since
every function can only have one argument, this function uses a set `{ ... }` as
its argument to include `config`, `lib`, and `pkgs`.

> [➡️ Read more about *Nix* functions in the language tutorial](https://nix.dev/tutorials/nix-language#functions)

```nix
{ config
, lib
, pkgs
, ...
}:
```

The function syntax is can be thought of as `a: b + 1`. Ultimately in this
function we're going to be returning a set that looks like this: `{ options = {
... } }`. But let's keep going.

Here's the continuation of the function with everything after the colon `:`.
This part here uses two syntaxes that help with passing attributes and accessing
them in the body of the function.

```nix
with lib; let
  cfg = config.security.pam;
in
{
```

```nix
  # WARN: This file only exists here because the following PR is not merged
  # upstream: https://github.com/LnL7/nix-darwin/pull/662. Once they do exist,
  # I'll be removing this file from my configuration.
  options = {
    security.pam = {
      # README: Renamed here to include the `Patch` suffix to avoid collision with
      # upstream option of the same name
      enableSudoTouchIdAuthPatch = mkEnableOption ''
        Enable sudo authentication with Touch ID

        When enabled, this option adds the following line to /etc/pam.d/sudo:

            auth       sufficient     pam_tid.so

        (Note that macOS resets this file when doing a system update. As such, sudo
        authentication with Touch ID won't work after a system update until the nix-darwin
        configuration is reapplied.)
      '';
      enablePamReattach = mkEnableOption ''
        Enable re-attaching a program to the user's bootstrap session.

        This allows programs like tmux and screen that run in the background to
        survive across user sessions to work with PAM services that are tied to the
        bootstrap session.

        When enabled, this option adds the following line to /etc/pam.d/sudo:

            auth       optional       /path/in/nix/store/lib/pam/pam_reattach.so"

        (Note that macOS resets this file when doing a system update. As such, sudo
        authentication with Touch ID won't work after a system update until the nix-darwin
        configuration is reapplied.)
      '';
      sudoPamFile = mkOption {
        type = types.path;
        default = "/etc/pam.d/sudo";
        description = ''
          Defines the path to the sudo file inside pam.d directory.
        '';
      };
    };
  };
```

Here you can see how the system.patches is used to add the necessary lines
depending on the `if-` statements using the values saved in `cfg` matching the
options we set earlier.

```nix
  config = {
    environment.pathsToLink = optional cfg.enablePamReattach "/lib/pam";

    system.patches =
      if cfg.enableSudoTouchIdAuthPatch && cfg.enablePamReattach
      then [
        (pkgs.writeText "pam-reattach-tid.patch" ''
          --- a/etc/pam.d/sudo
          +++ b/etc/pam.d/sudo
          @@ -1,4 +1,6 @@
           # sudo: auth account password session
          +auth       optional       ${pkgs.pam-reattach}/lib/pam/pam_reattach.so
          +auth       sufficient     pam_tid.so
           auth       sufficient     pam_smartcard.so
           auth       required       pam_opendirectory.so
           account    required       pam_permit.so
        '')
      ]
      else if cfg.enableSudoTouchIdAuthPatch && !cfg.enablePamReattach
      then [
        (pkgs.writeText "pam-tid.patch" ''
          --- a/etc/pam.d/sudo
          +++ b/etc/pam.d/sudo
          @@ -1,4 +1,5 @@
           # sudo: auth account password session
          +auth       sufficient     pam_tid.so
           auth       sufficient     pam_smartcard.so
           auth       required       pam_opendirectory.so
           account    required       pam_permit.so
        '')
      ]
      else if !cfg.enableSudoTouchIdAuthPatch && cfg.enablePamReattach
      then [
        (pkgs.writeText "pam-reattach.patch" ''
          --- a/etc/pam.d/sudo
          +++ b/etc/pam.d/sudo
          @@ -1,4 +1,5 @@
           # sudo: auth account password session
          +auth       optional       ${pkgs.pam-reattach}/lib/pam/pam_reattach.so
           auth       sufficient     pam_smartcard.so
           auth       required       pam_opendirectory.so
           account    required       pam_permit.so
        '')
      ]
      else [ ];
  };
}

```
