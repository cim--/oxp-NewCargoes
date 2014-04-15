this.name = "CargoTypeExtension-OpenContract";
this.description = "'Open' cargo contracts; high risk, high reward";

// var this = this;

this.startUp = function() {
		worldScripts["CargoTypeExtension"].registerPersonality(this.name);

		if (missionVariables.cargotypeextension_opencontract) {
				this.unserialiseOpenContract();
		} else {
				this.initialiseOpenContract();
		}
}

this.playerWillSaveGame = function(savetype) {
		this.serialiseOpenContract();
}

this.initialiseOpenContract = function() {
		this.contractdata = undefined;
		this.newOpenContract();
}

this.unserialiseOpenContract = function() {
		worldScripts["CargoTypeExtension"].debug(missionVariables.cargotypeextension_opencontract);
		var state = missionVariables.cargotypeextension_opencontract.split("|");
		var format = state.shift();
		
		if (format == "1") {
				this.unserialiseOpenContract1(state);
		} else {
				log(this.name,"Error: "+svars[0]+" is not a recognised open contract format");
				player.consoleMessage("Critical error decoding special cargo data. Please see Latest.log");
		}
}

this.unserialiseOpenContract1 = function(state) {
		if (state.length == 0) {
				this.contractdata = undefined;
		} else {
				worldScripts["CargoTypeExtension"].debug(state.length+" "+state.join(" @ "));
				this.contractdata = new Object;
				this.contractdata.active = state[0];
				this.contractdata.source = state[1];
				this.contractdata.dest = state[2];
				this.contractdata.buyer = state[3];
				this.contractdata.seller = state[4];
				this.contractdata.deadline = state[5];
				this.contractdata.cargogeneric = state[6];
				this.contractdata.cargospecific = state[7];
				this.contractdata.galaxy = state[8];
				this.contractdata.amount = state[9];

				this.redefine();
		}
}

this.serialiseOpenContract = function() {
		if (!this.contractdata) {
				missionVariables.cargotypeextension_opencontract = "1";
		} else {
				missionVariables.cargotypeextension_opencontract = "1|"+this.contractdata.active+"|"+this.contractdata.source+"|"+this.contractdata.dest+"|"+this.contractdata.buyer+"|"+this.contractdata.seller+"|"+this.contractdata.deadline+"|"+this.contractdata.cargogeneric+"|"+this.contractdata.cargospecific+"|"+this.contractdata.galaxy+"|"+this.contractdata.amount;
		}
}

this.shipWillExitWitchspace = function() {
		if (!system.isInterstellarSpace) {
				this.newOpenContract();
		}
}

this.newOpenContract = function() {
		// never redefine contract if cargo from an old contract is aboard.
		// Fixes: http://aegidian.org/bb/viewtopic.php?p=168498#p168498
		if (worldScripts["CargoTypeExtension"].hasSpecialCargo("CTE_CTOC_1") > 0) {
				worldScripts["CargoTypeExtension"].debug("...and Cargo carried");
				return;
		}

		if (this.contractdata) { // always define a new one if it's undefined
				if (this.contractdata.active > 0) {
						worldScripts["CargoTypeExtension"].debug("Open Contract Active");
				}
				if (Math.random() > 0.75 ) { // usually have one available
						worldScripts["CargoTypeExtension"].debug("Skipping open contract");
						return;
				}
		} else {
				worldScripts["CargoTypeExtension"].debug("Open contract undefined");
		}
		
		var contract = new Object;
		var names = expandDescription("[nom1];[nom1]").split(";");
		contract.buyer = randomName()+" "+names[0];
		contract.seller = randomName()+" "+names[1];
		contract.active = 0;
		contract.galaxy = galaxyNumber;
		contract.source = system.ID;
		
		var possibledests = SystemInfo.filteredSystems(this,this.preferredSystems);
		if (possibledests.length < 1) {
				var possibledests = SystemInfo.filteredSystems(this,this.eligibleSystems);
		}
		if (possibledests.length < 1) {
				worldScripts["CargoTypeExtension"].debug("No valid open contract destinations");
				return;
		}
		var chosendest = possibledests[Math.floor(Math.random()*possibledests.length)]; 
		contract.dest = chosendest.systemID;
		worldScripts["CargoTypeExtension"].debug("Chose "+contract.dest+" as destination");
		var simpleroute = system.info.routeToSystem(chosendest);
		if (!simpleroute) {
				return; // either we're in a system too isolated to have the contracts, or the other system is an isolate.
		}
		var quickroute = system.info.routeToSystem(chosendest,"OPTIMIZED_BY_TIME");

		worldScripts["CargoTypeExtension"].debug("Quick: "+quickroute.time.toFixed(1)+" (+"+quickroute.route.length+") / Simple: "+simpleroute.time.toFixed(1)+" (+"+simpleroute.route.length+")");
		// allow an hour in each system for in-system transit, docking, servicing, etc.
		simpleroute.time += simpleroute.route.length;
		quickroute.time += quickroute.route.length;
		
		if (simpleroute.time < quickroute.time+50) {
				worldScripts["CargoTypeExtension"].debug("Insufficient contrast");
				return; // need some contrast.
		}

		var reallength = Math.floor(Math.random()*(simpleroute.time-quickroute.time)*3600)+(quickroute.time*3600);
// the winner - if the player does nothing - will take a route with
// time between optimal and simplest. Quite possibly the ones trying
// the optimal route did one Anarchy too many and got blown up or
// stuck in drydock for repairs for weeks. Or it might be one on the
// optimal route who succeeds.

		contract.deadline = Math.floor(reallength+clock.adjustedSeconds);
// yes, this is to the second.

		var generics = ["food","textiles","radioactives","slaves","liquorWines","luxuries","narcotics","computers","machinery","alloys","firearms","furs","minerals"];
		
		contract.cargogeneric = generics[Math.floor(Math.random()*generics.length)];
		contract.cargospecific = expandDescription("[cte_ctd_"+contract.cargogeneric+"]");

		var amounts = [10,20,25,25,25,40,50,50,60,75,100,125];
		contract.amount = amounts[Math.floor(Math.random()*amounts.length)];
		
		worldScripts["CargoTypeExtension"].debug("Open Contract Initialising");
		this.contractdata = contract;
		this.redefine();

}

