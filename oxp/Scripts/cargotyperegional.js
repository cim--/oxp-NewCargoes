this.name = "CargoTypeExtension-Regional";
this.description = "Significant Regional fluctuations in pricing to make trading more interesting.";

this.fluctypes = 12;
/* Cargo classes
0=import ban (not used for cargo classes)
1=export ban (not used for cargo classes)
2=price decrease (export)
3=price increase (export)
4=price decrease (import)
5=price increase (import)
* Specific Cargo Types
6-11 as above
*/
this.cargoTypes = ["food","textiles","radioactives","slaves","liquorWines","luxuries","narcotics","computers","machinery","alloys","firearms","furs","minerals"];


this.startUp = function() {
		worldScripts["CargoTypeExtension"].registerPriceChange(this.name);
		worldScripts["CargoTypeExtension"].registerPermit(this.name);

/* Define regions. Thanks to Svengali for sharing region data from BGS-X */
		this.regions = new Array;
		for (var i=0;i<8;i++) {
				this.regions[i] = new Array;
		}
		this.regions[0].push({id:0,name: "Old Worlds", systems:[7,39,46,55,129,147],type:"area"});
		this.regions[0].push({id:1,name: "Xexedi Cluster", systems:[37,43,48,58,64,101,111,140,141,188,197,250],type:"area"});
		this.regions[0].push({id:2,name: "Iron Stars", systems:[2,3,6,94,128,132,146,153,196,234],type:"area"});
		this.regions[0].push({id:3,name: "Teraed Region", systems:[60,84,99,120,121,185,191,221,241],type:"area"});
		this.regions[0].push({id:4,name: "Galcenter G1", systems:[21,42,62,93,100,131,139,167,230,249],type:"area"});
		this.regions[0].push({id:5,name: "Devils Triangle", systems:[20,148,181],type:"area"});
		this.regions[0].push({id:6,name: "Pulsar Worlds", systems:[8,18,49,51,102,114,158,215,218,246],type:"area"});
		this.regions[0].push({id:7,name: "Tortuga Expanse", systems:[59,142,174,213,223,238],type:"area"});
		this.regions[0].push({id:8,name: "Spaceway L1", systems:[7,50,73,111,129,141,186,227,35,73,188,250],type:"lane"});
		this.regions[0].push({id:9,name: "Spaceway L2", systems:[7,29,42,73,89,93,129,131,222,227],type:"lane"});
		this.regions[0].push({id:10,name: "Spaceway L3", systems:[16,28,36,62,99,131,150,198,221],type:"lane"});
		this.regions[0].push({id:11,name: "Spaceway L4", systems:[18,86,99,126,241,246],type:"lane"});
		this.regions[1].push({id:12,name: "Citadels Of Chaos", systems:[5,37,100,229],type:"area"});
		this.regions[1].push({id:13,name: "Equilibrium", systems:[61,92,156],type:"area"});
		this.regions[1].push({id:14,name: "Fertile Cresent", systems:[0,30,47,64,110,135,137,190,213,217,225,254],type:"area"});
		this.regions[1].push({id:15,name: "Fiddlers Green", systems:[2,7,10,70,76,104,120,172,181,194,224],type:"area"});
		this.regions[1].push({id:16,name: "Galcenter G2", systems:[19,33,57,91,94,113,115,167,178,226,242],type:"area"});
		this.regions[1].push({id:17,name: "Kobs Ladder", systems:[13,20,29,81,97,102,123,124,149],type:"area"});
		this.regions[1].push({id:18,name: "Qucedi Bottleneck", systems:[16,34,59,111,139,157,159,205,248],type:"area"});
		this.regions[1].push({id:19,name: "Ramaans Keep", systems:[56,117,131,161,166,170,197,228],type:"area"});
		this.regions[1].push({id:20,name: "Redline Stars", systems:[65,108,140,147,189,204,215,231,249],type:"area"});
		this.regions[1].push({id:21,name: "Teonan Web", systems:[18,26,32,36,42,50,55,69,114,142,146,202,251],type:"area"});
		this.regions[1].push({id:22,name: "Zaedvera Pocket", systems:[38,44,62,87,134,155,175,185,192,220,227,235],type:"area"});
		this.regions[1].push({id:23,name: "Erlage Corridor", systems:[29,57,94,113,115],type:"lane"});
		this.regions[1].push({id:24,name: "Spaceway L1", systems:[23,43,45,54,57,74,82,115,122,178,188],type:"lane"});
		this.regions[1].push({id:25,name: "Spaceway L2", systems:[45,58,65,66,88,127,140,144,189,193,204,221,236,240,48],type:"lane"});
		this.regions[1].push({id:26,name: "Spaceway L3", systems:[42,109,114,127,202],type:"lane"});
		this.regions[1].push({id:27,name: "Maorin Pass", systems:[9,41,59,61,92,100,156,179,189,205],type:"lane"});
		this.regions[1].push({id:28,name: "Tomoka Run", systems:[6,24,48,53,78,127,136,207],type:"lane"});
		this.regions[2].push({id:29,name: "Galcenter G3", systems:[5,22,26,49,56,58,110,140,150,175,177,228,234,239],type:"area"});
		this.regions[2].push({id:30,name: "Inner Reach", systems:[54,118,121,129,161,165,185,186,232],type:"area"});
		this.regions[2].push({id:31,name: "Outer Reach", systems:[18,52,62,100,145,149,201,223],type:"area"});
		this.regions[2].push({id:32,name: "Prodigal Suns", systems:[133,206],type:"area"});
		this.regions[2].push({id:33,name: "Runners Leap", systems:[126,162,200,233],type:"area"});
		this.regions[2].push({id:34,name: "Sidewinder Expanse", systems:[35,36,40,51,61,90,99,184,210],type:"area"});
		this.regions[2].push({id:35,name: "Starbridge Cluster", systems:[19,32,46,60,64,82,88,94,101,107,114,119,134,168,173,192,205,207,215,227,236,241,244,248],type:"area"});
		this.regions[2].push({id:36,name: "Yeon Pass", systems:[27,45,108,127,170,199,231,247],type:"area"});
		this.regions[2].push({id:37,name: "Broken Circle", systems:[54,118,129,161,165,186],type:"lane"});
		this.regions[2].push({id:38,name: "Chancers Alley", systems:[5,58,76,77,97,140,152,168],type:"lane"});
		this.regions[2].push({id:39,name: "Glasnost Corridor", systems:[98,106,115,245,250,95,117,160],type:"lane"});
		this.regions[2].push({id:40,name: "Spaceway L1", systems:[5,17,22,26,38,50,56,75,91,110,140,144,150,177,182,209,218,246],type:"lane"});
		this.regions[2].push({id:41,name: "Spaceway L2", systems:[38,42,50,65,79,135,139,154,189],type:"lane"});
		this.regions[2].push({id:42,name: "Triskelion Conduit", systems:[6,70,101,132,164,180,205,241,10,53,70,81,85,202,225],type:"lane"});
		this.regions[3].push({id:43,name: "Razors Edge", systems:[16,24,131,196,219,251,139,168,243,88,160,192],type:"area"});
		this.regions[3].push({id:44,name: "Vuesar Cordon", systems:[59,200],type:"area"});
		this.regions[3].push({id:45,name: "Unified Democratic Star League", systems:[37,38,53,73,74,82,117,125,181,234,237,245],type:"area"});
		this.regions[3].push({id:46,name: "Anintorian Irruption", systems:[96,240],type:"area"});
		this.regions[3].push({id:47,name: "Ririla Influx", systems:[171],type:"area"});
		this.regions[3].push({id:48,name: "Parallel Accord", systems:[20,31,44,51,63,68,71,79,92,99,102,110,115,151,158,215,220,224,231,248],type:"area"});
		this.regions[3].push({id:49,name: "Galcenter G4", systems:[10,30,34,45,49,54,65,95,101,103,105,119,137,144,148,222,241],type:"area"});
		this.regions[3].push({id:50,name: "Foundrys Reach", systems:[12,35,36,55,57,86,94,116,159,163,167,184,191,228,230],type:"area"});
		this.regions[3].push({id:51,name: "Lower Insurgency", systems:[64,104,112,128,211,216,232],type:"area"});
		this.regions[3].push({id:52,name: "Sunspan Pass", systems:[36,48,84,85,116,118,135,150,154,162,167,193,197,206,210,213,223,230,240,154,166,213],type:"lane"});
		this.regions[3].push({id:53,name: "Supply Line 1", systems:[25,33,38,53,57,58,62,74,78,82,117,134,138,181,191,209,234,242,245],type:"lane"});
		this.regions[3].push({id:54,name: "Sanctuarys Way", systems:[1,40,65,100,105,119,144,146,172,174,189,208,222,233],type:"lane"});
		this.regions[3].push({id:55,name: "Spaceway L1", systems:[2,21,45,54,76,77,95,97,103,105,113,137,177,190,249,113,141,50,103,239,103,108],type:"lane"});
		this.regions[3].push({id:56,name: "Supply Line 2", systems:[1,4,6,44,63,66,68,71,79,110,121,142,145,146,158,174,215,220,231,7,11,140,142,161,165],type:"lane"});
		this.regions[3].push({id:57,name: "Esonlear Cakewalk", systems:[7,32,60,216,232],type:"lane"});
		this.regions[4].push({id:58,name: "Gate Of Damocles", systems:[49,58,66,71,78,84,125,242],type:"area"});
		this.regions[4].push({id:59,name: "Siege Worlds", systems:[31,37,44,63,95,127,134,198,219],type:"area"});
		this.regions[4].push({id:60,name: "Tetitri Conclave", systems:[7,70,137,140,161,173,191,205],type:"area"});
		this.regions[4].push({id:61,name: "Galcenter G5", systems:[1,3,19,24,28,35,47,60,69,102,111,112,122,156,180,181,230,231],type:"area"});
		this.regions[4].push({id:62,name: "Galcon Bombard", systems:[36,86,98,123,133,151,223],type:"area"});
		this.regions[4].push({id:63,name: "Steel Halo", systems:[55,72,100,109,126,128,185],type:"area"});
		this.regions[4].push({id:64,name: "Serenic Arc", systems:[16,20,39,74,93,131,182,207,249,40,53,80,146,153,166,182,188,220,221,225,252],type:"lane"});
		this.regions[4].push({id:65,name: "Lesser Wheel", systems:[2,10,65,91,99,114,116,118,146,153,244,248],type:"lane"});
		this.regions[4].push({id:66,name: "Spaceway L1", systems:[1,19,24,28,35,41,45,60,79,102,112,117,156,169,172,180,181,213,216,217,228,230,231],type:"lane"});
		this.regions[4].push({id:67,name: "Spaceway L2", systems:[7,11,54,115,135,137,140,150,184,193,225,243,253,57,115,135,189,201,202,221,226,227,12,54,85,158,175,178,204,212,215],type:"lane"});
		this.regions[4].push({id:68,name: "Zalexe Loop", systems:[77,88,89,106,152,167,170,190,194,208,246,30,87,89],type:"lane"});
		this.regions[4].push({id:69,name: "Extrinsic Reach", systems:[9,23,61,104,120,129,136,139,163,233],type:"lane"});
		this.regions[4].push({id:70,name: "Greater Wheel", systems:[8,41,149,183,194,210,222,254,29,34,42,82,92,108,121,130,149,183,229],type:"lane"});
		this.regions[5].push({id:71,name: "Galcenter G6", systems:[9,40,50,79,81,85,99,107,110,117,133,164,174,176,183,187,195,213,215,232,237],type:"area"});
		this.regions[5].push({id:72,name: "Raonbe Cluster", systems:[16,21,22,53,98,102,130,139,229,248],type:"area"});
		this.regions[5].push({id:73,name: "Rabian Spur", systems:[3,8,84,88,111,184,196,214,236],type:"area"});
		this.regions[5].push({id:74,name: "Iron Alliance", systems:[14,44,82,106,113,134,146,156,171,177,185,205,216,230,245,249],type:"area"});
		this.regions[5].push({id:75,name: "Isaanus Syndicate", systems:[10,46,66,77,118,140,159,186,240],type:"area"});
		this.regions[5].push({id:76,name: "Centreward Industrial Sector", systems:[1,6,17,89,143,161,189,60,67,75,127,138,147,155,233,250,252,4,37,71,86,155,225,254,0,5,19,58,69,71,144,150,182,194,200,206,210,223,254],type:"area"});
		this.regions[5].push({id:77,name: "Anener Commonwealth", systems:[32,56,160,47,242,167,129,12],type:"area"});
		this.regions[5].push({id:78,name: "Anenbian Confederacy", systems:[224,23,2,87,201,168,208,172,114,65,35,39,246,83,42],type:"area"});
		this.regions[5].push({id:79,name: "Lost Worlds", systems:[41,202,55,33],type:"area"});
		this.regions[5].push({id:80,name: "Jaws Of Cerberus", systems:[121,203,31,30,74,126,234],type:"area"});
		this.regions[5].push({id:81,name: "Rimward Industrial Sector", systems:[241,149,153,90,255,137,132,72,212,95,141,218,178,116,154,45,204,163,120,7,198,251],type:"area"});
		this.regions[5].push({id:82,name: "Centreward Span", systems:[6,17,28,29,54,104,108,148,152,162,181,211],type:"lane"});
		this.regions[5].push({id:83,name: "Spaceway L1", systems:[35,39,83,114,115,246,40,115,133,164,215,13,85,92,99,136,144,206,3,8,84,88,206],type:"lane"});
		this.regions[5].push({id:84,name: "Spaceway L2", systems:[51,80,103,169,243,16,98,102,243,16,67,101,109,138,142,209,112,138,225,233],type:"lane"});
		this.regions[5].push({id:85,name: "Remlok Road", systems:[203,31,30,226,234,240,140,159,77,10],type:"lane"});
		this.regions[5].push({id:86,name: "Rimward Arc", systems:[215,124,232,50,120,154,116,177,82,216,14,113,156],type:"lane"});
		this.regions[6].push({id:87,name: "Five Points Trade Barrier", systems:[139,27,228,137,153],type:"area"});
		this.regions[6].push({id:88,name: "Rubicon Crossroad", systems:[134,15,248,97,110,186],type:"area"});
		this.regions[6].push({id:89,name: "Kleptocratic Swathe", systems:[187,77,53,240,100,107,174],type:"area"});
		this.regions[6].push({id:90,name: "Galcop Central Intelligence Sector", systems:[18,234,117,49,1],type:"area"});
		this.regions[6].push({id:91,name: "Isare Pact", systems:[124,51,172,81,204,102],type:"area"});
		this.regions[6].push({id:92,name: "Galcentre", systems:[65,39,181,215,111,133,179,41,193,247,37,202,150,72,236,44],type:"area"});
		this.regions[6].push({id:93,name: "Spaceway L1", systems:[103,58,253,65,39,44,236,150,247,193,179,133,215,95,109],type:"lane"});
		this.regions[6].push({id:94,name: "Zero-G Hockey Road", systems:[194,73,146,239,86,74,199,23,138,18,234,244,166,152,162,242,184],type:"lane"});
		this.regions[6].push({id:95,name: "Far Rift Reach", systems:[218,130,125,205,79,191,17,178],type:"lane"});
		this.regions[6].push({id:96,name: "Isisian Detour", systems:[239,19,250,209,56,67,163,7,211],type:"lane"});
		this.regions[6].push({id:97,name: "Quandixe Connection", systems:[46,36,212,187,53,107,174],type:"lane"});
		this.regions[7].push({id:98,name: "Unified Tech-Core", systems:[216,137,147,13,9,211,88,171,2,215],type:"area"});
		this.regions[7].push({id:99,name: "Crystalline Desolation", systems:[246,229,131,36,100,89,22,207,37,176,74,228,99,5,164,101,182,48,165,208,86,80,10,153,112,217,214,239],type:"area"});
		this.regions[7].push({id:100,name: "Riven Hatachi Senate", systems:[231,200,72,219,75,153,10,80,86,208,6,250,81,65,169,232,105,252,59,40],type:"area"});
		this.regions[7].push({id:101,name: "Galcentre", systems:[241,233,39,168,125,41,45,64,104,110,201,7,73,193,120,127,102,184,135,172,177,210,70,130,123,38,175,23],type:"area"});
		this.regions[7].push({id:102,name: "Beggars' Loop", systems:[150,242,87,170,115,160,134,90,166,11,185,196,34,186,62,240],type:"area"});
		this.regions[7].push({id:103,name: "Ladle", systems:[52,223,247,144,67],type:"area"});
		this.regions[7].push({id:104,name: "Far Arm Star Cluster", systems:[203,255,161,16,98,84,20,107],type:"area"});
		this.regions[7].push({id:105,name: "Spaceway L1 Centreward Branch", systems:[215,2,211,9,13,147,216,225,21,218,71,206,236,190,18,26,152,51,209,24,174,82,179,173,30,251,233,125,45,41,104,110,73,135,117,55],type:"lane"});
		this.regions[7].push({id:106,name: "Spaceway L1 Rimward Branch", systems:[33,145,1,53,98,161,255,203,76,49,148,198,213,151,230,157,46,116,243,244,61,32,93,186,62,56,91,44,8,249,136,63,167,130,123,38,23,39,241,12,114],type:"lane"});
		this.regions[7].push({id:107,name: "Centreward Flight", systems:[126,6,81,65,169,232,252],type:"lane"});
		this.regions[7].push({id:108,name: "Hatachi Trade Annex", systems:[75,219,248,117],type:"lane"});
		this.regions[7].push({id:109,name: "Rimward Decamp", systems:[117,248,219,72,10],type:"lane"});

		

		this.unserialiseRegionalData();

}

