this.name = "CargoTypeExtension-TraderNet";
this.description = "Manages the TraderNet news";

this.tradernetbuffer = new Array;
this.maxbufferlength = 20;

this.startUp = function() {
		if (missionVariables.cargotypeextension_tradernet_messages && missionVariables.cargotypeextension_tradernet_messages.length>0) {
				this.tradernetbuffer = missionVariables.cargotypeextension_tradernet_messages.split("|");
				var maxbuffer = 1;
				if (player.ship.equipmentStatus("EQ_CTE_TRADERNET") == "EQUIPMENT_OK" && clock.days <= missionVariables.cargotypeextension_tradernet) {
						maxbuffer = this.maxbufferlength;
				}
				if (this.tradernetbuffer.length > maxbuffer) {
						this.tradernetbuffer.splice(0,this.tradernetbuffer.length-maxbuffer);
// trim spare elements in tradernet buffer
				}
		}

// cleanup previous versions
		delete missionVariables.cargotypeextension_tradernet_waiting;
}

this.playerWillSaveGame = function() {
		if (this.tradernetbuffer.length > 0) {
				missionVariables.cargotypeextension_tradernet_messages = this.tradernetbuffer.join("|");		
		} else {
				missionVariables.cargotypeextension_tradernet_messages = [];
		}
}

this.shipWillEnterWitchspace = function(cause) {
		if (player.ship.equipmentStatus("EQ_CTE_TRADERNET") == "EQUIPMENT_OK" && clock.days > missionVariables.cargotypeextension_tradernet) {
				this.subscriptionReminder();
				player.ship.removeEquipment("EQ_CTE_TRADERNET");
		}
		if (clock.days + 8 < missionVariables.cargotypeextension_tradernet) {
				missionVariables.cargotypeextension_tradenetrenew = 0;
		} else {
				missionVariables.cargotypeextension_tradenetrenew = 1;
		}

}

this.shipWillExitWitchspace = function() {
		if (!system.isInterstellarSpace && player.ship.equipmentStatus("EQ_CTE_TRADERNET") == "EQUIPMENT_OK") {
				this.profileGood();
		}
}

this.subscriptionReminder = function() {
		player.consoleMessage("Your TraderNet subscription has expired.",10);
}

this.playerBoughtEquipment = function(equipment) {
		if (equipment == "EQ_CTE_TRADERNET") {
				missionVariables.cargotypeextension_tradernet = clock.days+30;
		} else if (equipment == "EQ_CTE_TRADERNET_RENEWAL") {
				missionVariables.cargotypeextension_tradernet += 30;
				missionVariables.cargotypeextension_tradenetrenew = 0;
				player.ship.removeEquipment(equipment);
		}
}

this.equipmentDamaged = function(equipment) {
		if (equipment == "EQ_CTE_TRADERNET") {
				player.ship.setEquipmentStatus(equipment,"EQUIPMENT_OK");
		}
}

this.addTraderNet = function(msg) {
		this.tradernetbuffer.push(msg);
		if (this.tradernetbuffer.length > this.maxbufferlength) {
				var tmp = this.tradernetbuffer.shift(); // discard
		} else if (this.tradernetbuffer.length > 1 && !(player.ship.equipmentStatus("EQ_CTE_TRADERNET") == "EQUIPMENT_OK" && clock.days <= missionVariables.cargotypeextension_tradernet)) {
				// maximum buffer length is 1 if no equipment held
				var tmp = this.tradernetbuffer.shift(); // discard
		}
}

this.numMessages = function() {
		return this.tradernetbuffer.length;
}

this.getMessage = function(index) {
		return this.tradernetbuffer[this.tradernetbuffer.length-index];
}

