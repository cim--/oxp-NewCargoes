this.name = "CargoTypeExtension-Permits";
this.description = "Permits for the transport of normally illegal goods";

// var this = this;

this.govTypes = ["Anarchy",
                 "Feudal",
                 "Multi-Government",
                 "Dictatorship",
                 "Communist",
                 "Confederacy",
                 "Democracy",
                 "Corporate State"];
this.specTypes = ["Birds",
									"Felines",
									"Frogs",
									"Humanoids",
									"Insects",
									"Lizards",
									"Lobsters",
									"Rodents",
									"XEQjf8e"]; // nonsense string that won't match any species

this.startUp = function() {
		worldScripts["CargoTypeExtension"].registerPersonality(this.name);
		worldScripts["CargoTypeExtension"].registerPermit(this.name);

		if (missionVariables.cargotypeextension_permits) {
				this.unserialisePermits();
		} else {
				this.initialisePermits();
		}
}

this.playerWillSaveGame = function(cause) {
		this.serialisePermits();
}

this.initialisePermits = function() {
		this.currentPermits = new Array;
		this.permitSeller = null;
		this.localSeller();
}

this.serialisePermits = function() {
		var serial = "1|";

		var pdata = new Array;
		for (var i=0;i<this.currentPermits.length;i++) {
				var cpermit = this.currentPermits[i];
				var permitcode = this.encodePermit(cpermit);
				
				var heldpermit = cpermit.good+"="+cpermit.dest+"="+cpermit.real+"="+cpermit.deadline+"="+permitcode;
				pdata.push(heldpermit);
		}
		serial += pdata.join(";");
		serial += "|";
		if (this.permitSeller) {
				serial += this.permitSeller.good+"="+this.permitSeller.real+"="+this.permitSeller.permitcode+"="+this.permitSeller.name;
		}

		missionVariables.cargotypeextension_permits = serial;
}

this.unserialisePermits = function() {
		this.currentPermits = new Array;
		this.permitSeller = null;
		var pdata = missionVariables.cargotypeextension_permits.split("|");
		if (pdata[0] == "1") {
				this.unserialisePermits1(pdata);
		} else {
				log(this.name,"Error: "+pdata[0]+" is not a recognised permit format");
				player.consoleMessage("Critical error decoding special cargo data. Please see Latest.log");
		}
}

this.unserialisePermits1 = function(pdata) {
		if (pdata[1] != "") {
				var permits = pdata[1].split(";");
				for (var i=0;i<permits.length;i++) {
						var pinfo = permits[i].split("=");
						var permit = this.decodePermit(pinfo[4]);
						permit.good = pinfo[0];
						permit.dest = pinfo[1];
						permit.real = pinfo[2];
						permit.deadline = pinfo[3];
						this.currentPermits.push(permit);
				}
		}

		if (pdata[2] != "") {
				var sdata = pdata[2].split("=");
				this.permitSeller = new Object;
				this.permitSeller.good = sdata[0];
				this.permitSeller.real = sdata[1];
				this.permitSeller.permitcode = sdata[2];
				this.permitSeller.name = sdata[3];
		}
		

}


/* 31 bit int describes permit properties:
 * 31: clean only if true
 * 30: closer only if true
 * 28: if true, TC limit applies
 * 26-25: if both true, avoid government applies
 * 24-23: if both true, avoid species applies
 * 20-17: time limit noise (7=none, +/-1 = +/-4%)
 * 16-14: 10+(TC limit * 10)
 * 12-10: Government ban
 * 8-6: Species ban (Bird=0, Feline, Frog, Humanoid, Insect, Lizard, Lobster, Rodent)
 * 4-1: forgery quality (ignored if real)
 */
this.randomPermit = function() {
		return Math.floor(Math.random()*65536) + (Math.floor(Math.random()*32768) << 15);
//		return this.decodePermit(permit);
}

