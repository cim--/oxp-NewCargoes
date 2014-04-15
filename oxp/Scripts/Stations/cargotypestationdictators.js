this.name = "CargoTypeExtension-Station-Astrofactory";
this.description = "Dictatorship Astrofactory market definition";

this.startUp = function() {
		if (!worldScripts["dictators.js"]) {
				return;
		}
		if (worldScripts["dictators.js"] && worldScripts["dictators.js"].randomCargoChance) {
				return;
		}

		worldScripts["CargoTypeExtension"].registerOXPStation(this.name,"astrofactory");
}

/* Station API */

this.randomCargoChance = function(good) {
		var generic = worldScripts["CargoTypeExtension"].cargoDefinition(good,"genericType");
		if (generic == "alloys" || generic == "machinery" || generic == "computers") {
				return 2; // high tech goods
		} 
		return 0;
}

this.randomCargoAmount = function(good) {
		return 5;
} 

this.exportCargoAmount = function(good) {
		var generic = worldScripts["CargoTypeExtension"].cargoDefinition(good,"genericType");
		if (generic == "alloys" || generic == "machinery" || generic == "computers") {
				return Math.random()+Math.random();
		} 
		return 0;
}

this.exportCargoPrice = function(good) {
		return 0.8+(0.3*Math.random());
}

this.randomImportChance = function(good) {
		var generic = worldScripts["CargoTypeExtension"].cargoDefinition(good,"genericType");
		if (generic == "slaves") {
				return 0.1;
		} else if (generic == "computers" || generic == "machinery" || generic == "radioactives" || generic == "alloys") {
				return 0.02;
		} else {
				return 0;
		}
}

this.systemImportChance = function(good) {
		var generic = worldScripts["CargoTypeExtension"].cargoDefinition(good,"genericType");
		if (generic == "slaves") {
				return 1;
		} else {
				return 0;
		}
}

this.importCargoPrice = function(good) {
		return 0.7+(Math.random()*0.4);
}

this.importPermitCheck = function() {
		return false;
}

this.exportPermitCheck = function() {
		return false;
}

this.stationGossip = function() {
		if (system.shipsWithPrimaryRole("astrofactory").length > 0) {
				return "* The Astrofactory is good for industrial cargo.";
		}
		return false;
}
