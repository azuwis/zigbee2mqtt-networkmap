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
        hash = "sha256-KeIhOIAl+t6j8Pzc8zaAsrpmioGTWwdGAoDORlurXaI=";
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
        nativeBuildInputs = [
          pkgs.cacert
          pkgs.nodejs
          pkgs.writableTmpDirAsHomeHook
          pkgs.yarn
        ];

        buildPhase = ''
          runHook preBuild

          yarn install
          yarn upgrade

          runHook postBuild
        '';

        installPhase = ''
          runHook preInstall

          cp yarn.lock $out

          runHook postInstall
        '';

        outputHash = "sha256-0vM+CguJsrnftkzocgSkfiZBloUsJFoMfy6oguo7MPg=";
        outputHashAlgo = "sha256";
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
    cp "$(nix-build --no-out-link --attr zigbee2mqtt-networkmap.yarnlock)" yarn.lock
  '';
}
