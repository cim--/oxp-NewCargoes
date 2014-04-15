this.name = "CargoTypeExtension";
this.description = "A script to allow cargoes other than the standard 17 to be stored in TC-sized containers in the hold";

/* "Public" functions. Interface should be consistent */

this.registerPersonality = function(name) {
		if (this.startUp) { this.startUp(); }

		this.debug("Registering "+name+" personality extension");
		this.personalities.push(name);
}

this.registerPermit = function(name) {
		if (this.startUp) { this.startUp(); }

		this.debug("Registering "+name+" permit extension");
		this.permits.push(name);
}

this.registerPriceChange = function(name) {
		if (this.startUp) { this.startUp(); }

		this.debug("Registering "+name+" price extension");
		this.pricefluxes.push(name);
}

this.registerOXPStation = function(name,role) {
		if (this.startUp) { this.startUp(); }

		this.debug("Registering "+name+" station role");
		this.oxpstations[role] = name;
}


this.registerCargoType = function(obj) {
		if (this.startUp) { this.startUp(); }

		if (!obj.ID) { return this.error("registerCargoType: No ID specified"); }
		if (!obj.ID.match(/^[A-Za-z0-9._-]+$/)) { return this.error("registerCargoType: "+obj.ID+" invalid format"); }
// actually, allowing scripted changes in behaviour by re-registering makes more sense
		var already = false;
		if (this.specialCargoRegister[obj.ID]) { already = true; }
		if (this.cargoTypes.indexOf(obj.genericType) === -1) { return this.error("registerCargoType: "+obj.ID+": "+obj.genericType+" is not a valid generic commodity"); }
		if (!obj.specificType) { return this.error("registerCargoType: "+obj.ID+": No specific type specified"); }
		if (!this.isSystemList(obj.buySystems)) { return this.error("registerCargoType: "+obj.ID+": Invalid source systems specified"); }
		if (!this.isSystemList(obj.sellSystems)) { return this.error("registerCargoType: "+obj.ID+": Invalid destination systems specified"); }

// default 80% more expensive than a generic bundle's average price here
// so you don't just buy them normally for the Agri<->Ind trade
		if (!obj.buyAdjust) { obj.buyAdjust = 80; }
// give or take 30%
		if (!obj.buyVariance) { obj.buyVariance = 30; }
// quantity available (as a percentage of normal availability)
// set to a negative number to prevent appearance on exporter main market
		if (!obj.buyQuantity) { obj.buyQuantity = 50; }
// quantityvariance +/- 100% default
		if (!obj.buyAvailability) { obj.buyAvailability = 100; }
// default 100% better sales price
		if (!obj.sellAdjust) { obj.sellAdjust = 100; }
// sales price variance default 50%
		if (!obj.sellVariance) { obj.sellVariance = 50; } 
// max sales price bonus per LY from nearest source (cap at ~diagonal of 100LY)
// tends towards higher end of distribution (roll twice pick best)
// no route in galaxy counts as 150LY
		if (!obj.sellDistance) { obj.sellDistance = 10; }
// default to being no more illegal than the base good
		if (!obj.illegal) { obj.illegal = 0; }
// chance of a catastrophic market slump in percent (per day)
		if (!obj.slump) { obj.slump = 2; }
// chance of recovering from slump in percent (per day)
		if (!obj.unslump) { obj.unslump = 7; }
// chance of source rumours being reliable 
// less than zero for no rumours
		if (!obj.sourceRumour) { obj.sourceRumour = 90; }
// chance of destination rumours being reliable 
		if (!obj.destinationRumour) { obj.destinationRumour = 70; }
// %chance of finding outside normal exporter (set negative to remove entirely)
		if (!obj.salvageMarket) { obj.salvageMarket = 5; }
// forbid use by well-behaved extensions
		if (!obj.forbidExtension) { obj.forbidExtension = 0; }

		if (!obj.desc) { obj.desc = "No information available"; }


		this.specialCargoRegister[obj.ID] = obj;
		if (!already) {
				this.specialCargoList.push(obj.ID); // easier to iterate over
		}

		this.debug("Registered cargo type: "+obj.ID);

}

// remove 1 TC of cargo from the hold
this.removeSpecialCargo = function(id) {
		
		var generic = this.specialCargoRegister[id].genericType;

		for(var j=0;j<this.specialCargoCarried[generic].length;j++) {		
				if (this.specialCargoCarried[generic][j].type == id) {
						if (this.specialCargoCarried[generic][j].quantity > 0) {
								this.specialCargoCarried[generic][j].quantity--;
								if (this.specialCargoCarried[generic][j].quantity == 0) {
										this.specialCargoCarried[generic].splice(j,1);
								}
								player.ship.manifest[generic]--;
								this.debug("Removed "+id+" in removeSpecialCargo");
								return true;
						}
				}
		}
		return false;
}

// add 1 TC of cargo to the hold
this.addSpecialCargo = function(id,origininfo) {
		if (player.ship.cargoSpaceAvailable == 0) {
				return false;
		}
		if (!this.specialCargoRegister[id]) {
				this.error("Error: Cargo type "+id+" not defined!");
				return false;
		}
		var generic = this.specialCargoRegister[id].genericType;

		var found = false;
		for(j=0;j<this.specialCargoCarried[generic].length;j++) {		
				if (this.specialCargoCarried[generic][j].type == id) {
						found = true;
						this.specialCargoCarried[generic][j].quantity++;
				}
		}
		if (!found) {
				var cargo = new Object;
				cargo.quantity = 1;
				cargo.type = id;
				if (origininfo) {
						cargo.origin = origininfo;
				} else {
						cargo.origin = "unknown origin";
				}
				this.specialCargoCarried[generic].push(cargo);
		}

		player.ship.manifest[generic]++;
//		this.debug("Added "+id);
		return true;
}

this.hasSpecialCargo = function(id) {
		if (!this.specialCargoRegister[id]) {
				return 0; // can't be carrying unregistered cargo
// well, okay, you could be, but the OXP shouldn't be asking if you've
// got any before it registers it...
		}
		var generic = this.specialCargoRegister[id].genericType;

		for(var j=0;j<this.specialCargoCarried[generic].length;j++) {		
				if (this.specialCargoCarried[generic][j].type == id) {
						return this.specialCargoCarried[generic][j].quantity;
				}
		}		
		return 0;
}

this.specialCargoesCarried = function() {
		var carried = new Array;
		for (var i=0;i<this.cargoTypes.length;i++) {
				var cblock = this.specialCargoCarried[this.cargoTypes[i]];
				for (var j=0;j<cblock.length;j++) {
						if (cblock[j].quantity > 0) {
								carried.push(cblock[j].type);
						}
				}
		}
		return carried;
}

this.marketCollapsed = function(good,galaxy,system) {
		return this.marketCollapsedID(good,(galaxy*256)+system);
}

this.importPermitLevel = function(good,quantity) {
		var score = 0;
		for (var k=0;k<this.permits.length;k++) {
				var permitlevel = worldScripts[this.permits[k]].checkImport(good,quantity,true);
				score += permitlevel;
		}
		return score;
}

this.exportPermitLevel = function(good,quantity) {
		var score = 0;
		for (var k=0;k<this.permits.length;k++) {
				var permitlevel = worldScripts[this.permits[k]].checkPermit(good,quantity,true);
				score += permitlevel;
		}
		return score;
}

this.importPermitDetails = function(good,quantity) {
		var score = new Array;
		for (var k=0;k<this.permits.length;k++) {
				var permitlevel = worldScripts[this.permits[k]].checkImport(good,quantity,true);
				score.push(permitlevel);
		}
		return score;
}

this.exportPermitDetails = function(good,quantity) {
		var score = new Array;
		for (var k=0;k<this.permits.length;k++) {
				var permitlevel = worldScripts[this.permits[k]].checkPermit(good,quantity,true);
				score.push(permitlevel);
		}
		return score;
}



this.extendableCargo = function(ctype) {
		return this.extendableCargoSeeded(ctype,0);
}

this.extendableCargoSeeded = function(ctype,seed) {
		var opts = new Array();
		
		for (var i=0;i<this.specialCargoList.length;i++) {
				var cargo = this.specialCargoRegister[this.specialCargoList[i]];
				if (ctype == "") {
						if (cargo.buySystems[galaxyNumber].indexOf(system.ID) !== -1 && !cargo.forbidExtension) {
								opts.push(this.specialCargoList[i]);
						}
				} else {
						if ((ctype == "any" || cargo.genericType == ctype) && !cargo.forbidExtension) {
								opts.push(this.specialCargoList[i]);
						}
				}
		}
		if (opts.length == 0) {
				return false;
		}
		if (seed == 0) {
				return opts[Math.floor(Math.random()*opts.length)];
		} else {
				return opts[Math.floor(this.weeklyChaosAux(seed)*opts.length)];
		}
}

