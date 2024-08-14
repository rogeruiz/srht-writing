{ pkgs ? import <nixpkgs> { } }:

with pkgs;

mkShell {
  name = "write.rog.gr";

  buildInputs = [
    hugo
    nodejs_20
    vale
    prettierd
  ];
  shellHook = /* bash */ ''
    export PATH="$PWD/node_modules/.bin/:$PATH"
  '';

}
