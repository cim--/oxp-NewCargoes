this.author      = "cim"; 
this.copyright   = "� 2011-2012 cim."; 
this.licence = "CC-BY-SA 3.0";
this.version     = "1.1.1"; 
this.name = "CargoTypeExtension-Auctions";
this.description = "Auctions for special cargo, with a variety of rules";

// deals with scoping problems by doing runScreen between two worldscripts
//var this = this;

this.auctioneers = new Array;

this.easteregg = 0;

this.startUp = function() {
		worldScripts["CargoTypeExtension"].registerPersonality(this.name);

		this.unserialiseAuctioneers();

}

this.playerWillSaveGame = function() {
		this.serialiseAuctioneers();
}

this.playerEnteredNewGalaxy = function() {
		this.reinitialiseAuctioneers();
}

this.reinitialiseAuctioneers = function() {
	
		for(var i=1;i<=5;i++) {
				reinitialiseAuctioneer(i);
		}
		localAuctioneer();
}

this.reinitialiseAuctioneer = function(aucnum) {
		var auctioneer = new Object;
		auctioneer.name = expandDescription("[cte_auc_name"+galaxyNumber+""+aucnum+"]");
		if (aucnum < 5) {
				var gentypeidx = (3*(aucnum-1))+Math.floor(Math.random()*4);
		} else {
				var gentypeidx = Math.floor(Math.random()*13);
		}
		auctioneer.cargo = worldScripts["CargoTypeExtension"].extendableCargo(worldScripts["CargoTypeExtension"].cargoTypes[gentypeidx]);
		auctioneer.atype = Math.floor(Math.random()*8);

		auctioneer.quantity = 25*(3+Math.floor(Math.random()*6)); // 75-200 TC
		auctioneer.system = Math.floor(Math.random()*256);
		var auctime = clock.adjustedSeconds+Math.floor(86400*(5+(11*Math.random())));
		auctime -= auctime%3600; // exact hour
		auctioneer.time = auctime;
		this.auctioneers[aucnum] = auctioneer;
		worldScripts.CargoTypeExtension.debug("Initialised Auctioneer "+aucnum);
}

this.localAuctioneer = function() {

		if (Math.random() < 0.3) {
// not all the time
				this.auctioneers[0] = undefined;
				return;
		} 
		for (var i=1;i<=5;i++) {
				if (this.auctioneers[i].system == system.ID) {
// not if there's a celebrity auctioneer in the system
						this.auctioneers[0] = undefined;
						return;
				}
		}
		var auctioneer = new Object;
		auctioneer.name = expandDescription("%N [nom1]");
		var irregular = 0;
		if (Math.random() < 0.9) {
// generally attempt to sell cargo that's normally exported
				auctioneer.cargo = worldScripts["CargoTypeExtension"].extendableCargo("");
		} else {
				irregular = 1;
				auctioneer.cargo = worldScripts["CargoTypeExtension"].extendableCargo(worldScripts["CargoTypeExtension"].cargoTypes[Math.floor(Math.random()*13)]);
		}
		if (!auctioneer.cargo) {
				if (Math.random() < 0.8) {
						// generally not if the system doesn't have any regular exports
						this.auctioneers[0] = undefined;
						return;
				} else {
						irregular = 1;
						auctioneer.cargo = worldScripts["CargoTypeExtension"].extendableCargo(worldScripts["CargoTypeExtension"].cargoTypes[Math.floor(Math.random()*13)]);
				}
		}
		auctioneer.atype = galaxyNumber;

		if (Math.random() < 0.25) {
				auctioneer.atype = Math.floor(Math.random()*8);
		} 
		if (auctioneer.atype == 7 && Math.random() < 0.5) {
				// Xrata rare, even in Gal8, for local auctioneers
				auctioneer.atype = Math.floor(Math.random()*8);
		}

		if (irregular == 0) {
				auctioneer.quantity = 5*(2+Math.floor(Math.random()*14)); //10-75TC
		} else {
// generally auctioning small batches
				auctioneer.quantity = Math.min(5*(2+Math.floor(Math.random()*14)),5*(2+Math.floor(Math.random()*14)),5*(2+Math.floor(Math.random()*14))); //10-75TC, biased to low end
		}
		auctioneer.system = system.ID;
		var auctime = clock.adjustedSeconds + (Math.random()*36000); // on the hour
		auctime += 3600 - (auctime%3600);
		auctioneer.time = auctime;
		this.auctioneers[0] = auctioneer;
		worldScripts.CargoTypeExtension.debug("Initialised Local Auctioneer");
}

this.serialiseAuctioneers = function() {
		var serial = "1";
		for (var i=0;i<=5;i++) {
				var auctioneer = this.auctioneers[i];
				if (!auctioneer) {
						serial += "|";
				} else {
						serial += "|"+auctioneer.name+";"+
								auctioneer.cargo+";"+
								auctioneer.atype+";"+
								auctioneer.quantity+";"+
								auctioneer.system+";"+
								auctioneer.time;
				}
		}

		missionVariables.cargotypeextension_auctions = serial;
}

this.unserialiseAuctioneers = function() {
		if (!missionVariables.cargotypeextension_auctions) {
// gives time for cargo types to be initialised
				this.timer = new Timer(this,this.reinitialiseAuctioneers,0.25);
		} else {
				var serialblocks = missionVariables.cargotypeextension_auctions.split("|");
				var format = serialblocks.shift();
				if (format == "1") {
						this.unserialiseAuctioneers1(serialblocks);
				} else {
						log(this.name,"Error: "+svars[0]+" is not a recognised auctioneer format");
						player.consoleMessage("Critical error decoding special cargo data. Please see Latest.log");
				}
		}
}

this.unserialiseAuctioneers1 = function(blocks) {
		this.auctioneers = new Array;
		for (var i=0;i<blocks.length;i++) {
				if (blocks[i].length > 0) {
						var adata = blocks[i].split(";");
						var auc = new Object;
						auc.name = adata[0];				
						auc.cargo = adata[1];
						auc.atype = parseInt(adata[2]);
						auc.quantity = parseInt(adata[3]);				
						auc.system = parseInt(adata[4]);
						auc.time = parseInt(adata[5]);
						this.auctioneers[i] = auc;
				} else {
						this.auctioneers[i] = undefined; // should be slot 0 only
				}
		}
}

this.shipWillExitWitchspace = function() {
		for (var i=1;i<=5;i++) {
				if (!this.auctioneers[i] || this.auctioneers[i].time < clock.adjustedSeconds) {
						this.reinitialiseAuctioneer(i);
						this.tellTraderNet(i);
				}
		}
// need to give some time to exit witchspace and have the clock adjust before this next bit.		
		if (!system.isInterstellarSpace) {
				this.timer = this.localAuctioneer();

				if (this.easteregg) {
						system.addShips("cte_angry",1,player.ship.position,20E3);
				}
		}
}