this.localCargoData = function(goodid) {
		for (var i=0;i<this.specialCargoSystem.length;i++) {
				if (this.specialCargoSystem[i].type == goodid) {
						return [this.specialCargoSystem[i].quantity,this.specialCargoSystem[i].price];
				}
		}
		return [0,0];
}

this.controlledGood = function(good) {
		var details = this.specialCargoRegister[good];
		var illegality = details.illegal;
		if (details.genericType == "slaves" || details.genericType == "firearms") {
				illegality++;
		} else if (details.genericType == "narcotics") {
				illegality += 2;
		}
		return (illegality > 0);
}

this.systemImports = function(gal,sys) {
		var imports = new Array;
		for (var i=0;i<this.specialCargoList.length;i++) {
				var good = this.specialCargoList[i];
				if (this.specialCargoRegister[good].sellSystems[gal].indexOf(sys) >= 0) {
						imports.push(good);
				}
		}
		return imports;
}

this.systemExports = function(gal,sys) {
		var exports = new Array;
		for (var i=0;i<this.specialCargoList.length;i++) {
				var good = this.specialCargoList[i];
				if (this.specialCargoRegister[good].buySystems[gal].indexOf(sys) >= 0) {
						exports.push(good);
				}
		}
		return exports;
}

this.cargoDefinition = function(good,param) {
		if (this.specialCargoRegister[good]) {
				return this.specialCargoRegister[good][param];
		} else {
				this.debug(good+" not found in sCR");
				return false;
		}
}

this.cargoPriceExport = function(id,i,marketinfo) {
		var baseprice = this.genericPrice(this.specialCargoRegister[id].genericType,i);
		var chaos = i*100;
		var pricemod = 1+(this.specialCargoRegister[id].buyAdjust/100)+((this.weeklyChaos(chaos+1)-0.5)*this.specialCargoRegister[id].buyVariance/100);
		var price = Math.floor(baseprice*pricemod);
		price *= this.marketPriceFluctuations(id,"FLUX_EXPORT");
		price *= marketinfo.exportCargoPrice(id);
		return price;
}

this.cargoPriceImport = function(id,i,marketinfo) {
		var baseprice = this.genericPrice(this.specialCargoRegister[id].genericType,i);
		var chaos = i*100;
		if (this.marketCollapsed(id,galaxyNumber,system.ID)) {
				// might still make some profit on it, but not much
				var price = Math.floor(0.7+(0.6*this.weeklyChaos(chaos+16))*baseprice);
				this.debug("Collapsed: "+price);
		} else {
				var sa = (this.specialCargoRegister[id].sellAdjust/100);
				var sv = ((this.weeklyChaos(chaos+3)-0.5)*this.specialCargoRegister[id].sellVariance/100);
				var pricemod = 1+sa+sv;
				var distmod = this.distanceBonus(id,i);
				this.debug("Sale: "+baseprice+" * ("+pricemod+"("+sa+","+sv+") + "+distmod+") = "+(pricemod+distmod)+" => "+(baseprice*(pricemod+distmod))+" ?"+chaos);
				var price = 150+Math.floor(baseprice*(pricemod+distmod)); // add on 15 Cr. flat bonus so that Food / Textiles / Minerals are still worth trading.
		}
		price *= this.marketPriceFluctuations(id,"FLUX_IMPORT");
		this.debug("After flux: "+price);
		price *= marketinfo.importCargoPrice(id);
		this.debug("After station mod: "+price);
		
		return Math.floor(price);
}

this.cargoPriceMisc = function(id,i,marketinfo) {
		var baseprice = this.genericPrice(this.specialCargoRegister[id].genericType,i);
		var chaos = i*100;
		var price = Math.floor((1.5+(0.5*this.weeklyChaos(chaos+15)))*baseprice);
		var pricemod = 1+(this.specialCargoRegister[id].buyAdjust/200);
		price = price*pricemod;
		price *= this.marketPriceFluctuations(id,"FLUX_MISC");

		if (price < 1) {
				price = 1; // always at least 0.1 Cr.
		}
		return price;
}

this.cargoQuantityExport = function(id,i,marketinfo) {
		if (this.specialCargoRegister[id].buyQuantity < 0) {
				return 0;
		}
		var basequantity = this.genericQuantity(this.specialCargoRegister[id].genericType);
		var chaos = i*100;
		var quantmod = 1+(this.specialCargoRegister[id].buyQuantity/100)+(((this.weeklyChaos(chaos+5)*2)-1)*this.specialCargoRegister[id].buyAvailability/100);
		var quantity = basequantity*quantmod;
		if (quantity < 10) {
				quantity += 10;
		}
		quantity *= marketinfo.exportCargoAmount(id);
		if (this.marketCollapsed(id,galaxyNumber,system.ID)) {
				quantity /= 10;
		}
		return Math.floor(quantity);
}

this.cargoQuantityMisc = function(id,i,marketinfo) {
		var chaos = i*100;

		if (Math.floor(this.weeklyChaos(chaos+14)*100)<this.specialCargoRegister[id].salvageMarket*marketinfo.randomCargoChance(id)) {
				var basequantity = this.genericQuantity(this.specialCargoRegister[id].genericType);
				return 1+Math.floor(basequantity%marketinfo.randomCargoAmount(id)); // 1-n TC of a random good in stock
		} else {
				return 0; 
		}
}

this.addTraderNet = function(msg) {
		worldScripts["CargoTypeExtension-TraderNet"].addTraderNet(msg);
}

this.suspendPlayerManifest = function() {
		var ncmanifest = this.serialiseCargoCarried();
		this.resetCargoCarried();
		return "2|"+ncmanifest;
}

this.restorePlayerManifest = function(ncmanifest) {
		this.resetCargoCarried();
		return this.mergePlayerManifest(ncmanifest);
}

this.mergePlayerManifest = function(ncmanifest) {
		if (ncmanifest == "") {
				this.error("Warning: manifest format for merge/restore not recognised!");
				return false;
		}
		var ncms = ncmanifest.split("|");
		if (ncms[0] == "1") {
				this.unserialiseCargoCarried1(ncms[1]);
		} else if (ncms[0] == "2") {
				this.unserialiseCargoCarried2(ncms[1]);
		} else {
				this.error("Warning: manifest format for merge/restore not recognised!");
				return false;
		}

		return true;
}


this.defaultMarketInfo = function() {
		return worldScripts["CargoTypeExtension-DefaultMarket"];
}

this.checkImports = function(station) {
		if (station.isMainStation) { return true; }
		var marketinfo = this.getOXPMarket(station);
		if (!marketinfo) { return false; }
		return worldScripts[marketinfo].importPermitCheck();
}

this.checkExports = function(station) {
		if (station.isMainStation) { return true; }
		var marketinfo = this.getOXPMarket(station);
		if (!marketinfo) { return false; }
		return worldScripts[marketinfo].exportPermitCheck();
}

/* "Private" functions. May change at any time */

// A list of Worldscripts providing more interesting trade offers 
this.personalities = new Array;
this.permits = new Array;
this.pricefluxes = new Array;
this.oxpstations = new Object;
this.lastscreenchoice = null;

// only cover TC=sized for now
// matches the keys in Manifest
this.cargoTypes = ["food","textiles","radioactives","slaves","liquorWines","luxuries","narcotics","computers","machinery","alloys","firearms","furs","minerals","alienItems"];
// if any others added later, *add them to the end of the list*

this.initComplete = 0;
this.pointer = -1;

// copied straight out of commodities.plist
this.defaultCommodities = [         
		[ "Food", 0, 0, 19, -2, -2, 6, 1, 1, 0 ],
    [ "Textiles", 0, 0, 20, -1, -1, 10, 3, 3, 0 ],
    [ "Radioactives", 0, 0, 65, -3, -3, 2, 7, 7, 0 ],
    [ "Slaves", 0, 0, 40, -5, -5, 226, 31, 31, 0 ],
    [ "Liquor/Wines", 0, 0, 83, -5, -5, 251, 15, 15, 0 ],
    [ "Luxuries", 0, 0, 196, 8, 8, 54, 3, 3, 0 ],
    [ "Narcotics", 0, 0, 235, 29, 29, 8, 120, 120, 0 ],
    [ "Computers", 0, 0, 154, 14, 14, 56, 3, 3, 0 ],
    [ "Machinery", 0, 0, 117, 6, 6, 40, 7, 7, 0 ],
    [ "Alloys", 0, 0, 78, 1, 1, 17, 31, 31, 0 ],
    [ "Firearms", 0, 0, 124, 13, 13, 29, 7, 7, 0 ],
    [ "Furs", 0, 0, 176, -9, -9, 220, 63, 63, 0 ],
    [ "Minerals", 0, 0, 32, -1, -1, 53, 3, 3, 0 ],
		//                [ "Gold", 0, 0, 97, -1, -1, 66, 7, 7, 1 ],
		//                [ "Platinum", 0, 0, 171, -2, -2, 55, 31, 31, 1 ],
		//                [ "Gem-Stones", 0, 0, 45, -1, -1, 250, 15, 15, 2 ],
		[ "Alien Items", 0, 0, 53, 15, 0, 0, 7, 0, 0 ]
];


