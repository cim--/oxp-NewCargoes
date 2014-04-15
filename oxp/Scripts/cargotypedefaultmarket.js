this.name = "CargoTypeExtension-DefaultMarket";
this.description = "The default marketinfo entry for main stations";

/* In addition to the general New Cargoes license, you can use and
 * modify this script as a baseline for your own marketinfo entries as
 * if it were public domain */

this.randomCargoChance = function(good) {
		return 1;
}

this.randomCargoAmount = function(good) {
		return 3;
} 

this.exportCargoAmount = function(good) {
		return 1;
}

this.exportCargoPrice = function(good) {
		return 1;
}

this.randomImportChance = function(good) {
		return 0;
}

this.systemImportChance = function(good) {
		return 1;
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
		return false;
}