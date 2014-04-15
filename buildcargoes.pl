#!/usr/bin/perl

use strict;
use warnings;

my $interesting = [];
my $cargotypes = {};
my @basics;
my @illegals;

sub lineitem {
		my ($code) = @_;
		
		return '["'.$code.'","'.$cargotypes->{$code}->{generic}.'","'.$cargotypes->{$code}->{specific}.'","'.$cargotypes->{$code}->{desc}.'",'.planetlist($cargotypes->{$code}->{exp}).','.planetlist($cargotypes->{$code}->{imp}).'],'."\n";
}

sub planetlist {
		my ($clist) = @_;
		my $rv = "[";
		for (my $i=0;$i<=7;$i++) {
				$rv .= "[";
				my @sysids;
				my $chartdata = $clist->[$i];
				foreach my $sysid (keys %$chartdata) {
						push(@sysids,$sysid);
				}
				$rv .= join(",",@sysids);
				$rv .= "]";
				if ($i < 7) {
						$rv .= ",";
				}
		}
		$rv .= "]";
		return $rv;
}

sub addsystems {
		my ($code,$chart,$exp,$imp) = @_;
		
		my @exps = split(",",$exp);
		foreach my $expsys (@exps) {
				$expsys =~s/[^0-9]//g;
				$cargotypes->{$code}->{exp}->[$chart]->{$expsys}=1;
				$interesting->[$chart]->{$expsys} |= 1;
		}

		my @imps = split(",",$imp);
		foreach my $impsys (@imps) {
				$impsys =~s/[^0-9]//g;
				if (!$cargotypes->{$code}->{exp}->[$chart]->{$impsys}) {
						$cargotypes->{$code}->{imp}->[$chart]->{$impsys}=1;
				}
				$interesting->[$chart]->{$impsys} |= 2;
		}

}

sub boring {
		my $boring = "";
		for (my $i=0;$i<8;$i++) {
				for (my $j=0;$j<256;$j++) {
						if (!$interesting->[$i]->{$j}) {
								$boring .= $j.", ";
						}
				}
				$boring .= "\n";
		}
		return $boring;
}
sub iboring {
		my $boring = "";
		for (my $i=0;$i<8;$i++) {
				for (my $j=0;$j<256;$j++) {
						if (!$interesting->[$i]->{$j} || !($interesting->[$i]->{$j} & 2)) {
								$boring .= $j.", ";
						}
				}
				$boring .= "\n";
		}
		return $boring;
}
sub eboring {
		my $boring = "";
		for (my $i=0;$i<8;$i++) {
				for (my $j=0;$j<256;$j++) {
						if (!$interesting->[$i]->{$j} || !($interesting->[$i]->{$j} & 1)) {
								$boring .= $j.", ";
						}
				}
				$boring .= "\n";
		}
		return $boring;
}


# Define cargo type templates
my @cargodesc = ("A1","alloys","Decorative alloys","Bronze, polished Quirstone, alloys of gold and silver, and other largely decorative materials.",
								 "A2","alloys","Ceramics","High strength ceramics used for heat shielding for spacecraft and high-temperature worlds",
								 "A3","alloys","Duralium","The primary alloy used in the construction of spaceship hulls.",
								 "A4","alloys","Heavy plastics","Heavy plastics used as a substitute for metals where typical metal properties are unwanted.",
								 "A5","alloys","Solar shielding","A thick glass, providing protection from solar flares and other solar activity.",
								 "C1","computers","AIs ","State-of-the-art hardware and software for automation of ship systems.",
								 "C2","computers","Earthquake predictors","The Diso Digital OO32000 processor and sensor array, or a similar product from a less well-known manufacturer",
								 "C3","computers","NavCon electronics","Computers and databases for in-system and witchspace navigation.",
								 "C4","computers","Remote presence systems","A variety of televisual and robotic remote presence systems, for those with an ingrained aversion to physical company.",
								 "C5","computers","Weather control processors","Sophisticated weather forecast and control computers used to coordinate planet-wide weather adjustments",
								 "F1","food","Bananas","The ancient Terran delicacy can only be made to grow on a few of the colonies, and is much prized by gourmets.",
								 "F2","food","Edible Grubs","While most worlds have some sort of strictly edible grub, most are bland and tasteless. A few, like those of Ermaso, have an astonishing range of flavours.",
								 "F3","food","Edible Moth","The rare edible moth is subject to stringent export controls to preserve its numbers. While an acquired taste, it is immensely popular with the discerning eater.",
								 "F5","food","Fish meat","The difficulties in trading in fish are not the taste or interplanetary toxicity, which to the rich diner are mere trifles to be circumvented, but the need to transport it quickly before it rots. The meats of Inera and Zasoceat are particularly desired.",
								 "F6","food","Goat Meat","As the Aronar Deadly Goat shows, there is a significant trade-off between being able to kill the animal at all, and leaving it sufficiently intact that its meat is salvageable. Preparing the meat generally requires special tools.",
								 "F7","food","Goat Soup","A popular avian delicacy, this is often made from extra-planetary goat meat for added variety.",
								 "F8","food","Shrew meat","Finding a way to make shrew meat edible is a major challenge. Only a few systems have so far succeeded, and their produce is in high demand at the fashionable restaurants. Trade in Shrew products is generally forbidden on Rodent worlds.",
								 "F9","food","Tree Grubs","While no more naturally interesting in flavour than their edible counterparts, a tree grub will soak up chemicals from the wood it feeds on, and so makes excellent seasoning if dried and ground.",
								 "F10","food","Wolf meat","A particular speciality of Leriteanese cuisine, now gaining in popularity across the charts. Leritean itself has no wolves, and so the meat has to be imported at great expense.",
								 "F11","food","Edible Arthropoid","Creatures like the Vezadian Edible Aroid, while strictly edible, are generally highly toxic to most species unless properly cooked. This makes them a highly exclusive meal.",
								 "U1","furs","Feline fur","A warm fur generally taken from sub-sentient animals such as the Esusti spotted cat. Fur from sentient felines does find its way on to the black market, and the Feline Assembly has been lobbying Galcop to outlaw the trade entirely. While this has not yet been successful, import and export are generally illegal on Feline worlds.",
								 "U2","furs","Gold-flake reptile scales","Shiny, decorative, but not of much practical value, these scales are often sewn in to high-class clothing.",
								 "U3","furs","High-toughness Leather","Almost every planet produces some sort of leather, but a few planets have animals which through quirks of genetics and environment have hides comparable in resilience to tough industrial alloys.",
								 "U4","furs","Shrew fur","A simple patterned fur often used for accessories. Trade in Shrew products is generally forbidden on Rodent worlds.",
								 "U5","furs","Snake skin","The skin of the Leonedian or Israzaian tree snake is favoured by ship manufacturers for use on premium seat covers. After the Xerirea incident, many Lizard worlds required that traders in this good obtain full permits and proofs of authenticity.",
								 "U6","furs","Wolf fur","A very warm fur from the wolves and wolf-like creatures of the chart, especially prized by the ice planets.",
								 "L1","liquorWines","Brandy","In the varied high-tech world of intergalactic drinking, old traditional drinks like brandy almost disappeared. A change in fashion has led to plainer brandies from systems like Tibedied and Isbeus being in high demand at the hot nightspots of the sector.",
								 "L2","liquorWines","Evil juice","Call it evil juice, call it killer juice, every planet makes some form of this intoxicating beverage. Few are sufficiently interesting to be worth transporting out of their system of origin, however.",
								 "L3","liquorWines","Gargle Blasters","Serve with lemon and a brick.",
								 "L4","liquorWines","Lethal brandy","One of the most popular drinks throughout the charts, lethal brandy's appeal is further boosted by its effects on humanoid and reptilian drinkers, enabling them to tolerate harsh environments for longer.",
								 "L5","liquorWines","Vicious brew","Drinks that fought back were briefly popular a few centuries ago, but nowadays are rarely consumed. Only a few planets still produce this.",
								 "X1","luxuries","Entertainment systems","Top-quality in-flight or home entertainment systems. Note that a few systems have banned the import of these devices, either because of concerns of corrupting effects on the people, or simply because they can't stand the programming.",
								 "X2","luxuries","Fine clothing","Obtaining mere high quality fashionable outfits is straightforward in these days of intersystem trade. Those at the top of society naturally desire more. Clothing that uses nano-adjustments to tailor itself to you is lazy. The best outfitters make those adjustments by hand, to cater to the whims of their filthy rich clientele.",
								 "X3","luxuries","Masks","The Tionislan solution to their shyness problem has been adopted to some extents by other naturally aloof species. The sharing of mask designs and mechanisms is a profitable niche market.",
								 "X4","luxuries","Poetry","While the majority of poets in the galaxy are more renowned for their taste than their literacy, the rarefied mountain atmosphere of a few worlds gives the right environment for poetry with superb emotional resonance.",
								 "X5","luxuries","Vacuum Cricket Bats","Ribiso in Chart 1 invented vacuum cricket, and for many centuries was the undisputed galactic champion. Their recent decision to allow the rules to be translated and the kit exported has led to a few of the richer systems putting together their own teams, and for the first time Ribiso's lead is no longer a foregone conclusion.",
								 "X6","luxuries","Vacuum karate training videos","Vacuum Karate is a rare martial art, and those wishing to learn must travel across the galaxy - and often between galaxies - to visit its masters. For the slightly less rich, these training videos fetch a good price.",
								 "X7","luxuries","Wooden furniture","Thick woody plants are relatively rare in most systems, and that's not counting the 'trees' that are actually giant grubs. The production of furniture from real wood, especially in these days of cheap synthetics, is a major expense.",
								 "X8","luxuries","Zero-G cricket balls","Zero-G cricket is a popular sport across the galaxies, though few systems have a team good enough to make the major leagues. Less skilled systems often have to make do with second-rate equipment, so a shipment of top-quality balls can fetch a high price.",
								 "X9","luxuries","Zero-G hockey sticks","Consistent regulation of Zero-G hockey collapsed during the Esveor Embargo, and technological boosts to player skill became commonplace. While the League was able to re-regulate the sport afterwards, many of the innovations were kept as fan favourites. The top sticks are no mere piece of metal now - they often contain more sophisticated targeting systems than the average Mamba.",
								 "X10","luxuries","Mud tennis rackets","One of the more unusual sports in Galcop space is mud tennis. Invented, and most commonly played, in Chart 2, it has its devotees throughout the eight.",
								 "X11","luxuries","Mud hockey pucks","The swamp worlds enjoy a game of hockey as much as anyone, but need special pucks to cut through the dense mud. A few other systems are taking up the game, finding it more comprehensible and strategic than the more common zero-G variation",
								 "M1","machinery","Premium air filters","Whether it's to keep heavy industry clean or to protect visitors from the native air, most systems need air filters. A few have a need for more sophisticated filters than they can produce themselves, however, and a profitable trade in spare parts has emerged.",
								 "M2","machinery","Boats","From the smallest canoe to the largest ocean liner, the inability of most species to swim long distances creates a natural market on oceanic worlds. The inability of most space-born sentients to understand 2-dimensional sailing means that replacements are always necessary.",
								 "M3","machinery","Factory Equipment","A range of high-tech industrial parts for use in mass production.",
								 "M4","machinery","Farming Equipment","Super-high quality farming equipment, produced by the few agricultural systems to have a strong enough technological base. As the farmers say, would you trust a laser plough made by someone who'd never seen a field?",
								 "M5","machinery","Food blenders","The unusual love for food blenders a few species have is a mystery to the majority of sentients, but whether producing or collecting, the planetary hobby often becomes a religion. In other systems, of course, the pureeing of food is considered a capital offence.",
								 "M6","machinery","Parking Meters","For all the systems that wish to regulate parking, there are very few willing to convert their production towards the high-tech meters needed to outfox the determined hacker. Parking meters worth shipping out of system are therefore extremely rare.",
								 "M7","machinery","Witchspace engines","Most ships nowadays need a witchspace drive, and while shipyards have the capacity to produce their own, it's often cheaper for them to import the quirium condensers from elsewhere.",
								 "R1","minerals","Quirstone","Asteroids that tumble with one side consistently facing the sun eventually attract a thin coating of polarised Quirium from the solar wind. While too sparse to be extracted for fuel, it gives the underlying rock a brilliant sparkle, and the stone, if extracted intact, is valuable in the production of decorated goods.",
								 "R2","minerals","Crystal Ores","Mineral ores and deposits rich in gems.",
								 "R3","minerals","Arthropod shell","Exoskeletal species such as lobsters are often able to use the shells of other arthropods to repair minor damage to their own. The raw materials are considerably cheaper than usual medical kits.",
								 "R4","minerals","Corals","Corals, growing in certain life-rich oceans, are valuable for both their decorative properties, and in some species, their flavour. Those without the jaws to digest rock-like substances are advised to stick to decoration.",
								 "R5","minerals","Durassion Ore","A common ore in asteroid regions, this is refined and strengthened into the duralium alloy used in most ship hulls.",
								 "R6","minerals","Igneous Rocks","The residue of intense volcanic activity, these rocks are sometimes used decoratively, but the majority of exports go to be used as fertiliser on the richer agricultural worlds.",
								 "R7","minerals","Industrial lubricants","A variety of industrial lubricants, generally transported in liquid or powder form. The original ones were mineral in nature; recent innovations in the use of mountain slug secretions have not led to a change in Galcop taxation category.",
								 "R8","minerals","Sedimentary Rocks","Mostly commonplace and worthless, a few systems produce sedimentary rocks of great decorative or commercial value.",
								 "O1","radioactives","Gene-splicers","Substances that rewrite genetic code, even in a controlled fashion, are not regularly used. For systems that have overused cloning in the past, though, this can be the only way to reintroduce genetic diversity into the population.",
								 "O2","radioactives","Low-energy waste","Low-level radioactive waste is mostly an annoyance. However, the unpredictable rate of its decay is essential to casinos as a source of unbiased random numbers.",
								 "O3","radioactives","Terraforming nanobots","If you need an inhospitable planet terraforming to be hospitable, these miniature robots will do the trick. Unless you want your ship turning into a tiny planetoid, however, do not open the container inside.",
								 "O4","radioactives","Quirium Isotopes","Larger, more active suns produce a wider range of quirium isotopes. There is therefore a natural surplus of certain isotopes in some systems, and a natural deficit in others. To produce a consistent mix for witchspace engines, some trade is needed.",
								 "T1","textiles","Air gossamer","Produced by the mysterious airborne plants of Larais, this thread generally needs weaving into fabric before it can be used in clothing.",
								 "T2","textiles","Pink cotton","A generic name for a variety of durable general purpose plant fabrics, most of which are in fact pink.",
								 "T3","textiles","Tree ant silk","The 'silk' produced by tree ants is a strong polymer based on compounds found in the bark and leaves of the trees. It is always in short supply at the chart's preeminent outfitters.",
								 "T4","textiles","Tulip petal weave","A fabric produced by layering preserved tulip petals and a thin thread of another material, to produce a scale effect. Popular among the reptilian species for its scale-matching properties",
								 "T5","textiles","Vargorn mind-silk","An unusual fabric, believed by some to be able to reduce stress in its wearer. Whether this effect is real, and if so, which species benefit from it, has yet to be ascertained.",
								 "T6","textiles","Weed hemp","The production of Megaweed provides this strong fabric, often incorporated into light body armour. As a result, attempts to ban the production, as opposed to the export, of Megaweed itself have never really got anywhere.",
								 "T7","textiles","Woven fabrics","Their six-limbed structure and compound vision gives insectoids the ideal anatomy for weaving fabrics. ",
								 "T8","textiles","Yak wool","A somewhat rough but extremely warm material, often used for cloaks and bedding. The Oninran variety is particularly prized.",
								 "IF1","firearms","Hand weapons","Projectile weapons, lasers, plasma rifles, and other small arms",
								 "IF2","firearms","Explosives","High explosives stored in bulk form, suitable for local conversion into grenades, warheads, or bombs as the situation requires.",
								 "IF3","firearms","Plasma turrets","High power high drain plasma turrets as found on large capital ships and major ground installations.",
								 "IF4","firearms","Artillery parts","Spare parts and ready-to-build new parts for artillery and other heavy war machinery.",
								 "IF5","firearms","Evil poet","The evil poet is classed as a Firearm for historical reasons. Do not open the canister unless you have control poems prepared, as they are generally stored in attack mode for rapid deployment.",
								 "FI1","food","Edible Arts Graduate","The export of edible arts graduates breaches numerous local and galactic regulations, but the gourmets of worlds such as Malama may be prepared to break them.",
								 "FI2","food","Edible Poet","After the infamous conservation disasters on Biarge, export and consumption of edible poets was placed under strict control. Shipping poets outside of their native system is an offence.",
								 "OI1","radioactives","Next-generation personality editors","The Communist states have been at the forefront of personality editing, though the technology has become more widespread across all systems. These next-generation editors, transmitted through a viral medium, are viewed with extreme suspicion.",
								 "IS1","slaves","Avian Slaves","Non-humanoid creatures, while often preferring human slaves, will also take slaves of their own species class to carry out tasks unsuited to humanoid anatomy.",
								 "IS2","slaves","Budget Tourists","While it is illegal to transport tourists and other passengers in cryo-suspension in your ship's hold, this does provide a cheap way for people to see parts of the galaxy they could otherwise not afford. The high risks involved mean that Galcop is unlikely to decriminalise the practice any time soon, but even with the danger money paid to the hauler, it's still cheaper than a berth on a real liner.",
								 "IS3","slaves","Feline Slaves","Non-humanoid creatures, while often preferring human slaves, will also take slaves of their own species class to carry out tasks unsuited to humanoid anatomy.",
								 "IS4","slaves","Frog Slaves","Non-humanoid creatures, while often preferring human slaves, will also take slaves of their own species class to carry out tasks unsuited to humanoid anatomy.",
								 "IS5","slaves","Insect Slaves","Non-humanoid creatures, while often preferring human slaves, will also take slaves of their own species class to carry out tasks unsuited to humanoid anatomy.",
								 "IS6","slaves","Lizard Slaves","Non-humanoid creatures, while often preferring human slaves, will also take slaves of their own species class to carry out tasks unsuited to humanoid anatomy.",
								 "IS7","slaves","Lobster Slaves","Non-humanoid creatures, while often preferring human slaves, will also take slaves of their own species class to carry out tasks unsuited to humanoid anatomy.",
								 "IS8","slaves","Rodent Slaves","Non-humanoid creatures, while often preferring human slaves, will also take slaves of their own species class to carry out tasks unsuited to humanoid anatomy.",
								 "IN1","narcotics","Anti-nausea medication","Medication used to suppress nausea. Due to the ease with which it can be processed into illegal hallucinogens, an export license is required.",
								 "IN2","narcotics","Catnip","Very popular among felines for the high it provides, but almost worthless to other species.",
								 "IN3","narcotics","Healing waters","The regenerative properties of the waters of some planets are not fully understood. As a precuation, Galcop has placed them under export bans, to avoid ecosystem contamination. There are, however, plenty of systems desperate enough to wish to circumvent this.",
								 "IN4","narcotics","Lethal water","Bima water and other 'waters' were originally transported as Food, until an alert customs official realised that they contained high proportions of easily extractable hallucinogens. Galcop regulations reclassifying them were rapidly introduced.",
								 "IN5","narcotics","Megaweed","Edinsoian Maarleil, Gelaedian So and other so-called Megaweeds are widely sought after, and Galcop has so far failed to prevent their widespread dispersal. Agreements have been made, however, to prevent their growth outside their native planets.",
								 "IN6","narcotics","Tobacco","An old Terran narcotic, but still popular among some species. Its rapid toxic effects, especially on avians, make transport a risky business.",
								 "IN7","narcotics","Vaccines","A variety of anti-plague medicines. Transport of vaccines requires special permits to ensure that they reach the right destination.");