this.shipExitedWitchspace = function() {
		if (this.easteregg) {
				var angry = system.shipsWithPrimaryRole("cte_angry");
				if (angry.length > 0) {
						angry[0].displayName = this.easteregg+"'s "+angry[0].name;
						angry[0].target = player.ship;
						angry[0].commsMessage("I'll have that "+worldScripts["CargoTypeExtension"].cargoDefinition(this.currentauction.cargo,"specificType")+" when I pry it from your cold dead hands!");
						angry[0].setAI("interceptAI.plist");
						for (var i=0;i<angry[0].escorts.length;i++) {
								angry[0].escorts[i].target = player.ship;
								angry[0].escorts[i].setAI("interceptAI.plist");
						}
				}
				this.easteregg = 0;
		}
}

this.tellTraderNet = function(aucnum) {
		var auctioneer = this.auctioneers[aucnum];
		msg = expandDescription("[cte_auc_move"+(1+Math.floor(Math.random()*6))+"]",{cte_auc_auctioneer: auctioneer.name,
																							cte_auc_good: worldScripts["CargoTypeExtension"].cargoDefinition(auctioneer.cargo,"specificType"),
																							cte_auc_system: System.infoForSystem(galaxyNumber,auctioneer.system).name,
																							cte_auc_time: clock.clockStringForTime(auctioneer.time)});

		worldScripts["CargoTypeExtension"].addTraderNet(msg);
}

this.activeAuction = function() {
		for (var i=0;i<=5;i++) {
				if (this.auctioneers[i] && this.auctioneers[i].system == system.ID && this.auctioneers[i].time > clock.adjustedSeconds) {
						return this.auctioneers[i];
				}
		}
		return false;
}

this.auctionTypeName = function(num) {
		// One for each galaxy, names from Kaxgar/Feudal States
		var names = ["Santaari","Colesque","Lara'tan","Angiana","Proximus","Solans","Jaftra","Xrata"];
		return names[num];
}

/* API calls */

this.traderGossip = function() {
		var aucnum = 1+(clock.days%5);
		if (this.auctioneers[aucnum]) {
				return "* There's a big auction coming up in "+System.infoForSystem(galaxyNumber,this.auctioneers[aucnum].system).name+".";
		} 
		return false;
}

this.describeContracts = function() {
		return "";
}

this.traderHere = function(srole) {
		if (srole != "") { // main stations only for now
				return false;
		}
		if (this.activeAuction()) {
				return true;
		}
		return false;
}

this.traderName = function() {
		return this.activeAuction().name+", auctioneer";
}

this.traderDesc = function() {
		var auc = this.activeAuction();
		var msg = "Welcome, Trader. Bidding on "+auc.quantity+" TC of "+worldScripts["CargoTypeExtension"].cargoDefinition(auc.cargo,"specificType")+" will start at "+clock.clockStringForTime(auc.time)+" and be conducted using "+this.auctionTypeName(auc.atype)+" rules.\n\nAs usual, we require all participants to have sufficient cargo space to load the goods immediately if they win, and to cover all auction fees and bids from cash in hand.";
		return msg;
}

this.runOffer = function() {

		var auc = this.activeAuction();
		
		var msg = "Welcome, Trader. Bidding doesn't start until "+clock.clockStringForTime(auc.time)+", so feel free to get your ship and credit ready before we start. We've got "+auc.quantity+" TC of "+worldScripts["CargoTypeExtension"].cargoDefinition(auc.cargo,"specificType")+" to sell.\n\nRemember, you must have sufficient cargo space to take the goods, and cover all fees and bids from your current credits.\n\nWe'll be using "+this.auctionTypeName(auc.atype)+" bidding:\n"+expandDescription("[cte_auc_rules"+auc.atype+"]");
//		log(this.name,"Run offer");
		mission.runScreen({title: this.traderName(),
											 message: msg,
											 background: "cte_auction.png",
											 choicesKey: "cte_auc_opening"},this.checkAuction,this);
		

}

/** Use this. rather than this. in functions below this point to stop
 * scoping oddities **/

this.minSpaceRequired = function(auc) {
		if (auc.atype == 0) { // Santaari
				return 5; // might get a block size this low at some point
		}
		if (auc.atype == 2) { // Lara'tan
				return 1; // auction is a canister at a time
		}
		return auc.quantity;
}

this.checkAuction = function(choice) {
//		log(this.name,"Check Auction");
		if (choice == "02_BEGIN") {
				var auc = this.activeAuction();
				if (player.ship.cargoSpaceAvailable >= this.minSpaceRequired(auc)) {
						this.startAuction();
						return;
				} else {
						player.consoleMessage("You do not currently have enough free cargo space.",10);
				}
		}
		worldScripts["CargoTypeExtension"].tradeFloor();
}

this.startAuction = function() {
		var auc = this.activeAuction();
		this.currentauction = auc;

		var delay = auc.time-clock.adjustedSeconds;
		clock.addSeconds(delay);
		
		if (auc.atype == 0) {
				this.initSantaariAuction();
		} else if (auc.atype == 1) {
				this.initColesqueAuction();
		} else if (auc.atype == 2) {
				this.initLaratanAuction();
		} else if (auc.atype == 3) {
				this.initAngianaAuction();
		} else if (auc.atype == 4) {
				this.initProximusAuction();
		} else if (auc.atype == 5) {
				this.initSolansAuction();
		} else if (auc.atype == 6) {
				this.initJaftraAuction();
		} else if (auc.atype == 7) {
				this.initXrataAuction();

		} else {
				player.consoleMessage("This auction type is not implemented yet",10);
		}
}

/* General Auction Functions */

this.blockSize = function(auc) {
		if (auc.atype == 0) { // Santaari
				if (auc.quantity >= 50) { // && auc.quantity % 25 == 0) {
						return 25;
				} else if (auc.quantity % 5 == 0) {
						return 5;
				} else {
						return 1; // shouldn't happen, but just in case
				}
		} else if (auc.atype == 2) { // Lara'tan
				return 1;
		} else {
				return auc.quantity;
		}
}

this.angianaBuyout = function() {
		return Math.floor(this.currentbid*2.5);
}

this.colesqueIncrement = function(bid) {
		if (bid < 100) {
				return 5;
		} else if (bid < 250) {
				return 10;
		} else {
				return 25;
		}
}

this.guessValue = function() {
		
		var localdata = worldScripts["CargoTypeExtension"].localCargoData(this.currentauction.cargo);
		if (worldScripts["CargoTypeExtension"].cargoDefinition(this.currentauction.cargo,"buySystems")[galaxyNumber].indexOf(system.ID) === -1) { // not a buy system
				worldScripts["CargoTypeExtension"].debug("Unusual cargo auction");
				if (worldScripts["CargoTypeExtension"].cargoDefinition(this.currentauction.cargo,"sellSystems")[galaxyNumber].indexOf(system.ID) !== -1) {
						// being auctioned at a destination system? Expect the buyer to be planetary
						return Math.floor(localdata[1]*2);
						worldScripts["CargoTypeExtension"].debug("Sell system");
				} else {
						worldScripts["CargoTypeExtension"].debug("Unusual system");
						// alternative calculation needed
						var baseprice = worldScripts["CargoTypeExtension"].cargoPriceImport(this.currentauction.cargo,Math.floor(Math.random()*100),worldScripts["CargoTypeExtension"].defaultMarketInfo())/10;
						var currentprice = baseprice/2; // 100% gross profit seems about right
						worldScripts["CargoTypeExtension"].debug("Base:"+baseprice+";Current:"+currentprice);
						if (currentprice < 40) {
								currentprice = 40;
						}
						if (currentprice > baseprice) {
								return Math.floor(currentprice/10);
						} else {
								return Math.floor(baseprice/10);
						}
				}
		} else if (localdata[0] > this.currentauction.quantity) { // is a buy system
				// can get it easily on the local market, so expect it to go cheaper here
				worldScripts["CargoTypeExtension"].debug("Buy system (small auction)");
				return Math.floor(localdata[1]*0.5);
		} else {
				// this is a substantial amount of cargo, so it might go for a little more than the local market price (so we set the price less than that, of course)
				worldScripts["CargoTypeExtension"].debug("Buy system (big auction)");
				return Math.floor(localdata[1]*0.8);
		}
}


