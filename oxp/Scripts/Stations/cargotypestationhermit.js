this.name = "CargoTypeExtension-Station-RockHermit";
this.description = "Rock Hermit market definition";

this.startUp = function() {
		worldScripts["CargoTypeExtension"].registerOXPStation(this.name,"rockhermit");
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
		var exports = worldScripts["CargoTypeExtension"].systemExports(galaxyNumber,system.ID)
		for (var i=1;i<=8;i++) {
				if (i != 3 && i != 4) {
						if (exports.indexOf("CTE_CTS_R"+i) != -1) { 
								return "* Head out to the rock hermits for the best minerals deals.";
						}
				}
		} 
		return false;
}
