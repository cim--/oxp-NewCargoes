this.name = "CargoTypeExtension-Station-SuperHub";
this.description = "SuperHub market definition";

this.startUp = function() {
		if (!worldScripts["PAGroove_superhubPopulator"]) {
				return;
		}
		if (worldScripts["PAGroove_superhubPopulator"] && worldScripts["PAGroove_superhubPopulator"].randomCargoChance) {
				return;
		}

		worldScripts["CargoTypeExtension"].registerOXPStation(this.name,"pagroove_superhub");
}

/* Station API */
/* SuperHub:
	 RCC: 2 for Computers, 0.5 for Machinery, Luxuries, Alloys, Radioactives, 0 for rest. Maybe have some exclusions there.
	 RCA: 2
	 ECA: 0.5-1.5 for all categories in RCC
	 ECP: 0.9
	 RIC: 0.2*RCC, iff RCC check failed
	 SIC: 1 for RCC categories, 0 otherwise
	 ICP: (randomise 0.8-1.1)
	 IPC: true
	 EPC: true
	 SG: "You can get good deals on high-tech cargo at the SuperHub"
*/

this.randomCargoChance = function(good) {
		var generic = worldScripts["CargoTypeExtension"].cargoDefinition(good,"genericType");
		if (generic == "computers") { 
				return 2.5; // very high tech
		}
		if (generic == "machinery" || generic == "luxuries" || generic == "alloys" || generic == "radioactives") {
				return 0.5; // somewhat high tech
		}
		return 0;
}

this.randomCargoAmount = function(good) {
		return 10;
} 

this.exportCargoAmount = function(good) {
		var generic = worldScripts["CargoTypeExtension"].cargoDefinition(good,"genericType");
		if (generic == "machinery" || generic == "luxuries" || generic == "alloys" || generic == "radioactives" || generic == "computers") {
				return Math.random()+0.5;
		} else {
				return 0;
		}
}

this.exportCargoPrice = function(good) {
		return 0.9;
}

this.randomImportChance = function(good) {
		var generic = worldScripts["CargoTypeExtension"].cargoDefinition(good,"genericType");
		if (generic == "machinery" || generic == "luxuries" || generic == "alloys" || generic == "radioactives") {
				return 0.02;
		} else if (generic == "computers") {
				return 0.1;
		} else {
				return 0;
		}
}

this.systemImportChance = function(good) {
		var generic = worldScripts["CargoTypeExtension"].cargoDefinition(good,"genericType");
		if (generic == "machinery" || generic == "luxuries" || generic == "alloys" || generic == "radioactives" || generic == "computers") {
				return 1;
		} else {
				return 0;
		}
}

this.importCargoPrice = function(good) {
		return 0.8+(Math.random()*0.3);
}

this.importPermitCheck = function() {
		return true;
}

this.exportPermitCheck = function() {
		return true;
}

this.stationGossip = function() {
		if (system.shipsWithPrimaryRole("pagroove_superhub").length > 0) {
				return "* Fly over to the SuperHub for better deals on high-tech goods";
		} else {
				return false;
		}
}
