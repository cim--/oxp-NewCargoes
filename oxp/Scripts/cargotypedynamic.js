this.name = "CargoTypeExtension-Dynamic";
this.description = "Dynamic trade routes that appear and disappear over time."

this.cargoDefs = new Object;
this.tradernet = 0;

this.startUp = function() {
		this.lastupdate = clock.days;

		if (missionVariables.cargotypeextension_dynamic) {
				this.unserialiseDynamicCargo();
		} else {
				this.initialiseDynamicCargo();
		}

}

this.playerWillSaveGame = function(savetype) {
		this.serialiseDynamicCargo();
}

this.initialiseDynamicCargo = function() {
		for (var j=1;j<=20;j++) {
				var cargoid = "CTE_CTD_"+j;
				this.redefine(cargoid,false,true);
				this.registerCargo(this.cargoClass3,cargoid);
		}
}

this.serialiseDynamicCargo = function() {
		var serial = new Array;
		for (var j=1;j<=20;j++) {
				var cargoid = "CTE_CTD_"+j;
				var cargo = this.cargoDefs[cargoid];
				serial.push(cargo.genericType+";"+cargo.specificType+";"+cargo.buySystem+";"+cargo.sellSystem+";"+cargo.deadline);
		}

		missionVariables.cargotypeextension_dynamic = "1|"+serial.join("|");
}

this.unserialiseDynamicCargo = function() {
		var serial = missionVariables.cargotypeextension_dynamic;

		var svars = serial.split("|");
		if (svars[0] == "1") {
				this.unserialiseDynamicCargo1(svars);
		} else {
// and do something sensible if we get given data from a later version
				log(this.name,"Error: "+svars[0]+" is not a recognised dynamic cargo data format");
				player.consoleMessage("Critical error decoding dynamic cargo data. Please see Latest.log");
		}
}

this.unserialiseDynamicCargo1 = function(svars) {
		for (var j=1;j<=20;j++) {
				var cargo = "CTE_CTD_"+j;
				var obj = new Object;
				var cdata = svars[j].split(";");
				obj.genericType = cdata[0];
				obj.specificType = cdata[1];
				obj.buySystem = cdata[2];
				obj.sellSystem = cdata[3];
				obj.deadline = cdata[4];
				this.cargoDefs[cargo] = obj;
				if (obj.deadline < clock.days) {
						this.registerCargo(this.cargoClass3a,cargo);
						worldScripts["CargoTypeExtension"].debug("Reregistering "+cargo+" (old)");
				} else {
						this.registerCargo(this.cargoClass3,cargo);
						worldScripts["CargoTypeExtension"].debug("Reregistering "+cargo+" (okay)");
				}
		}		
}

this.shipWillEnterWitchspace = function(cause) {
		this.tradernet = 1;
		if (cause != "galactic jump") {
				// no point
				for (var j=1;j<=20;j++) {
						this.updateDynamicCargo("CTE_CTD_"+j,false);
				}
		}
		this.tradernet = 0;
}

this.playerEnteredNewGalaxy = function() {
		this.tradernet = 0;
		for (var j=1;j<=20;j++) {
				this.updateDynamicCargo("CTE_CTD_"+j,true);
		}
		this.tradernet = 0;
}

this.updateDynamicCargo = function(cargoid,forcenew) {
		if (!forcenew && this.cargoDefs[cargoid].deadline > clock.days) {
				return;
		}
		if (worldScripts["CargoTypeExtension"].hasSpecialCargo(cargoid)) {
// If it's being carried, just slump it.
// Otherwise, erase the ID
				this.registerCargo(this.cargoClass3a,cargoid);
		} else {
				this.redefine(cargoid,!forcenew,forcenew);
				this.registerCargo(this.cargoClass3,cargoid);
		}

}

this.registerCargo = function (cargoclass, cargoid) {
		var cargo = cargoclass();
		cargo.ID = cargoid;
		cargo.genericType = this.cargoDefs[cargoid].genericType;
		cargo.specificType = this.systemIan(this.cargoDefs[cargoid].buySystem)+" "+this.cargoDefs[cargoid].specificType;
		cargo.buySystems = this.systemList(this.cargoDefs[cargoid].buySystem);
		cargo.sellSystems = this.systemList(this.cargoDefs[cargoid].sellSystem);
		cargo.desc = this.cargoDescription(this.cargoDefs[cargoid]);
		
		worldScripts["CargoTypeExtension"].registerCargoType(cargo);
}

this.systemIan = function(sysid) {
		if (Math.floor(sysid/256) == galaxyNumber) {
				return System.infoForSystem(galaxyNumber,sysid%256).name+"ian";
		} else {
				return "Extragalactic";
		}
}

this.systemList = function(sysid) {
		var list = [[],[],[],[],[],[],[],[]];
		list[Math.floor(sysid/256)].push(sysid%256);
		return list;
}