this.unserialiseRegionalData = function() {
		if (!missionVariables.cargotypeextension_regional) {
// give time for trade goods to be initialised
				this.timer = new Timer(this,this.initialiseRegionalData,0.25);
				return;
		}
		var fluxdata = missionVariables.cargotypeextension_regional.split("|");
		var version = fluxdata.shift();
		if (version == "1") {
				this.unserialiseRegionalData1(fluxdata);
		} else {
				log(this.name,"Error: "+svars[0]+" is not a recognised regional format");
				player.consoleMessage("Critical error decoding special cargo data. Please see Latest.log");
		}
}

this.initialiseRegionalData = function() {
		this.variations = new Array;
		for (var i=0;i<=7;i++) {
				this.variations[i] = new Array;
				for (var j=0;j<=6;j++) {
						this.variations[i].push(this.newVariation(i));
				}
		}

}

this.newVariation = function(gal) {
		var variation = new Object;
		variation.type = Math.floor(Math.random()*this.fluctypes);		
		if (variation.type < 2) {
				variation.type += 6;
		}
		variation.region = Math.floor(Math.random()*this.regions[gal].length);
		if (variation.type < 6) {
				variation.cargo = this.cargoTypes[Math.floor(Math.random()*this.cargoTypes.length)];
		} else {
				var ctype = this.cargoTypes[Math.floor(Math.random()*this.cargoTypes.length)];
				variation.cargo = worldScripts["CargoTypeExtension"].extendableCargo(ctype);
		}
		variation.intensity = 3+Math.floor(Math.random()*6);
		variation.halflife = 5+(Math.floor(Math.random()*11));
		worldScripts["CargoTypeExtension"].debug(gal+" "+variation.type+" "+variation.region+" "+variation.cargo+" "+variation.intensity+" "+variation.halflife);
		return variation;
}

