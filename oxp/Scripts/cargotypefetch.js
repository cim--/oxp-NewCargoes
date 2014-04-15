this.name = "CargoTypeExtension-FetchContracts";
this.description = "Contracts to bring a buyer some goods";

// var cte_fetch = this;

this.startUp = function() {

		worldScripts["CargoTypeExtension"].registerPersonality(this.name);

		this.unserialiseFetchData();
}

this.unserialiseFetchData = function() {
		if (!missionVariables.cargotypeextension_fetchcontract) {
				this.timer = new Timer(this,this.initialiseFetchData,0.25);
		} else {
				var fetchdata = missionVariables.cargotypeextension_fetchcontract.split("|");
				var version = fetchdata.shift();
				if (version == "1") {
						this.unserialiseFetchData1(fetchdata);
				} else {
						log(this.name,"Error: "+svars[0]+" is not a recognised fetch format");
						player.consoleMessage("Critical error decoding special cargo data. Please see Latest.log");
				}
		}
}

this.initialiseFetchData = function() {
		this.fetchContracts = new Array; // contracts agreed by player
		this.localOffer = this.newContract();
}

this.playerWillSaveGame = function(cause) {
		this.serialiseFetchData();
}

this.serialiseFetchData = function() {
		var fetchdata = "1|";
		var contracts = new Array;
		for (var i=0;i<this.fetchContracts.length;i++) {
				if (this.fetchContracts[i].amount > 0) {
						contracts.push(this.serialiseContract(this.fetchContracts[i]));
				}
		}
		fetchdata += contracts.join(";");
		fetchdata += "|";
		fetchdata += this.serialiseContract(this.localOffer);
		missionVariables.cargotypeextension_fetchcontract = fetchdata;
}

this.serialiseContract = function(contract) {
		if (contract) {
				return contract.galaxy+"/"+contract.system+"/"+contract.good+"/"+contract.amount+"/"+contract.price+"/"+contract.deadline+"/"+contract.name;
		} else {
				return "";
		}
}

this.unserialiseFetchData1 = function(fetchdata) {
		var actives = fetchdata[0].split(";");
		this.fetchContracts = new Array;
		for (var i=0;i<actives.length;i++) {
				if (actives[i] != "") {
						this.fetchContracts.push(this.unserialiseContract1(actives[i]));
				}
		}
		this.localOffer = this.unserialiseContract1(fetchdata[1]);
}

this.unserialiseContract1 = function(cstr) {
		if (cstr == "") { return false; }
		var cdata = cstr.split("/");
		var contract = {galaxy:cdata[0],
										system:cdata[1],
										good:cdata[2],
										amount:cdata[3],
										price:cdata[4],
										deadline:cdata[5],
										name:cdata[6]};
		return contract;
}

this.newContract = function() {
		var imports = worldScripts["CargoTypeExtension"].systemImports(galaxyNumber,system.ID);
		if (Math.random()-0.1 < imports.length/3) {
				worldScripts["CargoTypeExtension"].debug("No local fetch: too many imports");
				return false; // bias away from systems which have imports anyway
		}
		var good = worldScripts["CargoTypeExtension"].extendableCargo("any");
		var exports = worldScripts["CargoTypeExtension"].systemImports(galaxyNumber,system.ID);
		if (exports.indexOf(good) >= 0 || imports.indexOf(good) >= 0) {
				worldScripts["CargoTypeExtension"].debug("No local fetch: picked wrong cargo");
				return false; // not a good the system usually trades in
		} 

		var contract = new Object;
		contract.galaxy = galaxyNumber;
		contract.system = system.ID;
		contract.name = randomName()+" "+randomName();
		contract.deadline = 15+(5*Math.floor(Math.random()*7))+clock.days;
		if (Math.random() < 0.5) {
				contract.amount = 10+(5*Math.floor(Math.random()*5));
		} else {
				contract.amount = 10+(10*Math.floor(Math.random()*20));
		}

		contract.good = good;
		contract.price = Math.floor(worldScripts["CargoTypeExtension"].cargoPriceImport(
				good,
				Math.floor(Math.random()*1000),
				worldScripts["CargoTypeExtension"].defaultMarketInfo())/8); // /8 rather than /10 for a slight premium
		worldScripts["CargoTypeExtension"].debug("Local fetch: "+contract.good+" by "+contract.deadline+" at "+contract.price);
		return contract;
}


