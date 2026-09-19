This folder contains the PCB design file script in `PCB/boards/designs`.  This folder also contains zipped Gerber PCB files, and STL CAD files for the rigid components.

The design file contains both the stator and the rotor; in order to export Gerbers, comment out one of these calls such that:

```
// makeRotor(0, 0, 30, rotor_sides + extra_sides);

makeStator(0, 0, 41, stator_sides + extra_sides);
```

or

```
makeRotor(0, 0, 30, rotor_sides + extra_sides);

// makeStator(0, 0, 41, stator_sides + extra_sides);
```  
