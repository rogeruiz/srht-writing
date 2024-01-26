+++
draft = true
title = "Using TouchID with Tmux"
date = "2024-01-23"
description = """As I transition my dotfiles configurations over to **Nix** away
from **Homebrew** & **Chezmoi**, I found myself elevating my priviledges a lot
more than usual. Having to type my password so much lead me question my life
choices in how I can improve things for myself. In my research, I learned about
using **TouchID** for **Sudo**, but quickly found that it didn't work in
**Tmux**."""
+++

> `tl;dr`
> 
> This post is going to cover how to I setup **TouchID** for **Sudo** commands
> in **Tmux** using **Nix**. But there are **other ways to do this** without Nix
> at all that you'll need to maintain yourself. I'll cover those first, but if you
> just want to read how to do it yourself then you can read the following
> helpful links covering this.
> 
> [➡️ Enabling **TouchID** authorization for Sudo on *macOS High Sierra*][derflounder]
>
> [➡️ *GitHub* pam_reattach repository][pam_reattach]

[derflounder]: https://derflounder.wordpress.com/2017/11/17/enabling-touch-id-authorization-for-sudo-on-macos-high-sierra/
[pam_reattach]: https://github.com/fabianishere/pam_reattach

I started using *Nix* while my laptop was at the *Apple* repair center earlier
this month. It started with learning *NixOS* with an old *Dell Chromebook*, then
quickly moving into learning how to use *Home Manager* to reproducibly build my
user space. When I eventually got my laptop back from *Apple*, I liked *Nix* so
much that I decided to learn *Nix Darwin*. 

This is a long-winded way of saying that I went down the *Nix* rabbit-hole 🐰🕳️,
**though my writing about that journey is for another series of posts**. For
folks unfamiliar with *Nix* it's three-letters that refer to at least three
different things. There's the ***Nix* operating system**, ***Nix* package
manager**, & the ***Nix* language**. I'll be covering using all three in my
dot-files to get *TouchID* working when authenticating in a terminal or inside
of *Tmux* much further down this page. But I'll start by talking about the
problem we're solving here without *Nix* first.

