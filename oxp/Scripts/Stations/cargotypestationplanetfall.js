this.name = "CargoTypeExtension-Station-PlanetFall";
this.description = "PlanetFall market definition";

this.startUp = function() {
		if (!worldScripts["PlanetFall"]) {
				return;
		}

		if (worldScripts["PlanetFall"] && worldScripts["PlanetFall"].randomCargoChance) {
				return;
		}
		// it's trivial for players to produce an unlimited quantity of
		// these stations, so allowing cargo to be purchased at them would
		// let them get lots of goods very easily.
		worldScripts["CargoTypeExtension"].registerOXPStation(this.name,"planetFall_surface");
}

/* Station API */

this.randomCargoChance = function(good) {
		return 0;
}

this.randomCargoAmount = function(good) {
		return 1;
} 

this.exportCargoAmount = function(good) {
		return 0;
}

this.exportCargoPrice = function(good) {
		return 0.9;
}

this.randomImportChance = function(good) {
		return 0;
}

this.systemImportChance = function(good) {
		return 1;
}

this.importCargoPrice = function(good) {
		return 0.8+(Math.random()*0.3);
}

this.importPermitCheck = function() {
		return false;
}

this.exportPermitCheck = function() {
		return false;
}

this.stationGossip = function() {
		return false;
}