this.redefine = function(cargoid,snoopers,inmediares) {
		var cargodef = new Object;

// not alien items
		var generics = ["food","textiles","radioactives","slaves","liquorWines","luxuries","narcotics","computers","machinery","alloys","firearms","furs","minerals"];

		var gtype = generics[Math.floor(Math.random()*generics.length)];

		var stype = expandDescription("[cte_ctd_"+gtype+"]");

		cargodef.genericType = gtype;
		cargodef.specificType = stype;

		do {
				do {
						var source = Math.floor(Math.random()*256);
						var sourceinfo = System.infoForSystem(galaxyNumber,source);
				} while (sourceinfo.sun_gone_nova);
				var dest = Math.floor(Math.random()*256);
				var destinfo = System.infoForSystem(galaxyNumber,dest);
				var route = sourceinfo.routeToSystem(destinfo);
		} while (!(route && route.distance > 20 && !destinfo.sun_gone_nova));


		cargodef.buySystem = galaxyNumber*256 + source;
		cargodef.sellSystem = galaxyNumber*256 + destinfo.systemID;
		
		if (!inmediares) {
				cargodef.deadline = clock.days + Math.floor((1+sourceinfo.routeToSystem(destinfo).time/24)*(1+(2*Math.random())));
		} else {
				// initialisation or galjump: many of the deals will have existed for a while
				cargodef.deadline = clock.days + Math.floor(Math.floor(1+sourceinfo.routeToSystem(destinfo).time/24)*(3*Math.random()));
		}

		this.cargoDefs[cargoid] = cargodef;

		for (var i=0;i<3;i++) {
				// shouldn't be more than three locations affected
				worldScripts["CargoTypeExtension"].undepressGood(cargoid);
		} 

		worldScripts["CargoTypeExtension"].debug("Defined dynamic cargo "+stype+" from "+source+" to "+destinfo.systemID+" by "+cargodef.deadline);

//		if (snoopers && this.tradernet == 1 && player.ship.equipmentStatus("EQ_CTE_TRADERNET") == "EQUIPMENT_OK" && clock.days <= missionVariables.cargotypeextension_tradernet) {
		if (this.tradernet == 1) { // don't notify on init or galjump!
				this.traderNetNotify(cargodef);
		}
//		}

}

this.systemName = function(systemid) {
		if (Math.floor(systemid/256) != galaxyNumber) {
				return "";
		}
		return System.infoForSystem(Math.floor(systemid/256),systemid%256).name;
}

this.cargoDescription = function(cargodef) {
		var sname = this.systemName(cargodef.buySystem);
		var dname = this.systemName(cargodef.sellSystem);
		if (!sname || !dname) { return "This cargo originates from chart "+(1+Math.floor(cargodef.buySystem/256)); }
/*		if (cargodef.deadline > clock.days) {
				var desc = sname+"ian "+cargodef.specificType+" is currently needed urgently in "+dname+". This is expected to continue until around "+cargodef.deadline;
		} else {
				var desc = sname+"ian "+cargodef.specificType+" was needed urgently in "+dname+". Who knows - they might still need some.";
		} */
		var desc = "Canisters of "+sname+"ian "+cargodef.specificType+".";
		return desc;
}

this.traderNetNotify = function(cargodef) {
		
		var msg = expandDescription("[cte_ctd_snoopers"+(1+Math.floor(Math.random()*9))+"]",
																{ cte_ctd_tradername: expandDescription("[nom1]"),
																	cte_ctd_source: this.systemName(cargodef.buySystem),
																	cte_ctd_dest: this.systemName(cargodef.sellSystem),
																	cte_ctd_deadline: cargodef.deadline,
																	cte_ctd_good: cargodef.specificType,
																	cte_ctd_generic: worldScripts["CargoTypeExtension"].genericName(cargodef.genericType),
																	cte_ctd_random: 50+Math.floor(Math.random()*75)
																} );

		worldScripts["CargoTypeExtension"].addTraderNet(msg);

//		this.tradernet = 0; // max 1 update of dynamic routes per jump
}

// cargo class 3 has a higher distance bonus and sale bonus for short-term deal
this.cargoClass3 = function() {
		var cargo = new Object;
		cargo.buyAdjust = 120; // a bit more than normal
		cargo.sellDistance = 20;
		cargo.sellAdjust = 250;
		cargo.slump = 0.3;
		cargo.unslump = 0.1;
		cargo.sourceRumour = 100;
		cargo.destinationRumour = 90;
		cargo.salvageMarket = 2; // less likely than normal
		cargo.forbidExtension = 1;
		return cargo;
}

// switch to 3a once the delivery deadline has passed
this.cargoClass3a = function() {
		var cargo = new Object;
		cargo.sellDistance = 2;
		cargo.sellAdjust = 25;
		cargo.slump = 30;
		cargo.unslump = 0.1;
		cargo.sourceRumour = -1;
		cargo.destinationRumour = -1;
		cargo.salvageMarket = 0.01;
		cargo.forbidExtension = 1;
		return cargo;
}