this.playerWillSaveGame = function(cause) {
		this.serialiseRegionalData();
}

this.serialiseRegionalData = function() {
		var galdata = new Array;
		for (var i=0;i<=7;i++) {
				var vardata = new Array;
				for (j=0;j<this.variations[i].length;j++) {
						var variation = this.variations[i][j];
						// some undefs can get into this bit
						if (variation.type && variation.region) {
								vardata.push(variation.type+"/"+variation.region+"/"+variation.cargo+"/"+variation.intensity+"/"+variation.halflife);
						}
				}
				galdata.push(vardata.join(";"));
		}

		missionVariables.cargotypeextension_regional = "1|"+galdata.join("|");
}

this.unserialiseRegionalData1 = function(fluxdata) {
		this.variations = new Array;
		for (var i=0;i<=7;i++) {
				this.variations[i] = new Array;
				var galdata = fluxdata[i].split(";");
				for (var j=0;j<galdata.length;j++) {
						var vardata = galdata[j].split("/");
						var variation = {type: vardata[0],
														 region: vardata[1],
														 cargo: vardata[2],
														 intensity: vardata[3],
														 halflife: vardata[4]};
						this.variations[i][j] = variation;
				}
		}
}

this.shipWillEnterWitchspace = function() {
		this.lastday = clock.days;
}

