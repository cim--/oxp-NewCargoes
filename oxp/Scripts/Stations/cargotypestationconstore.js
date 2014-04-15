this.name = "CargoTypeExtension-Station-ConStore";
this.description = "Con Store market definition";

this.startUp = function() {
		if (!worldScripts["Pi-Forty-Two Con stores"]) {
				return;
		}
		if (worldScripts["Pi-Forty-Two Con stores"] && worldScripts["Pi-Forty-Two Con stores"].randomCargoChance) {
				return;
		}
		worldScripts["CargoTypeExtension"].registerOXPStation(this.name,"constore");
}

this.dayChanged = this.shipWillExitWitchspace = function() {
		delete this.$saleCargo;
}

this.saleCargo = function() {
		if (this.$saleCargo) {
				return this.$saleCargo;
		}
		var cid = worldScripts["CargoTypeExtension"].extendableCargoSeeded("any",clock.days*(300+system.ID));
		worldScripts["CargoTypeExtension"].debug("Constore importer: "+cid);
		this.$saleCargo = cid;
		return cid;
}

/* Station API */
/* RCC: 1
	 RCA: 3
	 ECA: (randomise 0-2)
	 ECP: (randomise 0.9-1.2)
	 RIC: pick one using daily chaos method; gossip can advertise it at main station
	 SIC: 0.8
	 ICP: (randomise 0.8-1.1)
	 IPC: false
	 EPC: false
	 SG: see RIC
*/

this.randomCargoChance = function(good) {
		return 1;
}

this.randomCargoAmount = function(good) {
		return 3;
} 

this.exportCargoAmount = function(good) {
		return Math.random()*2;
}

this.exportCargoPrice = function(good) {
		return 0.9+(Math.random()*0.3);
}

this.randomImportChance = function(good) {
		if (good == this.saleCargo()) {
				return 1;
		}
		return 0;
}

this.systemImportChance = function(good) {
		return 0.8;
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
		if (system.shipsWithPrimaryRole("constore").length > 0) {
				var good = this.saleCargo();
				return "* I hear someone at the Constore needs "+worldScripts["CargoTypeExtension"].cargoDefinition(good,"specificType");
		} else {
				return false;
		}
}