this.shipWillExitWitchspace = function() {
		if (!system.isInterstellarSpace) {
				this.updateFetchContracts();
		}
}

this.updateFetchContracts = function() {
		var addlocal = true;
		for (var i=this.fetchContracts.length-1;i>=0;i--) {
				var contract = this.fetchContracts[i];
				if (contract.amount <= 0) {
						this.fetchContracts.splice(i,1); // cleanup
				} else {
						if (contract.deadline < clock.days) {
								// too late!
								var penalty = contract.amount * contract.price;
								player.commsMessage(contract.name+": You've failed to deliver the cargo promised in time. According to the automatic penalty clauses on our contract, "+penalty+"Cr. are now being transferred from your accounts.",10);
								if (penalty > player.credits) {
										player.commsMessage(contract.name+": What? Trying to avoid it by emptying that account first? Please refer to section 6.5: Legal status penalties', Commander!");
										player.bounty |= 25;
								}
								player.credits -= penalty;
								this.fetchContracts.splice(i,1);
						} else if (contract.galaxy == galaxyNumber && contract.system == system.ID) {
								addlocal = false;
						}
				}
		}
		if (addlocal) {
				this.localOffer = this.newContract();
		} else {
				this.localOffer = false;
		}
}

this.currentOffer = function() {
		worldScripts["CargoTypeExtension"].debug(this.fetchContracts.length);
		for (var i=0;i<this.fetchContracts.length;i++) {
				var contract = this.fetchContracts[i];
				worldScripts["CargoTypeExtension"].debug(this.serialiseContract(contract));
				if (contract.galaxy == galaxyNumber && contract.system == system.ID) {
						worldScripts["CargoTypeExtension"].debug("System match");
						if (contract.amount > 0) {
								worldScripts["CargoTypeExtension"].debug("Amount match");
								return contract;
						} else {
								worldScripts["CargoTypeExtension"].debug("Amount zero");
								return this.localOffer;
						}
				}
		}
		
		return this.localOffer;
}

/* Personality API */

this.traderGossip = function() {
		var sysid = clock.days%256;
		if (worldScripts["CargoTypeExtension"].systemImports(galaxyNumber,sysid) < 2) {
				return "* I hear you can get some interesting deals at "+System.systemNameForID(sysid)+".";
		}
		return false;
}

this.describeContracts = function() {
		if (this.fetchContracts.length == 0) {
				return "";
		}
		var descs = new Array();
		for (var i=0;i<this.fetchContracts.length;i++) {
				var contract = this.fetchContracts[i];
				var desc = "Get "+contract.amount+" TC of "+worldScripts["CargoTypeExtension"].cargoDefinition(contract.good,"specificType")+" to ";
				if (contract.galaxy == galaxyNumber) {
						desc += System.infoForSystem(galaxyNumber,contract.system).name;
				} else {
						desc += "Chart "+(1+contract.galaxy);
				}
				desc += " by "+contract.deadline+".";
				descs.push(desc);
		}
		return descs.join("\n")+"\n";
}

this.traderHere = function(srole) {
		if (srole != "") { // main stations only for now
				return false;
		}
		return this.currentOffer() != false;
}

this.traderName = function() {
		worldScripts["CargoTypeExtension"].debug(this.name+" "+this.currentOffer());
		return this.currentOffer().name+", procurer";
}

this.traderDesc = function() {
		var offer = this.currentOffer();
		if (this.localOffer) {
				return "Hello, Trader. I'm looking for someone who can supply me with some "+worldScripts["CargoTypeExtension"].cargoDefinition(offer.good,"specificType")+". If you know a suitable supplier and are willing to transport the goods I can offer an excellent price - come over and talk terms.";
		} else {
				return "Hello again, Trader. Have you got my "+worldScripts["CargoTypeExtension"].cargoDefinition(offer.good,"specificType")+" yet?";
		}
}

