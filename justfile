# ==========================================================
#    _____               __     _____          _______ __
#  _|     |.--.--.-----.|  |_  |     \.-----. |_     _|  |_
# |       ||  |  |__ --||   _| |  --  |  _  |  _|   |_|   _|
# |_______||_____|_____||____| |_____/|_____| |_______|____|
# ==========================================================

[private]
@default:
    just -l

[doc('Build the Hugo site into `./public/`')]
build:
    npm run build

[doc('Start the Hugo site for local development')]
start:
    npm start

new title type="writing" lang="en":
    #!/usr/bin/env bash
    set -euxo pipefail
    t="{{ type }}"
    l="{{ lang }}"
    s="{{ kebabcase(title) }}"
    case $t in
        "writing")
            p="./content/${l}/${t}/${s}/index.md"
            ;;
        "tags")
            p="./content/${l}/${t}/${s}/_index.md"
            ;;
        *)
            p="./content/${l}/${t}/${s}.md"
            ;;
    esac

    if [[ $t == "writing" ]]
    then
        i="./content/${l}/${t}/${s}/images"
        mkdir -p "${i}"
        touch "${i}/.gitkeep"
    fi

    hugo new content -k {{ type }} "${p}"
