this.name = "CargoTypeExtension-Station-RRSWaystation";
this.description = "RRS Waystation market definition";

this.startUp = function() {
		if (!worldScripts["Rescue Stations"]) {
				return;
		}
		if (worldScripts["Rescue Stations"] && worldScripts["Rescue Stations"].randomCargoChance) {
				return;
		}
		
		worldScripts["CargoTypeExtension"].registerOXPStation(this.name,"rescue_station");
}

/* Station API */

this.randomCargoChance = function(good) {
		var generic = worldScripts["CargoTypeExtension"].cargoDefinition(good,"genericType");
		if (generic == "alloys") { return 0.25; }
		if (good == "CTE_CTS_IN7") { return 2; } // Vaccines
		return 0;
}

this.randomCargoAmount = function(good) {
		return 3;
} 

this.exportCargoAmount = function(good) {
		if (good == "CTE_CTS_IN7") {
				return 2;
		}
		return 0;
}

this.exportCargoPrice = function(good) {
		return 0.9;
}

this.randomImportChance = function(good) {
		var generic = worldScripts["CargoTypeExtension"].cargoDefinition(good,"genericType");
		if (generic == "computers" || generic == "machinery" || generic == "alloys" || good == "CTE_CTS_R3") {
				return 0.01;
		}
		return 0;
}

this.systemImportChance = function(good) {
		return 0;
}

this.importCargoPrice = function(good) {
		return 1;
}

// they will trade in Vaccines, but they want you to have a permit
this.importPermitCheck = function() {
		return true;
}

this.exportPermitCheck = function() {
		return true;
}

this.stationGossip = function() {
		if (system.shipsWithPrimaryRole("rescue_station").length > 0) {
				return "* If you have a permit, the RRS Waystation is good for Vaccines.";
		}
		return false;
}