this.shipWillExitWitchspace = function() {
		if (!system.isInterstellarSpace) {
				// give enough time for the clock to adjust
				this.updateRegionalData();
		}
}

this.updateRegionalData = function() {
		var cycles = clock.days-this.lastday;
		for (var k=0;k<cycles;k++) {
				// update existing variations
				for (var i=0;i<7;i++) {
						// reverse order for splicing out expired
						for (var j=this.variations[i].length-1;j>=0;j--) {				
								if (Math.random() < 1/this.variations[i][j].halflife) {
										this.variations[i][j].intensity--;
										if (this.variations[i][j].intensity <= 0) {
												this.variations[i].splice(j,1);
										}
								}
						}
				}
				
				var gal = Math.floor(Math.random()*8);

				var newvar = this.newVariation(gal);
				this.variations[gal].push(newvar);
				if (gal == galaxyNumber) {
						this.notifyTradernet(newvar);
				}
		}

}

this.notifyTradernet = function(newvar) {

		if (newvar.type < 6) {
				var cargotype = worldScripts["CargoTypeExtension"].genericName(newvar.cargo);
		} else {
				var cargotype = worldScripts["CargoTypeExtension"].cargoDefinition(newvar.cargo,"specificType");
		}
		var region = this.regions[galaxyNumber][newvar.region];
		
		var template = "[cte_regionnews_"+region.type+"_"+newvar.type+"_1]";
		
		var msg = expandDescription(template,{cte_region_cargo:cargotype,
																					cte_region_name:region.name});

		worldScripts["CargoTypeExtension"].addTraderNet(msg);
		
}




