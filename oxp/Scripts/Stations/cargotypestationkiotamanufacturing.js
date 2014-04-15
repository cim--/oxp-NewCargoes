this.name = "CargoTypeExtension-Station-KiotaFactory";
this.description = "Kiota Manufacturing market definition";

this.startUp = function() {
		if (!worldScripts["wildShips_populator.js"]) {
				return;
		}
		if (worldScripts["wildShips_populator.js"] && worldScripts["wildShips_populator.js"].randomCargoChance) {
				return;
		}

		worldScripts["CargoTypeExtension"].registerOXPStation(this.name,"wildShips_kiota2Disc");
		worldScripts["CargoTypeExtension"].registerOXPStation(this.name,"wildShips_kiota4Disc");
}

/* Station API */


this.randomCargoChance = function(good) {
		var generic = worldScripts["CargoTypeExtension"].cargoDefinition(good,"genericType");
		if (generic == "alloys" || generic == "machinery" || generic == "luxuries" || generic == "computers") {
				return 0.75; 
		}
		return 0.2;
}

this.randomCargoAmount = function(good) {
		return 3;
} 

this.exportCargoAmount = function(good) {
		var generic = worldScripts["CargoTypeExtension"].cargoDefinition(good,"genericType");
		if (generic == "alloys" || generic == "machinery" || generic == "luxuries" || generic == "computers") {
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
		if (generic == "alloys" || generic == "radioactives" || generic == "minerals") {
				return 1;
		} else {
				return 0.2;
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