while (@cargodesc > 0) {
		my $code = shift(@cargodesc);		
		my $generic = shift(@cargodesc);
		my $specific = shift(@cargodesc);
		my $desc = shift(@cargodesc);

		$cargotypes->{$code}->{generic} = $generic;
		$cargotypes->{$code}->{specific} = $specific;
		$cargotypes->{$code}->{desc} = $desc;

		if ($code =~/^[A-Z][0-9]/) {
				push(@basics,$code);
		} else {
				push(@illegals,$code);
		}
}

# Define galaxy 1 routes

my @route1 = (
		"A1","113,140,182,200,213,227","124,54",
		"A2","75,129,165,176,29,246,145","93,126,4,53,116,139,153,175,194,220,251,124",
		"A3","0,  2,  6,  12,  32,  35,  41,  73,  76,  88,  96, 103, 106, 108, 127, 128, 131, 145, 152, 159, 166, 170, 199, 226, 227,7,91,226,48,128,94,9,79,8,49,240,54,149,53,174,219","33,39,100,141,210,250,24,193,154,188,125,109,249,150,80,175,120,220,158,15",
		"A4","41,  50, 213, 233,141"," 23, 250,188,124",
		"A5","99,54,254,196","246,20,41,84,91,127,131,132,143,195,212,216,243,247",
		"C1","23,  33, 151, 246, 250,163,173,79,98,8,174,219","33,39,100,141,210,250",
		"C2","147,67,182,203,205,214,227","18,24,26,34,39,72,78,133,134,137,140,231,97",
		"C3","52,  85, 123, 153, 158, 168, 210, 212, 232,7,232,76,8,174,219","33,39,141,210,250",
		"C4","59,95,104","63,136,235,173",
		"C5","3,  8,  49,  82,  99, 141, 195, 207, 254,89,35","129,15,28",
		"F1","156,87","17,40,46,49,105,138,150,160,232",
		"F2","0,85,185","17,40,46,49,105,138,150,156,160,232",
		"F3","9","17,40,46,49,105,138,150,156,160,232",
		"F5","33,221","17,40,46,49,105,138,150,156,160,232",
		"F6","45,73,79","21,17,40,46,49,77,105,138,150,156,160,164,200,232,236",
		"F7","21,77,164,201,236","79,  85, 105, 122, 151, 163, 185, 236",
		"F8","243","17,40,46,49,105,138,150,156,160,232",
		"F9","7,11,155,240","17,40,46,49,105,138,150,156,160,232,228",
		"F10","92,128,139,150","17,40,46,49,105,138,156,160,232",
		"F11","","17,40,46,49,105,138,150,156,160,232",
		"U1","62,135","89,150,200,170,13",
		"U2","195","21,46,124,249",
		"U3","188,73","145,29",
		"U4","135,142,220,243","21,46,124,249,204,17",
		"U5","97","33,39,100,141,210,250",
		"U6","22,34,47,185,230,247,249","89,150,200,227,170,13",
		"L1","0","26,42,111,232,239",
		"L2","55,215,136,217","26,42,111,232,239",
		"L3","24,76,121","26,42,111,232,239",
		"L4","14,16,100,119,153,171,181,218,248","26,42,50,89,111,150,198,200,227,232,239,170,8,13",
		"L5","10,60,128,193","26,42,111,232,239",
		"X1","153,28","63,7,108,224",
		"X2","21,46,249","23,33,246,250,151,153,158,168,210,232,7",
		"X3","124","59,95,104",
		"X4","137,142","23,33,246,250,151,153,158,168,210,232,7,124",
		"X5","115","1,3,5,7,8,12,17,23,26,33,35,36,42",
		"X6","126","241,5,43,45,49,58,67,79,82,98,99,100,107,37,42",
		"X7","1,7,11,12,25,61,70,110,143,151,161,184,188,215,218,225,244,249","23,33,246,250,153,158,168,210,232",
		"X8","19,55,99,104,195,237","5,125,130,131,135,141,151,153,158,163,249,250,254,42,72,77,85,110",
		"X9","44,95,114,172","5,171,178,184,195,198,200,207,218,221,235,240,246,42,113,150,153,209",
		"X10","","198,17,98,5",
		"X11","","151,161,33,5",
		"M1","4,  53, 139, 153, 175, 220,36,99,53,139,153,175,220","29,86,177,250,169,116,126,194,251",
		"M2","148,28,99,153,164","29,42,56,68,74,102,154,172",
		"M3","23,33,151,153,158,168,210,232,246,250","61,78,91,110,134,149,212,213,219,233,245,255",
		"M4","111,158,114,161","10,21,30,34,38,44,46,52,59,63,74,84,85,95,101,116,123,137,142,157,160,167,169,174,181,187,189,191,192,209,223,224,228,236,244,251",
		"M5","132,131","13,108,162,224",
		"M6","100,231","75, 132, 158, 254,59,60,92,156,167,223,249",
		"M7"," 52,  85, 123, 153, 158, 168, 210, 212, 232,75,98,8,174,219","33,39,91,141,210,250",
		"R1","13,  28,  50,  51,  65,  90,  92, 120, 128, 156, 220, 254,55,148,228,246,65,92,120,220,28,51,128,156,254,13,50,90","91,39,7,147,46,129,255,113,140,182,200,213,227",
		"R2","55,148,228,218,8,51,114,215,18,102,158,49","91,39,7,147,46,129,255,93,124",
		"R3","4,8,36,65,194,212","20,58,159,174,182,207,211,237,238",
		"R4","28,29,42,102","20,58,124,159,182,207,237,174,211,238",
		"R5","52, 109, 123, 156,55,148,198,228,8,51,114,215,18,102,158,49","7,91,226,48,128,94,9,79,8,49,240,54,149,53,0,  2,  6,  12,  32,  35,  41,  73,  76,  88,  96, 103, 106, 108, 127, 128, 131, 145, 152, 159, 166, 170, 199, 226, 227",
		"R6","4,53,116,126,139,153,175,194,220,251","124,19,1,7,17,26,43,58,107,125,130,171,178,184,200,222,235",
		"R7","198,175,56,210,252","13, 108, 131, 132, 162, 224,169,132,131",
		"R8","113,140,182,200,213,227,8","93,124",
		"O1","49,  71, 162,111,190","211,250",
		"O2","178,36,169,145,112","35,73,83,198,199,154",
		"O3","114, 177,36"," 161,222",
		"O4","65,92,120,220,28,51,128,156,254,13,50,90","72,77,85,110,113,150,153,209",
		"T1","177","5,57,59,60,69,78,92,99,156,167,210,218,223,231,241,249,253",
		"T2","2,244,87","21,46,249",
		"T3","48,79,85,92,117,118","124,21,46,249",
		"T4","64,147,87","124,217,14,33,103,121,15,26,87,90,95,97,125,133,197",
		"T5","232,87,90","33,21,46,249",
		"T6","71,127,87","240,124",
		"T7","5,57,59,60,69,78,92,99,156,167,210,218,223,231,241,253","21,46,221,249",
		"T8","23","89,150,200,227,13",
		"IF1","24,193,154,188,125,109,249,150,80,175,120,220,158,15","1,2,6,15,43,46,50,57,60,70,80,94,118,125,162,168,179,180,183,223,226,233,253,209,190",
		"IF2","24,193,154,188,125,109,249,150,80,175,120,220,158,15","1,2,6,15,43,50,70,94,118,125,162,168,179,180,183,226,253,209",
		"IF3","24,193,154,188,125,109,249,150,80,175,120,220,158,15","1,2,15,70,162,180,183,209",
		"IF4","141,165,24,193,154,188,125,109,249,150,80,175,120,220,158,15","1,2,15,70,162,180,183,209",
		"IF5","114","209,180",
		"FI1","27,251","17,40,46,49,105,138,150,156,160,232",
		"FI2","3,37,61,63,122,123,146,170","17,40,46,49,105,138,150,156,160,232",
		"OI1","190,75,100,132,139,158,165,254","192,43,94,2,162,209,226,15",
		"IS1","85,105,122,185,236","79,151,163",
		"IS2","124,131,250,18,55,72,168,183,193,210,225","9,93,102,129,155,246,188",
		"IS3","39,86,109,140,147,169,186","31,82,110,149,227,246",
		"IS4","18,21,118,142,143,150,154,161,235,242,251","23,41,50,173,213,214,233,250",
		"IS5","59,60,92,156,167,223,249","5,57,69,78,99,210,218,231,241,253",
		"IS6","15,26,87,90,95,97,125,133,197","14,33,103,121,124",
		"IS7","58,174,211,238","20,159,182,207,237",
		"IS8","28,43,44,45,46,83,107,113,114,123,177,178,187,188","22,61,146,204,206,220",
		"IN1","86, 177,172","232,26,42,111,239",
		"IN2","110,149,129,180","31,39,82,86,109,140,147,169,186,227,246",
		"IN3","241,29","21,35,51,66,69,87,90,101,113,169,175,181,199,202,206,213,245,250",
		"IN4","116,159,189,202,206,230","18,21,23,41,50,118,142,143,150,154,161,173,213,214,233,235,242,250,251",
		"IN5","71,127","18,21,23,41,50,118,142,143,150,154,161,173,213,214,233,235,242,250,251",
		"IN6","198,16,180,84,116,244","18,21,23,41,50,118,142,143,150,154,161,173,213,214,233,235,242,250,251",
		"IN7","17,58,171,200,237","21,35,51,66,69,87,90,101,113,169,175,181,199,202,206,213,245,250");