this.resetCargoCarried = function() {
		this.specialCargoCarried = new Object;
		for(var i=0;i<this.cargoTypes.length;i++) {
				this.specialCargoCarried[this.cargoTypes[i]] = new Array;
		}
}

// some of this Array storage is speed-inefficient for search but on
// the other hand we run out of storage memory long before that
// actually becomes a practical issue, and we only need to do the
// searches at natural pauses anyway, so...
this.startUp = function() {
		// types of special cargo available
		this.specialCargoRegister = new Object;
		this.specialCargoList = new Array;
		this.localbuyables = new Array;
		this.localsellables = new Array;

		// types of special cargo currently onboard. Ish.
		this.resetCargoCarried();
		// special cargo for sale in this system
		this.specialCargoSystem = new Array;
		// cargo currently affected by market catastrophes
		this.marketCatastrophes = new Array;

		this.unserialiseCargoData();

		delete this.startUp;
}


// serialisation format 1
// version|specialCargoCarried|specialCargoSystem|marketCatastrophes
// version|foodid=quant;...;.../textilesid=quant/...////.....|id=ct=price;...|id=sysid;...

this.marketCollapsedID = function(good,sysid) {
		for (var i=0;i<this.marketCatastrophes.length;i++) {
				if (this.marketCatastrophes[i].type == good && this.marketCatastrophes[i].system == sysid) {
						return true;
				}
		}
		return false;
}

this.serialiseCargoCarried = function() {
		var serial = "";
		for (i=0;i<this.cargoTypes.length;i++) {
				var generic = this.specialCargoCarried[this.cargoTypes[i]];
				for(j=0;j<generic.length;j++) {
						if (this.specialCargoRegister[generic[j].type]) {
// only save those that are still registered
								serial += generic[j].type+"="+generic[j].quantity+"="+generic[j].origin;
								if (j+1<generic.length) {
										serial += ";";
								}
						}
				}
				if (i+1<this.cargoTypes.length) {
						serial += "/";
				}
		}
		return serial;
}

this.serialiseCargoData = function() {
//    this.specialCargoCarried		
//    this.specialCargoSystem
//		this.marketCatastrophes
		var serial = "2|"; // version number

		serial += serialiseCargoCarried();

		serial += "|";
		for (i=0;i<this.specialCargoSystem.length;i++) {
				var c = this.specialCargoSystem[i];
				if (this.specialCargoRegister[c.type]) {
						serial += c.type+"="+c.quantity+"="+Math.floor(10*c.price);
						if (i+1<this.specialCargoSystem.length) {
								serial += ";";
						}
				}
		}
		serial += "|";
		for (i=0;i<this.marketCatastrophes.length;i++) {
				var catas = this.marketCatastrophes[i];
				if (this.specialCargoRegister[catas.type]) {
						// drop unregistered cargoes from the list
						serial += catas.type+"="+catas.system;
						if (i+1<this.marketCatastrophes.length) {
								serial += ";";
						}
				}
		}

		missionVariables.cargotypeextension_state = serial;
}

this.unserialiseCargoData = function() {
		if (!missionVariables.cargotypeextension_state) {
// first use
				this.debug("No serialised data, starting afresh");
// can't do this yet, because we have to wait for everything else to
// startUp and register the goods
				this.timer = new Timer(this,this.initialiseSystemMarket,0.25);
				return;
		}
		var serial = missionVariables.cargotypeextension_state;

		var svars = serial.split("|");
// make sure we can always load this data from previous versions
		if (svars[0] == "1") {
				this.unserialiseCargoData1(svars);
		} else if (svars[0] == "2") {
				this.unserialiseCargoData2(svars);
		} else {
// and do something sensible if we get given data from a later version
				log(this.name,"Error: "+svars[0]+" is not a recognised cargo data format");
				player.consoleMessage("Critical error decoding special cargo data. Please see Latest.log");
		}
}

this.unserialiseCargoCarried1 = function(cargodata) {
		this.unserialiseCargoCarried2(cargodata);
}

this.unserialiseCargoCarried2 = function(cargodata) {
		var gens = cargodata.split("/");
		for (var i=0;i<gens.length;i++) {
				var sclist = new Array;
				var specs = gens[i].split(";");
				if (specs[0] != "") {
						for (j=0;j<specs.length;j++) {
								var spcar = specs[j].split("=");
								var already = false;
								for (var k=0;k<this.specialCargoCarried[this.cargoTypes[i]].length;k++) {
										if (spcar[0] == this.specialCargoCarried[this.cargoTypes[i]][k].type) {
												this.debug(spcar[0]+" add quantity");
												this.specialCargoCarried[this.cargoTypes[i]][k].quantity += parseInt(spcar[1]);
												already = true;
												break;
										}
								}
								if (!already) {
										var canisters = new Object;
										canisters.type = spcar[0];
										canisters.quantity = parseInt(spcar[1]);
										if (spcar.length >= 3) {
												canisters.origin = spcar[2];
										} else {
												canisters.origin = "unknown origin";
										}
												this.debug(spcar[0]+" new");
										sclist.push(canisters);
								}
						}
				}
				this.specialCargoCarried[this.cargoTypes[i]] = this.specialCargoCarried[this.cargoTypes[i]].concat(sclist);
				this.debug(this.specialCargoCarried[this.cargoTypes[i]].length+" entries for "+this.cargoTypes[i]);
		}
}


this.unserialiseCargoData1 = function(svars) {
		// cargo hold
		this.unserialiseCargoCarried1(svars[1]);
		
		var syss = svars[2].split(";");
		var sysclist = new Array;
		if (syss[0] != "") {
				for (i=0;i<syss.length;i++) {
						var spcar = syss[i].split("=");
						var canisters = new Object;
						canisters.type = spcar[0];
						canisters.quantity = parseInt(spcar[1]);
						canisters.price = parseInt(spcar[2])/10;
						sysclist.push(canisters);
				}
		}
		this.specialCargoSystem = sysclist;

		var mcats = svars[3].split(";");
		var mcatlist = new Array;
		if (mcats[0] != "") {
				for (i=0;i<mcats.length;i++) {
						var mcatdata = mcats[i].split("=");
						mcat = new Object;
						mcat.type = mcatdata[0];
						mcat.system = parseInt(mcatdata[1]);
						mcatlist.push(mcat);
				}
		}
		this.marketCatastrophes = mcatlist;
}

this.unserialiseCargoData2 = function(svars) {
		// cargo hold
		
		this.unserialiseCargoCarried2(svars[1]);

		var gens = svars[1].split("/");
		for (var i=0;i<gens.length;i++) {
				var sclist = new Array;
				var specs = gens[i].split(";");
				if (specs[0] != "") {
						for (j=0;j<specs.length;j++) {
								var spcar = specs[j].split("=");
								var canisters = new Object;
								canisters.type = spcar[0];
								canisters.quantity = parseInt(spcar[1]);
								canisters.origin = spcar[2];
								sclist.push(canisters);
						}
				}
				this.specialCargoCarried[this.cargoTypes[i]] = sclist;
		}
		
		var syss = svars[2].split(";");
		var sysclist = new Array;
		if (syss[0] != "") {
				for (i=0;i<syss.length;i++) {
						var spcar = syss[i].split("=");
						var canisters = new Object;
						canisters.type = spcar[0];
						canisters.quantity = parseInt(spcar[1]);
						canisters.price = parseInt(spcar[2])/10;
						sysclist.push(canisters);
				}
		}
		this.specialCargoSystem = sysclist;

		var mcats = svars[3].split(";");
		var mcatlist = new Array;
		if (mcats[0] != "") {
				for (i=0;i<mcats.length;i++) {
						var mcatdata = mcats[i].split("=");
						mcat = new Object;
						mcat.type = mcatdata[0];
						mcat.system = parseInt(mcatdata[1]);
						mcatlist.push(mcat);
				}
		}
		this.marketCatastrophes = mcatlist;
}


