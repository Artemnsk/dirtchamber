# dirtchamber
Thanks https://github.com/alexandergurov for idea and prototype.

https://artemnsk.github.io/dirtchamber/battleground1/index.html

# Rules.
* Few players can play this game.
* Your and your enemies microbes put on specific place in the beginning.
* Food which used to restore microbes health spawns in some places.
* Almost all environment and game parameters live as configs in the game you chosen.
* You write algorithm using API provided below. It describes your microbe behavior and interactions between
other microbes basing on information around him in some radius and using API tools like "yell message", "move", "reproduce" and so on.
* After each environment step each microbe's hitpoints decreased by some value (default = 41) 

## Environment Lifecycle step
1. All microbes 'live' - your algorithm applied to each microbe in the beginning.
2. All reproduce microbe requests processed then. We do it after step 1 to not allow newly reproduced 
microbe to perform any actions on current step.
3. Each environment cell being processed:
    * Microbe battle: for each cell where microbes of different players stay environment calculates
    hitpoints sum per player. Player with maximum overall hitpoints will live. When hitpoints are the
    winner defined randomly.
    * Microbes with no hitpoints die.
    * Microbes eat: if there is some food on microbe's cell with height > 0 microbe restores it's hitpoints
    by specified value. Food's height decremented then.
    * Food 'dies' if it's height = 0;
4. Environment step incremented so all old messages from previous step being deleted.


# API
```
function (messages, my_x, my_y, my_hitpoints, my_inner_info, microbe_move, microbe_reproduce, microbe_yell, microbe_set_inner_info) {
    // .. do whaterver you want.
}
```

## Parameters

### *messages*
(Array of Message objects)

The entire environment is filled by some information: microbes can see object in some radius 
(radius = 2 by default), microbes can yell some message to nearby teammates and many other. 
On every game step each microbe provided with array of message objects which he can parse to
 understand what is going on around him.

##### Message Object.
```json
{
    "x": "<x coordinate of message>",
    "y": "<y coordinate of message>",
    "player": "<player who's own microbe which yell some message. Could be null.>",
    "step": "<game step this message belongs to. SHould be the same for all messages in array.>", 
    "text": "<some text>"
}
```

The most important thing here is 'text' key. You can put any text in your microbe_yell(text) 
function and it will appear here. All microbes in specified radius around the source of your yell will got this
message.

"General" non-player messages from environment about Food and Microbes around current microbe have specific format:
```json
// Microbe.
{
    "x": "<x coordinate of microbe>",
    "y": "<y coordinate of microbe>",
    "player": "<player object>",
    "type": "microbe",
    "hitpoints": "<microbe hitpoints>",
    "inner_info": "<microbe inner_info>"
}
```
```json
// Food.
{
    "x": "<x coordinate of food>",
    "y": "<y coordinate of food>",
    "type": "food",
    // How much times this food piece could be eaten by microbe.
    // Microbe gains some amount of hitpoints per eat. 
    "height": "<food height>"
}

```

### *my_x*
(Integer)

X coordinate of current microbe. Integer.

### *my_y*
(Integer)

Y coordinate of current microbe.

### *my_hitpoints*
(Integer)

Hitpoints of current microbe.

### *my_inner_info*
(Text)

Inner info of microbe.
Each microbe has it's own inner information and everybody see it. However for your enemy player this
info means almost nothing when you can effectively set some information for each microbe.

E.g. This info can mean specific role your microbe playes in your game - 'scout' to search for food only,
always track way back to teammate base and run back when food found and to not perform battles with enemies.

### *microbe_move*
(Function(x, y))

Use this function with x, y coordinates parameters. You can use this function only once per environment step.
Just nothing will happen if you perform moving by the same microbe twice per step.

### *microbe_reproduce*
(Function(data))

Use this function to 'split' current microbe into 2 ones.
Hitpoints of current microbe will be decreased by amount provided in data object.
You can pass inner_info text parameter to set inner_info for newly created microbe in data object.
This function can be used only once per environment step.
Microbe generated with this function can start 'live' only on next environment step.
```json
// data.
{
    "hitpoints": "<half of current microbe hitpoints will be used by default>",
    "inner_info": "<empty string by default>"
}

```

### *microbe_yell*
(Function(text))

Yells some message in some radius with text specified in text parameter.
This message will be available for your microbes on next environment step only.

### *microbe_set_inner_info*
(Function(inner_info))

Sets inner_info for your current microbe.