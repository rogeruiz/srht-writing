+++
draft = true
title = "Redirect OAUTH2 and SameSite=Strict"
date = "2023-11-15"
description = """A post about working with cookies that have SameSite=Strict on and you have
multiple subdomains while working with OAUTH2."""
slug = "redirect-oauth2-and-samesitestrict"
tags = ["security"]
+++

> https://stackoverflow.com/questions/42216700/how-can-i-redirect-after-oauth2-with-samesite-strict-and-still-get-my-cookies

usr1
  17:37
fwiw, our cookie was scoped to the domain example.com so that both my.example.com and cms.example.com would be able to read it. But when the SAML server posted back to the former and we tried to redirect to the latter the browser would not forward the cookie on the redirect.


usr2
  17:38
Ah interesting. I wouldn’t thing that it would work even if there was only one domain including the subdomain. Or is it because there’s two URLs?


usr1
  17:40
I think it's because there are 2 urls. At least that's what I understood. Redirecting to any page under the first domain worked everytime


usr2
  17:40
Ah thanks
17:40
That makes more sense then that it needs the redirect to be in the URL history stack.
17:41
So the page you redirected to moved between subdomains?


usr1
  17:43
So if you go to the cms first, it will see you are not logged in and redirect you to my.example.com/login where you can trigger the saml flow. Once you log in the saml server sends you back to my.example.com with the RelayState set to the page you were trying to go to in the first place, in this case cms. So we see that after they are signed in and redirect to cms.example.com/. Cookie isn't forwarded. If the RelayState is /internalpage it works fine as the redirect is my.example.com/internalpage.
17:44
so we redirect them to a temporary page that is internal and then redirects them.


usr2
  17:44
Thanks for that. So the redirection happens on the return trip.


usr1
  18:07
yes, after they have successfully completed the SAML flow. Advantage to working on open source project https://github.com/USSF-ORBIT/ussf-portal-client/pull/1144  & the fix for the redirect https://github.com/USSF-ORBIT/ussf-portal-client/pull/1152