my @route2 = (
"A1","188,45,15,19,40,57,90,135,151,222","178,152,80",
"A2"," 8,  65, 188,178,56,171","24,71,107,109,111,113,136,243",
"A3","36,39,82,138,16, 26, 46, 57, 58, 73, 79,143,153,158,170,202,208,222,233,238,240,52, 68,100,212,244","24,33,48,96,106,127,135,150,170,182,185,202,227,236,243,248,251,39,105",
"A4","127,82","40, 106, 209,236,14,178",
"A5","66,231,246","1,18,28,36,40,67,89,101,109,117,128,175,227,232,244",
"C1","36,66, 98,231,39","185,24,251,39,105",
"C2","62,93,98,108,109,127,130,151,172,202,248","26,32,50,63,104,139,159,196,208,217,222",
"C3","36,39,85,52, 68,100,114,146,167,191,209,212,215,244,246","24,33,48,82,96,106,127,135,150,170,182,185,202,227,236,243,248,251",
"C4","59,161,207,217,233,243","79,229",
"C5","24,  82, 103, 106, 109, 127","192, 209,115,88,202",
"IF1","33,48,82,96,106,127,135,150,170,182,202,227,243,248","5,11,29,26,55,60,74,80,83,102,116,118,123,124,148,168,220,226,247",
"IF2","33,48,82,96,106,127,135,150,170,182,202,227,243,248","5,11,29,26,55,60,74,80,83,116,118,123,124,148,220,226",
"IF3","33,48,82,96,106,127,135,150,170,182,202,227,243,248","11,55,60,65,74,83,116,204,220",
"IF4","33,48,82,96,106,127,135,150,170,182,202,227,243,248","11,55,60,65,74,83,116,204,220",
"IF5","165,77,209","11,116",
"F1","150,42","43,66,79,90,126,236,251",
"FI1","153,54,212,214","43,66,79,90,126,236,251",
"F2","70","43,66,79,90,126,236,251",
"F3","160,86,171","43,66,79,90,126,236,251",
"FI2","176","43,66,79,90,126,236,251",
"F5","182,39","43,66,79,90,126,236,251",
"F6","183","43,66,79,90,96,115,126,193,199,236,251",
"F7","115,96,193,199","49,57,58,64,78,184,208,238",
"F8","5,33,82","43,66,79,90,126,236,251",
"F9","38,41,64,91,133","43,66,79,90,126,236,251",
"F10","74","43,66,79,90,126,236,251",
"F11","21,201","43,66,79,90,126,236,251",
"U1","39,62,235","25,  62, 160, 253,23,57",
"U2","82","127,224",
"U3","46,51,57,87,115,119,184,192","14, 67, 80,101,152",
"U4","143,54,177,204,238","224,127",
"U5","155,70,174,206,223","185,24,251,39,105",
"U6","12,73,74,140,160,170,177,195,203,230","25,  62, 160, 200, 253,23,57,221",
"L1","51,77,171,215,228,234","14,26,91,109,114,144,167,178,201,211,216",
"L2","214,250","14,26,91,109,114,144,167,178,201,211,215,216",
"L3","63","14,26,91,109,114,144,167,178,201,211,215,216",
"L4","27,116,178,197,216,230","25,  62, 160, 200, 253,192, 209,14,23,26,45,57,88,91,109,114,136,144,167,201,211,215,221",
"L5","144,168,182,193,238","14,26,91,109,114,167,178,201,211,215,216",
"X1","20,61,140,236","47,73,84,137,145,219,255",
"X2","127,224","39, 66, 98,114,146,167,191,209,215,231,246",
"X3","233,35","110,67",
"X4","11,117","39, 66, 98,114,146,167,191,209,215,231,246",
"X5","","140,60,237",
"X6","","146,81,226",
"X7","7,28,38,42,64,74,95,100,111,122,138,146,149,175,194,221,224","39, 66, 98,114,146,167,191,209,215,231,246,122",
"X8","36,81,176,189","1,22,41,127,191,209,231",
"X9","160,32,228","16,10,122,128,136,189,242",
"X10","35,78,135,165","40,63,66,98,106,198,218,246,253",
"X11","159","57,92,82,103,125,129,224,255",
"M1","16,103","111,71,107,113,136,157,243,249",
"M2","6,25,127,195,200","2,22,31,114,115,137,154,160,203",
"M3","39, 66, 98,114,146,167,191,209,215,231,246","5,32, 84,148,196,201,229, ",
"M4","66,71,135,152,210,17","0, 4, 9, 11, 14, 19, 20, 21, 27, 29, 30, 34, 37, 38, 43, 48, 53, 56, 59, 68, 69, 72, 74, 77, 83, 88, 89, 91, 94,107,110,116,122,126,137,139,149,155,160,164,165,169,174,175,179,180,181,187,190,192,197,203,206,212,217,224,225,228,235,236,239,243,251,252,253",
"M5","6","",
"M6","173","178,80,109,188,189",
"M7","36,58,69,85,52, 68,100,212,244","24,33,48,82,96,106,127,135,150,170,185,182,202,227,243,248,251,39,105",
"R1","53,58,63,71,103,188,221, 66, 71,120,128,129,155,170,201,230","15,19,40,57,90,135,151,222",
"R2","103,188,192,40, 57, 91,113,115,178,182","178,152,80",
"R3","105,130,209","0,15,29,43,46,57,85,87,90,121,122,125,136,138,139,147,158,168,176,183,216,234,248,254",
"R4","6,31","0,15,29,43,46,57,85,87,90,121,122,125,136,138,139,147,158,168,176,183,216,234,248,254",
"R5","103,188,40, 57, 91,113,115,178,182","82,138,16, 26, 46, 57, 58, 73, 79,143,153,158,170,202,208,222,233,238,240",
"R6","111,71,107,113,136,157,243,249","10, 22, 41, 60,112,120,122,125,129,136,140,169,224,226,230,242,253",
"R7","35","6,101",
"R8","15,19,40,57,90,135,151,222","178,152,80",
"IN1","42, 120,127","14,26,144",
"IN2","","56,57,80,83,107,190,203,206,26,61,151,153,170,185,200,202,221",
"IN3","31,154","10,16,19,45,59,66,68,86,121,126,142,156,158,197,239",
"IN4","7,18,37,169,190,211,239","8,10,11,30,40,126,143,157,174,209",
"IN5","105,250","8,10,11,30,40,126,143,157,174,209",
"IN6"," 20, 37, 68, 69,165,197,212","8,10,11,30,40,126,143,157,174,209",
"IN7","98,136,237,120,129,136,226,230","10,16,19,37,59,66,68,86,121,126,142,156,158,197,239",
"O1","106, 127, 138, 191, 82,81","178,152,80",
"O2","17,170,244","25,34,50,68,119,155,158,198,135",
"OI1","140,172,188,189,109","127,43, 60, 89,29, 60,124,220,205",
"O3","135","32,220,223,234",
"O4","53,58,63,71,221,66, 71,120,128,129,155,170,201,230"," 33, 57, 60, 78, 79, 92,124,156,159,188,215,220,252",
"IS1","111,75,119,154,211","49,57,58,64,78,184,208,238",
"IS2","103,50,87,130,146,151,215,23, 34","6,22,107,122,127,178,185,200,206",
"IS3","56,57,80,83,107,190,203,206","26,61,151,153,170,185,200,202,221",
"IS4","10,11,30,57,120,126,157,174","8,40,106,143,209,215",
"IS5","14,53,89,113,115,144,224","81,57",
"IS6","51,57,104,145,149,152,186,192,239,247","32,79,117,177,240",
"IS7","0,29,43,90,110,121,122,125,136,139,147,168,175,183,234","15,46,85,87,138,158,176,216,248,254,57",
"IS8","17,21,42,57,72,74,94,112,160,179,235","23,24,25,62,93,189,207,232,245",
"T1","","14,53,57,89,81,113,115,144",
"T2","250","127,224",
"T3","0,21,27","127,224",
"T4","13,231","51,57,104,145,149,152,186,192,239,247,32,79,117,177,240",
"T5","240","127,224,152",
"T6","105,250","127,224",
"T7","14,53,57,89,81,113,115,144","127,224",
"T8","235","25,  62, 160, 200, 253,23,57"
		);