> ⚠️ **My solution here** is based on other's code that might soon be merged
> upstream. This means you will greatly simplify the **Nix** solution presented
> here. Because of that, I'll be showing how to do all this manually before diving
> deeper into how to do it with **Nix**. It's always best to understand the
> problem before reaching for a more complex solution.
>
> [➡️ Add option to pam module to use pam_reattach **#662**](https://github.com/LnL7/nix-darwin/pull/662)
>
> [➡️ pam: add touchIdAuth to sudo_local **#787**](https://github.com/LnL7/nix-darwin/pull/787)

## What file(s) manages this?

The file `/etc/pam.d/sudo` manages *Sudo* for your *Mac*. Since 2017, you've
been able to modify this file to get *TouchID* support for any *Sudo* actions.
It's an important file that *Apple* resets during major *macOS* system updates.
So you'll need to edit it again after upgrades if you make any changes to it. In
this file, you will need to add the following line to enable *TouchID*.

```ini{title="This is all it takes to enable *TouchID* on your *Mac*" verbatim=false}
auth       sufficient     pam_tid.so
```

But wait! Take a look at the contents of your `/etc/pam.d/sudo` file and you'll
find an `include` directive for something called `sudo_local` in this file.

```ini{title="/etc/pam.d/sudo"}
# sudo: auth account password session
auth       include        sudo_local 
auth       sufficient     pam_smartcard.so
auth       required       pam_opendirectory.so
account    required       pam_permit.so
password   required       pam_deny.so
session    required       pam_permit.so
```

If you take a look at what's in the `/etc/pam.d/` directory you will find a
`sudo_local.template` file that you can modify and save as `sudo_local` which
gets included in the main `sudo` file. Also the comments in that file promise
that *macOS* system updates won't re-write your configuration.

```ini{title="/etc/pam.d/sudo_local.template"}
# sudo_local: local config file which survives system update and is included for sudo
# uncomment following line to enable Touch ID for sudo
#auth       sufficient     pam_tid.so
```

It's helpful to note too that this includes the `pam_tid.so` reference from
above here on the third line as a comment. It's nice to see *Apple* engineers
being helpful to their users when those users are mucking around in the
low-level files in their OS.

Now with the `/etc/pam.d/sudo_local` file updated, you'll now have *TouchID*
support within your favorite terminal emulators. You won't even need to restart
your system. 

That's great 🎉! But it doesn't work inside of *Tmux* 😢. Similar to how
[`pbpaste` and `pbcopy` needed to be **reattached**][reattach-to-user-namespace]
for *Tmux* sessions, you will need to also reattach *Privileged Access
Management (PAM)* to *Tmux* sessions in order to get things working. Thankfully,
there's already a project that does just that! It's available through all
package managers such as *Homebrew*, *MacPorts*, or *Nixpkgs* via *Nix Darwin*.
Once you have the *PAM* module `pam_reattach` installed & placed or linked in
either `/usr/lib/pam/` or `/usr/local/lib/pam`, you can then can add the
following line to enable *TouchID* in *Tmux* sessions.

[reattach-to-user-namespace]: https://github.com/ChrisJohnsen/tmux-MacOSX-pasteboard

```ini{title="/etc/pam.d/sudo_local"}
auth       optional       pam_reattach.so ignore_ssh
```

⚠️ It's important to remember to have the file linked in one of the two appropriate
directories mentioned above ⚠️. Making a mistake with these files will cause you
to have to reboot your *Mac* in *Recovery Mode* in order to edit the file again
to either remove or fix the path issues when running *Sudo*.

<details>

<summary> ⚠️ <strong> Click here to learn to how to recover from errors
in your <code>sudo_local</code> file</strong> </summary>

### Recovering from errors in your `/etc/pam.d/sudo_local` file

Don't panic 👽! Mistakes happen and that's totally okay. Errors in your
`sudo_local` file can cause your *Mac* to not allow you to run *Sudo* commands
which means you're effectively locked-out of editing those files in `/etc/pam.d`
since you can no longer run *Sudo*. This may happen if the path to
`pam_reattach.so` is not where *macOS* expects it to be and can't find it. You
can easily solve your issue by putting your *Mac* into recovery mode.

Here's the steps you'll need to take to fix *Sudo* and remove your broken
`sudo_local` file.

1. Shutdown your *Mac*
1. Hold the power button while booting up to get the `loading startup options`
   message.
1. Click on options
1. Select Macintosh HD
1. Enter your administrator password
1. Open Terminal.app
1. Change directories into `/Volumes/Data/private/etc/pam.d`
1. Remove the `sudo_local` file using `rm` or rename it using `mv`.
1. Reboot

And with those steps you will be able to revert the broken `sudo_local` file and
make updates to it to fix it.

</details>

If you want to install it somewhere differently, you'll need to use the full
path to the `pam_reattach.so` file. **This is especially true on *M1 Macs*
because *Homebrew* uses `/opt/homebrew/` on those systems**. I also added
`ignore_ssh` to avoid prompting for a touch when connected via SSH.

<details>

<summary> <strong>Click here to see what <code>/etc/pam.d/sudo_local</code>
should look like in the end.</strong> </summary>

### Example contents of a `/etc/pam.d/sudo_local` file

Keep in mind that the example here is if `pam_reattach.so` is located in
`/usr/lib/` or `/usr/local/lib/`. If `pam_reattach.so` is another location,
you'll have a full path for `pam_reattach.so`.

```ini{title="/etc/pam.d/sudo_local"}
# sudo_local: local config file which survives system update and is included for sudo
auth       optional       pam_reattach.so ignore_ssh
auth       sufficient     pam_tid.so
```

Like I mentioned earlier, if you're installing `pam_reattach.so` in a different
location, you'll need to use the full path and it might look like this.

```ini{title="/etc/pam.d/sudo_local"}
# sudo_local: local config file which survives system update and is included for sudo
auth       optional       /opt/homebre/lib/pam/pam_reattach.so ignore_ssh
auth       sufficient     pam_tid.so
```

</details>

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

[➡️ Read more about *Nix* functions in the language tutorial](https://nix.dev/tutorials/nix-language#functions)

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

Here's the body of the function with everything after the colon `:`. This part
here uses two parts of the language that help with passing attributes and
accessing them in the body of the function. 

There's a `with` expression where `lib` is defined as a convenience to avoid
having to type `lib.` before `mkEnableOption` and similar functions. The other
one is a `let in` expression where `cfg` is defined as a convenience variable to
not have to type out `config.security.pam`.

```nix
with lib; let
  cfg = config.security.pam;
in
{
```

The `with ...; ...` expression lets you access attributes without having to
reference them. It's used here to include `lib` in scope so that you don't have
to write out `lib.mkEnableOption`

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