this.decodePermit = function(permitcode) {
		var permit = new Object;
		if (permitcode & 0x40000000) {
				permit.requireclean = 1;
		} else {
				permit.requireclean = 0;
		}
		if (permitcode & 0x20000000) {
				permit.requirecloser = 1;
		} else {
				permit.requirecloser = 0;
		}
		if (permitcode & 0x08000000 == 0x08000000) {
				permit.tclimit = 5*(1+((permitcode & 0x0000E000)>>13));
		} else {
				permit.tclimit = 0;
		}
		if (permitcode & 0x03000000 == 0x03000000) {
				permit.govrestrict = ((permitcode & 0x00000E00)>>9);
		} else {
				permit.govrestrict = 8; // i.e. none
		}
		if (permitcode & 0x00C00000 == 0x00C00000) {
				permit.specrestrict = ((permitcode & 0x000000E0)>>5);
		} else {
				permit.specrestrict = 8; // i.e. none
		}
		permit.timenoise = ((permitcode & 0x000F0000)>>16)-7;
		permit.quality = permitcode & 0x0000000F;
		
		return permit;
}

this.encodePermit = function(permit) {
		var permitcode = 0;
		if (permit.requireclean) {
				permitcode |= 0x40000000;
		}
		if (permit.requirecloser) {
				permitcode |= 0x20000000;
		}
		if (permit.tclimit > 0) {
				permitcode |= 0x08000000;
				permitcode |= ((permit.tclimit-1)/5)<<13;
		}
		if (permit.govrestrict < 8) {
				permitcode |= 0x03000000;
				permitcode |= permit.govrestrict<<9;
		}
		if (permit.specrestrict < 8) {
				permitcode |= 0x00C00000;
				permitcode |= permit.specrestrict<<5;
		}
		permitcode |= (permit.timenoise+7)<<16;
		permitcode |= permit.quality;

		return permitcode;
}

this.shipWillEnterWitchspace = function() {
		if (!system.isInterstellarSpace) {
				this.previous = system.ID;
		}
}

this.shipExitedWitchspace = function() {
		if (!system.isInterstellarSpace) {
// use later event as needs to be after market is initialised
				this.localSeller();

				this.expirePermits(this.previous);
		}
}

this.playerEnteredNewGalaxy = function() {
		if (this.currentPermits.length > 0) {
				player.commsMessage("Your export permits have been revoked.");
				this.currentPermits = new Array;
		}
}

this.localSeller = function() {
		var exports = worldScripts["CargoTypeExtension"].systemExports(galaxyNumber,system.ID);
		if (exports.length == 0) {
				worldScripts["CargoTypeExtension"].debug("Can't find local market; no permits issued");
				this.permitSeller = null;
				return;
		}
		if (Math.random() < 0.25) {
				// not always
				this.permitSeller = null;
				return;
		}
		var candidates = new Array;
		for (var i=0;i<exports.length;i++) {
				var good = exports[i];
				if (worldScripts["CargoTypeExtension"].controlledGood(good)) {
						candidates.push(good);
				}
		}
		
		if (candidates.length == 0) {
				if (Math.random() < 0.9) {
						worldScripts["CargoTypeExtension"].debug("No suitable illegal goods on local market; no permits issued");
						this.permitSeller = null;
						return;
				} else {
						if (Math.random() < 0.5) {
								candidates.push(worldScripts["CargoTypeExtension"].extendableCargo("narcotics"));
						} else if (Math.random() < 0.5) {
								candidates.push(worldScripts["CargoTypeExtension"].extendableCargo("slaves"));
						} else {
								candidates.push(worldScripts["CargoTypeExtension"].extendableCargo("firearms"));
						}
						if (!candidates[0]) {
								worldScripts["CargoTypeExtension"].debug("No suitable illegal goods defined; no permits issued");
								this.permitSeller = null;
								return;
						}
				}
		}

		var seller = new Object;
		seller.good = candidates[Math.floor(Math.random()*candidates.length)];
		seller.permitcode = this.randomPermit();

		worldScripts["CargoTypeExtension"].debug("Defined permit "+seller.permitcode+" for "+seller.good);

		if ((10*Math.random())-2 < system.government) {
				seller.real = 1;
				seller.name = this.sellerName(system.scrambledPseudoRandomNumber(15));//seed based on system
				if (this.decodePermit(seller.permitcode).govrestrict == system.government) {
						return; // a real seller wouldn't do this. Thanks to Capt. Murphy for spotting this one...
				}

		} else {
				seller.real = 0;
				seller.name = this.sellerName(Math.random());//random each time
		}

		worldScripts["CargoTypeExtension"].debug("Seller is "+seller.name+" ("+seller.real+")");

		this.permitSeller = seller;
}