my @route3 = (
"A1","184,185,230","82, 91,109,124",
"A2","189","202,46",
"A3"," 9, 12, 28, 39, 45,103,109,126,142,156,158,172,173,174,190,199,206,222,233,238,249,252","99,5,42,52,97,36, 17,21,26,31,36,84,139,165,204,205,223,245,247,251",
"A4","191,68","6, 36, 43",
"A5","","1, 16, 61, 62, 70, 72, 94,101,112,114,126,147,184,198,206,230,231,243",
"C1","36, 38, 42, 54, 69, 79,","99,5,42,52,97,36",
"C2","33, 37, 38, 84,115,116,125,132,224,252","115,125,239, 19, 27, 57, 88, 99,108,110,136,157,159,168,217,221,235",
"C3","6, 10, 22, 40, 56, 63, 99,131,147,179,184,227,","99,5,42,52,97,36, 17,21,26,31,36,84,139,165,204,205,223,245,247,251",
"C4","35,114,121","20,249,133,206",
"C5","17, 26, 34, 43, 58,116,129,149,155,223","22,148,235,253",
"IF1","17,21,26,31,36,84,139,165,204,205,223,245,247,251","8, 23, 26, 41, 71, 86, 90, 93, 95,107,128,144,149,152,155,156,162,175,186,223,227,236,244,245,251",
"IF2","17,21,26,31,36,84,139,165,204,205,223,245,247,251","23, 26, 41, 71, 86, 93, 95,107,128,144,152,155,156,162,175,223,227,236,245,251",
"IF3","17,21,26,31,36,84,139,165,204,205,223,245,247,251","41, 71, 86, 93,128,144,227,236,245",
"IF4","17,21,26,31,36,84,139,165,204,205,223,245,247,251","41, 71, 86, 93,128,144,227,236,245",
"IF5","100","227,41",
"F1","223,29","29, 34, 46, 50, 52,122,133,145,149,188,203,208,218,",
"FI1","111","29, 34, 46, 50, 52,122,133,145,149,188,203,208,218,",
"F2","204","29, 34, 46, 50, 52,122,133,145,149,188,203,208,218,",
"F3","151,200,210","29, 34, 46, 50, 52,122,133,145,149,188,203,208,218,",
"FI2","56, 65,190","29, 34, 46, 50, 52,122,133,145,149,188,203,208,218,",
"F5","7, 10, 21, 66,179","29, 34, 46, 50, 52,122,133,145,149,188,203,208,218,",
"F6","8,246","29, 34, 46, 50, 52,122,133,145,149,188,203,208,218,51, 76,165",
"F7","51, 76,165","22,  33,  40,  52,  56,  74,  85,  88,  90, 125, 138, 150, 152, 153, 161, 167, 184, 186, 203, 213, 218, 244, 253",
"F8","1, 45,105,249","29, 34, 46, 50, 52,122,133,145,149,188,203,208,218,",
"F9","36, 55, 72, 85,196,242","29, 34, 46, 50, 52,122,133,145,149,188,203,208,218,",
"F10","181","29, 34, 46, 50, 52,122,133,145,149,188,203,208,218,",
"F11","","29, 34, 46, 50, 52,122,133,145,149,188,203,208,218,",
"U1","94,109,163,189,134","25, 62,160,200,253",
"U2","137","31,84,198",
"U3","103,193","130,152,189,242",
"U4","5,148,171,18,87"," 31, 84,198",
"U5","51,135,238,246","5,99,42,52,97,36",
"U6","14, 31, 48, 77,105,138,144,160,195,215,243","25, 62,160,200,253",
"L1","30, 56, 65,108,198,219,227","28, 37, 70, 75,151,153,154,167,203",
"L2","78,170,231","28, 37, 70, 75,151,153,154,167,203",
"L3","187","28, 37, 70, 75,151,153,154,167,203",
"L4","30, 56, 65,108,198,219,227","28, 37, 70, 75,151,153,154,167,203, 22,148,235,253,25, 62,160,200,253",
"L5","47,75","28, 37, 70, 75,151,153,154,167,203",
"X1","10, 48, 59, 182,195,234","80,126,141,166,133,206",
"X2"," 31, 84,198","5, 6, 10, 22, 36, 38, 42, 54, 63, 69, 79",
"X3","208","20, 249",
"X4","","20, 31, 64, 84,186,5, 6, 10, 22, 36, 38, 42, 54, 63, 69, 79,227,41",
"X5","","2, ,218,",
"X6","","76,198,",
"X7","9, 13, 50, 64, 71, 97,130,140,158,173,192,209,239,255","5, 6, 10, 22, 36, 38, 42, 54, 63, 69, 79",
"X8","47, 97,165,173,188,209","220,223,225,226,228,230,234,242,245,246,250,79, 84, 87,101,113,116,125,129,144,149,155,157,175,194",
"X9","2, 30,100,150","5, 6, 7, 10, 13, 17, 18, 22, 26, 31, 34, 36, 38, 42, 43, 50, 54, 55, 58, 64, 75, 199,202,205,210,214",
"X10","","231,251",
"X11","","124,112",
"M1","","46,202",
"M2","43, 58, 59,115,125,193,206","215",
"M3","5, 6, 10, 22, 36, 38, 42, 54, 63, 69, 79","3, 25, 40, 56, 62, 67, 78,108,179,200",
"M4","49,111,181","7, 8, 24, 27, 30, 35, 41, 46, 48, 51, 57, 60, 65, 66, 71, 72, 82, 83, 88, 89, 91, 99,100,102,114,118,124,128,134,135,136,139,140,147,150,152,153,159,162,163,168,169,194,201,203,208,211,215,216,229,231,232",
"M5","141"," 42, 58",
"M6","33,110","219,43,107,155,140",
"M7","6, 10, 22, 40, 56, 63, 99,131,147,179,184,227","5,99,42,52,97,36,17,21,26,31,36,84,139,165,204,205,223,245,247,251",
"R1","15, 16, 19, 24, 52, 55, 65, 89,103,110,114,117,145,171,198,236,237"," 31, 84,198",
"R2","84,139,240","184,185,230",
"R3","62, 90,148","42, 54, 70,118,159,170,181,182,235,246,255",
"R4","58,115,125,206","42, 54, 70,118,159,170,181,182,235,246,255",
"R5","5, 84,110,139,172,240,250","9, 12, 45,103,109,126,142,156,158,172,173,174,190,199,206,222,233,238,249",
"R6","202,46","13, 31, 84, 87,101,112,113,124,210,218,225,226,228,231,234,242,245,246,250,251",
"R7","52","141,42,58",
"R8","184,185,230","247,251",
"IN1","11, 176","28, 37, 70, 75,151,153,154,167,203",
"IN2","136","1, 11, 26, 29, 86,121,122,129,193,249,250",
"IN3","43,58","12, 25, 53, 54, 67, 69,121,140,180,183,194,202,210,248,254",
"IN4","14, 54,106,138,169,196,226","4, 6, 20, 36, 43, 68, 99,134,164,191,234,245",
"IN5","112","4, 6, 20, 36, 43, 68, 99,134,164,191,234,245",
"IN6","35, 51,147,163","4, 6, 20, 36, 43, 68, 99,134,164,191,234,245",
"IN7","31, 75, 84,101,210,218,228,230,234,242,245,246,250,251,5","12, 25, 53, 54, 67, 69,121,140,180,183,194,202,210,248,254",
"O1","34","24, 236,133,206",
"O2","55, 61, 73,166,191,213","68, 99,187,220,229,238",
"OI1","16, 43, 64,107,144,155,219","133,190,218,107,128,144,155,25",
"O3","","81,128",
"O4","15, 16, 19, 24, 52, 55, 65, 89,103,110,114,117,145,171,198,236,237","40,122,124,151,158,162,196,199,213,246",
"IS1","74, 85, 88, 90,138,150,152,153,161,167,186,203,218,244","22, 33, 40, 52, 56,125,184,213,253",
"IS2","53,197, 74, 85, 90,106,122,133,229","36",
"IS3","1, 11, 86,122,136,250","26, 29,121,129,193,249",
"IS4","4, 20, 99,134,164,234,245","6, 36, 43, 68,191",
"IS5","31, 84, 95,198","53, 67,107,127,195,212,223",
"IS6","7, 8, 21, 61, 65, 93,135,139,154,157,214,221,225,232","97,104,149,189",
"IS7","70,118,159,170,181,182,246,255","42, 54,235",
"IS8","24, 57, 71, 72, 75, 89,102,166,168,180,202,216,217,230,231","10, 25, 38, 39, 58,103,116,120,185,199,200,248",
"T1","206","31, 53, 67, 84, 95,107,127,195,198,212,223",
"T2","112"," 31, 84,198",
"T3","77"," 31, 84,198",
"T4","27","7, 8, 21, 61, 65, 93, 97,104,135,139,149,154,157,189,214,221,225,232",
"T5","133"," 31, 84,198",
"T6","112"," 31, 84,198",
"T7","53, 67, 95,107,127,195,212,223"," 31, 84,198",
"T8","","25, 62,160,200,253"
		);