this.initBidders = function(likelyvalue) {
		var numbidders = Math.floor(Math.random()*(2+system.government))+Math.floor(Math.random()*(2+system.government));
		if (numbidders < 1) {
				numbidders = 1; // always have someone to bid against
		} else if (numbidders > 10) {
				numbidders = 10; // or we run out of space on the mission screen
		}
		if ((this.currentauction.atype == 2) && numbidders <= 5) {
				// Lara'tan auctions need a larger number of bidders to work
				numbidders += 5;
		}

		this.currentbidders = new Array();
		for (var i=0;i<numbidders;i++) {
				var bidder = new Object;
// TODO: Make bidders have persistent names, species and personalities
// TODO: Allow occasional rumours about bidder behaviour to appear
				bidder.name = randomName()+" "+randomName();
				bidder.recklessness = Math.random();
				bidder.information = Math.random();
				bidder.preferredvalue = likelyvalue*(0.75+(Math.random()*0.5)+(Math.random()*(1-bidder.information)));
				bidder.maxvalue = bidder.preferredvalue*(1.25+Math.min(Math.random()*(1-bidder.information),(Math.random()*bidder.recklessness)));
				bidder.lastbid = 0;
				this.currentbidders.push(bidder);
		}
		this.playerbid = 0;
}

this.auctionStatus = function() {
		msg = "You: "+player.ship.cargoSpaceAvailable+" TC free, "+player.credits.toFixed(1)+"₢ available\n";
		msg += "Current bid: "+this.currentbid+"₢/TC ("+(this.currentbid*this.blockSize(this.currentauction))+"₢ total)\n";
		msg += "-----------------------------------\n";
		for (var i=0;i<this.currentbidders.length;i++) {
				var line = this.currentbidders[i].name + ": ";
				if (this.currentbidders[i].lastbid == 0) {
						line += "no bid";
				} else {
						line += this.currentbidders[i].lastbid+"₢";
				}
				line += "\n";
				msg += line;
		}
		var line = "Commander "+player.name + ": ";
		if (this.playerbid == 0) {
				line += "no bid";
		} else {
				line += this.playerbid+"₢";
		}
		line += "\n";
		msg += line;
		
		return msg;
}

this.removeAuctionBlock = function() {
		this.currentauction.quantity -= this.blockSize(this.currentauction);
}

this.moveAuctionBlock = function() {
		var block = this.blockSize(this.currentauction);
		if (player.ship.cargoSpaceAvailable < block) {
				return false;
		}
		var price = this.currentbid*block;
		if (player.credits < price) {
				return false;
		}
		for(var i=0;i<block;i++) {
				if (this.currentauction.atype == 2) {
// no bid amount as such in Lara'tan auctions
						worldScripts["CargoTypeExtension"].addSpecialCargo(this.currentauction.cargo,"By auction in "+system.info.name);
				} else {
						worldScripts["CargoTypeExtension"].addSpecialCargo(this.currentauction.cargo,this.currentbid.toFixed(1)+"₢ by auction in "+system.info.name);
				}
		}
		player.credits -= price;
		this.currentauction.quantity -= block;
		return true;
}

this.endAuction = function() {
		mission.runScreen({title: "Auction over",
											 background: "cte_auction.png",
											 message: this.auctionmessage+"\nThe auction is over."});
		this.localAuctioneer();
}

/* Santaari Auctions */

this.initSantaariAuction = function() {
		var likelyvalue = this.guessValue();
		worldScripts["CargoTypeExtension"].debug("Initial valuation: "+likelyvalue);
		this.initBidders(likelyvalue);
		
		this.currentbid = Math.floor(likelyvalue*(2+(0.5*(Math.random()+Math.random()))));
		this.currentbid -= this.currentbid%5;
		this.auctionmessage = "";
		this.playSantaariAuction();

}

this.playSantaariAuction = function() {
		if (this.currentauction.quantity < 1) {
				this.endAuction();
		} else {
				var title = this.currentauction.quantity+" TC of "+worldScripts["CargoTypeExtension"].cargoDefinition(this.currentauction.cargo,"specificType");
				var msg = "Auction: Santaari ("+this.blockSize(this.currentauction)+" TC blocks)\n";
				if (this.auctionmessage != "") {
						msg += "* "+this.auctionmessage+"\n";
						this.auctionmessage = "";
				}
				msg += this.auctionStatus();
				mission.runScreen({title: title,
													 background: "cte_auction.png",
													 message: msg,
													 choicesKey: "cte_auc_santaari_bid"},this.choiceSantaariAuction,this);
		}

}

this.choiceSantaariAuction = function(choice) {
		if (choice == "01_PASS") {
				this.updateSantaariAuction();
		} else if (choice == "02_BID") {
				this.playerbid = this.currentbid;
				if (this.moveAuctionBlock()) {
						player.consoleMessage("Cargo transferred",5);
						this.playSantaariAuction();
				} else {
						player.consoleMessage("Insufficient funds/space",5);
						this.updateSantaariAuction();
				}
		} else if (choice == "03_BIDALL") {
				this.playerbid = this.currentbid;
				if (this.moveAuctionBlock()) {
						while (this.moveAuctionBlock()) {}
						player.consoleMessage("Cargo transferred",5);
						this.playSantaariAuction();
				} else {
						player.consoleMessage("Insufficient funds/space",5);
						this.updateSantaariAuction();
				}				
				
		} else if (choice == "04_LEAVE") {
				
				this.endAuction();
		}
}

