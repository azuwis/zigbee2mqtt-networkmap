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
        hash = "sha256-4IcHO8P5r6hktgjqQutS0ynAVriDaDSdkXoNSH9tN9g=";
      };

      postPatch = ''
        echo 'ignore-scripts true' >> .yarnrc
      '';

      nativeBuildInputs = [
        yarnConfigHook
        yarnBuildHook
        nodejs
      ];

      installPhase = ''
        runHook preInstall

        mkdir $out
        cp -rv dist/* $out/

        runHook postInstall
      '';

      dontFixup = true;

      shellHook = ''
        # Run yarnConfigHook in subshell, so $HOME will retain
        test -e node_modules || (yarnConfigHook)
      '';

      passthru.yarnlock = finalAttrs.finalPackage.overrideAttrs (old: {
        # Avoid nix-update trying to update zigbee2mqtt-networkmap.yarnlock.offlineCache
        offlineCache = null;

        nativeBuildInputs = [
          pkgs.cacert
          pkgs.nodejs
          pkgs.writableTmpDirAsHomeHook
          pkgs.yarn
        ];

        buildPhase = ''
          runHook preBuild

          yarn upgrade --latest

          runHook postBuild
        '';

        installPhase = ''
          runHook preInstall

          mkdir $out
          cp package.json yarn.lock $out/

          runHook postInstall
        '';

        outputHash = "sha256-d8pACPwyjMnHUHMHWCVFKzssQOvRxHW7lG6qyjrK5/k=";
        outputHashAlgo = "sha256";
        outputHashMode = "recursive";
      });
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
  # nix run -f . yarnlock
  yarnlock = pkgs.writeShellScriptBin "yarnlock" ''
    ${pkgs.nix-update}/bin/nix-update zigbee2mqtt-networkmap.yarnlock --version=skip
    cp "$(nix-build --no-out-link --attr zigbee2mqtt-networkmap.yarnlock)"/* .
  '';
}
