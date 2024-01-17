let
  nixpkgs = builtins.fetchTarball {
    name = "nixpkgs-unstable-2024-01-16";
    url = "https://github.com/NixOS/nixpkgs/archive/07252f64aaa871cbd5292839ccdd5149672f97ca.tar.gz";
    sha256 = "0l858rc4kmvn5jvqvcpprgzyqbcc82b06792m79dfzjyqasmk134";
  };
in

{ pkgs ? import nixpkgs {} }:

with pkgs;

let
in

mkShell {
  name = "write.rog.gr";

  buildInputs = [
    hugo
    nodejs_20
  ];
  shellHook = /* bash */ ''
    mkdir -p .nix-node
    export NODE_PATH=$PWD/.nix-node
    export NPM_CONFIG_PREFIX=$PWD/.nix-node
    export PATH=$NODE_PATH/bin:$PATH
  '';

}
