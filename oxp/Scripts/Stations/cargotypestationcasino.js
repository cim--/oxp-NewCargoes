this.name = "CargoTypeExtension-Station-HoopyCasino";
this.description = "Hoopy Casino market definition";

this.startUp = function() {
		if (!worldScripts["hoopy_casino"]) {
				return;
		}
		if (worldScripts["hoopy_casino"] && worldScripts["hoopy_casino"].randomCargoChance) {
				return;
		}
		worldScripts["CargoTypeExtension"].registerOXPStation(this.name,"casinoship");
}

/* Station API */
/* RCC: 2 for space minerals, 0 otherwise
	 RCA: 5
	 ECA: 1 for space minerals, 0 otherwise
	 ECP: 0.8
	 RIC: 0
	 SIC: 0
	 ICP: 1
	 IPC: false
	 EPC: false
	 SG: false */

this.randomCargoChance = function(good) {
		var specific = worldScripts["CargoTypeExtension"].cargoDefinition(good,"specificType");
		if (specific == "Fine clothing") {
				return 5; // might occasionally be trying to sell on someone's shirt.
		}
		return 0; // no exports
}

this.randomCargoAmount = function(good) {
		return 1;
} 

this.exportCargoAmount = function(good) {
		return 0;
}

this.exportCargoPrice = function(good) {
		return 0.8;
}

this.randomImportChance = function(good) {
		if (good == "CTE_CTS_O2") { // low energy waste
				return 1;
		} else {
				var generic = worldScripts["CargoTypeExtension"].cargoDefinition(good,"specificType");
				if (generic == "liquorWines") {
						return 0.2;
				} 
				return 0;
		}
}

this.systemImportChance = function(good) {
		if (good == "CTE_CTS_O2") { // low energy waste
				return 1;
		} else {
				var generic = worldScripts["CargoTypeExtension"].cargoDefinition(good,"specificType");
				if (generic == "liquorWines") {
						return 0.6;
				} 
				return 0;
		}
}

this.importCargoPrice = function(good) {
		return 1.2;
}

this.importPermitCheck = function() {
		return false;
}

this.exportPermitCheck = function() {
// they don't sell or buy any illegal goods, they're right next to the
// main station, and they canonically rely on Galcop for most of their
// defense.
		return true;
}

this.stationGossip = function() {
		if (system.shipsWithPrimaryRole("casinoship").length > 0) {
				return "* The casino always needs more random numbers and drinks.";
		}
		return false;
}