this.sellerName = function(seed) {
		var digrams = expandDescription("[digrams]");
		var transmute = function(val) { return 3.9324*val*(1-val); }
		var interpret = function(val) { return (32*val)-Math.floor(32*val); }

		var l1 = 2+Math.floor(interpret(seed)*3); seed = transmute(seed);
		var l2 = 2+Math.floor(interpret(seed)*3); seed = transmute(seed);

		var name = "";
		for (var i=0;i<l1;i++) {
				if (i==0) {
						name += digrams.substr(Math.floor(97*interpret(seed)),1)+digrams.substr(Math.floor(97*interpret(seed))+1,1).toLowerCase();
				} else {
						name += digrams.substr(Math.floor(97*interpret(seed)),2).toLowerCase();
				}
				seed = transmute(seed);
		}
		name += " ";
		for (var i=0;i<l2;i++) {
				if (i==0) {
						name += digrams.substr(Math.floor(97*interpret(seed)),1)+digrams.substr(Math.floor(97*interpret(seed))+1,1).toLowerCase();
				} else {
						name += digrams.substr(Math.floor(97*interpret(seed)),2).toLowerCase();
				}
				seed = transmute(seed);
		}

		return name;
}

this.calculatePermitDeadline = function(dest,timenoise) {
		var route = system.info.routeToSystem(System.infoForSystem(galaxyNumber,dest));
		if (!route) {
				return 0;
		}
		var hours = route.time+(6*route.route.length);
		return clock.days+Math.floor(hours*(100+(4*timenoise))/2400)+1;
}

// the level of legal status per TC it cancels
this.permitLevel = function(permit) {
		var gen = worldScripts["CargoTypeExtension"].cargoDefinition(permit.good,"genericType");
		var illegal = worldScripts["CargoTypeExtension"].cargoDefinition(permit.good,"illegal");
		if (gen == "slaves" || gen == "firearms") {
				illegal += 1;
		} else if (gen == "narcotics") {
				illegal += 2;
		}
		return illegal;
}

this.permitPrice = function(permit) {
		var hops = system.info.routeToSystem(System.infoForSystem(galaxyNumber,permit.dest)).route.length;
		var quantity = permit.tclimit;
		if (quantity == 0) {
				quantity = player.ship.cargoSpaceCapacity;
		}
		var price = 15*hops*quantity;
		if (permit.govrestrict != 8) {
				price *= 0.9;
		}
		if (permit.specrestrict != 8) {
				price *= 0.95;
		}
		if (permit.requireclean) {
				price *= 0.95;
		}
		if (permit.requirecloser) {
				price *= 0.9;
		}
		if (permit.real == 0) {
				price *= permit.quality/20;
		}
		price *= 0.7+(system.government/10);
		price *= Math.sqrt(this.permitLevel(permit));
		price *= 0.5+(system.scrambledPseudoRandomNumber(12));

		return Math.floor(price); // nearest whole credit
}