my @route4 = (
"A1"," 18, 64, 96,138,218","34, 245",
"A2","169,44","75,128,161,182,227,228,252",
"A3","6, 17, 22, 30, 46, 49,169,198,201,209,214,222,233,238,241","2,34,247 9,39,49,57,66,86,103,110,140,186,188,221,237,254",
"A4","195,224,255","159",
"A5","220,2","9, 22, 52, 74, 82,113,129,133,164,187,190,214,232,238,239,251",
"C1","141,197","2,34,247",
"C2","13, 23, 30, 49,103,117,138,167,188","20, 21, 56, 64, 96,106,160,171,177,219",
"C3","3, 10, 24, 36, 75, 76, 85, 99,104,107,115,117,120,123,136,144,147,184,192,195,203,219","2,34,247, 9,39,49,57,66,86,103,110,140,186,188,221,237,254",
"C4","4, 19,110,182,202,225","",
"C5","29, 50, 58,137,220","4, 254",
"IF1","9,39,49,57,66,86,103,110,140,186,188,221,237,254","11, 14, 35, 40, 42, 43, 48, 54, 63, 65, 77, 81,131,134,137,149,159,168,169,178,194,199,230,234,240,245,246",
"IF2","9,39,49,57,66,86,103,110,140,186,188,221,237,254","11, 14, 35, 40, 42, 43, 54, 63, 65, 81,131,134,137,149,159,169,194,230,240,246",
"IF3","9,39,49,57,66,86,103,110,140,186,188,221,237,254","11, 35, 40, 43, 63, 81,131,137,159,194,230,240",
"IF4","9,39,49,57,66,86,103,110,140,186,188,221,237,254","11, 35, 40, 43, 63, 81,131,137,159,194,230,240",
"IF5",76,"11, 35, 40, 43,131,240",
"F1","","78,141,183,189,208,212,250",
"FI1","3, 85, 93,108,143,157,227","78,141,183,189,208,212,250",
"F2","","78,141,183,189,208,212,250",
"F3","24, 62,147,153,255","78,141,183,189,208,212,250",
"FI2","185,203,244,254","78,141,183,189,208,212,250",
"F5",43,"78,141,183,189,208,212,250",
"F6","51","195,236,78,141,183,189,208,212,250",
"F7","195,236","5,  53,  54,  70, 118, 133, 181, 182, 198, 246",
"F8","12, 17, 62, 88,153,237","78,141,183,189,208,212,250",
"F9","104,198","78,141,183,189,208,212,250",
"F10","10, 40,165,167,237","78,141,183,189,208,212,250",
"F11","158","78,141,183,189,208,212,250",
"U1","10, 56,102,122,181,205,235","35,153,229",
"U2","231,114","175",
"U3","216,53,248","57,149",
"U4","175, 152,7","175",
"U5"," 17, 88,152","2,34",
"U6",126,"35,153,229,233",
"L1","15,101,158,242","63,115,154,173,177,183,242",
"L2","172,187,201","63,115,154,173,177,183,242",
"L3","119,71","63,115,154,173,177,183,242",
"L4","15,101,242","35,153,229,233,63,115,154,173,177,183,242",
"L5","12,107,215","63,115,154,173,177,183,242",
"X1","48, 53, 58, 246,249,","71, 74,120,162,165,176,191",
"X2","175","2, 10, 36, 76, 85,117,141,197",
"X3","39, 78, 95,124,125,189,232","",
"X4","","76,128, 2, 10, 36, 76, 85,117,141,197",
"X5","","119,60",
"X6","","36,209",
"X7","6, 11, 31, 36, 41, 57,108,126,137,201,255","2, 10, 36, 76, 85,117,141,197",
"X8","215,15","85,101,103,113,126,130,132,134,137",
"X9","19,124,209","45, 46, 50, 54, 58, 63, 65, 76, ,138,141,142,146,148",
"X10","195,213,247","25, 29, 30, 34, 38, 41, 42,150,154,159",
"X11","196,90","7, 15, ,172,175,185,189,197,215,220,225,244,245",
"M1","161,227,228","75,128,182,252",
"M2","148,216,224,247","16,130,178,179,192",
"M3","2, 10, 36, 76, 85,117,141,197","0, 3, 11, 19, 32, 43, 51, 80,104,121,152,155,161,187",
"M4","13,69","8, 16, 21, 24, 27, 28, 33, 35, 41, 48, 53, 56, 59, 62, 66, 67, 68, 70, 71, 73, 74, 75, 78, 81, 86, 88, 94, 96, 99,100,102,105,107,108,110,113,118,120,127,128,131,134,139,140,145,147,150,158,160,168,171,174,177,179,180,183,192,200,208,211,219,232,240,243,249,251,253,",
"M5","243","26, 50,163",
"M6","156","36, 76,116,220,105",
"M7","3, 10, 24, 36, 75, 76, 85, 99,104,107,115,117,120,123,136,144,147,184,192,195,203,219","2,34,247",
"R1","16, 37,108,110,111,113,114,115,137,144,151,205,236,238,242"," 18, 64, 96,138,218",
"R2","163,210","156,211",
"R3","23, 46,148,175,186,199,219,220,241,251","0, 8, 24, 40, 57, 62, 64, 88,110,126,128,136,152,168,185,190,192,216,238,254",
"R4","16,130,148,178,179,192,216,224,247","0, 8, 24, 40, 57, 62, 64, 88,110,126,128,136,152,168,185,190,192,216,238,254",
"R5","9,134","6, 17, 22, 30, 46, 49,169,198,201,209,214,222,233,238,241",
"R6","75,128,161,182,227,228,252","7, 41, 45, 60, 63,101,113,119,126,130,132,134,138,142,146,150,154,172,175,185,189,225,244,245",
"R7","150,184,223","26, 50,163,243",
"R8","138,218,96,64,18","151, 233",
"IN1","69,  92, 142","63,115,154,173,177,183,242",
"IN2","16, 80,144,208","16, 21, 41, 73, 80, 86,105,144,149,169,201,208,214,233",
"IN3","178,179","1, 6, 24, 44, 79, 84, 89, 90, 94, 99,102,135,141,145,146,166,170,184,202,205,209,212,218,223,253",
"IN4",109,"31, 67, 94, 95, 96,127,159,195,222,223,224,255",
"IN5","214","31, 67, 94, 95, 96,127,159,195,222,223,224,255",
"IN6","59,107,131,160,171,251","31, 67, 94, 95, 96,127,159,195,222,223,224,255",
"IN7","149,130,138,189,244,245","1, 6, 24, 44, 79, 84, 89, 90, 94, 99,102,135,141,145,146,166,170,184,202,205,209,212,218,223,253",
"O1","","98,104,110,143",
"O2","2, 51, 97,168","5, 16, 36, 82,248",
"OI1","4, 23, 36, 44, 76,103,116,135,159,167,191,215,220,223,247","63,159,199",
"O3","69,245","61, 83, 210",
"O4","16, 37,108,110,111,113,114,115,137,144,151,205,236,238,242","24, 33, 35, 52, 57, 70, 74, 85,159,180,198,199,202,253",
"IS1","53, 70,118,133,182","5, 54,181,198,246",
"IS2","58,65","130,145,161,188,198",
"IS3","16, 21, 41, 73, 86,105,208","80,144,149,169,201,214,233",
"IS4","31, 67, 94, 95, 96,127","159,195,222,223,224,255",
"IS5","56,120,153,174,175,179,200,217,232,239,243,249","25, 46, 47, 51, 72, 89,104,111,115,121,184,248",
"IS6","9, 48,102,150,166,213,240","22, 38, 85,112,137,176,230",
"IS7","8, 24, 62, 88,110,126,128,168,185,192","0, 40, 57, 64,136,152,190,216,238,254",
"IS8","69,101,134,165,245","6, 37,117,197,229",
"T1","","25, 46, 47, 51, 56, 72, 89,104,111,115,120,121,153,174,175,179,184,200,217,232,239,243,248,249",
"T2","41,197,214","175",
"T3","101,120","175",
"T4","14, 52, 83, 98,157,166,213","9, 22, 38, 48, 85,102,112,137,150,166,176,213,230,240",
"T5","102,166","175",
"T6","214","175",
"T7","25, 46, 47, 51, 56, 72, 89,104,111,115,120,121,153,174,179,184,200,217,232,239,243,248,249","175",
"T8","","35,153,229,233"
		);


my @route5 = (
"A1","3, 30,112,125,137","76, 155",
"A2","42,231","17, 81,148,163,201",
"A3","49, 55, 66, 73, 76, 86, 93,125,130,147,151,157,219,232,233,238,247,251","55,128,29,57,71,73,102,144,152,153,190,198,204,222,233,249,88",
"A4","107,219,229","40,115",
"A5","135,230","6,  22,  67,  78,  91, 125, 130, 131, 133, 142, 159, 197, 199, 250, 251",
"C1","39,  70,  99, 126, 198, 249","55,128,88",
"C2"," 28,  43, 105, 120, 126, 178, 182, 185, 217, 220","26,  30,  36,  71,  72, 119, 129, 149, 177, 218, 229",
"C3","0,  12,  64,  69,  89,  90,  95, 128, 133, 135, 159, 191, 218, 220, 229, 230, 250","55,128,88,29,57,71,73,102,144,152,153,190,198,204,222,233,249",
"C4","69,  84,  98, 104, 239","8,  74, 123",
"C5","2, 156, 212, 226, 240","95",
"IF1","29,57,71,73,102,144,152,153,190,198,204,222,233,249","13,  16,  20,  23,  40,  49,  64,  73, 106, 107, 111, 181, 209, 222, 228, 237, 244, 252, 253",
"IF2","29,57,71,73,102,144,152,153,190,198,204,222,233,249","16,  20,  40,  49,  64,  73, 209, 237, 244, 252, 253",
"IF3","29,57,71,73,102,144,152,153,190,198,204,222,233,249","16,  20,  49,  73, 209, 237, 253",
"IF4","29,57,71,73,102,144,152,153,190,198,204,222,233,249","16,  20,  49,  73, 209, 237, 253",
"IF5","227","49, 209",
"F1","55,95","10,  23,  45, 106, 146, 166, 172, 186, 206, 238, 246",
"FI1"," 5,  31,  37, 116, 127, 193","10,  23,  45, 106, 146, 166, 172, 186, 206, 238, 246",
"F2","48, 113","10,  23,  45, 106, 146, 166, 172, 186, 206, 238, 246",
"F3","14, 232","10,  23,  45, 106, 146, 166, 172, 186, 206, 238, 246",
"FI2","186, 225","10,  23,  45, 106, 146, 166, 172, 186, 206, 238, 246",
"F5","25","10,  23,  45, 106, 146, 166, 172, 186, 206, 238, 246",
"F6","79, 156","10,  23,  45, 106, 146, 166, 172, 186, 206, 238, 246,12, 115",
"F7","12, 115","9,  62,  84,  95, 111, 122, 159, 172, 175, 189, 246",
"F8","6,27","10,  23,  45, 106, 146, 166, 172, 186, 206, 238, 246",
"F9","111, 140, 157, 188, 251","10,  23,  45, 106, 146, 166, 172, 186, 206, 238, 246",
"F10","95, 203, 207, 254","10,  23,  45, 106, 146, 166, 172, 186, 206, 238, 246",
"F11","50","10,  23,  45, 106, 146, 166, 172, 186, 206, 238, 246",
"U1","102, 163, 195, 245"," 24,  35,  48, 108, 145, 157, 201, 234, 253",
"U2","158","239",
"U3","15","76, 155",
"U4","102, 145,213,101","239",
"U5","27, 249","55,128,88",
"U6","130,198,118,60"," 24,  35,  48, 108, 145, 157, 179, 201, 234, 253",
"L1","42,  59, 103, 126, 237"," 32,  47,  70, 103, 141, 166, 209",
"L2","3,  25,  84,  88, 134, 161, 190, 230"," 32,  47,  70, 103, 141, 166, 209",
"L3","7,  97, 183, 218"," 32,  47,  70, 103, 141, 166, 209",
"L4","42,  59, 103, 126, 237"," 32,  47,  70, 103, 141, 166, 209,95, 24,  35,  48, 108, 145, 157, 179, 201, 234, 253",
"L5"," 59,  79, 254"," 32,  47,  70, 103, 141, 166, 209",
"X1","46,  247","108, 153, 183",
"X2","239","12,  39,  70,  89,  99, 126, 135, 198, 220, 230, 249",
"X3","58, 135, 138, 189, 205, 223","8,  74, 123",
"X4","20","12,  39,  70,  89,  99, 126, 135, 198, 220, 230, 249,74, 159,",
"X5","","21,  34,   212, 213",
"X6","39","39,  40  , 201, 202,115, 116, 141, 152,138",
"X7","14,  32,  51,  73,  88,  89, 104, 116, 160, 197, 198, 207","12,  39,  70,  89,  99, 126, 135, 198, 220, 230, 249",
"X8"," 7,  42,  97, 246","1,  2,  249, 254, 44,  66,   194, 198, 118, ",
"X9","24, 138, 152, 175","3,  8,   245, 246, 70,  74,  184, 188,126",
"X10","75, 112, 243","10,  11,  239, 240,80,  89,  162, 173 , 130",
"X11","65, 232","12,  19, 215, 226,98,  99,  153, 156, 137",
"M1","17","81, 148, 163, 201",
"M2","61,  65,  93, 194, 211, 255","62,  71, 187",
"M3","12,  39,  70,  89,  99, 126, 135, 198, 220, 230, 249","14,  90, 128, 132, 154, 159, 160, 218, 241, 255,",
"M4","28,  56,  75, 134, 190","0,  4,  9,  10,  16,  22,  27,  31,  32,  37,  44,  46,  58,  59,  63,  78,  81,  85,  87,  91, 101, 104, 108, 111, 113, 122, 123, 129, 149, 150, 155, 164, 174, 177, 179, 180, 183, 186, 187, 191, 192, 196, 197, 200, 201, 206, 209, 223, 224, 228, 250, 252",
"M5","","171",
"M6","226","217,19",
"M7"," 0,  12,  64,  69,  89,  90,  95, 128, 133, 135, 159, 191, 218, 220, 229, 230, 250","55,128,88,29,57,71,73,102,144,152,153,190,198,204,222,233,249",
"R1"," 11,  19,  21,  73,  76,  92,  97, 112, 121, 134, 216, 241, 87","3, 30,112,125,137",
"R2","96, 171,87","76, 155",
"R3","44, 145, 176, 211, 227","11,  81,  92,  98, 106, 118, 123, 143, 160, 187, 190, 203, 211, 238, 254",
"R4"," 61,  62,  65,  71,  93, 187, 194, 211, 255","11,  81,  92,  98, 106, 118, 123, 143, 160, 187, 190, 203, 211, 238, 254",
"R5","0,  50, 130, 174, 238,87","49, 55, 66, 73, 76, 86, 93,125,130,147,151,157,219,232,233,238,247,251",
"R6","17,  81, 148, 163, 201","1,  3,  8,  10,  11,  19,  21,  44,  74,  80, 116, 118, 138, 141, 152, 153, 173, 188, 201, 202, 215, 239, 245, 246",
"R7","174, 243","171",
"R8","3, 30,112,125,137","76, 155",
"IN1","33, 109, 168"," 32,  47,  70, 103, 141, 166, 209",
"IN2","133,165,186","3,  6,  18,  19,  59,  68,  75,  82,  83,  88, 132, 133, 139, 152, 162, 165, 169, 170, 177, 179, 186, 209, 226, 233, 243, 251",
"IN3","61, 187, 194","0,  12,  17,  21,  86,  92,  93, 148, 165, 172, 174, 203, 215, 221, 238",
"IN4","22, 157, 162","28,  29,  31,  37,  40,  41,  42,  49,  58,  67, 107, 115, 134, 146, 174, 182, 210, 219, 223, 224, 227, 229, 255",
"IN5","209","28,  29,  31,  37,  40,  41,  42,  49,  58,  67, 107, 115, 134, 146, 174, 182, 210, 219, 223, 224, 227, 229, 255",
"IN6","0, 192, 250","28,  29,  31,  37,  40,  41,  42,  49,  58,  67, 107, 115, 134, 146, 174, 182, 210, 219, 223, 224, 227, 229, 255",
"IN7","3, 141, 153, 188, 245, 246,35","0,  12,  17,  21,  86,  92,  93, 148, 165, 172, 174, 203, 215, 221, 238",
"O1","12,  51, 182","10,  201, 96, 105,",
"O2","13,  83, 155","41,  52,  55, 167, 215, 220, 226",
"OI1","42, 106, 170, 175, 208, 240","16, 106, 111, 181",
"O3","","77,  96, 105, 152,",
"O4","11,  19,  21,  73,  76,  92,  97, 112, 121, 134, 216, 241","3,  7,  13,  14,  24,  27, 105, 135, 202, 215, 218, 245",
"IS1","9,  62,  84, 111, 122, 246","95, 159, 172, 175, 189",
"IS2","102,211, 163, 195, 217, 220, 230, 252"," 0,  26,  82, 113, 176, 177, 182, 194",
"IS3","3,  6,  19,  59,  75,  83,  88, 152, 169, 177, 179, 186, 209, 243","18,  68,  82, 132, 133, 139, 162, 165, 170, 226, 233, 251",
"IS4"," 28,  31,  37,  41,  58,  67, 134, 174, 223, 224, 227","29,  40,  42,  49, 107, 115, 146, 182, 210, 219, 229, 255",
"IS5","43,  44,  47,  48, 191, 196, 239","5,  34,  35,  51, 105, 212, 216, 240",
"IS6","91, 101, 104, 163, 221","20,  70,  96, 110, 176, 195, 220",
"IS7","11,  81,  92, 118, 123, 187, 190","98, 106, 143, 160, 203, 211, 238, 254",
"IS8","27,  32,  46,  63,  79, 108, 112, 168, 201","15,  17,  54,  69,  99, 125, 126, 127, 156, 157, 171, 234, 235, 241",
"T1","","5,  34,  35,  43,  44,  47,  48,  51, 105, 191, 196, 212, 216, 239, 240",
"T2","16,  144","239",
"T3","","239",
"T4","78,185","20,  70,  91,  96, 101, 104, 110, 163, 176, 195, 220, 221",
"T5","221","239",
"T6","","239",
"T7","5,  34,  35,  43,  44,  47,  48,  51, 105, 191, 196, 212, 216, 240","239",
"T8","81"," 24,  35,  48, 108, 145, 157, 179, 201, 234, 253",
		);