// returns true for system list
this.isSystemList = function(arr) {
		if (!arr) { return false; }
		if (arr.length != 8) { this.debug("Wrong length: "+arr.length); return false; }
		for (i=0;i<8;i++) {
				for (j=0;j<arr[i].length;j++) {
						if (arr[i][j] < 0 || arr[i][j] > 255) {
								this.debug(arr[i][j]);
								return false; // invalid system ID
						}
				}
		}
		return true;
}

this.debug = function(msg) {
		log(this.name+".debug",msg); //comment out for release versions
		return false;
}
this.error = function(msg) {
		log(this.name,msg); 
		return false;
}


this.validateHold = function() {
		this.debug("Validating hold");
// if there isn't enough generic cargo of a particular type
// throw out special cargo entries of that type until there is
		for (i=0;i<this.cargoTypes.length;i++) {
				var totalspecial = 0;
				var totalgeneric = player.ship.manifest[this.cargoTypes[i]];
				for(j=0;j<this.specialCargoCarried[this.cargoTypes[i]].length;j++) {
						if (this.specialCargoRegister[this.specialCargoCarried[this.cargoTypes[i]][j].type]) {
								totalspecial += this.specialCargoCarried[this.cargoTypes[i]][j].quantity;
						} else { // no longer registered, make generic
// yes, we're modifying the array in the middle of the loop
// it works anyway
								this.specialCargoCarried[this.cargoTypes[i]].splice(j,1);
								j--;
						}
				}
				this.debug(this.cargoTypes[i]+": g="+totalgeneric+", s="+totalspecial);
				if (totalspecial > totalgeneric) {
						for (j=0;j<totalspecial-totalgeneric;j++) {
								this.destroySpecialCargo(this.cargoTypes[i]);
						}
				}
		}

}

// destroy 1 item of special cargo of a particular generic type
// mainly for if it gets dumped or destroyed in battle
// or sold on the general market
this.destroySpecialCargo = function(generictype) {
		var types = this.specialCargoCarried[generictype];
		var type = Math.floor(Math.random()*types.length);
		
		this.debug("Removed "+generictype);
		if (this.specialCargoCarried[generictype][type].quantity > 1) {
				this.specialCargoCarried[generictype][type].quantity--;
		} else {
				this.specialCargoCarried[generictype].splice(type,1);
		}
}

// give a pseudo-random number constant for the week, the system, and the salt
// range 0..1
this.weeklyChaos = function(salt) {
// salts 1-11,14-149 used so far
		var n = (salt*159217)+system.ID+(256*galaxyNumber)+(103*Math.floor((clock.days-2084000)/7));
		return this.weeklyChaosAux(n);
}

// RANROT (taken from native Oolite implementation)
this.weeklyChaosAux = function(n) {
		var high = (n & 0xFFFF0000) >> 16;
		var low = n & 0x0000FFFF;
		high = ((high << 8) + (high >> 8)) & 0x0000FFFF;
		high = (high+low) & 0x0000FFFF;
		low = high;
		high = ((high << 8) + (high >> 8)) & 0x0000FFFF;
		high = (high+low) & 0x0000FFFF;
		
		return high/65536.0;
}

// work in decicredits for most of the function, return credits
this.cargoPrice = function(id,i,marketinfo,quantity) {

		if (this.specialCargoRegister[id].buySystems[galaxyNumber].indexOf(system.ID) !== -1) { // source system
				var price = this.cargoPriceExport(id,i,marketinfo);
		} else {
				var isimport = (this.specialCargoRegister[id].sellSystems[galaxyNumber].indexOf(system.ID) != -1);
				if (isimport) {
						if (Math.random() > marketinfo.systemImportChance(id)) {
								isimport = false; // override import
						}
				} else {
						if (Math.random() < marketinfo.randomImportChance(id)) {
								isimport = true; // override no-import
						}
				}

				if (isimport) { // dest system
						var price = this.cargoPriceImport(id,i,marketinfo);
				} else { // nothing special
						// more expensive than base price, probably
						var price = this.cargoPriceMisc(id,i,marketinfo);
						if (quantity == 0) {
								price = Math.floor(price*(0.1+(0.4*Math.random())));
						}
				}
		}
		return price/10;
}


this.marketPriceFluctuations = function(good,context) {
		var basis = 1;
		for (var i=0;i<this.pricefluxes.length;i++) {
				basis *= worldScripts[this.pricefluxes[i]].priceChange(good,context);
		}
		if (basis != 1) {
				this.debug("Fluctuation API reports "+basis+" for "+good+" in "+context);
		}
		return basis;
}


this.routeSorter = function(a,b) {
		return system.info.distanceToSystem(System.infoForSystem(galaxyNumber,a)) - system.info.distanceToSystem(System.infoForSystem(galaxyNumber,b));
}

this.distanceBonus = function(id,j) {
		var chaos = j*100;
		var basicavail = this.specialCargoRegister[id].buySystems[galaxyNumber];
		var avail = basicavail.slice(0);
		avail.sort(this.routeSorter);
		// check the closest pairs first to minimise recalculation
		var distance = 150;
		for (var i=0;i<avail.length;i++) {
				var sysdist = system.info.distanceToSystem(System.infoForSystem(galaxyNumber,avail[i]));
				if (sysdist < distance) { // route calculation is really expensive
						var route = system.info.routeToSystem(System.infoForSystem(galaxyNumber,avail[i]));
						if (route && route.distance < distance) {
								distance = route.distance;
						}
				}
		}
		return Math.max(this.weeklyChaos(17+j),this.weeklyChaos(18+j))*distance*this.specialCargoRegister[id].sellDistance/100;
}

this.cargoQuantity = function(id,i,marketinfo) {
		if (this.specialCargoRegister[id].buySystems[galaxyNumber].indexOf(system.ID) != -1) { // source system
				return this.cargoQuantityExport(id,i,marketinfo);
		} else {
				return this.cargoQuantityMisc(id,i,marketinfo);
		}
}

this.genericPrice = function(generic,i) {
		var chaos = i*100;
		var commodity = this.defaultCommodities[this.cargoTypes.indexOf(generic)];
		var price = (commodity[3]+(Math.floor(256*this.weeklyChaos(chaos+7))&commodity[7])+(system.economy*commodity[4]))&255;
		return 10*Math.floor(price*0.4); // in decicredits
}
this.genericQuantity = function(generic) {
		var commodity = this.defaultCommodities[this.cargoTypes.indexOf(generic)];
		var quantity = (commodity[6]+(Math.floor(256*this.weeklyChaos(8))&commodity[8])-(system.economy*commodity[5]))&255;
		if (quantity > 127) { quantity = 0; }
		quantity &= 63;
		if (quantity <= 10) {
				quantity += 10; // adjust for systems where cargo is antieconomic in generic form
		}
		return quantity;
}

this.missionScreenOpportunity = function() {
// on docking or startup
// probably a little *too* frequent, but it should be a fairly fast
// function unless you're flying an Anaconda and taking lots of small
// packets of different sorts of special cargo
		if (this.initComplete == 0) {
				this._readyInterface(system.mainStation);
				this.initComplete = 1;
		}
		this.validateHold();		
}

this.guiScreenChanged = function(to,from) {
		if (from == "GUI_SCREEN_MARKET" && to != "GUI_SCREEN_MAIN") {
				// in case player sold some specific cargo as generic
				// since we can't yet stop them doing that
				this.validateHold();		
		} 
// replaced by interface in 1.77
/*		if (player.ship.dockedStation) {
				// F8 F8 F8 screen for main stations.
				if (player.ship.dockedStation.isMainStation && from == "GUI_SCREEN_CONTRACTS" && to == "GUI_SCREEN_MARKET" && guiScreen == "GUI_SCREEN_MARKET") {
						this.startTrading();
						// for OXP stations, F2 F8
				} else if (player.ship.dockedStation.script.newCargoesMarket && from == "GUI_SCREEN_OPTIONS" && to == "GUI_SCREEN_MARKET" && guiScreen == "GUI_SCREEN_MARKET") {
						this.startTrading();
				}
		} */
}

this.shipWillExitWitchspace = function() {
		if (!system.isInterstellarSpace) {
				this.initialiseSystemMarket();
		}
}

this.getOXPMarket = function(station) {
		this.debug("Checking "+station.primaryRole);
		var oxpmarket = this.oxpstations[station.primaryRole];
		if (!oxpmarket) { 
				for (var i=0;i<station.roles.length;i++) {
						this.debug("No primary: checking "+station.roles[i]);
						oxpmarket = this.oxpstations[station.roles[i]];
						if (oxpmarket) {
								this.debug("Found secondary role");
								break;
						}
				}
				if (!oxpmarket) {
						this.debug("Station not supported");
						return false; 
				}
		} // station not supported
		return oxpmarket;
}

