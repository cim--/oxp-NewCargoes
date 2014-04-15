this.name = "CargoTypeExtension-Scavenger";
this.description = "Rare goods and their collectors";

// var this = this;

this.startUp = function() {
		worldScripts["CargoTypeExtension"].registerPersonality(this.name);

		var cargotypes = ["F1","food","Colonial Ration Packs","The ration packs used by the first human settlers of the many worlds are of great interest to historians. Most of the packs are empty, but even the packaging can provide significant information about what humans ate several centuries ago, and how this varied between times and places.",
											"T1","textiles","Panels of Far Voyager Tapestry","When the Far Voyager Generation Ship was found derelict in the Birior system in 2954, the salvage team discovered a tapestry over ten miles in length running much of the length of the ship, depicting the history of the vessel's voyage. Its panels were carefully loaded into a freighter, which was then ambushed by pirates. Fortunately they recognised the immense value of the tapestry; unfortunately to get away with it they had to spend years slowly fencing it panel by panel across the eight charts. Quonso University has been slowly buying up the panels from private ownership ever since with the aim of reconstructing the whole tapestry.",
											"O1","radioactives","Quantum Phase Matter","Quantum Phase Matter appears to most instruments to be perfectly normal, but its quantum vibrations are a fraction of a degree out of phase with the rest of the universe. The implications of this are not known, and a few high-tech labs are desperate for further samples for their research.",
											"IS1","slaves","Suspended animation medpods","Larivearian pirates made a daring raid on the experimental hospital there, stealing hundreds of thousands of medpods for slaves, and destroying much of the facility in the process. Unfortunately for them, the first capsule they opened contained a victim of Rirelaxean Exploding Disease, and the majority of the pirates died within hours. A few who had already left to try to sell the pods instead dumped them across the charts when they heard what had happened. No-one now dares open them until they can be brought back to Larivear to be correlated against the remains of the medical records there.",
											"L1","liquorWines","Venerable Whisky Barrels","It was inevitable that the very richest members of galactic society would no longer be content with whisky that had been aged for mere decades. These barrels, heavily reinforced, are well over a century old, and the whisky continues to mature inside them.",
											"X1","luxuries","Scrolls of the Poet Lexegez","The work of Lexegez is said to be the finest and most accurate poetic description of the universe, with their Quanteisrion cycle, describing all of the 2,040 worlds known during their time, probably the most famous. These are first generation facsimiles, believed by the most pretentious of galactic society to be the best way to experience the poems. Most people just buy the book.",
											"IN1","narcotics","Stored Experience Cubes","An extremely potent hallucinogen, which allows the recipient to experience the full sensory input of its creator. Unfortunately, the neural incompatibilities this causes are invariably fatal within seconds. The Star Bridge Biocomputing Consortium is working on a translator and reader for the cubes to try to recover their contents safely.",
											"C1","computers","Antique AIs","First-hand information is the best, and so the few AIs surviving intact from centuries ago are highly sought after by historians who are willing to construct complex systems to overcome decades of protocol and hardware drift.",
											"M1","machinery","Perpetual Motion Machines","The development of systems that can power themselves consistently from ambient energy sources, and so appear to be in perpetual motion, was a significant fad of the 3020s, and a wide variety of approaches ranging from zero-point energy collection to the use of tiny convection currents were perfected. None, of course, gave enough energy to do more than turn miniature clockwork assemblies, but the surviving machines are exquisite artworks in their own way.",
											"A1","alloys","Crystal plates","The formation of semi-random artworks by growing crystals in rapidly-cooled alloys was the predominant rodent art form of the 3090s. Though it fell out of fashion as quickly as it had risen, some of the more aesthetically pleasing examples are still sought by the more cosmopolitan art galleries.",
											"IF1","firearms","Dueling Accelerators","In the days before high-thrust inertialess drives for spacecraft were widespread, a common form of dueling was for the two ships to orbit a large gravity well, and use these mass accelerators to launch projectiles at each other. While a ship's shields would generally prevent immediate damage, the momentum transfer could potentially throw the ship towards the surface too fast to compensate - or into deep space to freeze. Nowadays they are utterly impractical as a weapon and only of interest to collectors.",
											"U1","furs","Dironothaxaurian Life-bones","Bones of an unknown creature, over 40 million years old, that sing and wait for something. The predominant theory is that they are incubation pods, but if so, no-one has yet found the conditions that will make them hatch.",
											"R1","minerals","Celanni Remnants","Named after the rock hermit who first discovered them, these small artefacts of unknown origin are occasionally found buried within asteroids, though never on planets. Research has so far only been able to determine that they are found throughout all eight galaxies and predate all sentient Galcop species by millions of years. The rest - including theories of alien rather than natural origin - is all speculation, and xenomineralogy labs will pay well for them."
										 ];

		this.scavengerCargoes = new Array();
		while (cargotypes.length > 0) {
				var cargo = this.cargoClassAntique();
				cargo.ID = "CTE_CTA_"+cargotypes.shift();
				cargo.genericType = cargotypes.shift();
				cargo.specificType = cargotypes.shift();
				cargo.desc = cargotypes.shift();
				worldScripts["CargoTypeExtension"].registerCargoType(cargo);
				this.scavengerCargoes.push(cargo.ID);
		}

/*		var names = expandDescription("[cte_namegen]").split(";");
		for (var i=0;i<13;i++) {
				log(this.name,randomName()+" "+names[i]);
		} */
		
		this.scavengerLocations = new Array;

		if (missionVariables.cargotypeextension_scavenger) {
				this.unserialiseScavengers();
		} else {
				this.initialiseScavengers();
		}
}