this.permitDescription = function(permit) {
		var desc = "This permit allows transport of "+worldScripts["CargoTypeExtension"].cargoDefinition(permit.good,"specificType")+" to "+System.systemNameForID(permit.dest)+" provided that transport is completed by the end of "+permit.deadline+". The following restrictions apply:\nPermit will expire if you leave the galaxy.";
		if (permit.tclimit > 0) {
				desc += "\nNo more than "+permit.tclimit+" TC may be transported";
		}
		if (permit.requireclean) {
				desc += "\nOnly valid for traders with a Clean legal record";
		}
		if (permit.requirecloser) {
				desc += "\nFlight plan must always get closer to destination system";
		}
		if (permit.govrestrict != 8) {
				desc += "\nTransport through "+this.govTypes[permit.govrestrict]+" systems is forbidden.";
		}
		if (permit.specrestrict != 8) {
				desc += "\nTransport through systems primarily inhabited by "+this.specTypes[permit.specrestrict]+" is forbidden.";
		}
		desc += "\nOther local by-laws may apply.";
		return desc;
}

this.permitConciseDescription = function(permit) {
		var desc = "Permit for export of "+worldScripts["CargoTypeExtension"].cargoDefinition(permit.good,"specificType")+" to "+System.systemNameForID(permit.dest)+" by "+permit.deadline+". ";
		if (permit.tclimit > 0) {
				desc += permit.tclimit+" TC max; ";
		}
		if (permit.requireclean) {
				desc += "Clean only; ";
		}
		if (permit.requirecloser) {
				desc += "Always closer; ";
		}
		if (permit.govrestrict != 8) {
				desc += "No "+this.govTypes[permit.govrestrict]+"; ";
		}
		if (permit.specrestrict != 8) {
				desc += "No "+this.specTypes[permit.specrestrict]+"; ";
		}
		worldScripts["CargoTypeExtension"].debug(desc);
		desc += "\n";
		if (permit.real < 0) {
				desc = "FAKE "+desc;
		}
		return desc;
}

this.expirePermits = function(lastsys) {
// discard any permits for which closer is required, and lastsys
// is closer than this one by most direct route
// also discard any for which clock.days > permit.deadline
		var n = this.currentPermits.length-1;
		for (var i=n;i>=0;i--) { // reverse order, so we can splice safely
				if (this.currentPermits[i].real == -1) {
						// silently remove discovered fakes
						this.currentPermits.splice(i,1);
				} else if (this.currentPermits[i].deadline < clock.days) {
						this.currentPermits.splice(i,1);
						player.commsMessage("Export permit expired.");
				} else if (!system.isInterstellarSpace && this.currentPermits[i].requirecloser) {
						var dist = system.info.routeToSystem(System.infoForSystem(galaxyNumber,this.currentPermits[i].dest)).distance;
						var lastdist = System.infoForSystem(galaxyNumber,lastsys).routeToSystem(System.infoForSystem(galaxyNumber,this.currentPermits[i].dest)).distance;
						if (dist > lastdist) {
								player.commsMessage("Your flight plan has invalidated an export permit!");
								this.currentPermits.splice(i,1);
						}
				}
		}
}

/* Permit API */

this.permitGossip = function() {
		if (clock.days % 3 == 0) {
				return "* Need a permit? Look for "+this.sellerName(system.scrambledPseudoRandomNumber(15));
		}
		return false;
}

this.checkPermit = function(good,quantity,dryrun) {
		var score = 0;
		for (var i=0;i<this.currentPermits.length;i++) {
				var permit = this.currentPermits[i];
				if (permit.good == good) {
						worldScripts["CargoTypeExtension"].debug("Found permit for "+good);
						if ((permit.real >= 0) && 
								(permit.tclimit == 0 || permit.tclimit >= quantity) &&
								(!permit.requireclean || player.bounty == 0) &&
								(permit.govrestrict != system.government) &&
								(system.inhabitantsDescription.indexOf(this.specTypes[permit.specrestrict]) == -1)) {
								// then this permit is applicable here

								// if a dry run, assume the forgery won't be discovered.
								if (!dryrun && permit.real == 0) {
										var check = Math.floor(Math.random()*(system.government+system.techLevel)); // max 0 in the worst anarchies, max 21 in a top corporate state.
										// permit quality is from 0-15 (so adjust to 5-20)
										worldScripts["CargoTypeExtension"].debug("Scan quality "+check+" versus forgery "+permit.quality);
										if (check > permit.quality+5) {
												permit.real = -1; // discovered, will be garbage collected
												player.bounty |= 64;
												player.commsMessage(expandDescription("%H Port Authority: Your export license is a fake, [describe-pirate]! Surrender your cargo immediately!"));
												return 0; // don't even bother checking for other permits; take the full legal hit for these cargo pods too
										}
								}

								if (score > -this.permitLevel(permit)) {
										// use the best permit
										score = -this.permitLevel(permit);
								}
								worldScripts["CargoTypeExtension"].debug("Permit applicable for "+good);
						}
				}
		}
		return score;
}