this.shipWillDockWithStation = function(station) {
		this.debug("Checking station market");
		if (station.isMainStation) { return; } // not main stations
		this.debug("Is OXP station");
		if (station.script.newCargoesMarket) { return; } // already defined
		var oxpmarket = this.getOXPMarket(station);
		if (oxpmarket) {
				this.initialiseOXPStation(station,oxpmarket);
		}
}

this.shipWillLaunchFromStation = function(station) {
		this.today = clock.days;
		this.oreprocessorcompat = false;

		this.oldmanifest = new Array;
		for (var i=0;i<this.cargoTypes.length;i++) {
				this.oldmanifest.push(manifest[this.cargoTypes[i]]);
		}

		if (this.checkExports(station)) {
				var penalty = this.basicLegalPenalty();
				var specpenalty = this.specialLegalPenalty();

				// they might not always inspect the hold thoroughly
				if (penalty > (Math.random()*30)-(system.government*4)) {
						penalty += specpenalty;
				} else if (specpenalty < 0) {
						// but presumably they'll be encouraged to if it's a benefit!
						penalty += specpenalty;
				}

				this.debug("Old Bounty: "+player.bounty);
				this.debug("Penalty: "+penalty+" (inc "+specpenalty+")");
				if (penalty > 0) {
						// apply legal status penalties
						if (player.setBounty) {
								player.setBounty(player.bounty | penalty,"illegal exports");
						} else {
								player.bounty |= penalty;
						}
				}
				this.debug("New Bounty: "+player.bounty);
		}
}

this.basicLegalPenalty = function() {
// duplicates the effects of the stock illegal_goods.plist, which is
// nullified by this OXP so that we can do more interesting things
		return player.ship.manifest.slaves+player.ship.manifest.firearms+(2*player.ship.manifest.narcotics);
}

this.specialLegalPenalty = function() {
		penalty = 0;
		for (var i=0;i<this.cargoTypes.length;i++) {
				var cblock = this.specialCargoCarried[this.cargoTypes[i]];
				for (var j=0;j<cblock.length;j++) {
						var illegal = this.specialCargoRegister[cblock[j].type].illegal;

						for (var k=0;k<this.permits.length;k++) {
								var permitlevel = worldScripts[this.permits[k]].checkPermit(cblock[j].type,cblock[j].quantity,false);
								this.debug("Permits for "+cblock[j].type+" = "+permitlevel);
								illegal += permitlevel;
						}

						if (illegal != 0) {
								penalty += cblock[j].quantity*illegal;
						}
				}
		}
		return penalty;
}

this.importPenalty = function() {
		penalty = 0;
		for (var i=0;i<this.cargoTypes.length;i++) {
				var cblock = this.specialCargoCarried[this.cargoTypes[i]];
				for (var j=0;j<cblock.length;j++) {
						var illegal = this.specialCargoRegister[cblock[j].type].illegal;

						for (var k=0;k<this.permits.length;k++) {
								var permitlevel = worldScripts[this.permits[k]].checkImport(cblock[j].type,cblock[j].quantity,false);
								this.debug("Imports for "+cblock[j].type+" = "+permitlevel);
								illegal += permitlevel;
						}

						if (illegal != 0) {
								penalty += cblock[j].quantity*illegal;
						}
				}
		}
		return penalty;
}

// Fixes: http://aegidian.org/bb/viewtopic.php?p=168462#p168462
this.shipScoopedOther = function(whom) {
		// don't assign special cargo flags to alloys and radioactives
		// from the ore processor
		if (worldScripts.oreProcessor && (player.ship.equipmentStatus("EQ_ORE_PROCESSOR") == "EQUIPMENT_OK" || player.ship.equipmentStatus("EQ_ORE_PROCESSOR") == "EQUIPMENT_DAMAGED")) {
				if (whom.scriptInfo && whom.scriptInfo.cargotype && (whom.scriptInfo.cargotype.toLowerCase() == "alloys" || whom.scriptInfo.cargotype.toLowerCase() == "radioactives")) {
						this.oreprocessorcompat = true;
						// or any other alloys or radioactives scooped on the same
						// trip; it's a lot of trouble to distinguish them.
				}
		}
}

this._readyInterface = function(station) {
		if (station.script.newCargoesMarket || station.isMainStation)
		{
				station.setInterface(worldScripts["CargoTypeExtension"].name,
														 {title:"Speciality cargo trading",
															category:"Commerce",
															summary:"Trade in a range of speciality cargoes, view your current hold, and read the latest trade news",
															callback:worldScripts["CargoTypeExtension"].startTrading,
															cbThis:worldScripts["CargoTypeExtension"]
														 });
		}
}

this.shipDockedWithStation = function(station) {
		this.updateMarketCatastrophes();
		this._readyInterface(station);

		// do this before checking scooped goods. 
		if (this.checkImports(station)) {
				var specpenalty = this.importPenalty();

				// they might not always inspect the hold thoroughly
				if (specpenalty > (Math.random()*30)-(system.government*4) && specpenalty > 0) {
						// apply legal status penalties
						this.debug("Illegal imports detected!");
						
						if (player.setBounty) {
								player.setBounty(player.bounty | specpenalty,"illegal imports");
						} else {
								player.bounty |= specpenalty;
						}
				}
		}

// if scooped up goods
		for (var i=0;i<this.cargoTypes.length;i++) {
				if (this.oreprocessorcompat && (i == 2 || i == 9)) {
						// if the ore processor has run, assume that
						// alloys and radioactives came from that
						continue;
				}
				var delta = manifest[this.cargoTypes[i]]-this.oldmanifest[i];
				this.debug(this.cargoTypes[i]+" delta="+delta);
				if (delta > 0 && Math.random() < 0.15) {
						// then have a random chance that the new goods of that type are specific 
						var patience = 20;
						do {
								var good = this.specialCargoRegister[this.specialCargoList[Math.floor(Math.random()*this.specialCargoList.length)]];
								patience--;
						} while (good.genericType != this.cargoTypes[i] && patience > 0); 
						if (good.genericType == this.cargoTypes[i]) {

								if (!this.hasSpecialCargo(good.ID)) {
										var cargo = new Object;
										cargo.quantity = delta;
										cargo.type = good.ID;
										cargo.origin = "scooped in "+system.info.name;
										this.specialCargoCarried[good.genericType].push(cargo);
								} else {
										for(j=0;j<this.specialCargoCarried[good.genericType].length;j++) {		
												if (this.specialCargoCarried[good.genericType][j].type == good.ID) {
														this.specialCargoCarried[good.genericType][j].quantity += delta;
												}
										}
								}
								player.consoleMessage("You scooped "+delta+" TC of "+good.specificType+" ("+this.genericName(good.genericType)+")",10);

						}
				}
		}
		this.oreprocessorcompat = false;
		this.validateHold(); // needed to guarantee compatibility with IGT
}

this.updateMarketCatastrophes = function() {
		var delta = clock.days - this.today;
		for (var i=0;i<delta;i++) {
				var len = this.specialCargoList.length;
				for (var j=0;j<len;j++) {
						var good = this.specialCargoRegister[this.specialCargoList[j]];
						// depress
						if (100*Math.random() < good.slump) {
								this.debug("Depressing "+good.ID);
								this.depressGood(good);
// slump takes priority over recovery for any particular good
						} else if (100*Math.random() < good.unslump) {
								this.debug("Recovering "+good.ID);
								this.undepressGood(good.ID);
						}
				}
		}
}

this.flattenSystemList = function(syslist) {
		var flatlist = new Array;
		for (var i=0;i<8;i++) {
				for (var j=0;j<syslist[i].length;j++) {
						flatlist.push((i*256)+syslist[i][j]);
				}
		}
		return flatlist;
}

this.depressGood = function(good) {
		if (Math.random() < 0.33) {
				var flatlist = flattenSystemList(good.buySystems);
		} else {
				var flatlist = flattenSystemList(good.sellSystems);
		}
		var sysid = flatlist[Math.floor(Math.random()*flatlist.length)];
		this.depressGoodHere(good.ID,sysid);
}

this.depressGoodHere = function(goodid,sysid) {
		if (this.marketCatastrophes) {
				if (!this.marketCollapsedID(goodid,sysid)) {
						var slump = new Object;
						slump.type = goodid;
						slump.system = sysid;
						this.marketCatastrophes.push(slump);
				}
		}
}

