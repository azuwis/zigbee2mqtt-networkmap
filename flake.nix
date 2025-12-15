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
      devShells = eachSystem (
        { pkgs, ... }:
        {
          default = pkgs.mkShellNoCC {
            pname = "devShell";
            offlineCache = pkgs.fetchYarnDeps {
              src = builtins.filterSource (path: type: type == "regular" && baseNameOf path == "yarn.lock") ./.;
              hash = "sha256-uYZndaaGPKF9jK475QJcOTtcpnfOFezhrhwhqX4rLGA=";
            };
            packages = with pkgs; [
              yarn
              yarnConfigHook
            ];
            shellHook = ''
              # Run yarnConfigHook in subshell, so $HOME will retain
              test -e node_modules || (yarnConfigHook)
            '';
          };
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
      default = self.devShells.x86_64-linux.default;
    };
}