this.updateSantaariAuction = function() {
		// Each bidder will buy at preferredvalue
		// Above preferred value, will buy if less than maxvalue depending on recklessness
		// If no-one bids, then drop the bid price by:
		// 25Cr if over 1000
		// 10Cr if over 250
		// 5Cr if over 100
		// 1Cr otherwise

		// If someone bids, 20% of the time they buy whatever is left,
		// otherwise they just buy 1 block.  If they're the only remaining
		// bidder except the player, they buy the lot, though

		// go through in reverse order; means we can splice without breaking things
		for (var i=this.currentbidders.length-1;i>=0;i--) {
				var bidder = this.currentbidders[i];
				worldScripts["CargoTypeExtension"].debug(bidder.name+" prefs "+bidder.preferredvalue+" max "+bidder.maxvalue);
				var buynow = 0;
				if (this.currentbid < bidder.preferredvalue) {
						buynow = 1;
				} else if (this.currentbid < bidder.maxvalue) {
						var diff = Math.pow((this.currentbid-bidder.preferredvalue)/(bidder.maxvalue-bidder.preferredvalue),1/3);
						diff *= 1-Math.pow(Math.random()*bidder.recklessness,3);
						if (Math.random() > diff) {
								buynow = 1
						}
				}

				if (buynow) {
						bidder.lastbid = this.currentbid;
						if (this.currentbidders.length == 1 || Math.random() < 0.2) {
								this.auctionmessage = bidder.name+" buys the remaining lots for "+this.currentbid+"₢/TC";
								this.endAuction();
								return;
						} else {
								
								blocks = this.currentauction.quantity/this.blockSize(this.currentauction);
								buyblocks = Math.min(1+Math.floor(Math.random()*(blocks-1)),1+Math.floor(Math.random()*(blocks-1))); // bias towards 1 block
								
								for (var j=1;j<=buyblocks;j++) {
										this.removeAuctionBlock();
								}
								if (buyblocks > 1) {
										this.auctionmessage = bidder.name+" buys "+buyblocks+" blocks for "+this.currentbid+"₢/TC and leaves";
										this.currentbidders.splice(i,1);
								} else {
										this.auctionmessage = bidder.name+" buys 1 block for "+this.currentbid+"₢/TC"; // and stays in
								}
								break;
						}
				}
		}

		if (this.auctionmessage == "") {
				// no-one buys this round
				if (this.currentbid > 1000) {
						this.currentbid -= 25;
				} else if (this.currentbid > 250) {
						this.currentbid -= 10;
				} else if (this.currentbid > 100) {
						this.currentbid -= 5;
				} else {
						this.currentbid -= 1;
				}
		}
		if (this.currentbid < 5) {
				this.auctionmessage = "Unable to find a buyer, the lots are withdrawn";
				this.endAuction();
		} else {
				this.playSantaariAuction();
		}
}


/* Colesque Auctions */
this.initColesqueAuction = function() {
		var likelyvalue = this.guessValue();
		this.initBidders(likelyvalue);

		this.currentbid = Math.floor(likelyvalue*(0.4+(0.15*(Math.random()+Math.random()))));
		this.currentbid -= this.currentbid%5;
		this.auctionmessage = "";
		this.lastcall = 0;
		this.aucwinner = "";
		this.playColesqueAuction();
}

this.playColesqueAuction = function() {
		if (this.currentauction.quantity < 1) {
				this.endAuction();
		} else {
				var title = this.currentauction.quantity+" TC of "+worldScripts["CargoTypeExtension"].cargoDefinition(this.currentauction.cargo,"specificType");
				var msg = "Auction: Colesque (minimum increment "+this.colesqueIncrement(this.currentbid)+"₢)\n";
				if (this.auctionmessage != "") {
						msg += "* "+this.auctionmessage+"\n";
						this.auctionmessage = "";
				}
				msg += this.auctionStatus();
				mission.runScreen({title: title,
													 background: "cte_auction.png",
													 message: msg,
													 choicesKey: "cte_auc_colesque_bid"},this.choiceColesqueAuction,this);
		}

}

this.choiceColesqueAuction = function(choice) {
		if (choice == "01_PASS") {
				this.updateColesqueAuction();
		} else if (choice == "02_BID") {
				var newbid = this.currentbid+this.colesqueIncrement(this.currentbid);
				if (newbid*this.currentauction.quantity <= player.credits) {
						this.playerbid = newbid;
						this.currentbid = this.playerbid;
						this.lastcall = 0;
						this.aucwinner = "Commander "+player.name;
				} else {
						player.consoleMessage("You don't have enough credits to cover that bid",10);
				}
				this.playColesqueAuction();
		} else if (choice == "03_BIDFIVE") {
				var newbid = this.currentbid+(5*this.colesqueIncrement(this.currentbid));
				if (newbid*this.currentauction.quantity <= player.credits) {
						this.playerbid = newbid;
						this.currentbid = this.playerbid;
						this.lastcall = 0;
						this.aucwinner = "Commander "+player.name;
				} else {
						player.consoleMessage("You don't have enough credits to cover that bid",10);
				}
				this.playColesqueAuction();
		} else if (choice == "04_LEAVE") {
				this.endAuction();
		}
}

this.updateColesqueAuction = function() {
		var activity = 0;
		for (var i=0;i<this.currentbidders.length;i++) {
				var bidder = this.currentbidders[i];
				worldScripts["CargoTypeExtension"].debug(bidder.name+" ("+bidder.recklessness+") prefs "+bidder.preferredvalue+" max "+bidder.maxvalue);
				if (bidder.lastbid < this.currentbid) {
						if (this.currentbid < bidder.preferredvalue) {
								if (Math.random() < bidder.recklessness || this.lastcall > 0) {
										activity = 1;
										this.lastcall = 0;
										this.currentbid += this.colesqueIncrement(this.currentbid);
										bidder.lastbid = this.currentbid;
										this.aucwinner = bidder.name;
								}
						} else if (this.currentbid < bidder.maxvalue) {
								var diff = (this.currentbid-bidder.preferredvalue)/(bidder.maxvalue-bidder.preferredvalue);
								if ((this.lastcall > 0 && Math.random() < bidder.recklessness && Math.random() < bidder.recklessness) || 
										(Math.random() < Math.pow((1-diff)*bidder.recklessness,2))) {
										activity = 1;
										this.lastcall = 0;
										this.currentbid += this.colesqueIncrement(this.currentbid);
										bidder.lastbid = this.currentbid;
										this.aucwinner = bidder.name;
								}
						}
				}
		}

		
		if (activity == 0) {
				if (this.lastcall == 0) {
						this.lastcall = 1;
						this.auctionmessage = "Going once ... going twice ...";
				} else {
						var premsg = "Sold! ";
						var winmsg =  " wins "+this.currentauction.quantity+"TC of "+worldScripts["CargoTypeExtension"].cargoDefinition(this.currentauction.cargo,"specificType")+" for "+(this.currentbid*this.currentauction.quantity)+"₢";
						if (this.currentbid == this.playerbid) {
								this.auctionmessage = premsg+"Commander "+player.name+winmsg;
								if (!this.moveAuctionBlock()) {
										// this shouldn't happen, in theory
										this.auctionmessage = "You don't have the credits/cargo hold to cover that bid! You are forcibly ejected from the room.";
								}
						} else {
								this.auctionmessage = premsg+this.aucwinner+winmsg;
						}
						this.endAuction();
						return;
				}
		} else {
				this.lastcall = 0;
		}
		this.playColesqueAuction();
}

/* Lara'tan auctions */
this.initLaratanAuction = function() {
		var likelyvalue = this.guessValue();
		this.initBidders(likelyvalue);

		this.currentbid = Math.floor((0.8+(Math.random()*0.4))*this.currentauction.quantity*likelyvalue/100);

		this.playerbid = 0;
		this.auctionmessage = "";
		this.lastcall = 1;
		this.aucwinner = "";
		this.playLaratanAuction();
		
}

