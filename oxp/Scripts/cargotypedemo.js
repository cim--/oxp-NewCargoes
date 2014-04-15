this.name = "Cargo Type Extension Demo";
this.description = "Demo of the cargo type extensions: the evil juice trading game";

this.randomSystems = function() {
		var result = [[],[],[],[],[],[],[],[]];
		for (var i=0;i<50;i++) {
				result[Math.floor(Math.random()*8)].push(i);
		}
		return result;
}

this.startUp = function() {
		if (worldScripts["CargoTypeExtension"].startUp) {
				worldScripts["CargoTypeExtension"].startUp();
		}

// quantity testing		
		for (var i=0;i<=2000;i++) {
				var obj = new Object;
				obj.ID = "CTEDemo-EJ"+i;
				obj.genericType = "liquorWines";
				obj.specificType = "Evil Juice ("+System.systemNameForID(i%256)+")";
				obj.buySystems = this.randomSystems();
				obj.sellSystems = this.randomSystems();
				obj.desc = "The local evil juice of "+System.systemNameForID(i%256);
				obj.buyAdjust = 50;
				obj.buyVariance = 30;
				obj.sourceRumour = 100; // the clue's in the name
				obj.destRumour = 75; // truth is, we don't know
				if (i&64 == 0) {
						obj.illegal = 1;
				}
				obj.slump = 1;
				obj.unslump = 2;

				worldScripts["CargoTypeExtension"].registerCargoType(obj);

		}
// Yryrre -> Ovnetr
// Krdhreva -> Gvenbe
// Krnna -> Irvf
// Enmnne -> Rabayn


}