+++
title = "Using launchd to keep up appearances"
date = "2024-01-19"
description = """I've covered how to automate appearances in **macOS** before
using the **Defaults** CLI to check for values in the user defaults system.
While this works well, I'll show you how you can use `launchd` to automate
things while using **Nix Darwin** to manage the functionality without having to
write any **XML**."""
slug = "using-launchd-to-keep-up-appearances"
tags = ["automation", "devex", "mac", "nix", "programming"]
+++

Back in 2022, I wrote about using `AppleInterfaceStyle` to control terminal
user-interface applications inspired by the Unix philosophy. [In that post][op],
I leveraged a simple shell script calling the `defaults` CLI to get the user
defaults of the running system. This required querying for a specific property
called `AppleInterfaceStyle`. If the property was set, it is set to a value of
`Dark`. But if the property wasn't set, then it would exit with a non-zero
status with an error message saying that the property doesn't exist.

[op]: {{< relref "writing/appleinterfacestyle-&-tui" >}}

```bash { title = "Checking for AppleInterfaceStyle" verbatim = false hl_lines = [ "3-5" ] }
defaults read -g AppleInterfaceStyle

# if Dark mode is set in the "System Settings.app", you'll see `Dark` in the
# output. Otherwise, if it set to Light mode, you'll get an error about how the
# property doesn't exist.
```

Here's the way you can leverage this in a shell script where it's only checking
if the command ran successfully or not. This is enough since

```bash{title="A bash If-Statement to check mode" verbatim=false hl_lines = [1]}
if defaults read -g AppleInterfaceStyle &>/dev/null
then
  echo "Dark mode is on."
else
  echo "Light mode is on."
fi
```

While this code above is useful, it still need to be kicked off by some process.
In my old post, I manually triggered my custom script myself. After publishing
it, I did work towards automating the running of the script by tying it into my
*Sketchybar* configuration via a custom plugin that I wrote to [run based on an
event that *Sketchybar* uses to track the changes to the system
theme][docs-sketchyevents]. While this worked for me for a while, I didn't
really like that I had a dependency for changing my themes across applications
tied to *Sketchybar*. While I don't see myself not using it, I wanted something
that was more agnostic to what applications I run.

[docs-sketchyevents]: https://github.com/FelixKratz/SketchyBar/discussions/151

## Leveraging `launchd` on *macOS*

This is where I started researching `launchd` since I'm running on *macOS*. It's
an `init` & OS service management daemon by Apple to replace the BSD-style
`init` & `SystemStarter`.

While I won't go into too much detail about what an `init` system is on a
Unix-based OS, you can think of `init` as the first process that is run during
the booting OS. It's a daemon that runs until the system is shut down. This
process is started by the kernel & given a process ID (*PID*) of 1. If you're
familiar with `systemd`, you already know what `launchd` is achieving on *macOS*
systems.

So after reading [the HOWTO documentation on `launchd`][docs-launchd], I
realized that I'd have to write some *XML*. Which I wouldn't mind, but I do
not want to maintain yet another file. Also, I'd have to install it manually
since I've been using *Nix*. I use it to automate the configuration of my
*macOS* & software packages I install with *Nix Darwin*, my home directory with
*Home Manager*.

[docs-launchd]: https://opensource.apple.com/source/launchd/launchd-257/launchd/doc/HOWTO.html

## Researching how to do this with *Nix Darwin*

Taking a look at [the *Nix Darwin* manual for the `launchd.user.agents`
property][docs-nixdarwin-launchd-useragents] explains how you can define a
per-user `launchd` agent. This is exactly what I need! So let's break down the
*Nix* code needed to create your own `launchd` user agents.

[docs-nixdarwin-launchd-useragents]: https://daiderd.com/nix-darwin/manual/index.html#opt-launchd.user.agents

By using *Nix Darwin*, you won't have to write any *XML* to create these
`launchd` user agents. For my use case, I named my service `nighthook` but you
can name it whatever you'd like.

It turns out that with that `launchd` user agent services can watch certain
paths for changes & then execute a program. This is exactly what is needed to
switch between light & dark appearances. All while not having to rely on
anything besides *macOS* functionality.

### Building out the *Nix* expression for the agent

Okay, now for the fun part. I'll be breaking down everything into little *Nix*
expression snippets. Don't worry though, I'll include a section at the end that
shows what the whole file looks like here & a link to my configuration file I'm
currently using.

So this is going to be a *Nix* module that you need to include in your *Nix
Darwin* inputs for the `lib.darwinSystem` function as a module. Here's a
skeleton for that file.

```nix { title = "nighthook.nix" hl_lines = [7, 10] }
{
  config,
  lib,
  pkgs,
  ...
}: with lib; let
  homeDir = "/Users/yo";
in
{
  # ... contents of the Nix function
}
```

Take a look at highlighted code above. The `homeDir` expression needs to be
replaced with the absolute path of your home directory. On my system, I use
`yo` but you need to replace with whatever your username is.

<details>

<summary>Don't know how to get your username?</summary>

