this.name = "CargoTypeExtension-Station-KiotaHabitat";
this.description = "Kiota Habitat market definition";

this.startUp = function() {
		if (!worldScripts["wildShips_populator.js"]) {
				return;
		}
		if (worldScripts["wildShips_populator.js"] && worldScripts["wildShips_populator.js"].randomCargoChance) {
				return;
		}

		worldScripts["CargoTypeExtension"].registerOXPStation(this.name,"wildShips_kiota2Ring");
		worldScripts["CargoTypeExtension"].registerOXPStation(this.name,"wildShips_kiota4Ring");
		worldScripts["CargoTypeExtension"].registerOXPStation(this.name,"wildShips_kiota4RingV");
		worldScripts["CargoTypeExtension"].registerOXPStation(this.name,"wildShips_kiota8Ring");
		worldScripts["CargoTypeExtension"].registerOXPStation(this.name,"wildShips_kiota8RingV");
}

/* Station API */


this.randomCargoChance = function(good) {
		var generic = worldScripts["CargoTypeExtension"].cargoDefinition(good,"genericType");
		if (generic == "textiles" || generic == "slaves" || generic == "luxuries") {
				return 0.75; 
		}
		return 0.2;
}

this.randomCargoAmount = function(good) {
		return 3;
} 

this.exportCargoAmount = function(good) {
		var generic = worldScripts["CargoTypeExtension"].cargoDefinition(good,"genericType");
		if (generic == "textiles" || generic == "slaves" || generic == "luxuries") {
				return 1;
		}
		return 0;
}

this.exportCargoPrice = function(good) {
		return 0.9+(Math.random()*0.2);
}

this.randomImportChance = function(good) {
		return 0;
}

this.systemImportChance = function(good) {
		var generic = worldScripts["CargoTypeExtension"].cargoDefinition(good,"genericType");
		if (generic == "computers" || generic == "radioactives" || generic == "minerals") {
				return 0.2;
		} else {
				return 1;
		}
}

this.importCargoPrice = function(good) {
		return 0.9+(Math.random()*0.2);
}

// they have police patrol ships, so they probably obey Galcop rules here
this.importPermitCheck = function() {
		return true;
}

this.exportPermitCheck = function() {
		return true;
}

this.stationGossip = function() {
		return false;
}
