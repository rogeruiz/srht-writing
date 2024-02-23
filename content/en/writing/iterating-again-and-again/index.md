+++
date = "2021-04-27"
title = "Iterating again and again"
description = """Let's iterate across files using ls and grep to copy or move
files from a parent directory into a bunch of sibling directories related to the
file. We can do this in an automated way using the commands mentioned above."""
slug = "iterating-again-and-again"
tags = ["automation", "linux"]
+++

I sometimes find myself having to iterate across a bunch of directories.
Usually, I have something to do in those directories like running an arbitrary
command. There's a lot of different ways to do things, but for the sake of this
example, we'll use `ls` to get the output of directories and iterate on them.

In this example, I have a file I need to copy across multiple directories. It's
a configuration file named `config.yml` that is adjacent to the directories I
want to place it in.

```bash {hl_lines=[9] title="Tree output of some folder" verbatim = false}

/some/folder
├── folder1
│  ├── some-other-file.txt
│  └── config.yml
├── folder2
│  ├── some-other-file.txt
│  └── config.yml
├── config.yml # <= I want to copy this file into the other directories.
├── carpeta1
│  ├── algun-otro-archivo.txt
│  └── config.yml
├── carpeta2
│  ├── algun-otro-archivo.txt
│  └── config.yml
```

You could open a GUI window and copy / paste the file across. But instead of
doing things manually, let's have the computer do it for us. I'm going to break
down my thought process of how I compose the loop to achieve this.

### Let's see what's inside the target directory

```bash {title = "Listing out some folder" verbatim = false}

ls -p /some/folder
```

```text {title = "Outputs of the previous command" verbatim = false}

config.yml         carpeta1/          carpeta2/
folder1/           folder2/
```

With the `-p` flag on `ls`, we add a slash to any directories found. From the
output above, you can see that we are including the `config.yml` file as well.
We want to make sure we only include the directories and not the files we find.
So let's try this again.

### Let's use grep

```bash {title = "Searching through the listing" verbatim = false}

ls -p /some/folder | grep -E '.+\/'
```

```text {title = "Output of the previous command" verbatim = false}

carpeta1/          carpeta2/
folder1/           folder2/
```

Using `grep` and a regular expression to match at least one character `.+`
followed by a literal `/`. This gives us just the directories which we use `ls
-p` to give a slash at the end.

### Let's loop and copy

```bash {title = "A for-loop for copying files around" verbatim = false}

for dir in $(ls -p /some/folder | grep -E '.+\/')
do
  cp -v /some/folder/config.yml "/some/folder/${dir}"
done
```

```text {title = "Output of the previous command due to -v" verbatim = false}

/some/folder/config.yml -> /some/folder/folder1/config.yml
/some/folder/config.yml -> /some/folder/folder2/config.yml
/some/folder/config.yml -> /some/folder/carpeta1/config.yml
/some/folder/config.yml -> /some/folder/carpeta2/config.yml
```

Now that we have a list of directories, we can use a `for-loop` in Bash to
iterate over all the directories. Once in the loop, we can run any arbitrary
commands for the number of directories that exist. We also capture the current
directory being iterated on in the `${dir}` variable. Also, note that the
`${dir}` variable contains a trailing `/` character, so we omit the `config.yml`
from the destination in the `cp` command.
