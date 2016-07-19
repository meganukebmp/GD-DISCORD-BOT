# GD-DISCORD-BOT

#### Official Geometry Dash Icon Discord bot.
---

The bot receives user input via command and then programatically renders an image with the user's provided parameters.

---
#### Syntax:
    ~draw <TYPE> <ID> <R1> <G1> <B1> <R2> <G2> <B2>
OR
    
    ~draw <TYPE> <ID> <#HEX1> <#HEX2>
OR

    ~draw <TYPE> <ID> <LITERAL1> <LITERAL2>
    
**TYPE** - icon type.
`icon/cube; wave/dart; ball; ship; ufo; robot; spider; mini`

**ID** - depending on the category can be anything. Usually a number but can also be a string to a filename.

**R#; G#; B#** - RGB values. `0-255`

**#HEX#** - Hex values `#000000 - #ffffff`

**LITERAL#** - The color name. Only colors existing in GD have been added.

    red
	green
	blue
	yellow
	orange
	lime	
	cyan	
	purple
	magenta
	pink
	white
	black
	gray
	denim
	violet
	aquamarine
	lightblue
	darkblue
	darkmagenta
	lightpink
	lightorange
	lightgray
	emerald
    darkcyan
    
**<RANDOM>** - when parameter provided draws random or random of **TYPE**

    ~draw random
OR

    ~draw random <TYPE>

    