this.checkImport = function(good,quantity,dryrun) {
		// all permits from this module are both import and export
		// forgeries only checked for on export, to make things simpler
		return this.checkPermit(good,quantity,true);
}

this.describePermits = function() {
		var desc = "";
		for (var i=0;i<this.currentPermits.length;i++) {
				desc += this.permitConciseDescription(this.currentPermits[i])+"\n";
		}
		return desc;
}

/* Personality API */

this.traderGossip = function() {
		return false;
}

this.describeContracts = function() {
		return "";
}

this.traderHere = function(srole) {
		if (srole != "") { // main stations only for now
				return false;
		}
		return (this.permitSeller != null);
}

this.traderName = function() {
		return this.permitSeller.name+", permit official";
}

this.traderDesc = function() {
		return "Welcome to the "+system.name+" permit office, Trader. We currently have permits available for the export of "+worldScripts["CargoTypeExtension"].cargoDefinition(this.permitSeller.good,"specificType")+". If you would like one, please set your navigation computer's destination system to your desired importer, and then come in to discuss permit terms.";
}

this.runOffer = function() {
		if (player.ship.targetSystem == system.ID) {
				this.permitDealings("Please set your navigation computer's destination system to your desired importer.");
				return;
		}
		this.currentpermit = this.decodePermit(this.permitSeller.permitcode);
		this.currentpermit.good = this.permitSeller.good;
		this.currentpermit.dest = player.ship.targetSystem;
		this.currentpermit.real = this.permitSeller.real;
		this.currentpermit.deadline = this.calculatePermitDeadline(this.currentpermit.dest,this.currentpermit.timenoise);
		if (this.currentpermit.deadline == 0) {
				this.permitDealings("I'm afraid we don't have a trade agreement with "+System.infoForSystem(galaxyNumber,player.ship.targetSystem).name+", Trader.");
				return;
		} else {
				var price = this.permitPrice(this.currentpermit);
				var desc = this.permitDescription(this.currentpermit);
				var msg = "We can offer the following permit:\n";
				msg += "-------------------------\n";
				msg += desc+"\n";
				msg += "-------------------------\n";
				msg += "Inclusive of all fees and taxes, this will cost "+price+"₢";
				
				mission.runScreen({title: this.traderName(),
													 message: msg,
													 choicesKey: "cte_permit_deal",
													 background: "cte_permit.png"},this.permitChoice,this);
				
		}

}

this.permitChoice = function(choice) {
		if (choice == "01_ACCEPT") {
				var price = this.permitPrice(this.currentpermit);
				if (player.credits < price) {
						this.permitDealings("I'm sorry, Trader. You don't currently have enough credit to afford this permit.");
				} else {
						player.credits -= price;
						this.currentPermits.push(this.currentpermit);
						this.permitDealings("The permit has been registered to your ship, Trader, and the fee of "+price+"₢ has been charged to your account.");
						this.permitSeller = null;
				}
		} else {
				this.permitDealings("Get back in touch if you'd like a quote for a permit to a different destination.");
		}
}

this.permitDealings = function(msg) {
		mission.runScreen({title: this.traderName(),
											 message: msg,
											 background: "cte_permit.png"},this.permitExit,this);
}

this.permitExit = function(choice) {
		worldScripts["CargoTypeExtension"].tradeFloor();
}