this.playLaratanAuction = function() {
		if (this.lastcall == 6) {
				this.endLaratanAuction();
		}	else {
				var title = this.currentauction.quantity+" TC of "+worldScripts["CargoTypeExtension"].cargoDefinition(this.currentauction.cargo,"specificType");
				var msg = "You: "+player.ship.cargoSpaceAvailable+" TC free, "+player.credits.toFixed(1)+"₢ available\n";
				msg += "Auction: Lara'tan (ticket price "+this.currentbid+"₢)\n";
				msg += "Round "+this.lastcall+"/5\n";
				
				msg += "-----------------------------------\n";
				for (var i=0;i<this.currentbidders.length;i++) {
						var line = this.currentbidders[i].name + ": ";
						if (this.currentbidders[i].lastbid == 0) {
								line += "no bid";
						} else {
								line += this.currentbidders[i].lastbid+" ticket(s)";
						}
						line += "\n";
						msg += line;
				}
				var line = "Commander "+player.name + ": ";
				if (this.playerbid == 0) {
						line += "no bid";
				} else {
						line += this.playerbid+" ticket(s)";
				}
				line += "\n";
				msg += line;

				mission.runScreen({title: title,
													 background: "cte_auction.png",
													 message: msg,
													 choicesKey: "cte_auc_laratan_bid"},this.choiceLaratanAuction,this);

		}
}

this.choiceLaratanAuction = function(choice) {
		if (choice == "01_PASS") {
				this.updateLaratanAuction();
		} else if (choice == "02_BID") {
				if (player.credits >= this.currentbid) {
						this.playerbid++;
						player.credits -= this.currentbid;
				} else {
						player.consoleMessage("You don't have enough credits to buy a ticket",10);
				}
				this.playLaratanAuction();
		} else if (choice == "03_BIDFIVE") {
				if (player.credits >= this.currentbid*5) {
						this.playerbid+=5;
						player.credits -= this.currentbid*5;
				} else {
						player.consoleMessage("You don't have enough credits to buy 5 tickets",10);
				}
				this.playLaratanAuction();
		} else if (choice == "04_BIDTFIVE") {
				if (player.credits >= this.currentbid*25) {
						this.playerbid+=25;
						player.credits -= this.currentbid*25;
				} else {
						player.consoleMessage("You don't have enough credits to buy 25 tickets",10);
				}
				this.playLaratanAuction();
		}
}

this.totalLaratanSales = function() {
		var total = 0;
		for (var i=0;i<this.currentbidders.length;i++) {
				total += this.currentbidders[i].lastbid;
		}
		total += this.playerbid;
		return total;
}

this.updateLaratanAuction = function() {
		for (var i=0;i<this.currentbidders.length;i++) {
				var bidder = this.currentbidders[i];
				if (bidder.lastbid == 0) {
						bidder.lastbid = 1;
				}
				var total = 1+this.totalLaratanSales();
				do {
						var bought = 0;
						var expectedvalue = ((bidder.lastbid/total)*bidder.preferredvalue*this.currentauction.quantity) - (bidder.lastbid*this.currentbid);
						var newvalue = (((1+bidder.lastbid)/total)*bidder.preferredvalue*this.currentauction.quantity) - ((1+bidder.lastbid)*this.currentbid);
						var diff = newvalue-expectedvalue;
						worldScripts["CargoTypeExtension"].debug(bidder.name+": "+diff);
						if (diff > 0 && (bidder.lastbid*this.currentbid) < (Math.random()*bidder.recklessness*bidder.maxvalue*this.currentauction.quantity)) {
								bought = 1;
								bidder.lastbid++;
						} else if (Math.random()<bidder.recklessness && (bidder.lastbid/total) > (2/(1+this.currentbidders.length))) {
								bought = 1;
								bidder.lastbid++;
						}								
				} while (bought == 1);
		}
		this.lastcall++;
		this.playLaratanAuction();

}

this.endLaratanAuction = function() {

// Math.random() <= this.playerbid/this.totalLaratanSales() for each TC
// until all distributed or we run out of cargo space
		var winchance = this.playerbid/this.totalLaratanSales();
		var won = 0;
		this.currentbid = 0;
		while (player.ship.cargoSpaceAvailable > 0 && this.currentauction.quantity > 0) {
				if (Math.random() < winchance) {
						if (this.moveAuctionBlock()) {
								won++;
						}
				} else {
						this.currentauction.quantity--;
				}
		}
// give a message to say how many TCs were won by the player
		var msg = "Final purchases:\n";
		for (var i=0;i<this.currentbidders.length;i++) {
				var line = this.currentbidders[i].name + ": ";
				if (this.currentbidders[i].lastbid == 0) {
						line += "no bid";
				} else {
						line += this.currentbidders[i].lastbid+" ticket(s)";
						}
				line += "\n";
				msg += line;
		}
		var line = "Commander "+player.name + ": ";
		if (this.playerbid == 0) {
				line += "no bid";
		} else {
				line += this.playerbid+" ticket(s)";
		}
		line += "\n";
		msg += line;
		this.auctionmessage = msg;
		this.auctionmessage += "--------------------------\n";
		if (won == 0) {
				this.auctionmessage += "Unfortunately, you didn't win anything.";
		} else {
				this.auctionmessage += "You won "+won+" TC of "+worldScripts["CargoTypeExtension"].cargoDefinition(this.currentauction.cargo,"specificType")+".";
		}

		this.endAuction();
}

/* Angiana auctions */

this.initAngianaAuction = function() {
		var likelyvalue = this.guessValue();
		this.initBidders(likelyvalue);

		this.currentbid = Math.floor(likelyvalue*(0.4+(0.15*(Math.random()+Math.random()))));
		this.currentbid -= this.currentbid%5;
		this.auctionmessage = "";
		this.lastcall = 0;
		this.aucwinner = "";
		this.playAngianaAuction();
}

this.playAngianaAuction = function() {
		if (this.currentauction.quantity < 1) {
				this.endAuction();
		} else {
				var title = this.currentauction.quantity+" TC of "+worldScripts["CargoTypeExtension"].cargoDefinition(this.currentauction.cargo,"specificType");
				var msg = "Auction: Angiana (minimum increment "+this.colesqueIncrement(this.currentbid)+"₢, buyout "+this.angianaBuyout()+"₢/TC)\n";
				if (this.auctionmessage != "") {
						msg += "* "+this.auctionmessage+"\n";
						this.auctionmessage = "";
				}
				msg += this.auctionStatus();
				mission.runScreen({title: title,
													 background: "cte_auction.png",
													 message: msg,
													 choicesKey: "cte_auc_angiana_bid"},this.choiceAngianaAuction,this);
		}

}

this.choiceAngianaAuction = function(choice) {
		if (choice == "01_PASS") {
				this.updateAngianaAuction();
		} else if (choice == "02_BID") {
// Angiana and Colesque use same increment amounts
				var newbid = this.currentbid+this.colesqueIncrement(this.currentbid);
				if (newbid*this.currentauction.quantity <= player.credits) {
						this.playerbid = newbid;
						this.currentbid = this.playerbid;
						this.lastcall = 0;
						this.aucwinner = "Commander "+player.name;
				} else {
						player.consoleMessage("You don't have enough credits to cover that bid",10);
				}
				this.playAngianaAuction();
		} else if (choice == "03_BUYOUT") {
				var oldbid = this.currentbid;
				this.currentbid = this.angianaBuyout();
				var totalcost = this.currentbid*this.currentauction.quantity;
				if (this.moveAuctionBlock()) {
						this.auctionmessage = "You buy out the auction for "+this.currentbid+"₢/TC ("+totalcost.toFixed(1)+"₢ total)\n";
						this.endAuction();
				} else {
						player.consoleMessage("You don't have enough credits to buy out the auction",10);
						this.currentbid = oldbid;
				}
		} else if (choice == "04_LEAVE") {
				this.endAuction();
		}
}