this.eligibleSystems = function(other) {
		if (other.systemID == system.ID) { return false; }
		if (system.info.distanceToSystem(other) < 40) {
				
				return false;
		}
		return true;
}
this.preferredSystems = function(other) {
		if (other.systemID == system.ID) { return false; }
		if (system.info.distanceToSystem(other) < 60) {
				return false;
		}
		return true;
}


this.redefine = function() {
		var cargo = new Object;
		cargo.ID = "CTE_CTOC_1";
		cargo.buySystems = [[],[],[],[],[],[],[],[]];
		cargo.buySystems[this.contractdata.galaxy].push(this.contractdata.source);
		cargo.sellSystems = [[],[],[],[],[],[],[],[]];
		cargo.slump = -1;
		cargo.unslump = -1;
		cargo.sourceRumour = -1;
		cargo.destinationRumour = -1;
		cargo.salvageMarket = -1;
		cargo.forbidExtension = 1;
		cargo.buyQuantity = -1; // not available on normal export market
		if (this.contractdata.cargogeneric == "slaves" || this.contractdata.cargogeneric == "narcotics" || this.contractdata.generic == "firearms") {
				cargo.buyAdjust = 200;
				cargo.sellAdjust = 600;
				cargo.sellDistance = 45;
				var verb = "smuggle";
		} else {
				cargo.buyAdjust = 200;
				cargo.sellAdjust = 500;
				cargo.sellDistance = 35;
				var verb = "transport";
		}
		cargo.genericType = this.contractdata.cargogeneric;
		cargo.specificType = this.contractdata.seller+"'s "+this.contractdata.cargospecific;

		if (this.contractdata.galaxy == galaxyNumber) {
				var destname = "at "+System.infoForSystem(galaxyNumber,this.contractdata.dest).name+" station";
		} else {
				var destname = "in Chart "+(1+this.contractdata.galaxy);
		}

		cargo.desc = "You accepted a contract to "+verb+" "+this.contractdata.amount+" TC of this cargo to "+this.contractdata.buyer+" "+destname+" as soon as possible. Rival traders have also accepted this contract, and only the first to arrive will be paid.";

		worldScripts["CargoTypeExtension"].registerCargoType(cargo);

}

this.missionScreenOpportunity = function() {
		if (this.contractdata && galaxyNumber == this.contractdata.galaxy && system.ID == this.contractdata.dest && this.contractdata.active == 1 && player.ship.dockedStation.isMainStation) {
				if (clock.adjustedSeconds <= this.contractdata.deadline) {
						this.openContractWin();
				} else {
						this.openContractLose();
				}
		}
}

/* API calls */

this.traderGossip = function() {
		return false; // not needed
}

this.describeContracts = function() {
		if (!this.contractdata || this.contractdata.active == 0) {
				return "";
		} else {
				var desc = "Transfer "+this.contractdata.amount+" TC of "+this.contractdata.cargospecific+" to ";
				if (this.contractdata.galaxy == galaxyNumber) {
						desc += System.infoForSystem(galaxyNumber,this.contractdata.dest).name;
				} else {
						desc += "Chart "+(1+this.contractdata.galaxy);
				}
				desc += " quickly.\n";
				return desc;
		}
}


