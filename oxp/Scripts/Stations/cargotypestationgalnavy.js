this.name = "CargoTypeExtension-Station-Galnavy";
this.description = "Galnavy market definition";

this.startUp = function() {
		if (!worldScripts["GalNavy"]) {
				return;
		}
		if (worldScripts["GalNavy"] && worldScripts["GalNavy"].randomCargoChance) {
				return;
		}
		worldScripts["CargoTypeExtension"].registerOXPStation(this.name,"navystat");
		worldScripts["CargoTypeExtension"].registerOXPStation(this.name,"navystat25");
		worldScripts["CargoTypeExtension"].registerOXPStation(this.name,"navystat50");		
		worldScripts["CargoTypeExtension"].registerOXPStation(this.name,"navystat75");
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
		return 1;
}

this.randomImportChance = function(good) {
		return 0;
}

this.systemImportChance = function(good) {
		if (good == "CTE_CTS_A3" || good == "CTE_CTS_C3" || good == "CTE_CTS_M7") {
				return 1;
		}
		return 0;
}

this.importCargoPrice = function(good) {
		return 1;
}

this.importPermitCheck = function() {
		return true;
}

this.exportPermitCheck = function() {
		return true;
}

this.stationGossip = function() {
		if (system.shipsWithRole("navySeccomBuoy").length > 0) {
				return "* The naval station always needs more ship parts.";
		}
		return false;
}