/* Permit API */

this.permitGossip = function() {
		var len = this.variations[galaxyNumber].length;
		var variation = this.variations[galaxyNumber][clock.days%len];
		if (this.regions[galaxyNumber][variation.region].type == "lane") {
				prepos = "on";
		} else {
				prepos = "in";
		}
		if (variation.type == 6) {
				return "* Importing "+worldScripts["CargoTypeExtension"].cargoDefinition(variation.cargo,"specificType")+" is still prohibited "+prepos+" the "+this.regions[galaxyNumber][variation.region].name;
		} else if (variation.type == 7) {
				return "* Exporting "+worldScripts["CargoTypeExtension"].cargoDefinition(variation.cargo,"specificType")+" is still prohibited "+prepos+" the "+this.regions[galaxyNumber][variation.region].name;
		}
		return false;
}

this.checkPermit = function(good,quantity,dryrun) {
		var score = 0;
		for (var i=0;i<this.variations[galaxyNumber].length;i++) {
				if (this.variations[galaxyNumber][i].type == 7 && this.variations[galaxyNumber][i].cargo == good) {
						if (this.regions[galaxyNumber][this.variations[galaxyNumber][i].region].systems.indexOf(system.ID) >= 0) {
								score += 1+Math.floor(this.variations[galaxyNumber][i].intensity/3);
						}
				}
		}
		return score;
}