this.updateAngianaAuction = function() {
		var activity = 0;
		for (var i=0;i<this.currentbidders.length;i++) {
				var bidder = this.currentbidders[i];
				worldScripts["CargoTypeExtension"].debug(bidder.name+" ("+bidder.recklessness+") prefs "+bidder.preferredvalue+" max "+bidder.maxvalue);
// rare that they'll try to buy it out
				if (this.angianaBuyout() < bidder.preferredvalue && Math.random() < bidder.recklessness-0.5) {
						this.auctionmessage = bidder.name+" buys out the auction for "+this.angianaBuyout()+"₢/TC";
						this.endAuction();
						return;
				}
				if (bidder.lastbid < this.currentbid) {
						if (this.currentbid < bidder.preferredvalue) {
// more common that they'll try to bid it up a little to discourage other buyouts.
								if (Math.random() < bidder.recklessness+0.3 || this.lastcall > 0) {
										activity = 1;
										this.lastcall = 0;
										this.currentbid += this.colesqueIncrement(this.currentbid);
										bidder.lastbid = this.currentbid;
										this.aucwinner = bidder.name;
								}
						} else if (this.currentbid < bidder.maxvalue) {
								var diff = (this.currentbid-bidder.preferredvalue)/(bidder.maxvalue-bidder.preferredvalue);
								if ((this.lastcall > 0 && Math.random() < bidder.recklessness && Math.random() < bidder.recklessness) || 
										(Math.random() < Math.pow((1-diff)*bidder.recklessness,2))) {
										activity = 1;
										this.lastcall = 0;
										this.currentbid += this.colesqueIncrement(this.currentbid);
										bidder.lastbid = this.currentbid;
										this.aucwinner = bidder.name;
								}
						}
				}
		}

		
		if (activity == 0) {
				if (this.lastcall == 0) {
						this.lastcall = 1;
						this.auctionmessage = "Going once ... going twice ...";
				} else {
						var premsg = "Sold! ";
						var winmsg =  " wins "+this.currentauction.quantity+"TC of "+worldScripts["CargoTypeExtension"].cargoDefinition(this.currentauction.cargo,"specificType")+" for "+(this.currentbid*this.currentauction.quantity)+"₢";
						if (this.currentbid == this.playerbid) {
								this.auctionmessage = premsg+"Commander "+player.name+winmsg;
								if (!this.moveAuctionBlock()) {
										// this shouldn't happen, in theory
										this.auctionmessage = "You don't have the credits/cargo hold to cover that bid! You are forcibly ejected from the room.";
								}
						} else {
								this.auctionmessage = premsg+this.aucwinner+winmsg;
						}
						this.endAuction();
						return;
				}
		} else {
				this.lastcall = 0;
		}
		this.playAngianaAuction();
}

/* Proximus auctions */

this.initProximusAuction = function() {
		var likelyvalue = this.guessValue();
		this.initBidders(likelyvalue);

		this.currentbid = 5;
		
		this.auctionmessage = "";
		this.lastcall = Math.floor((3+(Math.random()*5))*this.currentbidders.length);
		this.aucwinner = "";
		this.playProximusAuction();
}


this.playProximusAuction = function() {
		if (this.currentauction.quantity < 1) {
				this.endAuction();
		} else {
				var title = this.currentauction.quantity+" TC of "+worldScripts["CargoTypeExtension"].cargoDefinition(this.currentauction.cargo,"specificType");
				var msg = "Auction: Proximus (minimum increment "+this.colesqueIncrement(this.currentbid)+"₢)\n";
				if (this.auctionmessage != "") {
						msg += "* "+this.auctionmessage+"\n";
						this.auctionmessage = "";
				}
				msg += this.auctionStatus();
				mission.runScreen({title: title,
													 background: "cte_auction.png",
													 message: msg,
													 choicesKey: "cte_auc_proximus_bid"},this.choiceProximusAuction,this);
		}
}

this.choiceProximusAuction = function(choice) {
		
		if (choice == "01_PASS") {
				this.updateProximusAuction();
		} else if (choice == "02_BID") {
				var newbid = this.currentbid+this.colesqueIncrement(this.currentbid);
				if (newbid*this.currentauction.quantity <= player.credits) {
						this.playerbid = newbid;
						this.currentbid = this.playerbid;
						this.aucwinner = "Commander "+player.name;
				} else {
						player.consoleMessage("You don't have enough credits to cover that bid",10);
				}
				this.playProximusAuction();
		} else if (choice == "03_BIDFIVE") {
				var newbid = this.currentbid+(5*this.colesqueIncrement(this.currentbid));
				if (newbid*this.currentauction.quantity <= player.credits) {
						this.playerbid = newbid;
						this.currentbid = this.playerbid;
						this.aucwinner = "Commander "+player.name;
				} else {
						player.consoleMessage("You don't have enough credits to cover that bid",10);
				}
				this.playProximusAuction();
		} else if (choice == "04_LEAVE") {
				this.endAuction();
		}
}

this.updateProximusAuction = function() {
		this.lastcall--;
		for (var i=0;i<this.currentbidders.length;i++) {
				if (this.lastcall <= 0) {
						break;
				}
				worldScripts["CargoTypeExtension"].debug(this.lastcall);
				var bidder = this.currentbidders[i];
				worldScripts["CargoTypeExtension"].debug(bidder.name+" ("+bidder.recklessness+") prefs "+bidder.preferredvalue+" max "+bidder.maxvalue);
				if (bidder.lastbid < this.currentbid) {
						do {
// might raise a few times
								var madebid = 0;
								if (this.currentbid < bidder.preferredvalue) {
										if (Math.random() < 0.75+(bidder.recklessness/4)) {
												activity = 1;
												this.currentbid += this.colesqueIncrement(this.currentbid);
												bidder.lastbid = this.currentbid;
												this.aucwinner = bidder.name;
												madebid = 1;
										}
								} else if (this.currentbid < bidder.maxvalue) {
										var diff = (this.currentbid-bidder.preferredvalue)/(bidder.maxvalue-bidder.preferredvalue);
										if ((Math.random() < bidder.recklessness) || 
												(Math.random() < Math.pow((1-diff)*bidder.recklessness,2))) {
												activity = 1;
												this.currentbid += this.colesqueIncrement(this.currentbid);
												bidder.lastbid = this.currentbid;
												this.aucwinner = bidder.name;
												madebid = 1;
										}
								}
						} while (madebid == 1);
				}
				this.lastcall--;
		}

		
		if (this.lastcall <= 0) {
				var premsg = "The ship has arrived. Sold! ";
				var winmsg =  " wins "+this.currentauction.quantity+"TC of "+worldScripts["CargoTypeExtension"].cargoDefinition(this.currentauction.cargo,"specificType")+" for "+(this.currentbid*this.currentauction.quantity)+"₢";
				if (this.currentbid == this.playerbid) {
						this.auctionmessage = premsg+"Commander "+player.name+winmsg;
						if (!this.moveAuctionBlock()) {
								// this shouldn't happen, in theory
								this.auctionmessage = "You don't have the credits/cargo hold to cover that bid! You are forcibly ejected from the room.";
						}
				} else {
						this.auctionmessage = premsg+this.aucwinner+winmsg;
				}
				this.endAuction();
				return;
		}
		this.playProximusAuction();
}


