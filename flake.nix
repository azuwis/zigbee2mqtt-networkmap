{
  inputs.nixpkgs.url = "nixpkgs";
  inputs.flake-utils.url = "github:numtide/flake-utils";
  inputs.devshell.url = "github:numtide/devshell";
  inputs.devshell.inputs.nixpkgs.follows = "nixpkgs";
  inputs.devshell.inputs.flake-utils.follows = "flake-utils";

  outputs = { self, nixpkgs, flake-utils, devshell }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs {
        inherit system;
        overlays = [ devshell.overlay ];
      };
      nodeModules = pkgs.mkYarnModules {
        pname = "zigbee2mqtt-networkmap-node-modules";
        version = "1.0";
        packageJSON = ./package.json;
        yarnLock = ./yarn.lock;
      };
    in {
      devShell = pkgs.devshell.mkShell {
        devshell.startup.yarn.text = ''
          ${pkgs.rsync}/bin/rsync -rlt --chmod=Du+w --delete ${nodeModules}/node_modules ./
        '';
        packages = with pkgs; [
          yarn
        ];
      };
    });
}