this.checkImport = function(good,quantity,dryrun) {
		var score = 0;
		for (var i=0;i<this.variations[galaxyNumber].length;i++) {
				if (this.variations[galaxyNumber][i].type == 6 && this.variations[galaxyNumber][i].cargo == good) {
						if (this.regions[galaxyNumber][this.variations[galaxyNumber][i].region].systems.indexOf(system.ID) >= 0) {
								score += 1+Math.floor(this.variations[galaxyNumber][i].intensity/3);
						}
				}
		}
		return score;
}

this.describePermits = function() {
		var desc = "";
		for (var i=0;i<this.variations[galaxyNumber].length;i++) {
				if (this.regions[galaxyNumber][this.variations[galaxyNumber][i].region].systems.indexOf(system.ID) >= 0) {
						if (this.variations[galaxyNumber][i].type == 6) {
								desc += "Import of "+worldScripts["CargoTypeExtension"].cargoDefinition(this.variations[galaxyNumber][i].cargo,"specificType")+" is forbidden.\n";
						} else if (this.variations[galaxyNumber][i].type == 7) {
								desc += "Export of "+worldScripts["CargoTypeExtension"].cargoDefinition(this.variations[galaxyNumber][i].cargo,"specificType")+" is forbidden.\n";
						}
				}
		}
		return desc;
}

