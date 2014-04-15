this.name = "CargoTypeExtension-Station-SpaceBar";
this.description = "Space Bar market definition";

this.startUp = function() {
		if (!worldScripts["Random_Hits"]) {
				return;
		}
		if (worldScripts["Random_Hits"] && worldScripts["Random_Hits"].randomCargoChance) {
				return;
		}

		worldScripts["CargoTypeExtension"].registerOXPStation(this.name,"random_hits_any_spacebar");

}

/* Station API */

this.randomCargoChance = function(good) {
		var generic = worldScripts["CargoTypeExtension"].cargoDefinition(good,"genericType");
		var specific = worldScripts["CargoTypeExtension"].cargoDefinition(good,"specificType");
		if (generic != "minerals") { return 0; }
		if (specific == "Arthropod shell" || specific == "Corals") { return 0; }
		return 2;
}

this.randomCargoAmount = function(good) {
		return 5;
} 

this.exportCargoAmount = function(good) {
		var generic = worldScripts["CargoTypeExtension"].cargoDefinition(good,"genericType");
		var specific = worldScripts["CargoTypeExtension"].cargoDefinition(good,"specificType");
		if (generic != "minerals") { return 0; }
		if (specific == "Arthropod shell" || specific == "Corals") { return 0; }
		if (Math.random() < 0.5) {
				return Math.random()*2;
		}
}

this.exportCargoPrice = function(good) {
		return 0.8;
}

this.randomImportChance = function(good) {
		var generic = worldScripts["CargoTypeExtension"].cargoDefinition(good,"genericType");
		if (generic == "liquorWines") {
				return 0.1;
		}
		return 0;
}

this.systemImportChance = function(good) {
		return 0;
}

this.importCargoPrice = function(good) {
		return 1;
}

this.importPermitCheck = function() {
		return false;
}

this.exportPermitCheck = function() {
		return false;
}

this.stationGossip = function() {
		if (system.shipsWithRole("random_hits_any_spacebar").length > 0) {
				return "* It's a thirsty job, bounty hunting.";
		}
		return false;
}