this.undepressGood = function(good) {
		if (this.marketCatastrophes) {
				for (var i=0;i<this.marketCatastrophes.length;i++) {
						if (this.marketCatastrophes[i].type == good) {
								this.marketCatastrophes.splice(i,1);
								return;
						}
				}
		}
}

this.initialiseSystemMarket = function() {
		var newmarket = new Array;
		this.localbuyables = new Array;
		this.localsellables = new Array;
		var defaultmarket = this.defaultMarketInfo();
		for (var i=0;i<this.specialCargoList.length;i++) {
				var id = this.specialCargoList[i];
				var good = this.specialCargoRegister[id];
				if (good.buySystems[galaxyNumber].indexOf(system.ID) !== -1) {
						this.localbuyables.push(id);
				} 
				if (good.sellSystems[galaxyNumber].indexOf(system.ID) !== -1) {
						this.localsellables.push(id);
				} 
				var marketentry = new Object;
				marketentry.type = id;
				marketentry.quantity = this.cargoQuantity(id,i,defaultmarket);
				marketentry.price = this.cargoPrice(id,i,defaultmarket,marketentry.quantity);
				
				if (marketentry.price < 0.1) {
// cap minimum price
						marketentry.price = 0.1;
				}
				this.debug("Set price for "+id+" to "+marketentry.price+" with "+marketentry.quantity+" TC available");
				newmarket.push(marketentry);
		}
		this.specialCargoSystem = newmarket;
}

this.playerWillSaveGame = function(savetype) {
		this.serialiseCargoData();
}


/* 
* Init = (show manifest) buy special / sell special / exit
* Buy = buy 1 / buy 10 / buy all(ish) / next item in stock / back to init
* Sell = sell 1 / sell 10 / sell all / next item in hold / back to init
* Wanted = (view wanted items for system) next / back to init
*/

this.startTrading = function() {
		var choices = "cte_initscreenchoice";
		if (missionVariables.cargotypeextension_tradernet && missionVariables.cargotypeextension_tradernet >= clock.days) {
				choices = "cte_initscreenchoice_wtn";
		}

		mission.runScreen({
				title: "Specialist Trade Goods Market",
				message: this.showManifest(),
				background: "cte_containers.png",
				choicesKey: choices
		},
											this.initScreenChoice,this);
		
}

this.genericName = function(type) {
		if (type == "liquorWines") {
				return expandDescription("[commodity-name liquor/wines]");
		} else if (type == "alienItems") {
				return expandDescription("[commodity-name alien items]");
		} else if (type == "gemStones") { // not used
				return expandDescription("[commodity-name gem-stones]");
		} else {
				return expandDescription("[commodity-name "+type+"]");
		}
}

this.showManifest = function() {
		var manstr = "";
		var lines = 0;
		var maxlines = 9;
		for (var i=0;i<this.cargoTypes.length;i++) {
				var mblock = this.specialCargoCarried[this.cargoTypes[i]];
				for (var j=0;j<mblock.length;j++) {
						cargo = this.specialCargoRegister[mblock[j].type];
						lines++;
						if (lines <= maxlines) {
								manstr += cargo.specificType+" ("+mblock[j].quantity+" TC, "+this.genericName(cargo.genericType)+")\n";
						}
				}
		}
		if (lines > maxlines) {
				manstr += "...and "+(lines-maxlines)+" more (see detailed manifest).\n";
		}
		if (manstr == "") {
				manstr = "No special cargo\n";
		}
		manstr += "\n"+this.holdStatus();
		return manstr;
}

this.initScreenChoice = function(choice) {
		if (player.ship.dockedStation.isMainStation) {
				this.stationMarket = this.specialCargoSystem;
		} else {
				this.stationMarket = player.ship.dockedStation.script.newCargoesMarket;
		}
		if (choice == "01_BUY") {
				this.startBuying();
		} else if (choice == "02_SELL") {
				this.startSelling();
		} else if (choice == "03_WANTED") {
				this.gatherInformation();
		} else if (choice == "04_TRADERS") {
				this.tradefloorpointer = 0;
				this.tradeFloor();
		} else if (choice == "05_MANIFEST") {
				this.dmanoffset = 0;
				this.detailedManifest();
		} else if (choice == "06_PERMITS") {
				this.permitListing();
		} else if (choice == "07_TRADERNET") {
				this.tradernetpointer = 1;
				this.readTraderNet();

		} else {
				// quit
		}
}

this.startBuying = function() {
		this.moveBuyPointer();
		if (this.pointer == -1) {
				this.showNoBuyScreen();
		} else {
				this.showBuyScreen();
		}
}

this.startSelling = function() {
		this.holdgoods = this.specialCargoesCarried(); 
		this.moveSellPointer();
		if (this.pointer == -1) {
				this.showNoSellScreen();
		} else {
				this.showSellScreen();
		}
}

this.showNoBuyScreen = function() {
		mission.runScreen({
				title: "Buy Specialist Trade Goods",
				background: "cte_containers.png",
				message: "No specialist trade goods available for purchase"
		},
											this.startTrading,this);
		
}

this.showBuyScreen = function() {
		var goods = this.stationMarket[this.pointer];
		
		mission.runScreen({
				title: "Buy "+this.specialCargoRegister[goods.type].specificType,
				background: "cte_containers.png",
				message: this.buyMessage(goods),
				choicesKey: "cte_buyscreenchoice",
				initialChoicesKey: this.lastscreenchoice
		},
											this.handleBuyDecision,this);
}

this.holdStatus = function() {
		return "Hold: "+player.ship.cargoSpaceUsed+"/"+player.ship.cargoSpaceCapacity+" TC used\nCredits: "+player.credits.toFixed(1)+" ₢";
}

this.buyMessage = function(goods) {
		var details = this.specialCargoRegister[goods.type];
		var message = "On offer: "+goods.quantity+" TC @ "+goods.price.toFixed(1)+"₢/TC\n";
		message += details.specificType+" ("+this.genericName(details.genericType)+")\n";
		message += details.desc+"\n";
		if (this.controlledGood(goods.type)) {
				message += "WARNING: This is a controlled commodity\n";
		}

		message += "Currently carried: "+this.hasSpecialCargo(goods.type)+" TC\n";

		message += "\n"+this.holdStatus();

		return message;
}

this.handleBuyDecision = function(choice) {
		this.lastscreenchoice = choice;
		if (choice == "09_EXIT") {
				this.startTrading();
		} else if (choice == "00_NEXT") {
				this.moveBuyPointer();
				if (this.pointer == -1) {
						this.showNoBuyScreen();
				} else {
						this.showBuyScreen();
				}
		} else {
				if (choice == "01_BUY1") {
						this.attemptPurchase(this.pointer,1);
				} else if (choice == "02_BUY10") {
						this.attemptPurchase(this.pointer,10);
				} else if (choice == "03_BUY100") {
						this.attemptPurchase(this.pointer,100);
				}
				this.showBuyScreen();
		}
}

this.attemptPurchase = function(pointer,quantity) {
		var bought = 0;
		var fail = "";
		var goods = this.stationMarket[pointer];
		this.debug(goods);
		for (var i=1;i<=quantity;i++) {
				if (player.credits >= goods.price) {
						if (goods.quantity > 0) {
								var attempt = this.addSpecialCargo(goods.type,goods.price.toFixed(1)+"₢ in "+system.info.name);
								if (attempt) {
										player.credits -= goods.price;
										bought++;
										goods.quantity--;
										if (Math.random() < 0.01) {
// less likely to run out the supply by buying than to saturate by selling
												this.depressGoodHere(goods.type,system.ID);
										}
								} else {
										fail = "No room in hold";
										break;
								}
						} else {
								fail = "No goods available";
								break;
						}
				} else {
						fail = "Insufficient funds";
						break;
				}
		}
		if (bought > 0) {
				player.consoleMessage("Bought "+bought+" TC",2);
		} else {
				player.consoleMessage("Could not buy: "+fail,3);
		}
}

this.moveBuyPointer = function() {
		if (this.pointer >= 0) {
				var last = this.pointer;
		} else {
				var last = 0;
				this.pointer = 0;
		}
		if (this.stationMarket.length > 0) {
				do {
						this.pointer++;
						if (this.pointer >= this.stationMarket.length) {
								this.pointer = 0;
						}
						if (this.stationMarket[this.pointer].quantity > 0) {
								this.debug("Pointer: "+this.pointer);
								return;
						}
				} while (this.pointer != last); // then no cargo in stock
		}
		this.debug("Pointer: -1");
		this.pointer = -1;
}