/* Solans Auctions */
this.initSolansAuction = function() {
		var likelyvalue = this.guessValue();
		this.initBidders(likelyvalue);

		this.currentbid = Math.floor(likelyvalue*(0.4+(0.15*(Math.random()+Math.random()))));
		this.currentbid -= this.currentbid%5;
		this.auctionmessage = "";
		this.lastcall = 0;
		this.aucwinner = "";
		this.playSolansAuction();
}

this.playSolansAuction = function() {
		if (this.currentauction.quantity < 1) {
				this.endAuction();
		} else {
				var title = this.currentauction.quantity+" TC of "+worldScripts["CargoTypeExtension"].cargoDefinition(this.currentauction.cargo,"specificType");
				var msg = "Auction: Solans (increment "+this.colesqueIncrement(this.currentbid)+"₢)\n";
				if (this.auctionmessage != "") {
						msg += "* "+this.auctionmessage+"\n";
						this.auctionmessage = "";
				}
				msg += this.auctionStatus();
				mission.runScreen({title: title,
													 background: "cte_auction.png",
													 message: msg,
													 choicesKey: "cte_auc_solans_bid"},this.choiceSolansAuction,this);
		}

}

this.choiceSolansAuction = function(choice) {
		if (choice == "02_BID") {
				var newbid = this.currentbid+this.colesqueIncrement(this.currentbid);
				if (newbid*this.currentauction.quantity <= player.credits) {
						this.playerbid = newbid;
						this.currentbid = this.playerbid;
						this.aucwinner = "Commander "+player.name;
						this.updateSolansAuction();
				} else {
						player.consoleMessage("You don't have enough credits to cover that bid",10);
						this.playSolansAuction();
				}
		} else if (choice == "04_LEAVE") {
				this.endAuction();
		}
}

this.updateSolansAuction = function() {
		var dropouts = new Array;
		for (var i=0;i<this.currentbidders.length;i++) {
				var bidder = this.currentbidders[i];
				worldScripts["CargoTypeExtension"].debug(bidder.name+" ("+bidder.recklessness+") prefs "+bidder.preferredvalue+" max "+bidder.maxvalue);
				if (this.currentbid < bidder.preferredvalue) {
						this.currentbid += this.colesqueIncrement(this.currentbid);
						bidder.lastbid = this.currentbid;
						this.aucwinner = bidder.name;
				} else {
						if (Math.random()*(1-bidder.recklessness) < 1-((this.currentbid-bidder.preferredvalue)/(bidder.maxvalue-bidder.preferredvalue))) {
								this.currentbid += this.colesqueIncrement(this.currentbid);
								bidder.lastbid = this.currentbid;
								this.aucwinner = bidder.name;
						} else {
								dropouts.unshift(i);
						}
				}
		}
		
		for(var j=0;j<dropouts.length;j++) {
				this.currentbidders.splice(dropouts[j],1);	
		}
		
		if (this.currentbidders.length == 0) {
				var premsg = "Sold! ";
				var winmsg =  " wins "+this.currentauction.quantity+"TC of "+worldScripts["CargoTypeExtension"].cargoDefinition(this.currentauction.cargo,"specificType")+" for "+(this.currentbid*this.currentauction.quantity)+"₢";
				if (this.currentbid == this.playerbid) {
						this.auctionmessage = premsg+"Commander "+player.name+winmsg;
						if (!this.moveAuctionBlock()) {
								// this shouldn't happen, in theory
								this.auctionmessage = "You don't have the credits/cargo hold to cover that bid! You are forcibly ejected from the room.";
						} else {
								this.auctionmessage = premsg+this.aucwinner+winmsg;
						}
						this.endAuction();
						return;
				}
		}
		this.playSolansAuction();
}

/* Jaftra Auctions */

this.initJaftraAuction = function() {
		var likelyvalue = this.guessValue();
		worldScripts["CargoTypeExtension"].debug("Initial valuation: "+likelyvalue);
		this.initBidders(likelyvalue);
		
		this.currentbid = Math.floor(likelyvalue*(2+(0.5*(Math.random()+Math.random()))));
		this.currentbid -= this.currentbid%5;
		this.auctionmessage = "";
		this.playJaftraAuction();

}

this.playJaftraAuction = function() {
		if (this.currentauction.quantity < 1) {
				this.endAuction();
		} else {
				var title = this.currentauction.quantity+" TC of "+worldScripts["CargoTypeExtension"].cargoDefinition(this.currentauction.cargo,"specificType");
				var msg = "Auction: Jaftra\n";
				if (this.auctionmessage != "") {
						msg += "* "+this.auctionmessage+"\n";
						this.auctionmessage = "";
				}
				msg += this.auctionStatus();
				mission.runScreen({title: title,
													 background: "cte_auction.png",
													 message: msg,
													 choicesKey: "cte_auc_jaftra_bid"},this.choiceJaftraAuction,this);
		}

}

this.choiceJaftraAuction = function(choice) {
		if (choice == "01_PASS") {
				this.updateJaftraAuction();
		} else if (choice == "02_BID") {
				this.playerbid = this.currentbid;
				if (this.moveAuctionBlock()) {
						player.consoleMessage("Cargo transferred",5);
						this.playJaftraAuction();
				} else {
						player.consoleMessage("Insufficient funds/space",5);
						this.updateJaftraAuction();
				}
		} else if (choice == "04_LEAVE") {
				
				this.endAuction();
		}
}

this.updateJaftraAuction = function() {
		// Each bidder will buy at preferredvalue
		// Above preferred value, will buy if less than maxvalue depending on recklessness
		// If no-one bids, then drop the bid price by:
		// 25Cr if over 1000
		// 10Cr if over 250
		// 5Cr if over 100
		// 1Cr otherwise

		// If someone bids, 20% of the time they buy whatever is left,
		// otherwise they just buy 1 block.  If they're the only remaining
		// bidder except the player, they buy the lot, though

		// go through in reverse order; means we can splice without breaking things
		for (var i=this.currentbidders.length-1;i>=0;i--) {
				var bidder = this.currentbidders[i];
				worldScripts["CargoTypeExtension"].debug(bidder.name+" prefs "+bidder.preferredvalue+" max "+bidder.maxvalue);
				var buynow = 0;
				if (this.currentbid < bidder.preferredvalue) {
						buynow = 1;
				} else if (this.currentbid < bidder.maxvalue) {
						var diff = Math.pow((this.currentbid-bidder.preferredvalue)/(bidder.maxvalue-bidder.preferredvalue),1/3);
						diff *= 1-Math.pow(Math.random()*bidder.recklessness,3);
						if (Math.random() > diff) {
								buynow = 1
						}
				}

				if (buynow) {
						bidder.lastbid = this.currentbid;
						this.auctionmessage = bidder.name+" buys the cargo for "+this.currentbid+"₢/TC";
						this.endAuction();
						return;
				}
		}

		if (this.auctionmessage == "") {
				// no-one buys this round
				if (this.currentbid > 1000) {
						this.currentbid -= 25;
				} else if (this.currentbid > 250) {
						this.currentbid -= 10;
				} else if (this.currentbid > 100) {
						this.currentbid -= 5;
				} else {
						this.currentbid -= 1;
				}
		}
		if (this.currentbid < 5) {
				this.auctionmessage = "Unable to find a buyer, the lots are withdrawn";
				this.endAuction();
		} else {
				this.playJaftraAuction();
		}
}



