# Update sources:
# nix-instantiate --option tarball-ttl 1 --strict --eval --arg update true sources.nix > sources.tmp && mv sources.tmp sources.lock

{
  update ? false,
}:

builtins.mapAttrs
  (
    name: input:
    let
      lock = (import ./sources.lock).${name} or { };
      isLocked = update == false && lock != { };
      fetchGitArgs = {
        shallow = true;
      }
      // input
      // (
        if isLocked then
          removeAttrs lock [
            "lastModifiedDate"
            "outPath"
            "shortRev"
          ]
        else
          { }
      );
    in
    if isLocked then
      lock
      // {
        outPath = builtins.fetchTarball {
          url = input.url + "/archive/" + lock.rev + ".tar.gz";
          sha256 = lock.narHash;
        };
      }
    else
      builtins.trace "Fetching ${name} ${builtins.toJSON fetchGitArgs}" (builtins.fetchGit fetchGitArgs)
  )
  {
    nixpkgs = {
      url = "https://github.com/NixOS/nixpkgs";
      ref = "nixos-25.11";
    };
  }