this.traderHere = function(srole) {
		if (srole != "") { // main stations only for now
				return false;
		}
		if (!this.contractdata) { return false; }

		return (system.ID == this.contractdata.source && this.contractdata.active == 0);
// destination systems are handled by event handlers above
}

this.traderName = function() {
		if (system.ID == this.contractdata.source) {
				return this.contractdata.seller+", contractor";
		}
}

this.traderDesc = function() {
		return "Trader "+player.name+", welcome. I have an open contract offer to carry "+this.contractdata.amount+" TC of "+this.contractdata.cargospecific+" to a buyer on "+System.infoForSystem(galaxyNumber,this.contractdata.dest).name+". Excellent profits for a trader with a fast ship.";
}

this.runOffer = function() {

		var price = worldScripts["CargoTypeExtension"].cargoPriceExport("CTE_CTOC_1",15,worldScripts["CargoTypeExtension"].defaultMarketInfo())/10;
		var totalprice = price*this.contractdata.amount;

		if (player.ship.cargoSpaceCapacity < this.contractdata.amount) {
				var msg = "Trader, I appreciate your enthusiasm, but unfortunately my buyer isn't interested in partial deliveries. Come back and see me when you've got a proper freighter.";

				if(player.ship.equipmentStatus("EQ_HYPERCARGO") === "EQUIPMENT_OK" || player.ship.equipmentStatus("EQ_MULTIBAY") === "EQUIPMENT_OK") {
						msg = "Unfortunately, Trader, my buyer is somewhat old-fashioned, and doesn't approve of all these new hyperspatial storage arrangements. I'm afraid I can only offer this contract to people with a sufficiently large primary cargo bay.";
				} 
				mission.runScreen({title: this.traderName(),
													 background: "cte_tradefloor.png",
													 message: msg},this.leaveOpenC,this);
				
		} else if (player.ship.cargoSpaceAvailable < this.contractdata.amount) {
				var msg = "I'm sorry, Trader. You'll need to free up some hold space before we can discuss this contract.";

				if(player.ship.equipmentStatus("EQ_HYPERCARGO") === "EQUIPMENT_OK" || player.ship.equipmentStatus("EQ_MULTIBAY") === "EQUIPMENT_OK") {
						msg = "Unfortunately, Trader, my buyer is somewhat old-fashioned, and doesn't approve of all these new hyperspatial storage arrangements. You'll have to reorganise your cargo to get enough space in the main hold area for the goods before I can transfer them.";
				} 

				mission.runScreen({title: this.traderName(),
													 background: "cte_tradefloor.png",
													 message: msg},this.leaveOpenC,this);
		} else if (totalprice > player.credits) {
				var msg = "I'm sorry, Trader. You don't have enough credits to afford the security deposit. Come back some day when you're a little richer.";
				mission.runScreen({title: this.traderName(),
													 background: "cte_tradefloor.png",
													 message: msg},this.leaveOpenC,this);

		} else {

				var msg = "Here's the deal, "+player.name+". I'll sell you "+this.contractdata.amount+" of "+this.contractdata.cargospecific+" for "+price.toFixed(1)+"₢/TC ("+totalprice+"₢) security deposit. When you get to "+System.infoForSystem(galaxyNumber,this.contractdata.dest).name+" station, "+this.contractdata.buyer+" will pay you over ten times that for delivery. I can't tell you the exact price, unfortunately, because that obsolete Galcop regulation is still being enforced. They'll then pay me the rest of the goods cost minus your delivery fee and the security deposit. Everyone's a winner.\n\nWhat's that? What's the catch? Well, you're not the only one taking this contract. "+this.contractdata.buyer+" is only going to pay the first one there, so you'll need to be fast. You're one of the first to show up, so your odds are pretty good."; 

			if(player.ship.equipmentStatus("EQ_HYPERCARGO") === "EQUIPMENT_OK" || player.ship.equipmentStatus("EQ_MULTIBAY") === "EQUIPMENT_OK") {
				msg = "\n\nOh, by the way, Trader, my buyer is somewhat old-fashioned, and doesn't approve of all these new hyperspatial storage arrangements. For auditing purposes, you should keep the cargo in your main hold throughout the trip.";
			} 


				mission.runScreen({title: this.traderName(),
													 background: "cte_tradefloor.png",
													 message: msg,
													 choicesKey: "cte_oc_deal"},this.dealOpenC,this);

		}

}