That's okay. You can run the CLI tool `whoami` in your terminal. You can also
get the entire value of the expression by running `echo $HOME`. If you use the
second method, you can copy the output of the echo command using `pbcopy` so
all you'll need to is paste the value within the double-quotes for the
`homeDir` expression.

```sh { title = "Copying the path" verbatim = false }
echo $HOME | pbcopy # now the path for your home directory is in your clipboard.
```

</details>

We'll be using the `homeDir` expression in a couple of places within our
function body. We'll need to setup a `PATH` environment variable for the service
to use. We'll need to set this `PATH` variable since services will run outside
of our login shell. Also, since we're using *Nix*, we'll need to ensure that we
leverage the `systemPath` provided by *Nix Darwin*.

### Using the `serviceConfig` stanza

Here's the main stanza that we'll be building out incrementally in the next
couple of sections. Let's start by building out the function body that was
referenced above

```nix { title = "nighthook.nix" hl_lines = [4] }
# .. more content above
  launchd.user.agent.nighthook = {
    serviceConfig = {
      # ... configuration for the service
    };
  };
# .. more content below
```

The code above & below the highlighted area is how we bootstrap the
`serviceConfig` stanza. Read the documentation on your own to see a full list of
properties available on `serviceConfig`. We'll only be adding four properties to
be able to label the service, tell the service what paths to watch, the
environment variables we want to use, & the program arguments we want to run
whenever changes are made to the file we're watching.

#### Setting a label for the agent

Setting up a label for your service is required for every job definition. This
name has to be unique & is used to identify the job. By convention, these job
names are written in [reverse domain notation (*reverse-DNS*)][wiki-rdn]. **It's
a good & simple way to eliminate namespace collisions** when naming a service.
Don't worry about reinventing things here & stick to using *reverse-DNS*.

[wiki-rdn]: https://en.wikipedia.org/wiki/Reverse_domain_name_notation

```nix { title = "nighthook.nix" }
# .. more content above
    Label = "gr.rog.nighthook";
# .. more content below
```

I used the label `gr.rog.nighthook` which is a *reverse-DNS* based on the name
of the service being `nighthook` & my domain being `rog.gr`. For your service,
make sure you set the label expression to something that makes sense for you &
domains that you use.

[Read about the `Label` field in the *Nix Darwin*
documentation][docs-nixdarwin-label].

[docs-nixdarwin-label]: https://daiderd.com/nix-darwin/manual/index.html#opt-launchd.agents._name_.serviceConfig.Label

#### Setting the paths to watch for the agent

Next up, let's set up the paths that we want the service to watch for changes.
For the appearances setting, this gets set in a file in your user `Library`
directory. **This directory is hidden by default** in *macOS* since version 10.7
(*Lion*). The file in the `Library` directory that we want to watch is located
inside of `Preferences/.GlobalPreferences.plist`. So to get this working, setup
a `WatchPaths` expression with a list of paths to watch. In this case, the list
only contains one path.

```nix { title = "nighthook.nix" }
# .. more content above
    WatchPaths = [ "${homeDir}/Library/Preferences/.GlobalPreferences.plist" ];
# .. more content below
```

Here you can see that we're using the expression `homeDir` to complete the path
to the global preferences property list (*PLIST*) *XML* file which is what this
service will watch for changes. This is the file that is being modified when the
appearance setting is modified on *macOS*.

[Read about the `WatchPaths` field in the *Nix Darwin*
documentation][docs-nixdarwin-watchpaths].

[docs-nixdarwin-watchpaths]: https://daiderd.com/nix-darwin/manual/index.html#opt-launchd.agents._name_.serviceConfig.WatchPaths

#### Setting environment variables for the agent

Next up, let's set the environment variables that are available to the program
that the service will run. We only need to set a `PATH` for this, but you can
set any number of environment variables here to configure the program.

```nix { title = "nighthook.nix" hl_lines = [3] }
# .. more content above
    EnvironmentVariables = {
      PATH = (replaceStrings [ "$HOME" ] [ homeDir ] config.environment.systemPath );
    };
# .. more content below
```

Take a look at the highlighted line above. Here's where we are setting the
`PATH` variable to what is available in our `config.environment.systemPath`
provided by *Nix Darwin*. This string includes other environment variables such
as `$HOME`. Notice though that we're not setting a `HOME` variable above. This
means that we'll need to leverage *Nix*'s builtin function `replaceStrings` to
change the string `$HOME` to what we defined in the `homeDir` expression.

[Read about the `EnvironmentVariables` field in the *Nix Darwin*
documentation][docs-nixdarwin-envvars].

[docs-nixdarwin-envvars]: https://daiderd.com/nix-darwin/manual/index.html#opt-launchd.agents._name_.serviceConfig.EnvironmentVariables

#### Setting the script to run as `ProgramArguments`

Now finally for **the fun part**. I'll leave the contents of the shell script as an
exercise for the reader. The `ProgramArguments` section is where we will write
our *Bash* shell script that will run as a part of this service.