my @route6 = (
"A1","","197, 238",
"A2","27,46,152,155","35, 245",
"A3","1,  5,  19,  31,  37,  42,  64,  65,  74,  93,  96, 120, 130, 138, 150, 156, 189, 194, 220","6,8,51,53,60,66,85,120,129,146,151,208,220,227,11",
"A4","58, 123, 196, 229","40, 144",
"A5","81, 152","7,  22,  33,  54,  60,  78,  94, 101, 117, 140, 161, 167, 185, 221, 242, 247, 252, 253",
"C1","6,  40,  50, 144, 149, 204","11",
"C2","9, 104, 163, 250","110, 116, 118, 157, 214, 215, 230, 234, 248, 255",
"C3","11,  43,  62,  68,  69, 102, 107, 139, 177, 184, 200, 210, 222, 254","6,8,51,53,60,66,85,120,129,146,151,208,220,227,11",
"C4","165, 229","73",
"C5","20,  86, 109, 240","226",
"IF1","6,8,51,53,60,66,85,120,129,146,151,208,220,227","0,  5,  14,  15,  19,  39,  43,  63,  65,  76,  92, 109, 117, 119, 124, 138, 158, 169, 172, 174, 184, 202, 209, 228, 235, 245, 246, 251",
"IF2","6,8,51,53,60,66,85,120,129,146,151,208,220,227","0,  5,  14,  43,  63,  65,  76,  92, 117, 119, 138, 158, 169, 172, 184, 202, 228, 235, 251",
"IF3","6,8,51,53,60,66,85,120,129,146,151,208,220,227","0,  14,  63, 117, 119, 158, 169, 172, 202, 235",
"IF4","6,8,51,53,60,66,85,120,129,146,151,208,220,227","0,  14,  63, 117, 119, 158, 169, 172, 202, 235",
"IF5","41, 142","0,  63, 158, 202, 235",
"F1","129","12,  53,  83, 137, 204, 205, 208, 232",
"FI1","35","12,  53,  83, 137, 204, 205, 208, 232",
"F2","","12,  53,  83, 137, 204, 205, 208, 232",
"F3"," 61,  67, 111","12,  53,  83, 137, 204, 205, 208, 232",
"FI2","14,  31,  32,  52,  84,  89","12,  53,  83, 137, 204, 205, 208, 232",
"F5","3, 118, 171, 243","12,  53,  83, 137, 204, 205, 208, 232",
"F6","19,  60, 167, 192","12,  53,  83, 137, 204, 205, 208, 232,86, 127",
"F7","86, 127","3,  4,  5,  12,  23,  68,  70,  76, 149, 150, 155, 168, 183, 195",
"F8","183","12,  53,  83, 137, 204, 205, 208, 232",
"F9","30,  46,  75,  78, 177, 183, 223, 248","12,  53,  83, 137, 204, 205, 208, 232",
"F10","23,  58,  67,  69, 163, 169, 173, 242","12,  53,  83, 137, 204, 205, 208, 232",
"F11","","12,  53,  83, 137, 204, 205, 208, 232",
"U1","72,  97, 204","",
"U2","","22, 227, 242",
"U3","136, 166","197, 238",
"U4","107,201,68,31,2","22, 227, 242",
"U5","29, 232","11",
"U6","117, 212","117, 162, 224",
"L1","37,  119, 152, 188","37,  66,  82, 185, 249",
"L2","84","37,  66,  82, 185, 249",
"L3","159, 227","37,  66,  82, 185, 249",
"L4","66,  142, 149, 213","37,  66,  82, 185, 249, 117, 162, 224, 226",
"L5","38, 125","37,  66,  82, 185, 249",
"X1","57,  68,  87,   193, 209, 239","88,  97,  99, 109, 130, 150, 171, 182,41,33",
"X2","22, 227, 242"," 6,  40,  50,  69, 102, 144, 149, 177, 184, 200, 204, 210",
"X3","108","73",
"X4","121"," 6,  40,  50,  69, 102, 144, 149, 177, 184, 200, 204, 210",
"X5","","69, 149",
"X6","48","1,  17,  33,  50,  86, 109, 184, 227, 248",
"X7","20,  93, 111, 113, 130, 140, 200, 213, 222, 244"," 6,  40,  50,  102, 144, 149, 177, 184, 200, 204, 210",
"X8","123, 137, 205","2,  18,  34,  60,  91, 115, 165, 204, 240, 250",
"X9","225","6,  20,  38,  69,  99, 116, 169, 208, 242",
"X10","10,  27,  52, 127, 193","12,  22,  40,  73, 102, 118, 172, 219, 243",
"X11","105, 230","14,  28,  49,  77, 104, 144, 182, 226, 245",
"M1","35","245",
"M2","34,  69,  90, 153, 168, 182, 212, 243, 247","26,  41,  72,  77, 173",
"M3"," 6,  40,  50,  69, 102, 144, 149, 177, 184, 200, 204, 210","0,  4, 106, 121, 125, 171, 196, 254",
"M4","21","11,  16,  24,  25,  30,  32,  33,  36,  56,  57,  59,  61,  73,  76,  97, 100, 101, 105, 107, 113, 128, 131, 139, 140, 142, 151, 157, 158, 160, 164, 167, 187, 190, 202, 209, 211, 214, 215, 216, 217, 221, 224, 228, 231, 234, 235, 244, 249, 253",
"M5","196","235",
"M6","20, 114","215,20,  84, 206",
"M7","11,  43,  62,  68,  69, 102, 107, 139, 177, 184, 200, 210, 222, 254","6,8,51,53,60,66,85,120,129,146,151,208,220,227,11",
"R1","20,  35,  51,  56,  92, 105, 113, 138, 142, 146, 191, 234, 239, 254","197, 238",
"R2","","197, 238",
"R3","10,  80, 218","21,  32,  86, 131, 134, 151, 156, 158, 178, 212, 226, 255",
"R4","26,  34,  41,  69,  72,  77,  90, 153, 168, 173, 182, 212, 243, 247","21,  32,  86, 131, 134, 151, 156, 158, 178, 212, 226, 255",
"R5","22,  60, 109, 131, 142, 144, 182, 210, 227, 233, 243","1,  5,  19,  31,  37,  42,  64,  65,  74,  93,  96, 120, 130, 138, 150, 156, 189, 194, 220",
"R6","35, 245","2,  12,  18,  22,  33,  38,  49,  73,  77,  91,  99, 104, 116, 118, 165, 208, 219, 226, 227, 242, 245, 248,",
"R7","","196,235",
"R8","","197, 238",
"IN1","226","37,  66,  82, 185, 249",
"IN2",""," 31,  84,  87,  91, 106, 114, 117, 127, 162, 181, 186, 187, 214, 220, 224, 238, 247, 248",
"IN3","41,  69,  77, 173","1,  4,  6,  8,  17,  23,  24,  44,  47,  56,  58,  62,  98, 141, 149, 153, 155, 178, 199, 216",
"IN4","2,  59, 190","27,  40,  46,  58, 123, 133, 140, 144, 165, 196, 197, 198, 229",
"IN5","150, 225","27,  40,  46,  58, 123, 133, 140, 144, 165, 196, 197, 198, 229",
"IN6","57, 100, 228, 249","27,  40,  46,  58, 123, 133, 140, 144, 165, 196, 197, 198, 229",
"IN7","12,  18,  38,  49,  99, 104, 219, 227, 242, 245, 213","1,  4,  6,  8,  17,  23,  24,  44,  47,  56,  58,  62,  98, 141, 149, 153, 155, 178, 199, 216",
"O1","69, 152, 184","33, 41, 55, 202,1,  43,  53,  83",
"O2","9,  87, 187","26,  34,  42,  94, 106, 146, 161, 222, 250",
"OI1","14,  20,  84, 155, 206, 238","14, 169, 174, 251,103, 128, 134, 145, 172, 177",
"O3","","188, 190, 202",
"O4","20,  35,  51,  56,  92, 105, 113, 138, 142, 146, 191, 234, 239, 254"," 11,  15,  70,  78,  86,  97, 130, 147, 151, 154, 158, 160, 190, 223, 252",
"IS1","3,  12,  23,  76","4,  5,  68,  70, 149, 150, 155, 168, 183, 195",
"IS2","8,225,  23,  72,  85,  87, 114, 151, 168, 181, 210, 215, 232","113, 244",
"IS3","87,  91, 114, 162, 181, 187, 214, 224, 248","31,  84, 106, 117, 127, 186, 220, 238, 247",
"IS4","133, 140, 165, 197","27,  40,  46,  58, 123, 144, 196, 198, 229",
"IS5","22,  59, 110, 227, 232, 234, 242","34,  35,  53,  80,  96, 119, 132, 159, 204",
"IS6","16,  30,  98, 101, 104, 174","37, 163, 223",
"IS7","21,  32, 131, 134, 151, 158, 178, 226","86, 156, 212, 255",
"IS8","99, 160, 208","6,  28,  50,  63,  69,  85, 148, 170, 184, 222, 250, 251",
"T1","","22,  34,  35,  53,  59,  80,  96, 110, 119, 132, 159, 204, 227, 232, 234, 242",
"T2"," 77, 129, 150, 199, 225","22, 227, 242",
"T3","151, 251","22, 227, 242",
"T4","54,  74, 112","16,  30,  37,  98, 101, 104, 163, 174, 223",
"T5","98","22, 227, 242",
"T6","150, 225","22, 227, 242",
"T7","34,  35,  53,  59,  80,  96, 110, 119, 132, 159, 204, 232, 234","22, 227, 242",
"T8","168","117, 162, 224",
		);