this.runOffer = function() {
		var offer = this.currentOffer();
		if (this.localOffer) {
				this.runNewOffer();
		} else {
				this.runOldOffer();
		}
}

this.runNewOffer = function() {
		var offer = this.currentOffer();
		var msg = "This is a standard procurement contract - you bring me "+offer.amount+" TC of "+worldScripts["CargoTypeExtension"].cargoDefinition(offer.good,"specificType")+" by "+offer.deadline+", at a rate of "+offer.price+"₢/TC.\nYou can bring them in more than one load, if you want, and how you obtain the goods is up to you.\nIf you fail to fulfil the contract, there will be a penalty charge of "+offer.price+"₢ for every TC you are short, to cover my risk of being short on what I need, so it's in your interests to have a good idea of how you're going to deliver the goods.\n";
		
		mission.runScreen({title: this.traderName(),
											 message: msg,
											 background: "cte_tradefloor.png",
											 choicesKey: "cte_fetch_deal"},this.newOfferChoice,this);
}

this.newOfferChoice = function(choice) {
		if (choice == "01_ACCEPT") {
				this.fetchContracts.push(this.localOffer);
				this.localOffer = false;
				var msg = "Thank you, Trader "+player.name+". I look forward to you returning with the goods.";
		} else {
				var msg = "If you change your mind after a look at your charts, then I'll be around here for a little bit longer.";
		}
		
		mission.runScreen({title: this.traderName(),
											 message: msg,
											 background: "cte_tradefloor.png"},this.leaveFetch,this);
}

this.leaveFetch = function() {
		worldScripts["CargoTypeExtension"].tradeFloor();
}


this.runOldOffer = function() {
		var offer = this.currentOffer();

		var carried = worldScripts["CargoTypeExtension"].hasSpecialCargo(offer.good);
		if (carried == 0) {
				mission.runScreen({title: this.traderName(),
													 message: "You don't seem to have any "+worldScripts["CargoTypeExtension"].cargoDefinition(offer.good,"specificType")+" in your hold right now, Trader. Remember, I still need you to deliver "+offer.amount+" TC by "+offer.deadline+".",
													 background: "cte_tradefloor.png"},this.leaveFetch,this);
		} else {
				var msg = "Welcome back, Trader "+player.name+". Your manifest indicates that you have "+carried+" TC of "+worldScripts["CargoTypeExtension"].cargoDefinition(offer.good,"specificType")+" in your hold. Would you like to transfer them now, for the agreed price of "+offer.price+"₢ up to the "+offer.amount+" TC remaining on this contract?";
				mission.runScreen({title: this.traderName(),
													 message: msg,
													 background: "cte_tradefloor.png",
													 choicesKey: "cte_fetch_transfer"},this.oldOfferChoice,this);
		}
}

this.oldOfferChoice = function(choice) {
		if (choice != "01_ACCEPT") {
				mission.runScreen({title: this.traderName(),
													 message: "Don't forget to drop them off here before you leave, then!",
													 background: "cte_tradefloor.png"},this.leaveFetch,this);
				return;
		}
		
		var offer = this.currentOffer();
		var transferred = 0;
		while (offer.amount > 0 && worldScripts["CargoTypeExtension"].hasSpecialCargo(offer.good) > 0) {
				if (worldScripts["CargoTypeExtension"].removeSpecialCargo(offer.good)) {
						transferred++;
						offer.amount--;
				} else {
						worldScripts["CargoTypeExtension"].error("Unable to transfer expected good in fetch contract?!");
						player.consoleMessage("Warning: Unexpected error in NewCargoes OXP. Please see Latest.Log");
						return;
				}
		}
		
		var price = offer.price*transferred;
		var msg = "Thank you. "+transferred+" TC has been transferred, and "+price+"₢ has been credited to your account.\n";
		player.credits += price;

		if (offer.amount > 0) {
				msg += offer.amount+" TC remain to be delivered by "+offer.deadline+", Trader - I hope to see you back soon with more.";
		} else {
				msg += "Thank you, Trader. This is all of the goods we agreed. I hope to see you again soon.";
		}
		mission.runScreen({title: this.traderName(),
											 message: msg,
											 background: "cte_tradefloor.png"},this.leaveFetch,this);
		
}