this.moveSellPointer = function() {
		if (this.pointer >= 0 && this.pointer < this.holdgoods.length) {
				var last = this.pointer;
		} else {
				var last = 0;
				this.pointer = 0;
		}
		if (this.holdgoods.length > 0) {
				do {
						this.pointer++;
						if (this.pointer >= this.holdgoods.length) {
								this.pointer = 0;
						}
						if (this.hasSpecialCargo(this.holdgoods[this.pointer]) > 0) {
								this.debug("Pointer: "+this.pointer);
								return;
						}
				} while (this.pointer != last); // then no cargo in hold
		}
		this.debug("Pointer: -1");
		this.pointer = -1;
}


this.showNoSellScreen = function() {
		mission.runScreen({
				background: "cte_containers.png",
				title: "Sell Specialist Trade Goods",
				message: "No specialist trade goods in hold"
		},
											this.startTrading,this);
}

this.showSellScreen = function() {
		
		var goods = this.holdgoods[this.pointer];
		
		mission.runScreen({
				background: "cte_containers.png",
				title: "Sell "+this.specialCargoRegister[goods].specificType,
				message: this.sellMessage(goods),
				choicesKey: "cte_sellscreenchoice",
				initialChoicesKey: this.lastscreenchoice
		},
											this.handleSellDecision,this);
}

this.marketIndex = function(market, goods) {
		for (var i=0;i<market.length;i++) {
				if (market[i].type == goods) {
						return i;
				}
		}
		return -1;
}

this.sellMessage = function(goods) {
		var localmarket = this.stationMarket[this.marketIndex(this.stationMarket,goods)];

		var details = this.specialCargoRegister[goods];
		var message = "In hold: "+this.hasSpecialCargo(goods)+" TC\n";
		message += details.specificType+" ("+this.genericName(details.genericType)+")\n";
		message += details.desc+"\n";
		if (details.illegal > 0) {
				message += "WARNING: This is a controlled commodity\n";
		}

		message += "Currently on market: "+localmarket.quantity+" TC @ "+localmarket.price.toFixed(1)+" ₢/TC\n";

		message += "\n"+this.holdStatus();

		return message;
}

this.handleSellDecision = function(choice) {
		this.lastscreenchoice = choice;
		if (choice == "09_EXIT") {
				this.startTrading();
		} else if (choice == "00_NEXT") {
				this.moveSellPointer();
				if (this.pointer == -1) {
						this.showNoSellScreen();
				} else {
						this.showSellScreen();
				}
		} else {
				if (choice == "01_SELL1") {
						this.attemptSale(this.pointer,1);
				} else if (choice == "02_SELL10") {
						this.attemptSale(this.pointer,10);
				} else if (choice == "03_SELL100") {
						this.attemptSale(this.pointer,100);
				}
				this.showSellScreen();
		}
}

this.attemptSale = function(pointer,quantity) {
		var sold = 0;
		var fail = "";
		var goods = this.holdgoods[pointer];
		this.debug(goods);
		var localmarket = this.stationMarket[this.marketIndex(this.stationMarket,goods)];
		for (var i=1;i<=quantity;i++) {
				var attempt = this.removeSpecialCargo(goods);
				if (attempt) {
						player.credits += localmarket.price;
						sold++;
						localmarket.quantity++;
// put too much on the market, and it'll need to recover.
// won't affect immediate pricing
						if (Math.random() < 0.1) {
								this.depressGoodHere(localmarket.type,system.ID);
						}
				} else {
						fail = "No goods in hold";
						break;
				}
		}
		if (sold > 0) {
				player.consoleMessage("Sold "+sold+" TC",2);
		} else {
				player.consoleMessage("Could not sell: "+fail,3);
		}
}

this.gatherInformation = function() {
		mission.runScreen({title: "Local imports/exports",
											 background: "cte_tradefloor.png",
											 message: this.localTradeGoods()},
											this.gatherInformation2,this);
}

this.gatherInformation2 = function() {
		mission.runScreen({title: "Gossip in the trade district",
											 background: "cte_tradefloor.png",
											 message: this.localGossip()},
											this.startTrading,this);
}

this.localTradeGoods = function() {
		var msg = "Major exports of %H\n--------------------------\n";
		var exports = systemExports(galaxyNumber,system.ID);
		if (exports.length == 0) {
				msg += "None";
		} else {
				for (var i=0;i<exports.length;i++) {
						if (i != 0) {
								msg += ", ";
						}
						msg += this.cargoDefinition(exports[i],"specificType");
				}
		}
		msg += "\n\n";
		msg += "Major imports of %H\n--------------------------\n";
		var imports = systemImports(galaxyNumber,system.ID);
		if (imports.length == 0) {
				msg += "None";
		} else {
				for (var i=0;i<imports.length;i++) {
						if (i != 0) {
								msg += ", ";
						}
						msg += this.cargoDefinition(imports[i],"specificType");
				}
		}
		
		return expandDescription(msg);
}

this.localGossip = function() {
		var l = this.specialCargoList.length;
		var goods = new Array;
		for (var i=0;i<=12;i++) {
				var chaos = 20+(10*i);
				if ((i==0 || i==2 || i==4) && this.localbuyables.length > 0) {
						goods.push(this.localbuyables[Math.floor(this.localbuyables.length*this.weeklyChaos(chaos))]);
				} else if ((i==1 || i==3 || i==5) && this.localsellables.length > 0) {
						goods.push(this.localsellables[Math.floor(this.localsellables.length*this.weeklyChaos(chaos))]);
						this.debug(this.localsellables.length+" "+this.weeklyChaos(chaos));
				} else {
						goods.push(this.specialCargoList[Math.floor(l*this.weeklyChaos(chaos))]);
				}
		}
		var gossip = new Array;
		for (var i=0;i<=12;i++) {
				var chaos = 21+(10*i);
				this.debug(goods[i]);
				var good = this.specialCargoRegister[goods[i]];
				if ((good.buySystems[galaxyNumber].length == 0 && good.sellSystems[galaxyNumber].length == 0) || good.sourceRumour < 0 || good.destRumour < 0) {
						// no rumour
				} else {
//						this.debug(good.buySystems[galaxyNumber].length+" "+good.sellSystems[galaxyNumber].length);
						var sourcesys = Math.floor(this.weeklyChaos(chaos)*256);
						if (good.sourceRumour > this.weeklyChaos(chaos+1)*100) {
								if (good.buySystems[galaxyNumber].length == 0) {
										sourcesys = -1;
								} else {
//										this.debug(good.buySystems[galaxyNumber][0]);
										sourcesys = good.buySystems[galaxyNumber][Math.floor(good.buySystems[galaxyNumber].length*this.weeklyChaos(chaos+2))];
								}
						}

						var destsys = Math.floor(this.weeklyChaos(chaos+3)*256);
						if (good.destinationRumour > this.weeklyChaos(chaos+4)*100) {
								if (good.sellSystems[galaxyNumber].length == 0) {
										destsys = -1;
								} else {
										destsys = good.sellSystems[galaxyNumber][Math.floor(good.sellSystems[galaxyNumber].length*this.weeklyChaos(chaos+5))];
								}
						}
//						this.debug(sourcesys+";"+destsys);
						
						gossip.push(expandDescription("* [cte_rumour"+Math.floor(this.weeklyChaos(chaos+6)*10)+"]",
																				{cte_good: good.specificType,
																				 cte_source: this.tradeSystemName(sourcesys),
																				 cte_dest: this.tradeSystemName(destsys)}));
				}

		}				
		if (this.marketCatastrophes.length > 0) {
				for (var i=1;i<=3;i++) {
						var catas = this.marketCatastrophes[Math.floor(this.marketCatastrophes.length*this.weeklyChaos(9*i))];
						if (Math.floor(catas.system/256) == galaxyNumber) {
								var good = this.specialCargoRegister[catas.type];
								if (good) { // might have been deleted after it collapsed
										if (good.sellSystems[galaxyNumber].indexOf(catas.system&255) !== -1) {
												gossip.push(expandDescription("* [cte_collapserumour"+Math.floor(this.weeklyChaos(10*i)*6)+"]",
																										{cte_good: good.specificType, 
																										 cte_collapse: this.tradeSystemName(catas.system & 255)}));
										} else { // assume an exporter. Not strictly wrong if not ;)
												gossip.push(expandDescription("* [cte_shortagerumour"+Math.floor(this.weeklyChaos(10*i)*3)+"]",
																										{cte_good: good.specificType, 
																										 cte_collapse: this.tradeSystemName(catas.system & 255)}));
										}
								}
						}
				}
		}

		for (var i=0;i<this.personalities.length;i++) {
				this.debug("Checking gossip personality "+i);
				if (worldScripts[this.personalities[i]].traderGossip) {
						var tradenews = worldScripts[this.personalities[i]].traderGossip();
						if (tradenews) {
								this.debug("Got gossip personality "+i);
								gossip.push(tradenews);
						}
				}
		}
		for (var i=0;i<this.permits.length;i++) {
				this.debug("Checking gossip permit "+i);
				if (worldScripts[this.permits[i]].permitGossip) {
						var tradenews = worldScripts[this.permits[i]].permitGossip();
						if (tradenews) {
								this.debug("Got gossip permit "+i);
								gossip.push(tradenews);
						}
				}
		}
		for (var i=0;i<this.pricefluxes.length;i++) {
				this.debug("Checking gossip priceflux "+i);
				if (worldScripts[this.pricefluxes[i]].priceGossip) {
						var tradenews = worldScripts[this.pricefluxes[i]].priceGossip();
						if (tradenews) {
								this.debug("Got gossip prices "+i);
								gossip.push(tradenews);
						}
				}
		}
		var stationsused = new Array;
		for (var role in this.oxpstations) {
				if (stationsused.indexOf(this.oxpstations[role]) == -1) {
						var tradenews = worldScripts[this.oxpstations[role]].stationGossip();
						if (tradenews) {
								this.debug("Got gossip station "+i);
								gossip.push(tradenews);
						}
						stationsused.push(this.oxpstations[role]);
				}
		}

		gossip.sort(function(a,b) {return Math.random()-0.5;});
		if (gossip.length > 18) {
				gossip.length = 18; // truncate array
		}

		return gossip.join("\n");
}

