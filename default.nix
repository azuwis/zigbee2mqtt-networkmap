{ }:

let
  sources = import ./sources.nix { };
  pkgs = import sources.nixpkgs { };
  zigbee2mqtt-networkmap = pkgs.callPackage (
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
            ./default.nix
            ./sources.lock
            ./sources.nix
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
in

zigbee2mqtt-networkmap
// {
  inherit zigbee2mqtt-networkmap;
  # nix run -f . update
  update = pkgs.writeShellScriptBin "update" ''
    ${pkgs.nix-update}/bin/nix-update zigbee2mqtt-networkmap --version=skip
  '';
}