/* Pricing API */

this.priceGossip = function() {
		var len = this.variations[galaxyNumber].length;
		var variation = this.variations[galaxyNumber][clock.days%len];
		if (this.regions[galaxyNumber][variation.region].type == "lane") {
				prepos = "on";
		} else {
				prepos = "in";
		}
		if (variation.type % 6 < 2) {
				return false;
		}
		if (variation.type >= 6) {
				var cargo = worldScripts["CargoTypeExtension"].cargoDefinition(variation.cargo,"specificType");
		} else {
				var cargo = worldScripts["CargoTypeExtension"].genericName(variation.cargo);
		}
		var vt = variation.type % 6;
		var rn = this.regions[galaxyNumber][variation.region].name;
		if (vt == 2) {
				return "* You can get "+cargo+" cheaply "+prepos+" the "+rn;
		} else if (vt == 3) {
				return "* Don't expect bargains on "+cargo+" "+prepos+" the "+rn;
		} else if (vt == 4) {
				return "* The "+rn+" is no good to sell "+cargo+" now.";
		} else if (vt == 5) {
				return "* "+cargo+"? Good prices "+prepos+" the "+rn;
		}
		return false;	
}

this.priceChange = function(good,context) {
		if (!this.variations) {
				worldScripts["CargoTypeExtension"].debug("Regional variations not initialised yet!");
				return 1;
		}

		var gen = worldScripts["CargoTypeExtension"].cargoDefinition(good,"genericType");
		var multiplier = 1;
		for (var i=0;i<this.variations[galaxyNumber].length;i++) {
				var variation = this.variations[galaxyNumber][i];
				if (this.regions[galaxyNumber][variation.region] && this.regions[galaxyNumber][variation.region].systems.indexOf(system.ID) >= 0) {
						worldScripts["CargoTypeExtension"].debug("Currently in region");
						worldScripts["CargoTypeExtension"].debug(variation.type+" "+variation.cargo+" "+good+" "+gen+" "+variation.intensity);
						if ((variation.type < 6 && gen == variation.cargo) || 
								(variation.type >= 6 && good == variation.cargo)) {
								var vt = variation.type%6;
								var mi = variation.intensity/10;
								if (mi < 0) {
										mi = 0.1;
								}
								if (vt == 2 && (context == "FLUX_EXPORT" || context == "FLUX_MISC")) {
										multiplier *= (1-mi);
								} else if (vt == 3 && (context == "FLUX_EXPORT" || context == "FLUX_MISC")) {
										multiplier *= (1+mi);
								} else if (vt == 4 && context == "FLUX_IMPORT") {
										multiplier *= (1-mi);
								} else if (vt == 5 && context == "FLUX_IMPORT") {
										multiplier *= (1+mi);
// some effects from illegal goods; premium for smuggling
								} else if (vt == 0 && context == "FLUX_IMPORT") {
										multiplier *= 1.5;
								} else if (vt == 1 && context == "FLUX_EXPORT") {
										multiplier *= 0.8;
								} 
						}
				}
		}
		worldScripts["CargoTypeExtension"].debug("Multiplier for "+good+" in "+context+" is "+multiplier);
		return multiplier;
}