```nix { title = "nighthook.nix" hl_lines = [3,15] }
# .. more content above
    ProgramArguments = [
      ''${pkgs.writeShellScript "nighthook-action" ''
          # write all the Bash you need to modify your configuration files between
          # light & dark modes. Below I'm including the starting point where the
          # `MODE` variable gets set to either `dark` or `light` depending on
          # the value of `AppleInterfaceStyle`.
          if defaults read -g AppleInterfaceStyle &>/dev/null; then
            MODE="dark"
          else
            MODE="light"
          fi

          # ... do something with `MODE` to modify configuration files here.
      ''}''
    ];
# .. more content below
```

Now this section is a bit complicated but essentially we're adding a single item
to the list for `ProgramArguments` using the two single-quotes (`''`) to create
multi-line strings in *Nix*. The contents of this single item is then calling a
function called `pkgs.writeShellScript` with string of the name of the script
& then the contents of the shell script. Notice here that the contents of the
script is also wrapped in two single-quotes (`''`) as well. That's why the
second highlight has two single-quotes followed by the closing curly brace (`}`)
followed by two more single-quotes to close the original multi-line string.

If this explanation doesn't make sense, just make sure you copy the code from
above between the square brackets (`[]`) to start writing your own script.

The best reason to use this is that *Nix* will create a derivation called
`nighthook-action` in the *Nix* store while also provided the proper shebang
(`#!`) path for running the script.

[Read about the `ProgramArguments` field in the *Nix Darwin*
documentation][docs-nixdarwin-progargs].

[docs-nixdarwin-progargs]: https://daiderd.com/nix-darwin/manual/index.html#opt-launchd.agents._name_.serviceConfig.ProgramArguments

<details>

  <summary>Here's the whole contents of <code>nighthook.nix</code> as
    promised.</summary>

If you'd like to take a look at my personal `nighthook.nix` module, you can see
it in [my `~/.files.nix` repository on sourcehut][srht-filesnix]. This has a
completed *Bash* script for modifying several configuration files for CLI tools
using either `cat` or `sed` to modify files that are hot-reloaded by the tools.

[srht-filesnix]: https://git.sr.ht/~rogeruiz/.files.nix/tree/main/item/module/launchd/nighthook.nix

```nix { title = "complete-nighthook.nix" }
{
  config,
  lib,
  pkgs,
  ...
}: with lib; let
  homeDir = "/Users/yo";
in
{
  launchd.user.agent.nighthook = {
    serviceConfig = {
      Label = "gr.rog.nighthook";
      WatchPaths = [ "${homeDir}/Library/Preferences/.GlobalPreferences.plist" ];
      EnvironmentVariables = {
        PATH = (replaceStrings [ "$HOME" ] [ homeDir ] config.environment.systemPath );
      };
      ProgramArguments = [
        ''${pkgs.writeShellScript "nighthook-action" ''
            # write all the Bash you need to modify your configuration files between
            # light & dark modes. Below I'm including the starting point where the
            # `MODE` variable gets set to either `dark` or `light` depending on
            # the value of `AppleInterfaceStyle`.
            if defaults read -g AppleInterfaceStyle &>/dev/null; then
              MODE="dark"
            else
              MODE="light"
            fi

            # ... do something with `MODE` to modify configuration files here.
        ''}''
      ];
    };
  };
}

```

</details>

### Verifying the work using `launchctl`

At this point, you'll need to build your *Nix Darwin* configuration in order to
install the service under `~/Library/LaunchAgents`. Once you've done that, you
should be able to view the contents of the file & see that *Nix Darwin*
automatically generated the necessary *XML* file to setup the service in
`launchd`. Here's the generated *XML* file that my personal `nighthook.nix`
creates.

```xml { title = "gr.rog.nighthook.plist" }
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>EnvironmentVariables</key>
	<dict>
		<key>PATH</key>
		<string>/Users/yo/.nix-profile/bin:/etc/profiles/per-user/$USER/bin:/run/current-system/sw/bin:/nix/var/nix/profiles/default/bin:/usr/local/bin:/usr/bin:/usr/sbin:/bin:/sbin</string>
	</dict>
	<key>Label</key>
	<string>gr.rog.nighthook</string>
	<key>ProgramArguments</key>
	<array>
		<string>/nix/store/0z8arq6c561x0lmlf2cp1wn2h0isasp1-nighthook-action</string>
	</array>
	<key>WatchPaths</key>
	<array>
		<string>/Users/yo/Library/Preferences/.GlobalPreferences.plist</string>
	</array>
</dict>
</plist>
```

You can run `cat` on the `.plist` file found in your `~/Library/LaunchAgents`
directory to see the generate *XML* that *Nix Darwin* generated on your system.

## Conclusion

Thanks for reading this far. Using `launchd` to manage services is pretty
straight-forward. And it's great that I can use *Nix Darwin* to manage things
like this rather than manually copying files myself & writing the configuration
myself in *XML*. To learn more about `launchd` you can also check out [the
`launchd` info site][docs-launchdinfo] to see even more examples of how to
configure services.

[docs-launchdinfo]: https://launchd.info
