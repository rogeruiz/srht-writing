{ pkgs ? import <nixpkgs> { } }:

with pkgs;

mkShell {
  name = "write.rog.gr";

  buildInputs = [
    hugo
    nodejs_20
    vale
  ];
  shellHook = /* bash */ ''
    mkdir -p .nix-node
    export NODE_PATH=$PWD/.nix-node
    export NPM_CONFIG_PREFIX=$PWD/.nix-node
    export PATH=$NODE_PATH/bin:$PATH
  '';

}
