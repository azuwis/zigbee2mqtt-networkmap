{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  inputs.systems.url = "github:nix-systems/default";
  inputs.devshell.url = "github:numtide/devshell";
  inputs.devshell.inputs.nixpkgs.follows = "nixpkgs";
  inputs.devshell.inputs.systems.follows = "systems";

  outputs = inputs@{ ... }:
    let
      eachSystem = inputs.nixpkgs.lib.genAttrs (import inputs.systems);
    in
    {
      devShells = eachSystem (system:
        let
          pkgs = inputs.nixpkgs.legacyPackages.${system};
          devshell = import inputs.devshell {
            inherit inputs system;
            nixpkgs = pkgs;
          };
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
        });
    };
}
