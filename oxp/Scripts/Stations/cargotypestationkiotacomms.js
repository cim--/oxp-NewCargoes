this.name = "CargoTypeExtension-Station-KiotaRelay";
this.description = "Kiota Relay market definition";

this.startUp = function() {
		if (!worldScripts["wildShips_populator.js"]) {
				return;
		}

		if (worldScripts["wildShips_populator.js"] && worldScripts["wildShips_populator.js"].randomCargoChance) {
				return;
		}

		worldScripts["CargoTypeExtension"].registerOXPStation(this.name,"wildShips_kiota2Comms");
		worldScripts["CargoTypeExtension"].registerOXPStation(this.name,"wildShips_kiota4Comms");
}

/* Station API */


this.randomCargoChance = function(good) {
		var generic = worldScripts["CargoTypeExtension"].cargoDefinition(good,"genericType");
		return 0.2;
}

this.randomCargoAmount = function(good) {
		return 3;
} 

this.exportCargoAmount = function(good) {
		return 0.1;
}

this.exportCargoPrice = function(good) {
		return 0.9+(Math.random()*0.2);
}

this.randomImportChance = function(good) {
		return 0;
}

this.systemImportChance = function(good) {
		var generic = worldScripts["CargoTypeExtension"].cargoDefinition(good,"genericType");
		if (generic == "alloys" || generic == "machinery") {
				return 0.1;
		} else if (generic == "food" || generic == "liquorWines") {
				return 0.2;
		}
		return 0;
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
