this.name = "CargoTypeExtension-Station-SalvageGang";
this.description = "Salvage Gang market definition";

this.startUp = function() {
		if (!worldScripts["Anarchies"]) {
				return;
		}
		if (worldScripts["Anarchies"] && worldScripts["Anarchies"].randomCargoChance) {
				return;
		}

		worldScripts["CargoTypeExtension"].registerOXPStation(this.name,"anarchies_salvage_gang");

}

/* Station API */

this.randomCargoChance = function(good) {
		var generic = worldScripts["CargoTypeExtension"].cargoDefinition(good,"genericType");
		if (generic == "minerals" || generic == "alloys") { return 1.5; }
		return 0;
}

this.randomCargoAmount = function(good) {
		return 3;
} 

this.exportCargoAmount = function(good) {
		return 0;
}

this.exportCargoPrice = function(good) {
		return 1;
}

this.randomImportChance = function(good) {
		var generic = worldScripts["CargoTypeExtension"].cargoDefinition(good,"genericType");
		if (generic == "liquorWines") {
				return 0.05;
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
		if (system.shipsWithRole("anarchies_salvage_gang").length > 0) {
				return "* The salvage gang on the spacelane might have a few interesting things.";
		}
		return false;
}
