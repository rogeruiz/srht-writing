+++
title = "{{ replace .File.ContentBaseName `-` ` ` | title }}."
description = """<description_of_page>"""
url = "{{ .File.ContentBaseName }}"
[menu.main]
name = "<navigation_name>"
weight = <number>
+++
