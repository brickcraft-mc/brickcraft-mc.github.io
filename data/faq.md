# Support

> !note: Can't find what you're looking for?<br>Join our [Discord](https://Discord.gg/uBhFaBG) server for help!

> !warning: Some of this information is for old versions of Brickcraft, or for the old website/Patreon system. 
> If you have any questions, please ask in the [Discord](https://Discord.gg/uBhFaBG) server!

> !note: Brickcraft should work on any version of Minecraft from 1.16 and up. 
> Right now, NO versions are feature-complete. 

> !warning: Brickcraft does NOT support Bedrock Edition.


## Installation

?[How do I install Brickcraft?]

1. Download the resource pack from the downloads page
2. Open Minecraft and go to Options > Resource Packs
3. Either drag and drop the downloaded file into the resource packs folder or click "Open Pack Folder" and move the file there
4. Select the pack in the resource packs menu

There is a more detailed guide on the [Instructions](/instructions.html) page.
/?

?[Where is my resource packs folder?]
Press Windows + R and enter: `%appdata%\.minecraft\resourcepacks`
/?

?[Why isn't the pack showing up in Minecraft?]
Make sure you've downloaded the correct version for your Minecraft version. If it still doesn't work, try:

-   Restarting Minecraft
-   Checking if the file is properly extracted
-   Verifying the file isn't corrupted
/?

?[How do I update Brickcraft?]
To update Brickcraft, simply download the new version and replace the old one in your resource packs folder.
/?

## Downloads & Patreon

?[Is there a free version of Brickcraft?]
Yes, there is! There is a free demo version of Brickcraft available for download, linked on the [Downloads](/downloads.html) page.
Everything beyond that requires a pledge on [Patreon](https://www.patreon.com/alextestria).
/?

?[Why do better versions cost money?]
A resource pack takes an incredibly amount of work, especially at 1024x texture resolution with PBR materials.
At this point in time I've spent more than 90 hours of concentrated work on Brickcraft.
/?

?[I'm a Patron but it says that my email is blocked]
Patreon is blocking information requests of users who haven't verified their email address. Without your email address connected to your account the website can't tell wether you are a Patron or not.

Try verifying your email address on [Patreon](https://patreon.com), if that won't help contact @AlexTestria on Patreon, [Discord](https://Discord.gg/uBhFaBG) or by email.
/?

## General Information

?[Where can I follow this project?]
Updates are posted periodically on the [Discord](https://Discord.gg/uBhFaBG) server.
Every other link is located at the bottom of this page.
/?

?[How often do you post updates to Brickcraft?]
A timeline currently cannot be accurately given, however progress is posted somewhat regularly in the [Discord](https://Discord.gg/uBhFaBG) server.
/?

## Features & Compatibility

?[What are the minimum requirements?]
There are no set minimum requirements for Brickcraft, since it depends on your setup, other resource packs, mods, etc, but here are some general guidelines:

| Tier    | CPU    | RAM  | Graphics Card         | Minecraft Version |
| ------- | ------ | ---- | --------------------- | ----------------- |
| Vanilla | 4-core | 4GB  | DirectX 11 compatible | 1.19+             |
| Premium | 6-core | 8GB  | RTX 2070              | 1.19+             |
| Extreme | 6-core | 16GB | RTX 3070              | 1.19+             |

Note, these are just rough estimates and your experience may vary.  
Additionally, some graphics cards (such as those from AMD), may have issues with certain shaders or texture packs.
/?

?[Is Brickcraft playable on Bedrock Edition?]
No, Brickcraft only works for Minecraft Java Edition.
Bedrock edition does not support the block model modifications that Brickcraft makes.
/?

?[Does Brickcraft require mods?]
It does not require any mods in order to work properly.  
However, using a performance-optimisation mod such as Sodium, alongside a proper shader, it will look and run a lot better.
/?

?[Does Brickcraft support modded blocks?]
Brickcraft currently only supports vanilla Minecraft blocks and items.
/?

?[Can I use Brickcraft with shaders?]
Yes! Brickcraft is fully compatible with most popular shader packs. Some recommended options include:

-   [BSL Shaders](https://modrinth.com/shader/bsl-shaders)
-   [Complementary Shaders](https://modrinth.com/shader/complementary-reimagined)
-   [SEUS Renewed](https://www.sonicether.com/seus/)
-   [Kappa Shader](https://modrinth.com/shader/kappa-shader)
/?

?[Will Brickcraft affect my FPS?]
With Brickcraft, as with any high-quality resource pack, you may notice some FPS impact depending on your hardware. Brickcraft adds a lot of model detail to a lot of blocks.
/?

?[Is Brickcraft compatible with other resource packs?]
Brickcraft is compatible with most other resource packs, but it may not look as intended. Multiple resource packs can be used at the same time, but the order in which they are loaded can affect the appearance of the game.  
To ensure Brickcraft looks as intended, it should be placed at the top of the resource pack list.
/?

## Performance and Problems

?[The resource pack is lagging a lot!]
Because Brickcraft only uses 3D Models to achieve its look, it can lag quite a lot at medium to higher render distances. Try setting your render distance between two and six chunks.

> !warning: Check out the [Instructions](/instructions.html) page for additional tips!
> /?

?[I'm keep getting a "Resource reload failed" error]
This error can result from a few different issues.

### If you're using Brickraft 2.6 or earlier and playing Mincraft 1.21 or newer:
To fix this, try:

1. Unzip the resource pack
2. Find the folder at `Brickcraft > assets > minecraft > shaders`
3. Rename the folder to anything else
4. Re-zip the resource pack and try again

### If you've tried the above, or you are using Brickcraft 3.0 or newer:
The texture atlas may be too large for your GPU to handle.
This can occur on certain GPUs, and may also just appear as the above error (please check your logs).
There's no "fix" for it, since it's a hardware limitation, however you can work around it by reducing the size of the textures in the pack.

1. Navigate to the [Pack Resize Tool](/tools/resize.html)
2. Drag and drop the ZIP file into the designated area
3. Wait for the tool to resize the pack
4. Download the resized ZIP file
5. Move the resized ZIP file into your Resource Packs folder
6. Select the resized pack in Minecraft's Resource Packs menu
/?