/* Xrata Auctions */
this.initXrataAuction = function() {
		var likelyvalue = this.guessValue();
		this.initBidders(likelyvalue);

		this.currentbid = Math.floor(likelyvalue*(0.4+(0.15*(Math.random()+Math.random()))));
		this.currentbid -= this.currentbid%5;
		this.previousbid = 0;
		this.auctionmessage = "";
		this.lastcall = 0;
		this.aucwinner = "";
		this.aucloser = "";
		this.playXrataAuction();
}

this.playXrataAuction = function() {
		if (this.currentauction.quantity < 1) {
				this.endAuction();
		} else {
				var title = this.currentauction.quantity+" TC of "+worldScripts["CargoTypeExtension"].cargoDefinition(this.currentauction.cargo,"specificType");
				var msg = "Auction: Xrata (minimum increment "+this.colesqueIncrement(this.currentbid)+"₢)\n";
				if (this.auctionmessage != "") {
						msg += "* "+this.auctionmessage+"\n";
						this.auctionmessage = "";
				}
				msg += this.auctionStatus();
				mission.runScreen({title: title,
													 background: "cte_auction.png",
													 message: msg,
													 choicesKey: "cte_auc_xrata_bid"},this.choiceXrataAuction,this);
		}

}

this.choiceXrataAuction = function(choice) {
		if (choice == "01_PASS") {
				this.updateXrataAuction();
		} else if (choice == "02_BID") {
				var newbid = this.currentbid+this.colesqueIncrement(this.currentbid);
				if (newbid*this.currentauction.quantity <= player.credits) {
						this.playerbid = newbid;
						if (this.aucwinner != "Commander "+player.name) {
								this.previousbid = this.currentbid;
								worldScripts["CargoTypeExtension"].debug("Loser bid "+this.previousbid);
								this.aucloser = this.aucwinner;
						}

						this.currentbid = this.playerbid;
						this.lastcall = 0;
						this.aucwinner = "Commander "+player.name;
				} else {
						player.consoleMessage("You don't have enough credits to cover that bid",10);
				}
				this.playXrataAuction();
		} else if (choice == "03_BIDFIVE") {
				var newbid = this.currentbid+(5*this.colesqueIncrement(this.currentbid));
				if (newbid*this.currentauction.quantity <= player.credits) {
						this.playerbid = newbid;
						if (this.aucwinner != "Commander "+player.name) {
								this.previousbid = this.currentbid;
								this.aucloser = this.aucwinner;
						}

						this.currentbid = this.playerbid;
						this.lastcall = 0;
						this.aucwinner = "Commander "+player.name;
				} else {
						player.consoleMessage("You don't have enough credits to cover that bid",10);
				}
				this.playColesqueAuction();
		} else if (choice == "04_LEAVE") {
				if (this.aucloser == "Commander "+player.name || this.aucwinner == "Commander "+player.name) {
						player.consoleMessage("You can't leave Xrata auctions if you're in first or second place",10);
						this.playXrataAuction();
				} else {
						this.endAuction();
				}
		}
}

this.updateXrataAuction = function() {
		var activity = 0;
		var angryloser = 0;
		for (var i=0;i<this.currentbidders.length;i++) {
				var bidder = this.currentbidders[i];
				worldScripts["CargoTypeExtension"].debug(bidder.name+" ("+bidder.recklessness+") prefs "+bidder.preferredvalue+" max "+bidder.maxvalue);
				if (bidder.lastbid < this.currentbid) {
						if (bidder.name != this.aucloser) { // if not currently 2nd
								if (this.currentbid < bidder.preferredvalue) {
										if (Math.random() < bidder.recklessness || (this.previousbid == 0 && this.lastcall == 1)) {
												activity = 1;
												this.lastcall = 0;
												this.previousbid = this.currentbid;
												this.currentbid += this.colesqueIncrement(this.currentbid);
												bidder.lastbid = this.currentbid;
												this.aucloser = this.aucwinner;
												this.aucwinner = bidder.name;
										}
								} // if it's got above preferred and we're not first or second, don't bid!
						} else { // try to get out of 2nd!
								if (this.currentbid < bidder.maxvalue && (Math.random() < bidder.recklessness || (this.lastcall == 1  && Math.random() < bidder.recklessness))) {
										activity = 1;
										this.lastcall = 0;
										this.previousbid = this.currentbid;
										this.currentbid += this.colesqueIncrement(this.currentbid);
										bidder.lastbid = this.currentbid;
										this.aucloser = this.aucwinner;
										this.aucwinner = bidder.name;
								} else if (Math.random() < bidder.recklessness*(bidder.maxvalue/this.currentbid)) { // even if it means going over max bid
										activity = 1;
										this.lastcall = 0;
										this.previousbid = this.currentbid;
										this.currentbid += this.colesqueIncrement(this.currentbid);
										bidder.lastbid = this.currentbid;
										this.aucloser = this.aucwinner;
										this.aucwinner = bidder.name;
								} else if (bidder.maxvalue < this.currentbid) {
										angryloser = (this.currentbid/bidder.maxvalue)-1;
								}
						}
				}
		}

		
		if (activity == 0) {
				if (this.lastcall == 0) {
						this.lastcall = 1;
						this.auctionmessage = "Going once ... going twice ...";
				} else {
						var premsg = "Sold! ";
						var winmsg =  " wins "+this.currentauction.quantity+"TC of "+worldScripts["CargoTypeExtension"].cargoDefinition(this.currentauction.cargo,"specificType")+" for "+(this.currentbid*this.currentauction.quantity)+"₢\n";
						var loserprice = (this.previousbid*this.currentauction.quantity);
						var losemsg = this.aucloser+" must also pay "+loserprice+"₢\n";

						if (this.currentbid == this.playerbid) {
								this.auctionmessage = premsg+"Commander "+player.name+winmsg;
								if (!this.moveAuctionBlock()) {
										// this shouldn't happen, in theory
										this.auctionmessage = "You don't have the credits/cargo hold to cover that bid! You are forcibly ejected from the room.";
								}
								if (angryloser>0 && Math.random() < angryloser) {
										worldScripts["CargoTypeExtension"].debug("Easter egg activated!");
										this.easteregg = this.aucloser;
								}
						} else {
								this.auctionmessage = premsg+this.aucwinner+winmsg;
						}

						if (this.aucloser == "Commander "+player.name) {
								player.credits -= loserprice;
						}
						this.auctionmessage += losemsg;

						this.endAuction();
						return;
				}
		} else {
				this.lastcall = 0;
		}
		this.playXrataAuction();
}
