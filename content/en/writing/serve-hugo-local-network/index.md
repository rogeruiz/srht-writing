+++
date = "2023-03-04"
title = "Serve Hugo sites on your local network"
description = """When doing local web development, it's useful to have multiple
devices to view your site. This is especially true with mobile-first design &
starting a **Hugo** project from scratch. This neat feature will help you do
this reliably across development environments."""
slug = "serve-hugo-local-network"
+++

> `tl;dr`
>
> Working with **Hugo** projects locally is great and can be made better because
> it supports using your local network to serve its local content across your
> computer network. This is especially useful when you're on your home network
> and would like to see the **Hugo** site rendered in a different device besides
> where the server is running.
>
> With one simple command you can do this like this:
>
> `hugo serve --bind $(ipconfig getifaddr en0) --baseURL http://$(ipconfig
getifaddr en0)/`

When you're using *Hugo* to serve your site locally, you can bind and add a base
URL flag to the serve function which will allow you to view your site while
developing locally on devices that are on the same network. I use this regularly
to develop and view the content on my desktop and my phone at the same time.
This allows me to really get things right at a variety of screen sizes using the
actual browser that renders things.

This is one of the many reasons I like developing static sites with *Hugo*. It's
ease of use, speed, and features make it a really well-rounded static site
generator.

## The command(s) you need

So the easiest way to learn how to do this is to take a look at the local output
of `hugo help serve`. When you run this, you'll see that there are two flags you
can add to `hugo serve` to help.

```sh {title = "Looking through Hugo's help" verbatim = false}
hugo help serve | rg -e '--(baseURL|bind)'
```

```sh {title = "Output from the previous command" verbatim = false }
# output
  -b, --baseURL string         hostname (and path) to the root, e.g. https://spf13.com/
      --bind string            interface to which the server will bind (default "127.0.0.1")
```

With these two flags, you can now construct a command that will let you view
your *Hugo* site on your computer and another device on your network such as
your phone or tablet.

```sh {title = "Serving Hugo with your local IP" verbatim = false}
hugo serve \
    --bind $(ipconfig getifaddr en0) \
    --baseURL "http://$(ipconfig getifaddr en0)/"
```

These two commands together are important. While the `--bind` flag updates the
interface where the serve will bind to, the `--baseURL` flag fixes any issues
you might have locally when developing your *Hugo* site and using absolute URLs
where you don't add the domain site.

I do this regularly so I don't have to hard-code or worry what domain a site is
being deployed on. In other words, my paths look like this: `/img/png/jpeg.gif`.
This is instead of hard-coding the base URL like:
`http://example.com/img/png/jpeg.gif` or using *Hugo's* site variables like `{{
.Site.BaseURL }}/img/png/jpeg.gif`. The second example is something that doesn't
play well with *Markdown* content out-of-the-box.

Because of this, it's important to use `--bind` and `--baseURL` locally and use
`ipconfig getifaddr en0` to get your local IP address.

## Another command to get your IP address

If you're on a *Mac*, you have a command-line tool by *Apple* which can also
help you get your IP address. It's much slower than using `ipconfig` so I didn't
mention it at first. But if you're curious, you can use `system_profiler` and
`jq` to get similar information, _and so much more_, by querying your running
system.

```sh {title = "Using system_profiler to get the network address" verbatim = false}
system_profiler \
    SPNetworkDataType \
    -json \
    | jq -r '.SPNetworkDataType[] | select(._name == "Wi-Fi") | .IPv4.Addresses[]'
```

As I mentioned though, it's much slower than `ipconfig` relatively. I wouldn't
recommend using `system_profiler` over `ipconfig`. But it's always best to know
how to do something in multiple ways. Especially if you're familiar with `jq`
and need to extract more information in from the network information without
relying on matching regular expressions.
