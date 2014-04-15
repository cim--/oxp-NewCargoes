this.name = "CargoTypeExtension-Station-GRS";
this.description = "GRS Buoy Repair market definition";

this.startUp = function() {
		if (!worldScripts["buoyRepair"]) {
				return;
		}

		if (worldScripts["buoyRepair"] && worldScripts["buoyRepair"].randomCargoChance) {
				return;
		}

		worldScripts["CargoTypeExtension"].registerOXPStation(this.name,"repaired-buoy-station");
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
		if (good == "CTE_CTS_A2" || good == "CTE_CTS_A3" || good == "CTE_CTS_A4" || good == "CTE_CTS_A5") {
				return 0.1;
		} else {
				var generic = worldScripts["CargoTypeExtension"].cargoDefinition(good,"genericType");
				if (generic == "alloys") {
						return 0.02;
				} else {
						return 0;
				}
		}
}

this.systemImportChance = function(good) {
		return this.randomImportChance(good);
}

this.importCargoPrice = function(good) {
		return 0.7+(Math.random()*0.6);
}

this.importPermitCheck = function() {
		return true;
}

this.exportPermitCheck = function() {
		return true;
}

this.stationGossip = function() {
		if (system.shipsWithPrimaryRole("repaired-buoy-station").length > 0) {
				return "* If you've got alloys to sell, GRS often need more.";
		} else {
				return false;
		}
}