this.dealOpenC = function(choice) {
		if (choice == "01_DEAL") {
				var price = worldScripts["CargoTypeExtension"].cargoPriceExport("CTE_CTOC_1",15,worldScripts["CargoTypeExtension"].defaultMarketInfo())/10;
				for (var i=1;i<=this.contractdata.amount;i++) {
						worldScripts["CargoTypeExtension"].addSpecialCargo("CTE_CTOC_1",price.toFixed(1)+"₢ for open contract in "+system.info.name);
				}
				worldScripts["CargoTypeExtension"].debug(price+" "+this.contractdata.amount);
				player.credits = player.credits - (price*this.contractdata.amount);
				this.contractdata.active = 1;
				
				var msg = "Thank you, Trader. The cargo is being loaded on to your ship as we speak. I recommend you launch as soon as possible.";
				if(player.ship.equipmentStatus("EQ_HYPERCARGO") === "EQUIPMENT_OK" || player.ship.equipmentStatus("EQ_MULTIBAY") === "EQUIPMENT_OK") {
						msg += "\n\nRemember that the buyer doesn't approve of hyperspatial cargo storage. You can carry the cargo there in flight at your own risk if you must, but make sure that all the goods are in your primary cargo hold when you dock at the destination station, or they probably won't take them.";
				}

		} else {
				var msg = "Understood, Trader. Now, if you'll excuse me, I have a few other potential couriers to talk to. I'll still be here for a little while if you change your mind.";
		}
		mission.runScreen({title: this.traderName(),
											 background: "cte_tradefloor.png",
											 message: msg
											},this.leaveOpenC,this);

}

this.leaveOpenC = function() {
		worldScripts["CargoTypeExtension"].tradeFloor();
}

/* Contract results */

this.openContractWin = function() {
		var price = worldScripts["CargoTypeExtension"].cargoPriceImport("CTE_CTOC_1",15,worldScripts["CargoTypeExtension"].defaultMarketInfo())/10;
		var carried = worldScripts["CargoTypeExtension"].hasSpecialCargo("CTE_CTOC_1");
		var msg = "Welcome, Trader "+player.name+". Let's see those "+this.contractdata.cargospecific+" then.\n\n";
		if (carried == this.contractdata.amount) {
				msg += "Ah, excellent. All present and correct. If you'll just authorise the cargo transfer, the "+price.toFixed(1)+" ₢/TC will be yours.";

		} else if (carried >= this.contractdata.amount) { // shouldn't be possible, in general. Well, they probably deserve a small bonus.
				msg += "Ah, excellent. All present and correct. If you'll just authorise the cargo transfer, the "+price.toFixed(1)+" ₢/TC will be yours. I'll take the spares off your hands for the same price, I think. Don't tell "+this.contractdata.seller+", though, or they'll be wanting their cut.";

		} else if (carried > 0) {
				price = Math.floor(price*(carried/this.contractdata.amount));
				msg += "You appear to be missing some of the cargo I need. I'll take what you have off your hands, now it's here, but your payment has been reduced to "+price.toFixed(1)+" ₢/TC to account for my costs in obtaining replacements.";
		} else if (carried == 0) {
				msg += "Ah. Apologies. I seem to have been misinformed. I thought you were carrying some goods for me, but it must have been someone with a similar name.";
		}
		
		player.credits += price*carried;
		for(var i=1;i<=carried;i++) {
				worldScripts["CargoTypeExtension"].removeSpecialCargo("CTE_CTOC_1");
		}
		
		this.contractdata.active = 0;
		mission.runScreen({title: this.contractdata.buyer,
											 background: "cte_tradefloor.png",
											 message: msg},function(){},this);

}

this.openContractLose = function() {	
		this.contractdata.active = 0;
	
		var missed = clock.adjustedSeconds-this.contractdata.deadline;
		var msg = "You can't find "+this.contractdata.buyer+" when you dock. You ask the harbourmaster if they've seen them.\n\n"
		if (missed < 60) {
				msg += "You've literally just missed them. Some trader in a Boa Clipper was unloading cargo with them over there.";
		} else if (missed < 3600) {
				msg += "They were here a moment ago. I think they left a few minutes ago with a Boa II pilot.";
		} else if (missed < 86400) {
				msg += "I saw them around earlier today. An L-Crate full of cargo came in for them, I think, so they were supervising the unloading.";
		} else if (missed < (86400*7)) {
				msg += "Not for a few days, no. They were taking some cargo from a Boa planetside.";
 		} else {
				msg += "No, they've not been up here for a while, not since that Anaconda came in last week.";
		}

		mission.runScreen({title: "Too late...",
											 background: "cte_tradefloor.png",
											 message: msg},function(){},this);
}