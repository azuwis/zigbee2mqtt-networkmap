{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";

  outputs =
    inputs@{ self, ... }:
    let
      systems = [
        "aarch64-darwin"
        "aarch64-linux"
        "x86_64-darwin"
        "x86_64-linux"
      ];
      eachSystem =
        f:
        inputs.nixpkgs.lib.genAttrs systems (
          system:
          f rec {
            inherit system;
            pkgs = inputs.nixpkgs.legacyPackages.${system};
          }
        );
    in
    {
      packages = eachSystem (
        { pkgs, ... }:
        {
          default = pkgs.callPackage (
            {
              lib,
              stdenv,
              fetchYarnDeps,
              yarnConfigHook,
              yarnBuildHook,
              nodejs,
            }:

            stdenv.mkDerivation (finalAttrs: {
              pname = "zigbee2mqtt-networkmap";
              version = "0";

              src =
                with lib.fileset;
                toSource {
                  root = ./.;
                  fileset = difference ./. (unions [
                    (maybeMissing ./node_modules)
                    (maybeMissing ./result)
                    ./flake.lock
                    ./flake.nix
                  ]);
                };

              offlineCache = fetchYarnDeps {
                inherit (finalAttrs) src;
                hash = "sha256-Oa63hwVnWNuU53xpV/+yagMnbChAZpstNwl3rggAONc=";
              };

              nativeBuildInputs = [
                yarnConfigHook
                yarnBuildHook
                nodejs
              ];

              installPhase = ''
                runHook preInstall

                mkdir $out
                cp -v dist/* $out/

                runHook postInstall
              '';

              dontFixup = true;

              shellHook = ''
                # Run yarnConfigHook in subshell, so $HOME will retain
                test -e node_modules || (yarnConfigHook)
              '';
            })
          ) { };
        }
      );

      apps = eachSystem (
        { pkgs, ... }:
        {
          update = {
            type = "app";
            program = builtins.toString (
              pkgs.writers.writeBash "update" ''
                ${pkgs.nix-update}/bin/nix-update -F default --version=skip --override-filename flake.nix
              ''
            );
          };
        }
      );
    };
}
