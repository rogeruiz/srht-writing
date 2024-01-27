+++
title = "Using TouchID with Tmux"
date = "2024-01-23"
description = """As I transition my dotfiles configurations over to **Nix** away
from **Homebrew** & **Chezmoi**, I found myself elevating my priviledges a lot
more than usual. Having to type my password so much lead me to question my life
choices and how I can improve things for myself. In my research, I learned about
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
> [➡️ *GitHub* PAM Reattach repository][pam_reattach]

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

```ini{title="All you need to enable *TouchID*" verbatim=false}
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
either `/usr/lib` or `/usr/local/lib`, you can then can add the
following line to enable *TouchID* in *Tmux* sessions.

[reattach-to-user-namespace]: https://github.com/ChrisJohnsen/tmux-MacOSX-pasteboard

```ini{title="/etc/pam.d/sudo_local"}
# sudo_local: local config file which survives system update and is included for sudo
auth       optional       pam_reattach.so
auth       sufficient     pam_tid.so
```

⚠️ It's important to remember to have the file linked in one of the two appropriate
directories mentioned above ⚠️. Making a mistake with these files will cause you
to have to reboot your *Mac* in *Recovery Mode* in order to edit the file again
to either remove or fix the path issues when running *Sudo*.

<details>

<summary>🆘 <strong> Click here to learn to how to recover from a broken
<code>sudo_local</code> file</strong> </summary>

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

[➡️ For more information from *Apple* support, click
here](https://support.apple.com/guide/mac-help/intro-to-macos-recovery-mchl46d531d6/mac)

And with those steps you will be able to revert the broken `sudo_local` file and
make updates to it to fix it.

</details>

If you want to install it somewhere differently, you'll need to use the full
path to the `pam_reattach.so` file. **This is especially true on *M1 Macs*
because *Homebrew* uses `/opt/homebrew/` on those systems**. I also added
`ignore_ssh` to avoid prompting for a touch when connected via SSH.

```ini{title="/etc/pam.d/sudo_local"}
# sudo_local: local config file which survives system update and is included for sudo
auth       optional       pam_reattach.so ignore_ssh
auth       sufficient     pam_tid.so
```

And with that, you're all done 🎊! If you're interested in seeing how this is done
using *Nix*, keep reading. Thanks for reading this far & I hope this helped you
get *TouchID* working in your terminal and *Tmux* sessions.

## Leveraging *Nix* with *Nix Darwin*

So if you're still with me, let's use *Nix* to manage the changes that need to
be made to this file. This is convenient as you can use this to setup your
*macOS* system easily and consistently with the necessary *TouchID* settings to
get it working for *Sudo* commands. The *Nix* community is great and they have
folks working on solutions to this right now. I was able to find a couple of
patch changes on *GitHub* that I integrated into my personal configuration file.
It's something more for me to maintain, but it means that it works today without
having to wait for upstream to merge things in.

### Enabling *TouchID* first

Since 2022, you've been able to use *Nix Darwin* with the `security = { pam = {
enableSudoTouchIdAuth } }` option in *Nix*. So to enable *TouchID* for your
*Mac* may be as simple to as adding the following option to your *Nix*
configuration.

```nix{title="A *Nix* expression" verbatim=false}
{ ... }:
{
  security.pam.enableSudoTouchIdAuth = true;
}
```

With this, you just need to run `darwin-rebuild switch` to add a line to the
`/etc/pam.d/sudo` file with a comment from `nix-darwin` with the option
`enableSudoTouchIdAuth` added as well.

```ini{title="/etc/pam.d/sudo"}
# sudo: auth account password session
auth       sufficient     pam_tid.so # nix-darwin enableSudoTouchIdAuth
auth       include        sudo_local 
auth       sufficient     pam_smartcard.so
auth       required       pam_opendirectory.so
account    required       pam_permit.so
password   required       pam_deny.so
session    required       pam_permit.so
```

This is done with using the `sed` command. You can check out the *Nix* file if
you're curious how the changes are being handled.

[➡️ Source in *Nix Darwin* using `sed` to modify `/etc/pam.d/sudo` in
place][gh-pam.nix-using-sed]

[gh-pam.nix-using-sed]: https://github.com/LnL7/nix-darwin/blob/1e706ef323de76236eb183d7784f3bd57255ec0b/modules/security/pam.nix#L18-L37

Again this is where you can stop reading if you don't care about supporting
*Tmux*. Using *Nix* to add the `pam_tid.so` line from above is great too because
you don't have to worry about making any errors and are able to turn it on or
off easily if you need to without having to override or incorporate upstream
changes locally. I hope this helps explain what the `enableSudoTouchIdAuth`
option is doing in *Nix Darwin*.

### Creating a `/etc/pam.d/sudo_local` file using *Nix Darwin*

As I said before, the pull request **#787** should cover this all so you can use
`security.pam.<option>` to set the needed values to use `pam_tid.so` and
`pam_reattach.so` in some file that's getting managed by *Nix* but included from
the *macOS* `/etc/pam.d/sudo` file that *Apple* manages. If you've made it this
far, you're probably looking to implement some of the ideas behind the pull
requests yourself. At least that's where I am at. Until **#787** gets merged, or
even **#662** if upstream wants to just use `system.patches`, you can easily
implement a simple solution yourself using *Nix Darwin*.

To get this working you'll need to use the `text` property of `environment.etc`
and give the property the file name you'd like it to land in. As you can see
below it requires quoting because of the forward slash (`/`) in the path. The
simplicity of adding files to your system and having it managed in a single
place is so great even if you're only configuring one system.

[➡️ Source in *Nix Darwin* for how files get created in `/etc`][gh-system-etc]

[gh-system-etc]: https://github.com/LnL7/nix-darwin/blob/1e706ef323de76236eb183d7784f3bd57255ec0b/modules/system/etc.nix

```nix{title="A Nix expression in your config" verbatim=false}
{ pkgs, ... }:

{
  environment = {
    etc."pam.d/sudo_local".text = ''
      # Managed by Nix Darwin
      auth       optional       ${pkgs.pam-reattach}/lib/pam/pam_reattach.so ignore_ssh
      auth       sufficient     pam_tid.so
    '';
}
```

```ini{title="/etc/pam.d/sudo_local"}
# Managed by Nix Darwin
auth       optional       /nix/store/d9as2x461lhwryx7bb33q825qssn3dr0-pam_reattach-1.3/lib/pam/pam_reattach.so ignore_ssh
auth       sufficient     pam_tid.so
```

And that's it! 🎉 🎊

With this, you'll have *TouchID* support in your *Tmux* sessions and your
terminal emulator all while having the file managed by *Nix* on your *Mac*.