my @route7 = (
"A1"," 11,  14,  15,  17,  85, 206","54",
"A2","","86,  91,  94, 101",
"A3","14,  41,  48,  74,  79,  89, 106, 111, 128, 137, 138, 143, 175, 185, 186, 218, 221, 237, 250, 254","73,203,39,23,24,35,55,64,127,140,154,161,202,214,231,234,250",
"A4","52,  62","7, 119, 131, 167, 215, 225",
"A5","1, 53,  71,  88, 149, 247","20,  48,  80,  84, 123, 127, 133, 145, 162, 167, 182, 190, 206, 221, 252, 254",
"C1","6,  53,  66,  71,  87, 103, 119, 184, 229","73,203,39",
"C2","35,  39,  51,  69, 139, 181, 215, 218, 229","4,  10,  19,  25,  43,  58, 114, 124, 142, 188, 196, 212, 213, 244, 249",
"C3","11,  36,  68,  91, 132, 148, 155, 187, 219, 235, 244","73,203,39,23,24,35,55,64,127,140,154,161,202,214,231,234,250",
"C4"," 28,  56,  59,  61, 176, 196, 212","24,  81, 173, 197",
"C5","13,  64, 136, 195, 199, 215, 231, 240, 247","19,  67, 148, 230",
"IF1","23,24,35,55,64,127,140,154,161,202,214,231,234,250","12,  26,  33,  44,  52,  57,  79,  93, 100, 106, 120, 121, 135, 150, 159, 203, 217, 237, 239",
"IF2","23,24,35,55,64,127,140,154,161,202,214,231,234,250","26,  44,  52,  57,  79,  93, 100, 106, 120, 150, 159, 203, 217, 237, 239",
"IF3","23,24,35,55,64,127,140,154,161,202,214,231,234,250","26,  44,  57, 150, 159, 203, 217, 237",
"IF4","23,24,35,55,64,127,140,154,161,202,214,231,234,250","26,  44,  57, 150, 159, 203, 217, 237",
"IF5","65"," 57, 203, 217",
"F1","32,  36, 126","38,  72, 109, 134, 143, 144, 155, 204, 208, 253",
"FI1","101, 107, 140, 210, 225","7, 38,  72, 109, 134, 143, 144, 155, 204, 208, 253",
"F2","66, 129, 209, 234","38,  72, 109, 134, 143, 144, 155, 204, 208, 253",
"F3"," 81, 140, 152, 158, 192","38,  72, 109, 134, 143, 144, 155, 204, 208, 253",
"FI2","191, 199, 219","38,  72, 109, 134, 143, 144, 155, 204, 208, 253",
"F5","138, 145, 203, 249","38,  72, 109, 134, 143, 144, 155, 204, 208, 253",
"F6","65","38,  72, 109, 134, 143, 144, 155, 204, 208, 253,49",
"F7","49","20,  32,  38,  42, 120, 121, 137, 138, 147, 153, 158, 194, 198, 199, 209, 226, 227",
"F8","25,  66, 117, 254","38,  72, 109, 134, 143, 144, 155, 204, 208, 253",
"F9","43, 234, 248, 251","38,  72, 109, 134, 143, 144, 155, 204, 208, 253",
"F10","10,  42, 152, 241","38,  72, 109, 134, 143, 144, 155, 204, 208, 253",
"F11","","38,  72, 109, 134, 143, 144, 155, 204, 208, 253",
"U1","","56,  92, 134, 192, 193, 234, 244",
"U2","205","162",
"U3","118, 187","54",
"U4","116","162",
"U5","16, 117, 143, 179, 189, 250","73,203,39",
"U6","51,88,105,129,149,195,208","56,  81,  92, 134, 192, 193, 234, 244",
"L1","57,  176, 237","38, 125, 128, 144, 240, 251",
"L2","20,  87, 112, 160","6,38, 125, 128, 144, 240, 251",
"L3","27,  36, 168, 172","38, 125, 128, 144, 240, 251",
"L4","98, 125","56,  81,  92, 134, 192, 193, 234, 244, 19,  67, 148, 230, 38, 125, 128, 144, 240, 251",
"L5","47, 131, 132, 255","38, 125, 128, 144, 240, 251",
"X1","78,  83,  241, 245","6, 14, 92, 105, 113, 198, 219",
"X2","162","3,  6,  7,  23,  39,  53,  55,  66,  71,  82,  86,  87,  88, 103, 119, 149, 181, 184, 225, 229, 241",
"X3","24,  56,  74, 108, 167, 180, 182","24,  81, 173, 197",
"X4","133","3,  6,  7,  23,  39,  53,  55,  66,  71,  82,  86,  87,  88, 103, 119, 149, 181, 184, 225, 229, 241,197, 229",
"X5","","49, 177",
"X6","","82, 216",
"X7","46,  76,  97,  99, 134, 137, 150, 184, 189, 190, 217","3,  6,  7,  23,  39,  53,  55,  66,  71,  82,  86,  87,  88, 103, 119, 149, 181, 184, 225, 229, 241",
"X8","2,  6,  26","10,  26,  61,  71,  87, 119, 136, 165, 172, 183, 195, 225, 247",
"X9","157, 184, 194","3,  13,  28,  53,  64,  76,  96, 122, 141, 167, 184, 199, 230",
"X10","14,17","6,  16,  37,  54,  66,  97, 131, 151, 168, 178, 188, 215, 231",
"X11","4","7,  23,  39,  55,  67,  86, 103, 135, 162, 170, 181, 189, 240",
"M1","86, 101","0,91,94",
"M2","23, 139, 195","29,  42,  61, 130, 165, 213",
"M3","3,  6,  7,  23,  39,  53,  55,  66,  71,  82,  86,  87,  88, 103, 119, 149, 181, 184, 225, 229, 241","9,  20,  52,  59,  68, 110, 116, 169, 203, 207, 239",
"M4","8,  33, 210, 245","0,  16,  19,  24,  25,  27,  29,  30,  31,  43,  45,  61,  63,  73,  76,  78,  80,  91,  94,  95,  96, 105, 107, 114, 120, 121, 126, 127, 132, 133, 142, 148, 155, 157, 159, 160, 164, 166, 171, 174, 176, 180, 188, 190, 191, 196, 201, 209, 211, 212, 219, 220, 223, 228, 232, 233, 235, 238, 244, 255",
"M5","48,  174","72,  92, 113",
"M6"," 54, 137","18,82,194,3,195,7",
"M7","11,  36,  68,  91, 132, 148, 155, 187, 219, 235, 244","73,203,39,23,24,35,55,64,127,140,154,161,202,214,231,234,250",
"R1","8,  11,  33,  36,  57,  64, 116, 135, 138, 142, 147, 185, 254"," 11,  14,  15,  17,  85, 206",
"R2","","54",
"R3","13, 114, 127, 164, 211, 227","2,  6,  57,  74,  83,  88,  89, 135, 163, 180, 190, 201, 220, 224, 230, 247",
"R4","23,  29,  42,  61, 130, 139, 165, 195, 213","2,  6,  57,  74,  83,  88,  89, 135, 163, 180, 190, 201, 220, 224, 230, 247",
"R5","25,  29,  64,  66,  81, 160, 170, 216","14,  41,  48,  74,  79,  89, 106, 111, 128, 137, 138, 143, 175, 185, 186, 218, 221, 237, 250, 254",
"R6","86,  91,  94, 101","10,  16,  37,  49,  54,  61,  76,  96, 122, 162, 165, 168, 177, 178, 188, 189, 216, 230",
"R7","19,  35, 154","48,  72,  92, 113, 174",
"R8","11,14,15,17,85,206","54",
"IN1","37, 147, 193, 214","38, 125, 128, 144, 240, 251",
"IN2",148,"19,  23,  25,  28,  30,  33,  49,  60,  64,  70,  81,  98, 148, 170, 249",
"IN3","23,  29,  42, 130","11,  15,  45,  50,  60,  77,  90, 112, 151, 153, 154, 163, 169, 177, 178, 202, 207, 222, 224, 226, 228, 230, 236, 246, 253",
"IN4","95, 171, 240","1,  7,  35,  51,  52,  62,  73,  96, 102, 105, 119, 130, 131, 167, 202, 211, 215, 217, 225",
"IN5","118, 194, 227, 53","1,  7,  35,  51,  52,  62,  73,  96, 102, 105, 119, 130, 131, 167, 202, 211, 215, 217, 225",
"IN6","164, 228","1,  7,  35,  51,  52,  62,  73,  96, 102, 105, 119, 130, 131, 167, 202, 211, 215, 217, 225",
"IN7","54, 162, 165, 168, 177, 178, 230,66, 19","11,  15,  45,  50,  60,  77,  90, 112, 151, 153, 154, 163, 169, 177, 178, 202, 207, 222, 224, 226, 228, 230, 236, 246, 253",
"O1","13, 253","1,  28,  11, 159,231",
"O2","34,  47,  68, 142, 216","16,  18, 128, 187, 188",
"OI1","3,  60,  92, 115, 131, 172, 195, 204","12,44,209",
"O3","210","44,  59, 131, 157",
"O4","8,  11,  33,  36,  57,  64, 116, 135, 138, 142, 147, 185, 254","56,  58, 110, 131, 134, 151, 234",
"IS1","42, 120, 121, 147, 153, 194, 209, 227"," 20,  32,  38, 137, 138, 158, 198, 199, 226",
"IS2","2,184,  5,  18,  21,  98, 114, 133, 149, 17","9,  29,  40,  94,  99, 224, 225",
"IS3","19,  25,  30,  33,  49,  70,  81,  98, 148, 249","23,  28,  60,  64, 170",
"IS4","35,  73,  96, 105, 130, 202, 211","1,  7,  51,  52,  62, 102, 119, 131, 167, 215, 217, 225",
"IS5","0, 162, 233","3,  17,  39,  84,  87,  97, 106, 124, 129, 179, 184, 222, 241",
"IS6","10,  24,  65,  99, 126, 160, 166","9,  41,  66,  71, 115, 116, 183, 195, 231, 248",
"IS7","83, 163, 180, 190, 201, 220, 230","2,  6,  57,  74,  88,  89, 135, 224, 247",
"IS8","156, 161, 177, 188, 192, 193, 244","55,  67, 103, 151, 152, 169, 243, 254",
"T1","","0,  3,  17,  39,  84,  87,  97, 106, 124, 129, 162, 179, 184, 222, 233, 241",
"T2","118, 163, 164, 194, 227","162",
"T3","78, 119, 232","162",
"T4","163, 244","9,  10,  24,  41,  65,  66,  71,  99, 115, 116, 126, 160, 166, 183, 195, 231, 248",
"T5","","162",
"T6","118, 194, 227, 53","162",
"T7","0,  3,  17,  39,  84,  87,  97, 106, 124, 129, 162, 179, 184, 222, 233, 241","162",
"T8","","56,  81,  92, 134, 192, 193, 234, 244",
		);