this.getPic = function() {
		if (clock.days + 8 > missionVariables.cargotypeextension_tradernet) {
				missionVariables.cargotypeextension_tradenetrenew = 1;
				return "cte_tradenet-renewal.png";
		}
		var gn = galaxyNumber;
		if (clock.days % 10 == 0) { // rarely show another galaxy
				gn = system.ID % 8;
		}
		if (clock.days % 3 == 0) {
				return "cte_tradenet"+gn+""+(1+(system.ID % 7))+".png";
		}
		return "cte_tradenet"+gn+"0.png";
}

/*this.getBufferedMessages = function() {
		var msg = "";
		var allowedlen = 680;
		while (tradernetbuffer.length > 0 && this.tradernetbuffer[0].length < (allowedlen-80)) {
				if (msg != "") {
						allowedlen -= 80;
						msg += "\n\n";
				} 
				var tmp = this.tradernetbuffer.shift();
				allowedlen -= tmp.length;
				msg += tmp;
		}
		return msg;
}*/



/*this.callSnoopers = function() {
		if (!worldScripts.snoopers) {
				return;
		}
		if (this.cbwait) {
				return;
		}
		var msg = this.getBufferedMessages();
		if (msg == "") {
				return;
		}

		worldScripts.CargoTypeExtension.debug(msg);

		var obj = new Object;
		obj.ID = this.name;
		obj.Message = msg;
		obj.Priority = 1;
		if (clock.days + 8 < missionVariables.cargotypeextension_tradernet) {
				var gn = galaxyNumber;
				if (Math.random() < 0.1) { // rarely show another galaxy
						gn = Math.floor(Math.random()*8);
				}
				obj.Pic = "cte_tradenet"+gn+"0.png";
				if (Math.random() < 0.3) {
						obj.Pic = "cte_tradenet"+gn+""+Math.floor(1+(Math.random()*7))+".png";
				}
				missionVariables.cargotypeextension_tradenetrenew = 0;
		} else {
				obj.Pic = "cte_tradenet-renewal.png";
				missionVariables.cargotypeextension_tradenetrenew = 1;
		}

		worldScripts.snoopers.insertNews(obj);
		this.cbwait = true;
}

this.newsDisplayed = function(str) {
		this.cbwait = false;
}*/

this.profileGood = function() {
		var good = worldScripts.CargoTypeExtension.extendableCargo("any");

		var message = "Know Your Goods: "+worldScripts.CargoTypeExtension.cargoDefinition(good,"specificType")+"\n";
		message += worldScripts.CargoTypeExtension.cargoDefinition(good,"desc")+"\n";
		var exports = worldScripts.CargoTypeExtension.cargoDefinition(good,"buySystems")[galaxyNumber];
		var imports = worldScripts.CargoTypeExtension.cargoDefinition(good,"sellSystems")[galaxyNumber];
		var dm = worldScripts.CargoTypeExtension.defaultMarketInfo();
		message += "Buy at: "+this.systemListing(exports)+" for around "+this.approximately(worldScripts.CargoTypeExtension.cargoPriceExport(good,1,dm)/10)+" ₢/TC\n";
		message += "Sell at: "+this.systemListing(imports)+" for around "+this.approximately(worldScripts.CargoTypeExtension.cargoPriceImport(good,1,dm)/10)+" ₢/TC\n";

		this.addTraderNet(message);
}

this.approximately = function(price) {
		return Math.round(price/10)*10;
}

this.systemListing = function(list) {
		var copylist = list.slice(0);
		var i = 0;
		var names = [];
		while (i++ < 3 && copylist.length > 0) {
				var sysid = copylist.splice(Math.floor(Math.random()*copylist.length),1);
				names.push(System.infoForSystem(galaxyNumber,sysid).name);
		}
		if (names.length == 0) {
				return "Other galaxies";
		} else if (names.length == 1) {
				return names[0];
		} else if (names.length == 2) {
				return names[0]+" or "+names[1];
		} else {
				if (copylist.length > 0) {
						return names[0]+", "+names[1]+", "+names[2]+", etc.";
				} else {
						return names[0]+", "+names[1]+" or "+names[2];
				}
		}
}