this.playerWillSaveGame = function(savetype) {
		this.serialiseScavengers();
}

this.initialiseScavengers = function() {
		for (var i=0;i<this.scavengerCargoes.length;i++) {
				this.scavengerLocations.push(Math.floor(Math.random()*2048));
		}
}

this.serialiseScavengers = function() {
		missionVariables.cargotypeextension_scavenger = "1|"+this.scavengerLocations.join("|");
}

this.unserialiseScavengers = function() {
		var scavengers = missionVariables.cargotypeextension_scavenger.split("|");
		var version = scavengers.shift();
		if (version == "1") {
				this.unserialiseScavengers1(scavengers);
		} else {
				log(this.name,"Error: "+version+" is not a recognised scavenger data format");
				player.consoleMessage("Critical error decoding scavenger data. Please see Latest.log");
		}
}

this.unserialiseScavengers1 = function(scavengers) {
		this.scavengerLocations = scavengers;		
}


this.cargoClassAntique = function() {
		var cargo = new Object;
		cargo.buySystems = [[],[],[],[],[],[],[],[]];
		cargo.sellSystems = [[],[],[],[],[],[],[],[]];
		cargo.slump = -1;
		cargo.unslump = -1;
		cargo.sourceRumour = -1;
		cargo.destinationRumour = -1;
		cargo.salvageMarket = 0.1;
		cargo.forbidExtension = 1; // extensions could give hundreds of tons too easily!
		cargo.buyAdjust = 2000;
		cargo.sellAdjust = 5000;
		return cargo;
}

this.shipWillEnterWitchspace = function() {
		if (Math.random() < 0.01) {
				this.moveScavenger(Math.floor(Math.random()*this.scavengerLocations.length));
		} else if (Math.random() < 0.2) {
				this.reportScavenger(Math.floor(Math.random()*this.scavengerLocations.length));
		}
}

this.moveScavenger = function(sid) {
		worldScripts["CargoTypeExtension"].debug("Moving Scavenger "+sid);
		do {
				var newpos = Math.floor(Math.random()*2048);
		} while (this.scavengerLocations.indexOf(newpos) > -1); // avoid each other

		var oldpos = this.scavengerLocations[sid];
		this.scavengerLocations[sid] = newpos;

		if (Math.floor(oldpos/256) == galaxyNumber) {
				var oldval = System.infoForSystem(galaxyNumber,oldpos%256).name;
		} else {
				var oldval = "Chart "+(1+(Math.floor(oldpos/256)));
		}
		
		if (Math.floor(newpos/256) == galaxyNumber) {
				var newval = System.infoForSystem(galaxyNumber,newpos%256).name;
		} else {
				var newval = "Chart "+(1+(Math.floor(newpos/256)));
		}
//		worldScripts["CargoTypeExtension"].debug(oldpos+" -> "+newpos);
		worldScripts["CargoTypeExtension"].debug(oldval+" -> "+newval);
//		worldScripts["CargoTypeExtension"].debug(this.scavengerCargoes[sid]);
		var cargo = worldScripts["CargoTypeExtension"].cargoDefinition(this.scavengerCargoes[sid],"specificType");

		if (oldval == newval) {
				return; // moved within chart X but player not in chart X
		}
		var msg = expandDescription("[cte_scav_move]",{ cte_scav_name: expandDescription("[cte_scav_name"+sid+"]"),
																										cte_scav_cargo: cargo,
																										cte_scav_oldpos: oldval,
																										cte_scav_newpos: newval});
//		worldScripts["CargoTypeExtension"].debug(oldval+" -> "+newval);
		worldScripts["CargoTypeExtension"].addTraderNet(msg);
}

this.reportScavenger = function(sid) {
		var oldpos = this.scavengerLocations[sid];

		if (Math.floor(oldpos/256) == galaxyNumber) {
				var oldval = System.infoForSystem(galaxyNumber,oldpos%256).name;
		} else {
				var oldval = "Chart "+(1+(Math.floor(oldpos/256)));
		}
		var cargo = worldScripts["CargoTypeExtension"].cargoDefinition(this.scavengerCargoes[sid],"specificType");
		var msg = expandDescription("[cte_scav_stay]",{ cte_scav_name: expandDescription("[cte_scav_name"+sid+"]"),
																										cte_scav_cargo: cargo,
																										cte_scav_oldpos: oldval
																										});
//		worldScripts["CargoTypeExtension"].debug(oldval+" -> "+newval);
		worldScripts["CargoTypeExtension"].addTraderNet(msg);
}