my @route8 = (
"A1",76,"99, 101, 115",
"A2","2,  85, 188, 198"," 7,  25,  65,  71, 157, 252",
"A3","4,  33,  42,  56,  57,  68,  74,  89,  94, 109, 129, 139, 141, 146, 153, 173, 183, 190, 203, 204, 225, 227, 247, 249","9,26,55,75,87,98,116,136,156,174,184,212,218,251,161, 31, 171, 180, 145",
"A4","","",
"A5","219, 244","6,  12,  36,  43,  46,  47,  60,  73,  89, 118, 127, 134, 146, 249, 253",
"C1",251,"161, 31, 171, 180, 145",
"C2"," 78, 102, 125, 128, 160, 161, 218, 231","4,  10,  11,  33,  40,  95, 144, 162, 176, 193, 238, 239, 116",
"C3","2,  7,  16,  34,  41,  48,  82,  83,  86, 111, 118, 125, 137, 143, 144, 145, 147, 180, 182, 187, 188, 194, 200, 218, 226, 229, 239, 241, 244, 246","9,26,55,75,87,98,116,136,156,174,184,212,218,251,161, 31, 171, 180, 145",
"C4"," 26,  64, 148, 166","162",
"C5","31,  93, 161, 232","25,  28,  56, 143, 155",
"IF1","9,26,55,75,87,98,116,136,156,174,184,212,218,251","5,  38,  56,  59,  62,  63,  66,  74,  77,  86,  96,  99, 103, 108, 113, 117, 130, 137, 150, 157, 165, 182, 190, 224, 237, 248, 254",
"IF2","9,26,55,75,87,98,116,136,156,174,184,212,218,251","5,  38,  59,  62,  66,  74,  86,  96,  99, 130, 137, 150, 165, 182, 224, 237, 248, 254",
"IF3","9,26,55,75,87,98,116,136,156,174,184,212,218,251","59,  96,  99, 130, 137, 224, 248, 254",
"IF4","9,26,55,75,87,98,116,136,156,174,184,212,218,251","59,  96,  99, 130, 137, 224, 248, 254",
"IF5","22,  44,  70","99",
"F1","","41,  61,  84, 104, 120, 129, 174, 185, 222, 242",
"FI1"," 19,  48,  98, 104, 147, 153, 215","41,  61,  84, 104, 120, 129, 174, 185, 222, 242",
"F2","97,135","41,  61,  84, 104, 120, 129, 174, 185, 222, 242",
"F3",37,"41,  61,  84, 104, 120, 129, 174, 185, 222, 242",
"FI2","28,  81,  82,  83,  96, 211, 255","41,  61,  84, 104, 120, 129, 174, 185, 222, 242",
"F5","49, 106, 114","41,  61,  84, 104, 120, 129, 174, 185, 222, 242",
"F6","","41,  61,  84, 104, 120, 129, 174, 185, 222, 242, 111, 139",
"F7","111, 139","7,  14,  15,  38,  56,  61,  81,  98, 100, 121, 170, 173, 182, 187, 195, 213, 221, 238, 250, 255",
"F8"," 6,  35","41,  61,  84, 104, 120, 129, 174, 185, 222, 242",
"F9","115, 126, 140, 145, 164, 191, 243","41,  61,  84, 104, 120, 129, 174, 185, 222, 242",
"F10","7, 153, 168, 229","41,  61,  84, 104, 120, 129, 174, 185, 222, 242",
"F11","27, 112","41,  61,  84, 104, 120, 129, 174, 185, 222, 242",
"U1","109, 125, 131, 143","66,  67,  70,  73,  79,144, 150, 166,210, 223",
"U2","23,234","0,  73, 142, 184",
"U3","105, 141, 172, 230","126, 131, 154,63,  99",
"U4","186, 255","0,  73, 142, 184",
"U5","135, 142, 235","161, 31, 171, 180, 145",
"U6",243,"35,  66,  67,  70,  73,  79, 112, 133, 144, 150, 166, 193, 210, 223",
"L1","1,22,46,112, 118"," 9,  93, 138, 223",
"L2","16, 212"," 9,  93, 138, 223",
"L3","49,  55, 106, 122, 124, 206"," 9,  93, 138, 223",
"L4","16,31, 52,  68,241","25,  28,  56, 143, 155, 35,  66,  67,  70,  73,  79, 112, 133, 144, 150, 166, 193, 210, 223,  9,  93, 138, 223",
"L5","35,  53, 121, 154"," 9,  93, 138, 223",
"X1","20,  66,  208","89,  92,  94, 146, 178, 162",
"X2","0,  73, 142, 184","2,  7,  34,  41,  82,  83, 125, 137, 145, 147, 180, 187, 188, 194, 200, 218, 226, 241, 244, 251",
"X3","76, 124, 151, 174, 181","",
"X4","116","26, 171, 212,2,  7,  34,  41,  82,  83, 125, 137, 145, 147, 180, 187, 188, 194, 200, 218, 226, 241, 244, 251",
"X5","",110,
"X6","",232,
"X7","1,  3,  39,  42,  64,  65,  92, 120, 164, 166, 180, 230, 242, 254","2,  7,  34,  41,  82,  83, 125, 137, 145, 147, 180, 187, 188, 194, 200, 218, 226, 241, 244, 251",
"X8","68, 133, 148, 167","14,  41,  59,  88, 113, 147, 169, 206, 221, 244",
"X9","151, 160, 250","0,  17,  43,  73,  93, 122, 151, 181, 210, 231, 251",
"X10","39, 111","8,  31,  53,  75,  98, 137, 159, 184, 216, ",
"X11","218","13,  40,  56,  82, 142, 161, 192, 218, 238",
"M1","7,  65, 157","25,  71, 252",
"M2","44,  58,  87,  94, 117, 139, 149, 225, 229","60, 199, 221",
"M3","2,  7,  34,  41,  82,  83, 125, 137, 145, 147, 180, 187, 188, 194, 200, 218, 226, 241, 244, 251","15,  23,  79, 144, 175, 195, 197, 234",
"M4",209," 1,  3,  11,  12,  13,  16,  18,  21,  22,  25,  30,  35,  36,  38,  45,  47,  48,  50,  55,  61,  62,  69,  71,  76,  77,  86,  95,  97,  99, 100, 101, 111, 118, 120, 121, 126, 131, 133, 134, 135, 138, 152, 158, 162, 164, 170, 172, 182, 184, 185, 186, 196, 205, 207, 210, 211, 214, 217, 222, 224, 230, 237, 240, 245, 253, 254",
"M5","","91",
"M6","216, 231","31, 160,41,7",
"M7","2,  7,  16,  34,  41,  48,  82,  83,  86, 111, 118, 125, 137, 143, 144, 145, 147, 180, 182, 187, 188, 194, 200, 218, 226, 229, 239, 241, 244, 246","9,26,55,75,87,98,116,136,156,174,184,212,218,251,161, 31, 171, 180, 145",
"R1","37,  39,  62,  64,  68, 104, 170, 203, 215, 222, 248",76,
"R2","",76,
"R3","176, 185, 190","16,  33,  39,  40,  41,  42,  44,  59,  82,  85,  93,  95, 115, 122, 152, 153, 155, 163, 183, 196, 212, 222, 229, 240, 244",
"R4","44,  58,  60,  87,  94, 117, 139, 149, 199, 221, 225, 229","16,  33,  39,  40,  41,  42,  44,  59,  82,  85,  93,  95, 115, 122, 152, 153, 155, 163, 183, 196, 212, 222, 229, 240, 244",
"R5","14,  25,  31,  39,  83, 206, 234","4,  33,  42,  56,  57,  68,  74,  89,  94, 109, 129, 139, 141, 146, 153, 173, 183, 190, 203, 204, 225, 227, 247, 249",
"R6","7,  25,  65,  71, 157, 252","0,  8,  13,  17,  40,  43,  59,  73,  75,  98, 113, 122, 142, 159, 169, 181, 184, 210, 216, 221, 238",
"R7","","91",
"R8",76,"47,  63,   191, 21",
"IN1","23"," 9,  93, 138, 223",
"IN2","112, 133","10,  27,  28,  35,  55,  68,  75, 112, 128, 133, 141, 161, 193, 200",
"IN3","44,  58, 117, 225, 229","18,  24,  30,  37,  61,  88, 107, 168, 183, 189, 194, 195, 197, 203, 220, 228, 236, 247",
"IN4","54,  88, 132, 140, 170, 173, 181, 203, 220, 235, 244","5,  12,  13,  65, 107, 181, 194, 198, 226, 228, 242, 254",
"IN5","20, 141, 204, 233","5,  12,  13,  65, 107, 181, 194, 198, 226, 228, 242, 254",
"IN6",86,"5,  12,  13,  65, 107, 181, 194, 198, 226, 228, 242, 254",
"IN7","17,  59,  75,  98, 113, 122, 159, 169, 221, 7","18,  24,  30,  37,  61,  88, 107, 168, 183, 189, 194, 195, 197, 203, 220, 228, 236, 247",
"O1","82, 161","162,55,  59, 222, 248",
"O2",""," 30,  40, 142, 152, 162, 189, 210, 213, 216, 221, 227, 233",
"OI1","6,  31,  53,  85, 102, 117, 160, 198","38,  63,  96, 117, 224, 171, 209, 217, ",
"O3","66","173, 183, 201",
"O4","37,  39,  62,  64,  68, 104, 170, 203, 215, 222, 248","2,  6,  12,  14,  80,  86,  95,  96, 101, 129, 146, 228, 235",
"IS1","38,  61,  81,  98, 100, 121, 170, 182, 213, 221, 238, 255","7,  14,  15,  56, 173, 187, 195, 250",
"IS2","34,206,  49,  81,  92, 124, 145, 162, 177, 187, 226, 241, 252","71,  98, 100, 119, 199, 246",
"IS3","27,  35,  55,  75, 133, 193","10,  28,  68, 112, 128, 141, 161, 200",
"IS4","12,  13, 107, 181, 242, 254","5,  65, 194, 198, 226, 228",
"IS5","0,  22,  67,  72,  73, 135, 142, 154, 156, 184, 209, 252","19,  54,  87, 143, 241",
"IS6","25, 113, 126, 140, 169, 207, 243","26,  96, 114, 147, 167, 168",
"IS7","16,  39,  40,  59,  95, 122, 152, 163, 196, 212, 222, 240","33,  41,  42,  44,  82,  85,  93, 115, 153, 155, 183, 229, 244",
"IS8","47,  66,  70,  84, 101, 172, 210, 215, 223","24,  53,  94, 116, 124, 144, 150, 201, 235",
"T1","","0,  19,  22,  54,  67,  72,  73,  87, 135, 142, 143, 154, 156, 184, 209, 241, 252",
"T2","233,207,204,141,20","0,  73, 142, 184",
"T3","150, 170","0,  73, 142, 184",
"T4","36, 251","",
"T5","168","0,  73, 142, 184",
"T6"," 20, 141, 204, 233","0,  73, 142, 184",
"T7","19,  22,  54,  67,  72,  87, 135, 143, 154, 156, 209, 241, 252","0,  73, 142, 184",
"T8","","35,  66,  67,  70,  73,  79, 112, 133, 144, 150, 166, 193, 210, 223",
);


####

while (@route1 > 0) {
		my $code = shift(@route1);
		my $exp = shift(@route1);
		my $imp = shift(@route1);
		addsystems($code,0,$exp,$imp); # chart ID -1
}

while (@route2 > 0) {
		my $code = shift(@route2);
		my $exp = shift(@route2);
		my $imp = shift(@route2);
		addsystems($code,1,$exp,$imp); # chart ID -1
}

while (@route3 > 0) {
		my $code = shift(@route3);
		my $exp = shift(@route3);
		my $imp = shift(@route3);
		addsystems($code,2,$exp,$imp); # chart ID -1
}

while (@route4 > 0) {
		my $code = shift(@route4);
		my $exp = shift(@route4);
		my $imp = shift(@route4);
		addsystems($code,3,$exp,$imp); # chart ID -1
}

while (@route5 > 0) {
		my $code = shift(@route5);
		my $exp = shift(@route5);
		my $imp = shift(@route5);
		addsystems($code,4,$exp,$imp); # chart ID -1
}

while (@route6 > 0) {
		my $code = shift(@route6);
		my $exp = shift(@route6);
		my $imp = shift(@route6);
		addsystems($code,5,$exp,$imp); # chart ID -1
}

while (@route7 > 0) {
		my $code = shift(@route7);
		my $exp = shift(@route7);
		my $imp = shift(@route7);
		addsystems($code,6,$exp,$imp); # chart ID -1
}

while (@route8 > 0) {
		my $code = shift(@route8);
		my $exp = shift(@route8);
		my $imp = shift(@route8);
		addsystems($code,7,$exp,$imp); # chart ID -1
}


####

my $basic = 'var basictypes = ['."\n";
my $illegal = 'var illegaltypes = ['."\n";

while (my $btype = shift(@basics)) {
		$basic .= lineitem($btype);
}
while (my $itype = shift(@illegals)) {
		$illegal .= lineitem($itype);
}

$basic .= "];\n";
$illegal .= "];\n";


print ($basic);
print ($illegal);

print (STDERR "No goods\n");
print (STDERR boring());
print (STDERR "No exports\n");
print (STDERR eboring());
print (STDERR "No imports\n");
print (STDERR iboring());
