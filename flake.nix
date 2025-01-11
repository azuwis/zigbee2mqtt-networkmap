{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
  inputs.devshell.url = "github:numtide/devshell";
  inputs.devshell.inputs.nixpkgs.follows = "nixpkgs";

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
            devshell = import inputs.devshell { nixpkgs = pkgs; };
          }
        );
    in
    {
      devShells = eachSystem (
        { pkgs, devshell, ... }:
        let
          nodeModules = pkgs.mkYarnModules {
            pname = "zigbee2mqtt-networkmap-node-modules";
            version = "1.0";
            packageJSON = ./package.json;
            yarnLock = ./yarn.lock;
          };
        in
        {
          default = devshell.mkShell {
            devshell.startup.yarn.text = ''
              ${pkgs.rsync}/bin/rsync -rlt --chmod=Du+w --delete ${nodeModules}/node_modules ./
            '';
            packages = with pkgs; [
              yarn
            ];
          };
        }
      );
    };
}