this.activeScavenger = function() {
		var longsysid = (galaxyNumber*256)+system.ID;
		if (this.scavengerLocations.indexOf(longsysid) > -1) {
				return this.scavengerLocations.indexOf(longsysid);
		}
		return -1;
}

/* API calls */

this.traderGossip = function() {
		var about = clock.days % this.scavengerLocations.length;
		var cargo = worldScripts["CargoTypeExtension"].cargoDefinition(this.scavengerCargoes[about],"specificType");

		if (Math.floor(this.scavengerLocations[about]/256) == galaxyNumber) {
				var rumour = expandDescription("[cte_scav_rumour]",{ cte_scav_name: expandDescription("[cte_scav_name"+about+"]"),
																														 cte_scav_cargo: cargo,
																														 cte_scav_pos: System.infoForSystem(galaxyNumber,this.scavengerLocations[about]%256).name });

				return "* "+rumour;
				
		} else if (clock.days % 7 == 3) {
				return "* I hear someone is looking for "+cargo+" in Chart "+(1+(Math.floor(this.scavengerLocations[about]/256)));
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
		return this.activeScavenger() > -1;
}

this.traderName = function() {
		return expandDescription("[cte_scav_name"+this.activeScavenger()+"], collector");
}

this.traderDesc = function() {
		var scav = this.activeScavenger();
		var cargo = worldScripts["CargoTypeExtension"].cargoDefinition(this.scavengerCargoes[scav],"specificType");
		var msg = "Hello Trader "+player.name+". I am "+expandDescription("[cte_scav_name"+scav+"]")+", and I am looking for "+cargo+". It only rarely appears on the market, and I don't have time to search the entire eight myself, so I'll pay at least one thousand credits for every genuine canister you bring me, and a bonus if you can save me time and bring me more than one at once.\n\nI don't know how long I'll be staying here - in my line of work one really has to follow up every credible lead - but if I move on I'll make sure my new location is posted.\n\nIf you find any, look for me again, and I'm sure we can make a deal.";
		return msg;
}

this.runOffer = function() {
		var scav = this.activeScavenger();

		var spec = worldScripts["CargoTypeExtension"].cargoDefinition(this.scavengerCargoes[scav],"specificType");
		var gen = worldScripts["CargoTypeExtension"].cargoDefinition(this.scavengerCargoes[scav],"genericType");
		
		var amount = worldScripts["CargoTypeExtension"].hasSpecialCargo(this.scavengerCargoes[scav]);
		if (amount == 0) {
				var msg = "I'm sorry, Trader. I'm sure the contents of your hold are fascinating to the right buyer, but I'm only looking for "+spec+". I won't take up your time any further.";
				mission.runScreen({title: this.traderName(),
													 background: "cte_tradefloor.png",
													 message: msg},this.leaveScavenger,this);

		} else {
				var price = Math.floor(1000*amount*(Math.pow(amount,0.25)));
				if (gen == "slaves" || gen == "narcotics" || gen == "firearms") {
						price *= 2; // illegal goods
				}

				var msg = "Excellent work, Trader. In exchange for the "+amount+" TC of "+spec+" in your hold, I will pay "+price+"₢. Do we have a deal?";
				mission.runScreen({title: this.traderName(),
													 background: "cte_tradefloor.png",
													 message: msg,
													 choicesKey: "cte_scav_deal"},this.dealScavenger,this);
		}
}

this.leaveScavenger = function() {
		worldScripts["CargoTypeExtension"].tradeFloor();
}

this.dealScavenger = function(choice) {
		if (choice == "01_DEAL") {
				var scav = this.activeScavenger();
				var gen = worldScripts["CargoTypeExtension"].cargoDefinition(this.scavengerCargoes[scav],"genericType");

				var amount = worldScripts["CargoTypeExtension"].hasSpecialCargo(this.scavengerCargoes[scav]);				
				for (var i=0;i<amount;i++) {
						worldScripts["CargoTypeExtension"].removeSpecialCargo(this.scavengerCargoes[scav]);
				}
				var price = Math.floor(1000*amount*(Math.pow(amount,0.25)));
				if (gen == "slaves" || gen == "narcotics" || gen == "firearms") {
						price *= 2; // illegal goods
				}

				player.credits += price;

				var msg = "A pleasure dealing with you, Trader. "+price+"₢ has been credited to your account. Contact me again if you find any more.";

		} else {
				var msg = "Your choice, but you won't find anyone else willing to pay this much. Come back when you've figured that out for yourself.";
		}
		mission.runScreen({title: this.traderName(),
											 background: "cte_tradefloor.png",
											 message: msg},this.leaveScavenger,this);

}