{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";

  outputs =
    inputs@{ ... }:
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
            offlineCache = pkgs.fetchYarnDeps {
              src = builtins.filterSource (path: type: type == "regular" && baseNameOf path == "yarn.lock") ./.;
              hash = "sha256-uYZndaaGPKF9jK475QJcOTtcpnfOFezhrhwhqX4rLGA=";
            };
            nativeBuildInputs = [ pkgs.yarnConfigHook ];
            packages = with pkgs; [
              yarn
            ];
            shellHook = ''
              test -e node_modules || yarnConfigHook
            '';
          };
        }
      );
    };
}
