this.name = "CargoTypeExtension-Station-ZGF";
this.description = "Commies ZGF and SLAPU market definition";

this.startUp = function() {
		if (!worldScripts["communist_population"]) {
				return;
		}
		if (worldScripts["communist_population"] && worldScripts["communist_population"].randomCargoChance) {
				return;
		}

// use the same for both: tech level variation should handle the differences
		worldScripts["CargoTypeExtension"].registerOXPStation(this.name,"comczgf");
		worldScripts["CargoTypeExtension"].registerOXPStation(this.name,"comslapu");

// astromines generally added as rock hermits or pirate coves, so they get the same market
}

/* Station API */

this.randomCargoChance = function(good) {
		var generic = worldScripts["CargoTypeExtension"].cargoDefinition(good,"genericType");
		if (system.techLevel < 10) { // ZGF
				if (generic == "alloys" || generic == "machinery" || generic == "radioactives") {
						return 2; // high tech goods
				} 
		} else {
				if (generic == "computers" || generic == "radioactives" || generic == "machinery") {
						return 2; // SLAPU has different selection
				}
		}
		return 0;
}

this.randomCargoAmount = function(good) {
		return 5;
} 

this.exportCargoAmount = function(good) {
		var generic = worldScripts["CargoTypeExtension"].cargoDefinition(good,"genericType");
		if (system.techLevel < 10) { // ZGF
				if (generic == "machinery" || generic == "radioactives" || generic == "alloys") {
						return Math.random()+0.5;
				} 
		} else { // SLAPU
				if (generic == "computers" || generic == "radioactives" || generic == "machinery") {
						return Math.random()+0.5;
				}
		}
}

this.exportCargoPrice = function(good) {
		return 0.8+(0.2*Math.random());
}

this.randomImportChance = function(good) {
		var generic = worldScripts["CargoTypeExtension"].cargoDefinition(good,"genericType");
		if (generic == "slaves") {
				return 0.05;
		} else if (generic == "computers" || generic == "machinery" || generic == "radioactives" || generic == "alloys") {
				return 0.05;
		} else {
				return 0;
		}
}

this.systemImportChance = function(good) {
		var generic = worldScripts["CargoTypeExtension"].cargoDefinition(good,"genericType");
		if (generic == "machinery" || generic == "luxuries" || generic == "alloys" || generic == "radioactives" || generic == "computers") {
				return 0.5;
		} else {
				return 0;
		}
}

this.importCargoPrice = function(good) {
		return 0.8+(Math.random()*0.4);
}

this.importPermitCheck = function() {
		return false;
}

this.exportPermitCheck = function() {
		return false;
}

this.stationGossip = function() {
		if (system.shipsWithPrimaryRole("comslapu").length > 0) {
				return "* The SLAPU sometimes sells declassified surplus goods.";
		} else if (system.shipsWithPrimaryRole("comczgf").length > 0) {
				return "* Try the ZGF for industrial goods.";
		} else {
				return false;
		}
}