this.tradeSystemName = function(sysid) {
		if (sysid >= 0 && sysid <= 255) {
				return System.systemNameForID(sysid);
		} else {
				return "another galaxy";
		}
}

this.tradeFloor = function() {
		var choice = "cte_tradefloorchoice";
		this.debug("Building trade floor");
		var traders = new Array;
		var srole = "";
		if (player.ship.dockedStation != system.mainStation) {
				var srole = player.ship.dockedStation.primaryRole;
		}
		for (var i=0;i<this.personalities.length;i++) {
				if (worldScripts[this.personalities[i]].traderHere && worldScripts[this.personalities[i]].traderHere(srole)) {
						traders.push(this.personalities[i]);
						this.debug(this.personalities[i]+" is present");
				}
		}
		if (traders.length == 0) {
				this.tradeflooractive = 0;
				mission.runScreen({title: "No-one about",
													 background: "cte_tradefloor.png",
													 message: "The trade floor is deserted."},
													this.startTrading,this
												 );						
		} else {
				if (traders.length == 1) {
						choice = "cte_tradeflooronlychoice";
				} 
				this.tradeFloorEncounter(traders[this.tradefloorpointer%traders.length],choice);
		}

}

this.tradeFloorEncounter = function(traderscript,choice) {
		var title = worldScripts[traderscript].traderName();
		var desc = worldScripts[traderscript].traderDesc();
		
		this.traderscript = traderscript;
		mission.runScreen({title: title,
											 background: "cte_tradefloor.png",
											 message: desc,
											 choicesKey: choice},this.tradeFloorChoice,this);

}

this.tradeFloorChoice = function(choice) {

		if (choice == "09_EXIT") {
				this.tradeflooractive = 0;
				this.startTrading();
		} else if (choice == "02_TALK") {
				worldScripts[this.traderscript].runOffer();
				this.tradefloorpointer++;
		} else {
				this.tradefloorpointer++;
				this.tradeFloor();
		}
}

this.detailedManifest = function() {
		var manlines = this.detailedManifestLines();
		var maxlines = 15;
		if (manlines.length <= maxlines) {
				mission.runScreen({title: "Detailed Manifest",
													 background: "cte_containers.png",
													 message: this.viewDetailedManifest(manlines,0,maxlines),
													 choicesKey: "cte_manifestlast"},
													this.startTrading,this);
		} else {
				var pages = 1+Math.floor((manlines.length-1)/maxlines);
				var cpage = 1+Math.floor((this.dmanoffset)/maxlines);
				var fn = this.startTrading;
				var choice = "cte_manifestlast";
				if (this.dmanoffset+maxlines < manlines.length) {
						fn = this.detailedManifest;
						var choice = "cte_manifestnext";
				} 
				mission.runScreen({title: "Detailed Manifest ("+cpage+"/"+pages+")",
													 background: "cte_containers.png",
													 message: this.viewDetailedManifest(manlines,this.dmanoffset,maxlines),
													 choicesKey: choice},
													fn,this);
				
				this.dmanoffset += maxlines;
		}
}

this.detailedManifestLines = function() {
		var manlines = new Array;
		for (var i=0;i<this.cargoTypes.length;i++) {
				var mblock = this.specialCargoCarried[this.cargoTypes[i]];
				for (var j=0;j<mblock.length;j++) {
						cargo = this.specialCargoRegister[mblock[j].type];
						var manstr = mblock[j].quantity+" TC "+cargo.specificType+", "+mblock[j].origin;
						var market = this.stationMarket[this.marketIndex(this.stationMarket,mblock[j].type)];
						manstr += ", local market: "+market.quantity+"TC @ "+market.price.toFixed(1)+"₢/TC";
						manlines.push(manstr);
				}
		}
		return manlines;
}

this.viewDetailedManifest = function(manlines,offset,maxlines) {
		var manstr = "";
		if (manlines.length == 0) {
				manstr = "No interesting cargo in hold.";
		} else {
				var manslice = manlines.slice(offset,offset+maxlines-1);
				manstr = manslice.join("\n");
		}
		return manstr;
}

this.permitListing = function() {
		var msg = "";
		for (var k=0;k<this.permits.length;k++) {
				this.debug("Trying "+this.permits[k]);
				msg += worldScripts[this.permits[k]].describePermits();
		}
		for (var k=0;k<this.personalities.length;k++) {
				this.debug("Trying "+this.personalities[k]);
				msg += worldScripts[this.personalities[k]].describeContracts();
		}

		if (msg == "") {
				msg = "You have no permits or active contracts, and no local regulations apply to trading.";
		}
		mission.runScreen({title: "Permits, Contracts and Regulations",
											 background: "cte_permit.png",
											 message: msg},
											this.startTrading,this);

}

this.defaultMarketInfo = function() {
		return worldScripts["CargoTypeExtension-DefaultMarket"];
}

this.initialiseOXPStation = function(station,marketinfokey) {
		if (station.script.newCargoesMarket) {
				return;
		}
		var marketinfo = worldScripts[marketinfokey];
		var randomiser = Math.floor(Math.random()*1000);
		var newmarket = new Array;
		for (var i=0;i<this.specialCargoList.length;i++) {
				var j = i+randomiser;
				var id = this.specialCargoList[i];
				var good = this.specialCargoRegister[id];
				if (good.forbidExtension) { // OXP stations won't trade in these
						var marketentry = new Object;
						marketentry.type = id;
						marketentry.quantity = 0
						marketentry.price = 0.1						
				} else {
						var marketentry = new Object;
						marketentry.type = id;
						marketentry.quantity = this.cargoQuantity(id,j,marketinfo);
						marketentry.price = this.cargoPrice(id,j,marketinfo,marketentry.quantity);
						if (marketentry.price < 0.1) {
								// cap minimum price
								marketentry.price = 0.1;
						}
				}

				this.debug("Set price for "+id+" to "+marketentry.price+" with "+marketentry.quantity+" TC available");
				newmarket.push(marketentry);
		}

		station.script.newCargoesMarket = newmarket;
}

this.readTraderNet = function() {
		var background = worldScripts["CargoTypeExtension-TraderNet"].getPic();
		var messages = worldScripts["CargoTypeExtension-TraderNet"].numMessages();
		if (messages == 0) {
				mission.runScreen({title: "TraderNet News",
													 background: background,
													 message: "\n\n\n\n\n\n\n\nNo news available.",
													 choicesKey: "cte_tradernet_last"},
													this.startTrading,this);
		} else {
				if (this.tradernetpointer >= messages) {
						var article = worldScripts["CargoTypeExtension-TraderNet"].getMessage(messages);
						var ckey = "cte_tradernet_last";
				} else {
						var ckey = "cte_tradernet";
						var article = worldScripts["CargoTypeExtension-TraderNet"].getMessage(this.tradernetpointer++);
				}
				mission.runScreen({title: "TraderNet News",
													 background: background,
													 message: "\n\n\n\n\n\n\n\n"+article,
													 choicesKey: ckey},
													function(choice) { if (choice == "01_NEXT") { this.readTraderNet(); } else { this.startTrading(); }},this);

		}
}