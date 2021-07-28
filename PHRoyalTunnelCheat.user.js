// ==UserScript==
// @name         PH - Royal Tunnel Cheat
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Automatically answers royal tunnel questions
// @author       zc9, Lore
// @match        https://pokeheroes.com/royal_tunnel*
// @grant        none
// @downloadURL  https://github.com/warpKaiba/TMpokeheroes/raw/master/PHRoyalTunnelCheat.user.js
// @icon         https://vignette.wikia.nocookie.net/pkmnshuffle/images/7/7f/Ducklett.png/revision/latest?cb=20170409032016
// ==/UserScript==

if (getCookie("tunnelDelay") == "") {
    var tunnelDelay = 1000;
} else { tunnelDelay = getCookie("tunnelDelay"); } //console.log(tunnelDelay) }

var breakCookie = "";
if (getCookie("tunnelBreak") == "") {
    var tunnelBreak = false;
} else {
    tunnelBreak = getCookie("tunnelBreak");
    //console.log(tunnelBreak)
    if(tunnelBreak == "true") {
        breakCookie = "checked"
    } else {
        breakCookie = ""
    }
}

var cont = false;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

if (document.body.innerText.indexOf("Claim") >= 0 && !cont) {
    cont = true;
    sleep(tunnelDelay).then(() => {
        console.log("Claiming egg");
        cont=false;
        var claim = document.querySelector("#textbar > center > a");
        claim.click();
    });
}

if(document.body.innerText.indexOf("Start exploring") >= 0) {
    //document.location = "/royal_tunnel?start=beginner";
    $("#footer")[0].insertAdjacentHTML("beforebegin", "<div style='text-align: center;'><input id=delayinput type='number' min=600 value="+tunnelDelay+"></input>  <button id=delaysubmit>Submit delay (milliseconds)</button><br><div>This sets the delay for the auto-tunnel script, default is 1000. 1000 milliseconds = 1 second.</div></div><br>")
    $("#delaysubmit")[0].addEventListener("click", updateDelay)
}
if(document.body.innerText.indexOf("You can either take a break or continue") >= 0) {
    if (tunnelBreak == false) {
        let elem = document.querySelector("#textbar > center > font > a");
        elem.click();
    }
}
if(document.getElementsByClassName("royal_tunnel").length > 0 ) {
    if(cont) {return;}
    var el = document.getElementsByClassName("royal_tunnel")[0];
    var answers = el.getElementsByTagName("a");
    var quest = document.getElementsByClassName("royal_quest")[0];
    var twoType = false;
    var twoEgg = false;
    var eggBool = false;
    var looking;
    var looking2 = false;
    var evolve = false;
    var newVars = false;
    el.insertAdjacentHTML("beforebegin", "<input id=breakcheck type=checkbox style='transform: scale(2);' "+ breakCookie +">    Take breaks?</input>")
    $("#breakcheck").change(function() {
        if(this.checked) {
            document.cookie = "tunnelBreak=true; expires=Thu, 18 Dec 2029 12:00:00 UTC;";
            breakCookie = "checked"
        } else {
            document.cookie = "tunnelBreak=false; expires=Thu, 18 Dec 2029 12:00:00 UTC;";
            breakCookie = ""
        }
    });
    localStorage.setItem("lastQuestion",quest.innerHTML);
    console.log(localStorage.lastQuestion)
    if(quest.innerHTML.indexOf("Which of these is a ") >= 0) {
        looking = quest.innerHTML.split("Which of these is a ")[1].split("<b>")[0];
    }

    if(quest.innerHTML.indexOf("type_icons")>= 0) {
        looking = quest.innerHTML.split("type_icons/")[1].split(".")[0] + ".gif";
        var count = (quest.innerHTML.match(/type_icons/g) || []).length;
        if (count == 2) {
            looking2 = quest.innerHTML.split("type_icons/")[2].split(".")[0] + ".gif";
            twoType = true;
        }
    }
    if(quest.innerHTML.indexOf("considered as a") >= 0) {
        looking = quest.innerHTML.split("considered as a <b>")[1].split("</b>")[0];
    }
    if(quest.innerHTML.indexOf(" Entry:</b> ") >= 0) {
        looking = quest.innerHTML.split("Entry:</b> ")[1].split("</fieldset>")[0].replace(/\*/g,"").replace(/	/g,"").replace(/\/r\/n/g,"").split("\\")[0];
    }
    if(quest.innerHTML.indexOf("<b>egggroup(s)</b>") >= 0) {
        var egggcs = quest.innerHTML.split("<i>");
        if(egggcs.length > 2) {
            looking2 = egggcs[2].split("</i>")[0];
            twoEgg = true;
        }
        looking = egggcs[1].split("</i>")[0];
        eggBool = true;
    }
    if(quest.innerHTML.indexOf("these needs <b>") >= 0) {
        looking = quest.innerHTML.split("these needs <b>")[1].split(" ")[0];
    }
    if(quest.innerHTML.indexOf("evolves when") >= 0) {
        looking = quest.innerHTML.split("<b>Level ")[1].split("</b>")[0];
        evolve = true;
    }
    if(quest.innerHTML.indexOf("<b>heaviest") >= 0) {
        looking = "Weight";
        newVars = true;
    }
    if(quest.innerHTML.indexOf("<b>largest") >= 0) {
        looking = "Height";
        newVars = true;
    }
    if(evolve) {
        for(let answer of answers) {
            let s = answer.innerHTML.split("/");
            poketunnel2(parseInt(s[s.length-1].split(".")[0]),answer.href,looking,looking2);
        }
    }
    else if(!newVars) {
        for(let answer of answers) {
            let s = answer.innerHTML.split("/");
            poketunnel(parseInt(s[s.length-1].split(".")[0]),answer.href,looking,looking2,twoType,twoEgg,eggBool);
        }
    }
    else if(newVars) {
        let x = {}
        for(let answer of answers) {
            let link = answer.href;
            let s = answer.innerHTML.split("/");
            let [n, j] = poketunnel3(parseInt(s[s.length-1].split('.')[0]), link, looking);
            x[j] = n;
        }
        let items = Object.keys(x).map(function(key) {
            return [key, x[key]];
        });
        items.sort(function(first, second) {
            return second[1] - first[1];
        });
        let sorted={};
        $.each(items, function(k, v) {
            let use_key = v[0]
            let use_value = v[1]
            sorted[use_key] = use_value
        });
        let ans = Object.keys(sorted)[0];
        setTimeout(function(){ console.log(name); document.location = ans; newVars = false;}, ((parseInt(tunnelDelay))+(Math.random()*100)));
    }
}

function poketunnel(id,link,looking,looking2,twoType,twoEgg,eggBool) {
    $.ajax({
        type:"POST",
        url:"includes/ajax/pokedex/view_entry.php",
        data:{
            'pkdxnr':id,
        },
        success: function(data) {
            var name = data.split('<span style="font-size: 14pt; font-weight: bold">#')[1].split("</span>")[0];
            name = name.split(" ");
            name.splice(0,1);
            name = name.join(" ");

            if(quest.innerHTML.indexOf(" Entry:</b> ") >= 0) {
                looking = quest.innerHTML.split("Entry:</b> ")[1].split("</fieldset>")[0].replace(/\*{4,}/g,name).replace(/	/g,"").replace(/\/\//g,"").replace(/\\\\/g,"").split("\\")[0];
            }

            console.log(id,name,link,looking,looking2,twoType,twoEgg,eggBool)

            //special case for Ditto egggroup
            if (looking == "Ditto" && name == "Ditto") {
                document.location = link
            }

            //special case for ditto pkdx entry
            if (looking.includes("the ability to reconstitute its entire cellular") && name == "Ditto") {
                console.log("broken ditto pkdx entry")
                document.location = link
            }

            //special case for pinser pkdx entry
            if (looking.includes("grips prey with its pincers until the prey") && name == "Pinsir") {
                console.log("broken pinser pkdx entry")
                document.location = link
            }

            //special case for miltank pkdx entry
            if (looking.includes("milk grow up to become hearty") && name == "Miltank") {
                console.log("broken miltank pkdx entry")
                document.location = link
            }

            if(data.indexOf(looking) >= 0) {

                var pkdxSpecies = data.split("Species:</b> ")[1].split("<br>")[0];
                var pkdxEgggroup = data.split("Egggroup:</b> ")[1].split("<br>")[0];

                var pkdxEHP = data.split("EHP</b></span>: ")[1].split(" ")[0];
                var pkdxType1 = data.split('type_icons/')[1].split('">')[0]
                var pkdxType2 = false;
                var pkdxEntry = data.split("<i>")[1].split("</i>")[0]

                if (data.split("type_icons/").length > 2) { pkdxType2 = data.split('type_icons/')[2].split('">')[0] }
                var a = new RegExp(name,"gi");
                data = data.replace(a,"");




                var answerFound = false;

                if(looking == pkdxEntry) { answerFound = true; }

                if(!twoEgg && looking == pkdxEgggroup) { answerFound = true; }
                if(twoEgg && looking + "/" + looking2 == pkdxEgggroup) { answerFound = true; }

                if(looking == pkdxSpecies) { answerFound = true; }

                if(looking == pkdxEHP) { answerFound = true; }

                if(!twoType && !pkdxType2 && looking == pkdxType1) { answerFound = true; }
                if(twoType && looking == pkdxType1 && looking2 == pkdxType2) { answerFound = true; }
                if(twoType && looking == pkdxType2 && looking2 == pkdxType1) { answerFound = true; }

                //if(looking2 && data.indexOf(looking2) == -1) return;
                //if(twoType && looking2 && (data.match(/type_icons/g) || []).length == 1) return;
                //if(twoEgg && (looking + "/" + looking2) != data.split("Egggroup:</b> ")[1].split("<br>")[0]) return;
                //if(eggBool && !twoEgg && data.split("Egggroup:</b> ")[1].split("<br>")[0].includes("/")) return;

                if (answerFound == true) {
                    setTimeout(function(){ console.log(name); document.location = link;}, ((parseInt(tunnelDelay))+(Math.random()*100)))
                }
            }
        }
    })
}

function poketunnel2(id,link,looking) {
    $.ajax({
        type:"POST",
        url:"includes/ajax/pokedex/view_entry.php",
        data:{
            'pkdxnr':id,
        },
        success: function(data) {
            var name = data.split('<span style="font-size: 14pt; font-weight: bold">#')[1].split("</span>")[0];
            name = name.split(" ");
            name.splice(0,1);
            name = name.join(" ");
            console.log(2,name,id,link,looking)
            let datas = ["1	Bulbasaur	Grass/Poison	Seed	Starter	Monster/Grass	5355	16","2	Ivysaur	Grass/Poison	Seed		Monster/Grass		32","3	Venusaur	Grass/Poison	Seed		Monster/Grass		-","4	Charmander	Fire	Lizard	Starter	Monster/Dragon	5355	16","5	Charmeleon	Fire	Flame		Monster/Dragon		36","6	Charizard	Fire/Flying	Flame		Monster/Dragon		-","7	Squirtle	Water	Tiny Turtle	Starter	Monster/Water 1	5355	16","8	Wartortle	Water	Turtle		Monster/Water 1		36","9	Blastoise	Water	Shellfish		Monster/Water 1		-","10	Caterpie	Bug	Worm	Easy	Bug	2805	7","11	Metapod	Bug	Cocoon		Bug		10","12	Butterfree	Bug/Flying	Butterfly		Bug		-","13	Weedle	Bug/Poison	Hairy Bug	Easy	Bug	2805	7","14	Kakuna	Bug/Poison	Cocoon		Bug		10","15	Beedrill	Bug/Poison	Poison Bee		Bug		-","16	Pidgey	Normal/Flying	Tiny Bird	Medium	Flying	4080	18","17	Pidgeotto	Normal/Flying	Bird		Flying		36","18	Pidgeot	Normal/Flying	Bird		Flying		-","19	Rattata	Normal	Mouse	Easy	Field	4080	20","20	Raticate	Normal	Mouse		Field		-","21	Spearow	Normal/Flying	Tiny Bird	Medium	Flying	4080	20","22	Fearow	Normal/Flying	Beak		Flying		-","23	Ekans	Poison	Snake	Hard	Field/Dragon	5355	22","24	Arbok	Poison	Cobra		Field/Dragon		-","25	Pikachu	Electric	Mouse	Easy	Field/Fairy	2805	-","26	Raichu	Electric	Mouse		Field/Fairy		-","27	Sandshrew	Ground	Mouse	Hard	Field	5355	22","28	Sandslash	Ground	Mouse		Field		-","29	Nidoran (f)	Poison	Poison Pin	Medium	Monster/Field	5355	16","30	Nidorina	Poison	Poison Needle		Undiscovered		-","31	Nidoqueen	Poison/Ground	Drill		Undiscovered		-","32	Nidoran (m)	Poison	Poison Pin	Medium	Monster/Field	5355	16","33	Nidorino	Poison	Poison Needle		Monster/Field		-","34	Nidoking	Poison/Ground	Drill		Monster/Field		-","35	Clefairy	Fairy	Fairy	Easy	Fairy	2805	-","36	Clefable	Fairy	Fairy		Fairy		-","37	Vulpix	Fire	Fox	Rare	Field	5355	-","38	Ninetales	Fire	Fox		Field		-","39	Jigglypuff	Normal/Fairy	Balloon	Easy	Fairy	5355	-","40	Wigglytuff	Normal/Fairy	Balloon		Fairy		-","41	Zubat	Poison/Flying	Bat	Easy	Flying	4080	22","42	Golbat	Poison/Flying	Bat		Flying		-","43	Oddish	Grass/Poison	Weed	Medium	Grass	5355	21","44	Gloom	Grass/Poison	Weed		Grass		-","45	Vileplume	Grass/Poison	Flower		Grass		-","46	Paras	Bug/Grass	Mushroom	Hard	Bug/Grass	5355	24","47	Parasect	Bug/Grass	Mushroom		Bug/Grass		-","48	Venonat	Bug/Poison	Insect	Hard	Bug	5355	31","49	Venomoth	Bug/Poison	Poison Moth		Bug		-","50	Diglett	Ground	Mole	Medium	Field	5355	26","51	Dugtrio	Ground	Mole		Field		-","52	Meowth	Normal	Scratch Cat	Rare	Field	5355	28","53	Persian	Normal	Classy Cat		Field		-","54	Psyduck	Water	Duck	Medium	Water 1/Field	5355	33","55	Golduck	Water	Duck		Water 1/Field		-","56	Mankey	Fighting	Pig Monkey	Hard	Field	5355	28","57	Primeape	Fighting	Pig Monkey		Field		-","58	Growlithe	Fire	Puppy	Rare	Field	5355	-","59	Arcanine	Fire	Legendary		Field		-","60	Poliwag	Water	Tadpole	Medium	Water 1	5355	25","61	Poliwhirl	Water	Tadpole		Water 1		-","62	Poliwrath	Water/Fighting	Tadpole		Water 1		-","63	Abra	Psychic	Psi	Rare	Human-Like	5355	16","64	Kadabra	Psychic	Psi		Human-Like		-","65	Alakazam	Psychic	Psi		Human-Like		-","66	Machop	Fighting	Superpower	Medium	Human-Like	5355	28","67	Machoke	Fighting	Superpower		Human-Like		-","68	Machamp	Fighting	Superpower		Human-Like		-","69	Bellsprout	Grass/Poison	Flower	Hard	Grass	5355	21","70	Weepinbell	Grass/Poison	Flycatcher		Grass		-","71	Victreebel	Grass/Poison	Flycatcher		Grass		-","72	Tentacool	Water/Poison	Jellyfish	Easy	Water 3	5355	30","73	Tentacruel	Water/Poison	Jellyfish		Water3		-","74	Geodude	Rock/Ground	Rock	Easy	Mineral	4080	25","75	Graveler	Rock/Ground	Rock		Mineral		-","76	Golem	Rock/Ground	Megaton		Mineral		-","77	Ponyta	Fire	Fire Horse	Easy	Field	5355	40","78	Rapidash	Fire	Fire Horse		Field		-","79	Slowpoke	Water/Psychic	Dopey	Hard	Monster/Water 1	5355	-","80	Slowbro	Water/Psychic	Hermit Crab		Monster/Water 1		-","81	Magnemite	Electric/Steel	Magnet	Hard	Mineral	5355	30","82	Magneton	Electric/Steel	Magnet		Mineral		-","83	Farfetch'd	Normal/Flying	Wild Duck	Rare	Flying/Field	5355	-","84	Doduo	Normal/Flying	Twin Bird	Medium	Flying	5355	31","85	Dodrio	Normal/Flying	Triple Bird		Flying		-","86	Seel	Water	Sea Lion	Rare	Water 1/Field	5355	34","87	Dewgong	Water/Ice	Sea Lion		Water 1/Field		-","88	Grimer	Poison	Sludge	Medium	Amorphous	5355	38","89	Muk	Poison	Sludge		Amorphous		-","90	Shellder	Water	Bivalve	Rare	Water 3	5355	-","91	Cloyster	Water/Ice	Bivalve		Water 3		-","92	Gastly	Ghost/Poison	Gas	Easy	Amorphous	5355	25","93	Haunter	Ghost/Poison	Gas		Amorphous		-","94	Gengar	Ghost/Poison	Shadow		Amorphous		-","95	Onix	Rock/Ground	Rock Snake	Hard	Mineral	6630	-","96	Drowzee	Psychic	Hypnosis	Hard	Human-Like	5355	26","97	Hypno	Psychic	Hypnosis		Human-Like		-","98	Krabby	Water	River Crab	Medium	Water 3	5355	28","99	Kingler	Water	Pincer		Water 3		-","100	Voltorb	Electric	Ball	Medium	Mineral	5355	30","101	Electrode	Electric	Ball		Mineral		-","102	Exeggcute	Grass/Psychic	Egg	Hard	Grass	5355	-","103	Exeggutor	Grass/Psychic	Coconut		Grass		-","104	Cubone	Ground	Lonely	Rare	Monster	5355	28","105	Marowak	Ground	Bone Keeper		Monster		-","106	Hitmonlee	Fighting	Kicking	Rare	Human-Like	6630	-","107	Hitmonchan	Fighting	Punching	Rare	Human-Like	6630	-","108	Lickitung	Normal	Licking	Hard	Monster	5355	33","109	Koffing	Poison	Poison Gas	Easy	Amorphous	5355	35","110	Weezing	Poison	Poison Gas		Amorphous		-","111	Rhyhorn	Ground/Rock	Spikes	Medium	Monster/Field	5355	42","112	Rhydon	Ground/Rock	Drill		Monster/Field		-","113	Chansey	Normal	Egg	Rare	Fairy	10455	-","114	Tangela	Grass	Vine	Hard	Grass	5355	36","115	Kangaskhan	Normal	Parent	Rare	Monster	5355	-","116	Horsea	Water	Dragon	Rare	Water 1/Dragon	5355	32","117	Seadra	Water	Dragon		Water 1/Dragon		-","118	Goldeen	Water	Goldfish	Easy	Water 2	5355	33","119	Seaking	Water	Goldfish		Water 2		-","120	Staryu	Water	Star Shape	Medium	Water 3	5355	-","121	Starmie	Water/Psychic	Mysterious		Water 3		-","122	Mr.Mime	Psychic/Fairy	Barrier	Rare	Human-Like	6630	-","123	Scyther	Bug/Flying	Mantis	Medium	Bug	6630	-","124	Jynx	Ice/Psychic	Human Shape	Hard	Human-Like	6630	-","125	Electabuzz	Electric	Electric	Rare	Human-Like	6630	-","126	Magmar	Fire	Spitfire	Rare	Human-Like	6630	-","127	Pinsir	Bug	Stag Beetle	Hard	Bug	6630	-","128	Tauros	Normal	Wild Bull	Hard	Field	5355	-","129	Magikarp	Water	Fish	Easy	Water 2/Dragon	1530	20","130	Gyarados	Water/Flying	Atrocious		Water2/Dragon		-","131	Lapras	Water/Ice	Transport	Rare	Monster/Water 1	10455	-","132	Ditto	Normal	Transform	Ditto	Ditto	5355	-","133	Eevee	Normal	Evolution	Rare	Field	9180	-","134	Vaporeon	Water	Bubble Jet		Field		-","135	Jolteon	Electric	Lightning		Field		-","136	Flareon	Fire	Flame		Field		-","137	Porygon	Normal	Virtual	Rare	Mineral	5355	-","138	Omanyte	Rock/Water	Spiral	Special	Water 1/Water 3	7905	40","139	Omastar	Rock/Water	Spiral		Water 1/Water 3		-","140	Kabuto	Rock/Water	Shellfish	Special	Water 1/Water 3	7905	40","141	Kabutops	Rock/Water	Shellfish		Water 1/Water 3		-","142	Aerodactyl	Rock/Flying	Fossil	Special	Flying	7905	-","143	Snorlax	Normal	Sleeping	Special	Monster	10455	-","144	Articuno	Ice/Flying	Freeze	Legend	Undiscovered	20655	-","145	Zapdos	Electric/Flying	Electric	Legend	Undiscovered	20655	-","146	Moltres	Fire/Flying	Flame	Legend	Undiscovered	20655	-","147	Dratini	Dragon	Dragon	Special	Water 1/Dragon	10455	30","148	Dragonair	Dragon	Dragon		Water1/Dragon		55","149	Dragonite	Dragon/Flying	Dragon		Water1/Dragon		-","150	Mewtwo	Psychic	Genetic	Special	Legendary	30855	-","151	Mew	Psychic	New Species	Special	Undiscovered	510	-","							","							","152	Chikorita	Grass	Leaf	Starter	Monster/Grass	5355	16","153	Bayleef	Grass	Leaf		Monster/Grass		32","154	Meganium	Grass	Herb		Monster/Grass		-","155	Cyndaquil	Fire	Fire Mouse	Starter	Field	5355	14","156	Quilava	Fire	Volcano		Field		36","157	Typhlosion	Fire	Volcano		Field		-","158	Totodile	Water	Big Jaw	Starter	Monster/Water 1	5355	18","159	Croconaw	Water	Big Jaw		Monster/Water 1		30","160	Feraligatr	Water	Big Jaw		Monster/Water 1		-","161	Sentret	Normal	Scout	Easy	Field	4080	15","162	Furret	Normal	Long body		Field		-","163	Hoothoot	Normal/Flying	Owl	Easy	Flying	4080	20","164	Noctowl	Normal/Flying	Owl		Flying		-","165	Ledyba	Bug/Flying	Five Star	Easy	Bug	4080	18","166	Ledian	Bug/Flying	Five Star		Bug		-","167	Spinarak	Bug/Poison	String spit	Medium	Bug	4080	22","168	Ariados	Bug/Poison	Long Leg		Bug		-","169	Crobat	Poison/Flying	Bat	Easy	Flying	5355	-","170	Chinchou	Water/Electric	Angler	Hard	Water 2	5355	27","171	Lanturn	Water/Electric	Light		Water 2		-","172	Pichu	Electric	Tiny Mouse	Easy	Undiscovered	2805	-","173	Cleffa	Fairy	Star Shape	Easy	Undiscovered	2805	-","174	Igglybuff	Normal/Fairy	Balloon	Easy	Undiscovered	2805	-","175	Togepi	Fairy	Spike Ball	Medium	Undiscovered	2805	-","176	Togetic	Flying/Fairy	Happiness		Flying/Fairy		-","177	Natu	Psychic/Flying	Tiny Bird	Hard	Flying	5355	25","178	Xatu	Psychic/Flying	Mystic		Flying		-","179	Mareep	Electric	Wool	Medium	Monster/Field	5355	15","180	Flaaffy	Electric	Wool		Monster/Field		30","181	Ampharos	Electric	Light		Monster/Field		-","182	Bellossom	Grass	Flower	Medium	Grass	5355	-","183	Marill	Water/Fairy	Aqua Mouse	Easy	Water 1/Fairy	2805	18","184	Azumarill	Water/Fairy	Aqua Rabbit		Water 1/Fairy		-","185	Sudowoodo	Rock	Imitation	Hard	Mineral	5355	-","186	Politoed	Water	Frog	Medium	Water 1	5355	-","187	Hoppip	Grass/Flying	Cottonweed	Medium	Fairy/Grass	5355	18","188	Skiploom	Grass/Flying	Cottonweed		Field/Grass		27","189	Jumpluff	Grass/Flying	Cottonweed		Fairy/Grass		-","190	Aipom	Normal	Long Tail	Medium	Field	5355	32","191	Sunkern	Grass	Seed	Medium	Grass	5355	-","192	Sunflora	Grass	Sun		Grass		-","193	Yanma	Bug/Flying	Clear Wing	Hard	Bug	5355	33","194	Wooper	Water/Ground	Water Fish	Medium	Water 1/Field	5355	20","195	Quagsire	Water/Ground	Water Fish		Water 1/Field		-","196	Espeon	Psychic	Sun	Rare	Field	9180	-","197	Umbreon	Dark	Moonlight	Rare	Field	9180	-","198	Murkrow	Dark/Flying	Darkness	Hard	Flying	5355	-","199	Slowking	Water/Psychic	Royal	Hard	Monster/Water 1	5355	-","200	Misdreavus	Ghost	Screech	Hard	Amorphous	6630	-","201	Unown	Psychic	Symbol	Unown	Unown	10455	-","202	Wobbuffet	Psychic	Patient	Medium	Amorphous	5355	-","203	Girafarig	Normal/Psychic	Long Neck	Medium	Field	5355	-","204	Pineco	Bug	Bagworm	Medium	Bug	5355	31","205	Forretress	Bug/Steel	Bagworm		Bug		-","206	Dunsparce	Normal	Land Snake	Medium	Field	5355	-","207	Gligar	Ground/Flying	Fly Scorpion	Hard	Bug	5355	-","208	Steelix	Steel/Ground	Iron Snake	Hard	Mineral	6630	-","209	Snubbull	Fairy	Fairy	Medium	Field/Fairy	5355	23","210	Granbull	Fairy	Fairy		Field/Fairy		-","211	Qwilfish	Water/Poison	Balloon	Medium	Water 2	5355	-","212	Scizor	Bug/Steel	Pincer	Medium	Bug	6630	-","213	Shuckle	Bug/Rock	Mold	Rare	Bug	5355	-","214	Heracross	Bug/Fighting	Single Horn	Hard	Bug	6630	-","215	Sneasel	Dark/Ice	Sharp Claw	Medium	Field	5355	-","216	Teddiursa	Normal	Little Bear	Medium	Field	5355	30","217	Ursaring	Normal	Hibernator		Field		-","218	Slugma	Fire	Lava	Medium	Amorphous	5355	38","219	Magcargo	Fire/Rock	Lava		Amorphous		-","220	Swinub	Ice/Ground	Pig	Hard	Field	5355	33","221	Piloswine	Ice/Ground	Swine		Field		50","222	Corsola	Water/Rock	Coral	Hard	Water 1/Water 3	5355	-","223	Remoraid	Water	Jet	Medium	Water 1/Water 2	5355	25","224	Octillery	Water	Jet		Water 1/Water 2		-","225	Delibird	Ice/Flying	Delivery	Rare	Water 1/Field	5355	-","226	Mantine	Water/Flying	Kite	Medium	Water 1	6630	-","227	Skarmory	Steel/Flying	Armor Bird	Hard	Flying	6630	-","228	Houndour	Dark/Fire	Dark	Hard	Field	5355	24","229	Houndoom	Dark/Fire	Dark		Field		-","230	Kingdra	Water/Dragon	Dragon	Rare	Water 1/Dragon	5355	-","231	Phanpy	Ground	Long Nose	Medium	Field	5355	25","232	Donphan	Ground	Armor		Field		-","233	Porygon2	Normal	Virtual	Rare	Mineral	5355	-","234	Stantler	Normal	Big Horn	Hard	Field	5355	-","235	Smeargle	Normal	Painter	Rare	Field	5535	-","236	Tyrogue	Fighting	Scuffle	Rare	Undiscovered	6630	20","237	Hitmontop	Fighting	Handstand		Human-Like		-","238	Smoochum	Ice/Psychic	Kiss	Hard	Undiscovered	6630	30","239	Elekid	Electric	Electric	Rare	Undiscovered	6630	30","240	Magby	Fire	Live Coal	Rare	Undiscovered	6630	30","241	Miltank	Normal	Milk Cow	Hard	Field	5355	-","242	Blissey	Normal	Happiness	Rare	Fairy	10455	-","243	Raikou	Electric	Thunder	Special	Undiscovered	20655	-","244	Entei	Fire	Volcano	Special	Undiscovered	20655	-","245	Suicune	Water	Aurora	Special	Undiscovered	20655	-","246	Larvitar	Rock/Ground	Rock Skin	Rare	Monster	10455	30","247	Pupitar	Rock/Ground	Hard Shell		Monster		55","248	Tyranitar	Rock/Dark	Armor		Monster		-","249	Lugia	Psychic/Flying	Diving	Special	Undiscovered	30855	-","250	Ho-Oh	Fire/Flying	Rainbow	Special	Undiscovered	30855	-","251	Celebi	Psychic/Grass	Time Travel	Special	Undiscovered	30855	-","							","							","252	Treecko	Grass	Wood Gecko	Starter	Monster/Dragon	5355	16","253	Grovyle	Grass	Wood Gecko		Monster/Dragon		36","254	Sceptile	Grass	Forest		Monster/Dragon		-","255	Torchic	Fire	Chick	Starter	Field	5355	16","256	Combusken	Fire	Young Fowl		Field		36","257	Blaziken	Fire/Fighting	Blaze		Field		-","258	Mudkip	Water	Mud Fish	Starter	Monster/Water 1	5355	16","259	Marshtomp	Water/Ground	Mud Fish		Monster/Water 1		36","260	Swampert	Water/Ground	Mud Fish		Monster/Water 1		-","261	Poochyena	Dark	Bite	Easy	Field	4080	18","262	Mightyena	Dark	Bite		Field		-","263	Zigzagoon	Normal	Tiny Raccoon	Easy	Field	4080	20","264	Linoone	Normal	Rushing		Field		-","265	Wurmple	Bug	Worm	Easy	Bug	4080	7","266	Silcoon	Bug	Coccoon		Bug		10","267	Beautifly	Bug/Flying	Butterfly		Bug		-","268	Cascoon	Bug	Coccoon		Bug		10","269	Dustox	Bug/Poison	Poison Moth		Bug		-","270	Lotad	Water/Grass	Water Weed	Medium	Water 1/Grass	4080	14","271	Lombre	Water/Grass	Jolly		Water 1/Grass		-","272	Ludicolo	Water/Grass	Carefree		Water 1/Grass		-","273	Seedot	Grass	Acorn	Medium	Field/Grass	4080	14","274	Nuzleaf	Grass/Dark	Wily		Field/Grass		-","275	Shiftry	Grass/Dark	Wicked		Field/Grass		-","276	Taillow	Normal/Flying	Tiny Swallow	Easy	Flying	4080	22","277	Swellow	Normal/Flying	Swallow		Flying		-","278	Wingull	Water/Flying	Seagull	Medium	Water 1/Flying	5355	25","279	Pelipper	Water/Flying	Water Bird		Water 1/Flying		-","280	Ralts	Psychic/Fairy	Feeling	Rare	Amorphous	5355	20","281	Kirlia	Psychic/Fairy	Emotion		Amorphous		30","282	Gardevoir	Psychic/Fairy	Embrace		Amorphous		-","283	Surskit	Bug/Water	Pond Skater	Medium	Water 1/Bug	4080	22","284	Masquerain	Bug/Flying	Eyeball		Water 1/Bug		-","285	Shroomish	Grass	Mushroom	Medium	Fairy/Grass	4080	23","286	Breloom	Grass/Fighting	Mushroom		Fairy/Grass		-","287	Slakoth	Normal	Slacker	Medium	Field	4080	18","288	Vigoroth	Normal	Wild Monkey		Field		36","289	Slaking	Normal	Lazy		Field		-","290	Nincada	Bug/Ground	Trainee	Hard	Bug	4080	20","291	Ninjask	Bug/Flying	Ninja		Bug		-","292	Shedinja	Bug/Ghost	Shed	Rare	Mineral	10455	-","293	Whismur	Normal	Whisper	Medium	Monster/Field	5355	20","294	Loudred	Normal	Big Voice		Monster/Field		40","295	Exploud	Normal	Loud Noise		Monster/Field		-","296	Makuhita	Fighting	Guts	Medium	Human-Like	5355	24","297	Hariyama	Fighting	Arm Thrust		Human-Like		-","298	Azurill	Normal/Fairy	Polkadot	Easy	Undiscovered	2805	-","299	Nosepass	Rock	Compass	Hard	Mineral	5355	-","300	Skitty	Normal	Kitten	Medium	Field/Fairy	4080	-","301	Delcatty	Normal	Prim		Field/Fairy		-","302	Sableye	Dark/Ghost	Darkness	Hard	Human-Like	6630	-","303	Mawile	Steel/Fairy	Deceiver	Hard	Field/Fairy	5355	-","304	Aron	Steel/Rock	Iron Armor	Medium	Monster	9180	32","305	Lairon	Steel/Rock	Iron Armor		Monster		42","306	Aggron	Steel/Rock	Iron Armor		Monster		-","307	Meditite	Fighting/Psychic	Meditate	Medium	Human-Like	5355	37","308	Medicham	Fighting/Psychic	Meditate		Human-Like		-","309	Electrike	Electric	Lightning	Medium	Field	5355	26","310	Manectric	Electric	Discharge		Field		-","311	Plusle	Electric	Cheering	Rare	Fairy	5355	-","312	Minun	Electric	Cheering	Rare	Fairy	5355	-","313	Volbeat	Bug	Firefly	Medium	Bug/Human-Like	4080	-","314	Illumise	Bug	Firefly	Medium	Bug/Human-Like	4080	-","315	Roselia	Grass/Poison	Thorn	Easy	Fairy/Grass	5355	-","316	Gulpin	Poison	Stomach	Medium	Amorphous	5355	26","317	Swalot	Poison	Poison Bag		Amorphous		-","318	Carvanha	Water/Dark	Savage	Medium	Water 2	5355	30","319	Sharpedo	Water/Dark	Brutal		Water 2		-","320	Wailmer	Water	Ball Whale	Hard	Field/Water 2	10455	40","321	Wailord	Water	Float Whale		Field/Water 2		-","322	Numel	Fire/Ground	Numb	Medium	Field	5355	33","323	Camerupt	Fire/Ground	Eruption		Field		-","324	Torkoal	Fire	Coal	Hard	Field	5355	-","325	Spoink	Psychic	Bounce	Medium	Field	5355	32","326	Grumpig	Psychic	Manipulate		Field		-","327	Spinda	Normal	Spot Panda	Hard	Field/Human-Like	4080	-","328	Trapinch	Ground	Ant Pit	Medium	Bug	5355	35","329	Vibrava	Ground/Dragon	Vibration		Bug		45","330	Flygon	Ground/Dragon	Mystic		Bug		-","331	Cacnea	Grass	Cactus	Medium	Grass/Human-Like	5355	32","332	Cacturne	Grass/Dark	Scarecrow		Grass/Human-Like		-","333	Swablu	Normal/Flying	Cotton Bird	Medium	Flying/Dragon	5355	35","334	Altaria	Dragon/Flying	Humming		Flying/Dragon		-","335	Zangoose	Normal	Cat Ferret	Hard	Field	5355	-","336	Seviper	Poison	Fang Snake	Hard	Field/Dragon	5355	-","337	Lunatone	Rock/Psychic	Meteorite	Rare	Mineral	6630	-","338	Solrock	Rock/Psychic	Meteorite	Rare	Mineral	6630	-","339	Barboach	Water/Ground	Whiskers	Medium	Water 2	5355	30","340	Whiscash	Water/Ground	Whiskers		Water 2		-","341	Corphish	Water	Ruffian	Hard	Water 1/Water 3	4080	30","342	Crawdaunt	Water/Dark	Rogue		Water 1/Water 3		-","343	Baltoy	Ground/Psychic	Clay Doll	Rare	Mineral	5355	36","344	Claydol	Ground/Psychic	Clay Doll		Mineral		-","345	Lileep	Rock/Grass	Sea Lily	Special	Water 3	7905	40","346	Cradily	Rock/Grass	Barnacle		Water 3		-","347	Anorith	Rock/Bug	Old Shrimp	Special	Water 3	7905	40","348	Armaldo	Rock/Bug	Plate		Water 3		-","349	Feebas	Water	Fish	Rare	Water 1/Dragon	5355	-","350	Milotic	Water	Tender		Water 1/Dragon		-","351	Castform	Normal	Weather	Rare	Fairy/Amorphous	6630	-","352	Kecleon	Normal	Color Swap	Rare	Field	5355	-","353	Shuppet	Ghost	Puppet	Medium	Amorphous	6630	37","354	Banette	Ghost	Marionette		Amorphous		-","355	Duskull	Ghost	Requiem	Hard	Amorphous	6630	37","356	Dusclops	Ghost	Beckon		Amorphous		-","357	Tropius	Grass/Flying	Fruit	Rare	Monster/Grass	6630	-","358	Chimecho	Psychic	Wind Chime	Hard	Amorphous	6630	-","359	Absol	Dark	Disaster	Hard	Field	6630	-","360	Wynaut	Psychic	Bright	Medium	Undiscovered	5355	15","361	Snorunt	Ice	Snow Hat	Hard	Fairy/Mineral	5355	42","362	Glalie	Ice	Face		Fairy/Mineral		","363	Spheal	Ice/Water	Clap	Medium	Water 1/Field	5355	32","364	Sealeo	Ice/Water	Ball Roll		Water 1/Field		44","365	Walrein	Ice/Water	Ice Break		Water 1/Field		-","366	Clamperl	Water	Bivalve	Rare	Water 1	5355	-","367	Huntail	Water	Deep Sea		Water 1		-","368	Gorebyss	Water	South Sea		Water 1		-","369	Relicanth	Water/Rock	Longevity	Rare	Water 1/Water 2	10455	-","370	Luvdisc	Water	Rendevouz	Medium	Water 2	5355	-","371	Bagon	Dragon	Rock Head	Rare	Dragon	10455	30","372	Shelgon	Dragon	Endurance		Dragon		50","373	Salamence	Dragon/Flying	Dragon		Dragon		-","374	Beldum	Steel/Psychic	Iron Ball	Rare	Mineral	10455	20","375	Metang	Steel/Psychic	Iron Claw		Mineral		45","376	Metagross	Steel/Psychic	Iron Leg		Mineral		-","377	Regirock	Rock	Rock Peak	Special	Undiscovered	20655	-","378	Regice	Ice	Iceburg	Special	Undiscovered	20655	-","379	Registeel	Steel	Iron	Special	Undiscovered	20655	-","380	Latias	Dragon/Psychic	Eon	Special	Undiscovered	30855	-","381	Latios	Dragon/Psychic	Eon	Special	Undiscovered	30855	-","382	Kyogre	Water	Sea Basin	Special	Undiscovered	30855	-","383	Groudon	Ground	Continent	Special	Undiscovered	30855	-","384	Rayquaza	Dragon/Flying	Sky High	Special	Undiscovered	30855	-","385	Jirachi	Steel/Psychic	Wish	Special	Undiscovered	30855	-","386	Deoxys	Psychic	DNA	Special	Legendary	30855	-","							","							","387	Turtwig	Grass	Tiny Leaf	Starter	Monster/Grass	5355	18","388	Grotle	Grass	Grove		Monster/Grass		32","389	Torterra	Grass/Ground	Continent		Monster/Grass		-","390	Chimchar	Fire	Chimp	Starter	Field/Human-Like	5355	14","391	Monferno	Fire/Fighting	Playful		Field/Human-Like		36","392	Infernape	Fire/Fighting	Flame		Field/Human-Like		-","393	Piplup	Water	Penguin	Starter	Water 1/Field	5355	16","394	Prinplup	Water	Penguin		Water 1/Field		36","395	Empoleon	Water/Steel	Emperor		Water 1/Field		-","396	Starly	Normal/Flying	Starling	Easy	Flying	4080	14","397	Staravia	Normal/Flying	Starling		Flying		34","398	Staraptor	Normal/Flying	Predator		Flying		-","399	Bidoof	Normal	Plump Mouse	Easy	Water 1/Field	4080	15","400	Bibarel	Normal/Water	Beaver		Water 1/Field		-","401	Kricketot	Bug	Cricket	Easy	Bug	4080	10","402	Kricketune	Bug	Cricket		Bug		-","403	Shinx	Electric	Flash	Easy	Field	5355	15","404	Luxio	Electric	Spark		Field		30","405	Luxray	Electric	Gleam Eyes		Field		-","406	Budew	Grass/Poison	Bud	Easy	Undiscovered	5355	-","407	Roserade	Grass/Poison	Bouquet		Fairy/Grass		-","408	Cranidos	Rock	Headbutt	Special	Monster	7905	30","409	Rampardos	Rock	Headbutt		Monster		-","410	Shieldon	Rock/Steel	Shield	Special	Monster	7905	30","411	Bastiodon	Rock/Steel	Shield		Monster		-","412	Burmy	Bug	Bagworm	Medium	Bug	4080	20","414	Mothim	Bug/Flying	Moth		Bug		-","415	Combee	Bug/Flying	Tiny Hive	Special	Bug	4590	21","416	Vespiquen	Bug/Flying	Beehive		Bug		-","417	Pachirisu	Electric	Elesquirrel	Medium	Field/Fairy	2805	-","418	Buizel	Water	Sea Weasel	Medium	Water 1/Field	5355	26","419	Floatzel	Water	Sea Weasel		Water 1/Field		-","420	Cherubi	Grass	Cherry	Hard	Fairy/Grass	5355	25","421	Cherrim	Grass	Blossom		Fairy/Grass		-","422	Shellos	Water	Sea Slug	Easy	Water 1/Amorphous	5355	30","423	Gastrodon	Water/Ground	Sea Slug		Water 1/Amorphous		-","424	Ambipom	Normal	Long Tail	Medium	Field	5355	-","425	Drifloon	Ghost/Flying	Balloon	Special	Amorphous	7905	28","426	Drifblim	Ghost/Flying	Blimp		Amorphous		-","427	Buneary	Normal	Rabbit	Medium	Field/Human-Like	5355	-","428	Lopunny	Normal	Rabbit		Field/Human-Like		-","429	Mismagius	Ghost	Magical	Hard	Amorphous	6630	-","430	Honchkrow	Dark/Flying	Big Boss	Hard	Flying	5355	-","431	Glameow	Normal	Catty	Medium	Field	5355	38","432	Purugly	Normal	Tiger Cat		Field		-","433	Chingling	Psychic	Bell	Hard	Undiscovered	6630	-","434	Stunky	Poison/Dark	Skunk	Medium	Field	5355	34","435	Skuntank	Poison/Dark	Skunk		Field		-","436	Bronzor	Steel/Psychic	Bronze	Hard	Mineral	5355	33","437	Bronzong	Steel/Psychic	Bronze Bell		Mineral		-","438	Bonsly	Rock	Bonsai	Rare	Undiscovered	5355	17","439	Mime Jr.	Psychic/Fairy	Mime	Rare	Undiscovered	6630	18","440	Happiny	Normal	Playhouse	Rare	Undiscovered	10455	-","441	Chatot	Normal/Flying	Music Note	Hard	Flying	5355	-","442	Spiritomb	Ghost/Dark	Forbidden	Rare	Amorphous	7905	-","443	Gible	Dragon/Ground	Land Shark	Hard	Monster/Dragon	10455	24","444	Gabite	Dragon/Ground	Cave		Monster/Dragon		48","445	Garchomp	Dragon/Ground	Mach		Monster/Dragon		-","446	Munchlax	Normal	Big Eater	Special	Undiscovered	10455	-","447	Riolu	Fighting	Emanation	Medium	Undiscovered	6630	-","448	Lucario	Fighting/Steel	Aura		Field/Human-Like		-","449	Hippopotas	Ground	Hippo	Medium	Field	7905	34","450	Hippowdon	Ground	Heavyweight		Field		-","451	Skorupi	Poison/Bug	Scorpion	Medium	Bug/Water 3	5355	40","452	Drapion	Poison/Dark	Ogre Scorpion		Bug/Water 3		-","453	Croagunk	Poison/Fighting	Toxic Mouth	Medium	Human-Like	2805	37","454	Toxicroak	Poison/Fighting	Toxic Mouth		Human-Like		-","455	Carnivine	Grass	Bug Catcher	Hard	Grass	6630	-","456	Finneon	Water	Wing Fish	Medium	Water 2	5355	31","457	Lumineon	Water	Neon		Water 2		-","458	Mantyke	Water/Flying	Kite	Medium	Undiscovered	6630	Mantine","459	Snover	Grass/Ice	Frost Tree	Medium	Monster/Grass	5355	40","460	Abomasnow	Grass/Ice	Frost Tree		Monster/Grass		-","461	Weavile	Dark/Ice	Sharp Claw	Medium	Field	5355	-","462	Magnezone	Electric/Steel	Magnet Area	Hard	Mineral	5355	-","463	Lickilicky	Normal	Licking	Hard	Monster	5355	-","464	Rhyperior	Ground/Rock	Drill	Medium	Monster/Field	5355	-","465	Tangrowth	Grass	Vine	Hard	Grass	5355	-","466	Electivire	Electric	Thunderbolt	Rare	Human-Like	6630	-","467	Magmortar	Fire	Blast	Rare	Human-Like	6630	-","468	Togekiss	Fairy/Flying	Jubilee	Medium	Flying/Fairy	2805	-","469	Yanmega	Bug/Flying	Ogre Darner	Hard	Bug	5355	-","470	Leafeon	Grass	Verdant	Rare	Field	9180	-","471	Glaceon	Ice	Fresh Snow	Rare	Field	9180	-","472	Gliscor	Ground/Flyng	Fang Scorpion	Hard	Bug	5355	-","473	Mamoswine	Ice/Ground	Twin Tusk	Hard	Field	5355	-","474	Porygon-Z	Normal	Virtual	Rare	Mineral	5355	-","475	Gallade	Psychic/Fighting	Blade	Rare	Amorphous	5355	-","476	Probopass	Rock/Steel	Compass	Hard	Mineral	5355	-","477	Dusknoir	Ghost	Gripper	Hard	Amorphous	6630	-","478	Froslass	Ice/Ghost	Snow Land	Hard	Fairy/Mineral	5355	-","479	Rotom	Electric/Ghost	Plasma	Special	Amorphous	5355	-","480	Uxie	Psychic	Knowledge	Special	Undiscovered	20655	-","481	Mespirit	Psychic	Emotion	Special	Undiscovered	20655	-","482	Azelf	Psychic	Willpower	Special	Undiscovered	20655	-","483	Dialga	Steel/Dragon	Temporal	Special	Undiscovered	30855	-","484	Palkia	Water/Dragon	Spacial	Special	Undiscovered	30855	-","485	Heatran	Fire/Steel	Lava Dome	Special	Undiscovered	2805	-","486	Regigigas	Normal	Colossal	Special	Undiscovered	30855	-","487	Giratina	Ghost/Dragon	Renegade	Special	Undiscovered	30855	-","488	Cresselia	Psychic	Lunar	Special	Undiscovered	30855	-","489	Phione	Water	Sea Drifter	Rare	Water 1/Fairy	10455	-","490	Manaphy	Water	Sea-Faring	Special	Water 1/Fairy	2805	-","491	Darkrai	Dark	Pitch-Black	Special	Undiscovered	30855	-","492	Shaymin	Grass	Gratitude	Special	Undiscovered	30855	-","493	Arceus	Normal	Alpha	Special	Legendary	30855	-","							","							","494	Victini	Fire/Psychic	Victory	Special	Undiscovered	30855	-","495	Snivy	Grass	Grass Snake	Starter	Field/Grass	5355	17","496	Servine	Grass	Grass Snake		Field/Grass		36","497	Serperior	Grass	Regal		Field/Grass		-","498	Tepig	Fire	Fire Pig	Starter	Field	5355	17","499	Pignite	Fire/Fighting	Fire Pig		Field		36","500	Emboar	Fire/Fighting	Mega Fire Pig		Field		-","501	Oshawott	Water	Sea Otter	Starter	Field	5355	17","502	Dewott	Water	Discipline		Field		36","503	Samurott	Water	Formidable		Field		-","504	Patrat	Normal	Scout	Easy	Field	4080	20","505	Watchog	Normal	Lookout		Field		-","506	Lillipup	Normal	Puppy	Easy	Field	4080	16","507	Herdier	Normal	Loyal Dog		Field		32","508	Stoutland	Normal	Big-Hearted		Field		-","509	Purrloin	Dark	Devious	Easy	Field	5355	20","510	Liepard	Dark	Cruel		Field		-","511	Pansage	Grass	Grass Monkey	Rare	Field	5355	-","512	Simisage	Grass	Thorn Monkey		Field		-","513	Pansear	Fire	High Temp	Rare	Field	5355	-","514	Simisear	Fire	Ember		Field		-","515	Panpour	Water	Sprey	Rare	Field	5355	-","516	Simipour	Water	Geyser		Field		-","517	Munna	Psychic	Dream Eater	Hard	Field	2805	-","518	Musharna	Psychic	Drowsing		Field		-","519	Pidove	Normal/Flying	Tiny Pigeon	Easy	Flying	4080	21","520	Tranquill	Normal/Flying	Wild Pigeon		Flying		32","521	Unfezant	Normal/Flying	Proud		Flying		-","522	Blitzle	Electric	Electrified	Easy	Field	5355	27","523	Zebstrika	Electric	Thunderbolt		Field		-","524	Roggenrola	Rock	Mantle	Medium	Mineral	4080	25","525	Boldore	Rock	Ore		Mineral		-","526	Gigalith	Rock	Compressed		Mineral		-","527	Woobat	Psychic/Flying	Bat	Easy	Field/Flying	4080	-","528	Swoobat	Psychic/Flying	Courting		Field/Flying		-","529	Drilbur	Ground	Mole	Medium	Field	5355	31","530	Excadrill	Ground/Steel	Subterrene		Field		-","531	Audino	Normal	Hearing	Rare	Fairy	5355	-","532	Timburr	Fighting	Muscular	Medium	Human-Like	5355	25","533	Gurdurr	Fighting	Muscular		Human-Like		-","534	Conkeldurr	Fighting	Muscular		Human-Like		-","535	Tympole	Water	Tadpole	Easy	Water 1	5355	25","536	Palpitoad	Water/Ground	Vibration		Water 1		36","537	Seismitoad	Water/Ground	Vibration		Water 1		-","538	Throh	Fighting	Judo	Hard	Human-Like	5355	-","539	Sawk	Fighting	Karate	Hard	Human-Like	5355	-","540	Sewaddle	Bug/Grass	Sewing	Easy	Bug	4080	20","541	Swadloon	Bug/Grass	Leaf-Wrapped		Bug		-","542	Leavanny	Bug/Grass	Nurturing		Bug		-","543	Venipede	Bug/Poison	Centipede	Medium	Bug	4080	22","544	Whirlipede	Bug/Poison	Curlipede		Bug		30","555	Scolipede	Bug/Poison	Megapede		Bug		-","546	Cottonee	Grass/Fairy	Cotton Puff	Easy	Fairy/Grass	5355	-","547	Whimsicott	Grass/Fairy	Windveiled		Fairy/Grass		-","548	Petilil	Grass	Bulb	Easy	Grass	5355	-","549	Lilligant	Grass	Flowering		Grass		-","550	Basculin	Water	Hostile	Medium	Water 2	10455	-","551	Sandile	Ground/Dark	Desert Croc	Medium	Field	5355	29","552	Krokorok	Ground/Dark	Desert Croc		Field		40","553	Krookodile	Ground/Dark	Intimidation		Field		-","554	Darumaka	Fire	Zen Charm	Hard	Field	5355	35","555	Darmanitan	Fire	Blazing		Field		-","556	Maractus	Grass	Cactus	Medium	Grass	5355	-","557	Dwebble	Bug/Rock	Rock Inn	Medium	Bug/Mineral	5355	34","558	Crustle	Bug/Rock	Stone Home		Bug/Mineral		-","559	Scraggy	Dark/Fighting	Shedding	Medium	Field/Dragon	4080	39","560	Scrafty	Dark/Fighting	Hoodlum		Field/Dragon		-","561	Sigilyph	Psychic/Flying	Avianoid	Rare	Flying	5355	-","562	Yamask	Ghost	Spirit	Hard	Mineral/Amorphous	6630	34","563	Cofagrigus	Ghost	Coffin		Mineral/Amorphous		-","564	Tirtouga	Water/Rock	Prototurtle	Special	Water 1/Water 3	7905	37","565	Carracosta	Water/Rock	Prototurtle		Water 1/Water 3		-","566	Archen	Rock/Flying	First Bird	Special	Flying/Water 3	7905	37","567	Archeops	Rock/Flying	First Bird		Flying/Water 3		-","568	Trubbish	Poison	Trash Bag	Medium	Mineral	5355	36","569	Garbodor	Poison	Trash Heap		Mineral		-","570	Zorua	Dark	Tricky Fox	Rare	Field	6630	30","571	Zoroark	Dark	Illusion Fox		Field		-","572	Minccino	Normal	Chinchilla	Medium	Field	4080	-","573	Cinccino	Normal	Scarf		Field		-","574	Gothita	Psychic	Fixation	Medium	Human-Like	5355	32","575	Gothorita	Psychic	Manipulate		Human-Like		41","576	Gothitelle	Psychic	Astral Body		Human-Like		-","577	Solosis	Psychic	Cell	Easy	Amorphous	5355	32","578	Duosion	Psychic	Mitosis		Amorphous		41","579	Reuniclus	Psychic	Multiplying		Amorphous		-","580	Ducklett	Water/Flying	Water Bird	Medium	Water 1/Flying	5355	35","581	Swanna	Water/Flying	White Bird				-","582	Vanillite	Ice	Fresh Snow	Easy	Mineral	5355	35","583	Vanillish	Ice	Ice Snow		Mineral		47","584	Vanilluxe	Ice	Snowstorm		Mineral		-","585	Deerling	Normal/Grass	Season	Hard	Field	5355	34","586	Sawsbuck	Normal/Grass	Season		Field		-","587	Emolga	Electric/Flying	Sky Squirrel	Medium	Field	5355	-","588	Karrablast	Bug	Clamping	Medium	Bug	4080	-","589	Escavalier	Bug/Steel	Cavalry		Bug		-","590	Foongus	Grass/Poison	Mushroom	Easy	Grass	5355	39","591	Amoonguss	Grass/Poison	Mushroom		Grass		-","592	Frillish	Water/Ghost	Floating	Hard	Amorphous	5355	40","593	Jellicent	Water/Ghost	Floating		Amorphous		-","594	Alomomola	Water	Caring	Hard	Water 1/Water 2	10455	-","595	Joltik	Bug/Electric	Attaching	Medium	Bug	5355	36","596	Galvantula	Bug/Electric	Elespider		Bug		-","597	Ferroseed	Grass/Steel	Thorn Seed	Medium	Grass/Mineral	5355	40","598	Ferrothorn	Grass/Steel	Thorn Pod		Grass/Mineral		-","599	Klink	Steel	Gear	Hard	Mineral	5355	38","600	Klang	Steel	Gear		Mineral		49","601	Klinklang	Steel	Gear		Mineral		-","602	Tynamo	Electric	EleFish	Medium	Amorphous	5355	39","603	Eelectric	Electric	EleFish		Amorphous		-","604	Eelektross	Electric	EleFish		Amorphous		-","605	Elgyem	Psychic	Cerebral	Hard	Human-Like	5355	42","606	Beheeyem	Psychic	Cerebral		Human-Like		-","607	Litwick	Ghost/Fire	Candle	Medium	Amorphous	5355	41","608	Lampent	Ghost/Fire	Lamp		Amorphous		-","609	Chandelure	Ghost/Fire	Luring		Amorphous		-","610	Axew	Dragon	Tusk	Hard	Monster/Dragon	10455	38","611	Fraxure	Dragon	Axe Jaw		Monster/Dragon		48","612	Haxorus	Dragon	Axe Jaw		Monster/Dragon		-","613	Cubchoo	Ice	Chill	Hard	Field	5355	37","614	Beartic	Ice	Freezing		Field		-","615	Cryogonal	Ice	Crystalizing	Rare	Mineral	6630	-","616	Shelmet	Bug	Snail	Medium	Bug	4080	-","617	Accelgor	Bug	Shell Out		Bug		-","618	Stunfisk	Ground/Electric	Trap	Hard	Water 1/Amorphous	5355	-","619	Mienfoo	Fighting	Martial Arts	Hard	Field/Human-Like	6630	50","620	Meinshao	Fighting	Martial Arts		Field/Human-Like		-","621	Druddigon	Dragon	Cave	Rare	Dragon/Monster	7905	-","622	Golett	Ground/Ghost	Automaton	Rare	Mineral	6630	43","623	Golurk	Ground/Ghost	Automaton		Mineral		-","624	Pawniard	Dark/Steel	Sharp Blade	Hard	Human-Like	5355	52","625	Bisharp	Dark/Steel	Sword Blade		Human-Like		-","626	Bouffalant	Normal	Bash Buffalo	Hard	Field	5355	-","627	Rufflet	Normal/Flying	Eaglet	Hard	Flying	5355	54","628	Braviary	Normal/Flying	Valiant		Flying		-","629	Vullaby	Dark/Flying	Diapered	Hard	Flying	5355	54","630	Mandibuzz	Dark/Flying	Bone Vulture		Flying		-","631	Heatmor	Fire	Anteater	Rare	Field	5355	-","632	Durant	Bug/Steel	Iron Ant	Hard	Bug	5355	-","633	Deino	Dark/Dragon	Irate	Rare	Dragon	10455	50","634	Zweilous	Dark/Dragon	Hostile		Dragon		64","635	Hydreigon	Dark/Dragon	Brutal		Dragon		-","636	Larvesta	Bug/Fire	Torch	Rare	Bug	10455	59","637	Volcarona	Bug/Fire	Sun		Bug		-","638	Cobalion	Steel/Fighting	Iron Will	Special	Undiscovered	20655	-","639	Terrakion	Rock/Fighting	Cavern	Special	Undiscovered	20655	-","640	Virizion	Grass/Fighting	Grassland	Special	Undiscovered	20655	-","641	Tornadus	Flying	Cyclone	Special	Undiscovered	30855	-","642	Thundurus	Electric/Flying	Bolt Strike	Special	Undiscovered	30855	-","643	Reshiram	Dragon/Fire	Vast White	Special	Undiscovered	30855	-","644	Zekrom	Dragon/Electric	Deep Black	Special	Undiscovered	30855	-","645	Landorus	Ground/Flying	Abundance	Special	Undiscovered	30855	-","646	Kyurem	Dragon/Ice	Boundary	Special	Undiscovered	30855	-","647	Keldeo	Water/Fighting	Colt	Special	Undiscovered		-","648	Meloetta	Normal/Psychic	Melody	Special	Undiscovered	5355	-","649	Genesect	Bug/Steel	Paleozoic	Special	Legendary	30855	-","							","							","650	Chespin	Grass	Spiny Nut	Special	Field	5355	16","651	Quilladin	Grass	Spiny Armor				36","652	Chesnaught	Grass/Fighting	Spiny Armor				-","653	Fennekin	Fire	Fox	Special	Field	5355	16","654	Braixen	Fire	Fox		Field		36","655	Delphox	Fire/Psychic	Fox		Field		-","656	Froakie	Water	Bubble Frog	Special	Water 1	5355	16","657	Frogadier	Water	Bubble Frog		Water 1		36","658	Greninja	Water/Dark	Ninja		Water 1		-","659	Bunnelby	Normal	Digging	Medium	Field	5355	20","660	Diggersby	Normal/Ground	Digging		Field		-","661	Fletchling	Normal/Flying	Tiny Robin	Easy	Flying	5355	17","662	Fletchinder	Fire/Flying	Ember		Flying		35","663	Talonflame	Fire/Flying	Scorching		Flying		-","664	Scatterbug	Bug	Scatterdust	Easy	Bug	3840	9","665	Spewpa	Bug	Scatterdust		Bug		12","666	Vivillon	Bug/Flying	Scale		Bug		-","667	Litleo	Normal/Fire	Lion Cub	Special	Field	5355	35","668	Pyroar	Normal/Fire	Royal		Field		-","669	Flabebe	Fairy	Single Bloom	Medium	Fairy	5355	19","670	Floette	Fairy	Single Bloom		Fairy		-","671	Florges	Fairy	Garden		Fairy		-","672	Skiddo	Grass	Mount	Hard	Field	5355	32","673	Gogoat	Grass	Mount		Field		-","674	Pancham	Fighting	Playful	Hard	Field/Human-Like	5355	 32 (+ Dark Type)","675	Pangoro	Fighting/Dark	Daunting		Field/Human-Like		-","676	Furfrou	Normal	Poodle	Hard	Field	5355	-","677	Espurr	Psychic	Restraint	Special	Field	5355	25","678	Meowstic	Psychic	Constraint		Field		-","679	Honedge	Steel/Ghost	Sword	Hard	Mineral	5355	35","680	Doublade	Steel/Ghost	Sword		Mineral		-","681	Aegislash	Steel/Ghost	Royal Sword		Mineral		-","682	Spritzee	Fairy	Perfume	Hard	Fairy	5355	-","683	Aromatisse	Fairy	Fragrance		Fairy		-","684	Swirlix	Fairy	Cotton Candy	Medium	Fairy	5355	-","685	Slurpuff	Fairy	Meringue		Fairy		-","686	Inkay	Dark/Psychic	Revolving	Medium	Water 1/Water 2	5355	30","687	Malamar	Dark/Psychic	Overturning		Water 1/Water 2		-","688	Binacle	Rock/Water	Two-Handed	Medium	Water 3	5355	39","689	Barbaracle	Rock/Water	Collective		Water 3		-","690	Skrelp	Poison/Water	Mock Kelp	Hard	Water 1/Dragon	5355	48","691	Dragalge	Poison/Dragon	Mock Kelp		Water 1/Dragon		-","692	Clauncher	Water	Water Gun	Hard	Water 1/Water 3	5355	37","693	Clawitzer	Water	Howlitzer		Water 1/Water 3		-","694	Helioptile	Normal/Electric	Generator	Medium	Monster/Dragon	5355	-","695	Heliolisk	Normal/Electric	Generator		Monster/Dragon		-","696	Tyrunt	Rock/Dragon	Royal Heir	Special	Monster/Dragon	7680	39 (+ Day)","697	Tyrantrum	Rock/Dragon	Despot		MonsterDragon		-","698	Amaura	Rock/Ice	Tundra	Special	Monster	7680	 39 (+ Night)","699	Aurorus	Rock/Ice	Tundra		Monster		-","700	Sylveon	Fairy	Intertwining	Rare	Field	9180	-","701	Hawlucha	Fighting/Flying	Wrestling	Hard	Human-Like	5355	-","702	Dedenne	Electric/Fairy	Antenna	Medium	Field/Fairy	5355	-","703	Carbink	Rock/Fairy	Jewel	Special	Fairy/Mineral	6630	-","704	Goomy	Dragon	Soft Tissue	Hard	Dragon	10455	40","705	Sliggoo	Dragon	Soft Tissue		Dragon		50 (+ Rain)","706	Goodra	Dragon	Dragon		Dragon		-","707	Klefki	Steel/Fairy	Key Ring	Rare	Mineral	5355	-","708	Phantump	Ghost/Grass	Stump	Hard	Grass/Amorphous	5355	-","709	Trevenant	Ghost/Grass	Elder Tree		Grass/Amorphous		-","710	Pumpkaboo	Ghost/Grass	Pumpkin	Hard	Amorphous	5355	-","711	Gourgeist	Ghost/Grass	Pumpkin		Amorphous		-","712	Bergmite	Ice	Ice Chunk	Hard	Monster	5355	37","713	Avalugg	Ice	Iceberg		Monster		-","714	Noibat	Flying/Dragon	Sound Wave	Rare	Flying	5355	48","715	Noivern	Flying/Dragon	Sound Wave		Flying		-","716	Xerneas	Fairy	Life	Special	Undiscovered	30855	-","717	Yveltal	Dark/Flying	Destruction	Special	Undiscovered	30855	-","718	Zygarde	Dragon/Ground	Order	Special	Undiscovered	30855	-","719	Diancie	Rock/Fairy	Jewel	Special	Legendary	6630	-","720	Hoopa	Psychic/Ghost	Mischief	Special	Undiscovered	30855	-","721	Volcanion	Fire/Water	Steam	Special	Undiscovered	30855	-","							","							","722	Rowlet	Grass/Flying	Grass Quill	Starter	Flying	5355	17","723	Dartrix	Grass/Flying	Blade Quill		Flying		34","724	Decidueye	Grass/Ghost	Arrow Quill		Flying		-","725	Litten	Fire	Fire Cat	Starter	Field	5355	17","726	Torracat	Fire	Fire Cat		Field		34","727	Incineroar	Fire/Dark	Heel		Field		-","728	Popplio	Water	Sea Lion	Starter	Water 1/Field	5355	17","729	Brionne	Water	Pop Star		Water 1/Field		34","730	Primarina	Water/Fairy	Soloist		Water 1/Field		-","731	Pikipek	Normal/Flying	Woodpecker	Easy	Flying	4080	14","732	Trumbeak	Normal/Flying	Bugle Beak		Flying		28","733	Toucannon	Normal/Flying	Cannon		Flying		-","734	Yungoos	Nomal	Loitering	Easy	Field	4080	20 (+ Day)","735	Gumshoes	Normal	Stakeout		Field		-","736	Grubbin	Bug	Larva	Medium	Bug	4080	20","737	Charjabug	Bug/Electric	Battery		Bug		-","738	Vikavolt	Bug/Electric	Stag Beetle		Bug		-","739	Crabrawler	Fighting	Boxing	Special	Water 3	5355	-","740	Carbominable	Fighting/Ice	Wolly Crab		Water 3		-","741	Oricorio (Baile)	Fire/Flying	Dancing	Rare	Flying	5355	-","741	Oricorio (Pom-Pom)	Electric/Flying	Dancing	Rare	Flying	5355	-","741	Oricorio (Pa'u)	Psychic/Flying	Dancing	Rare	Flying	5355	-","741	Oricorio (Sensu)	Ghost/Flying	Dancing	Rare	Flying	5355	-","742	Cutiefly	Bug/Fairy	Bee Fly	Medium	Bug/Fairy	5355	25","743	Ribombee	Bug/Fairy	Bee Fly		Bug/Fairy		-","744	Rockruff	Rock	Puppy	Medium	Field	4080	25","745	Lycanroc	Rock	Wolf		Field		-","746	Wishiwashi	Water	Small Fry	Special	Water 2	4080	-","747	Mareanie	Poison/Water	Brutal Star	Hard	Water 1	5355	38","748	Toxapex	Poison/Water	Brutal Star		Water 1		-","749	Mudbray	Ground	Donkey	Hard	Field	5355	30","750	Mudslade	Ground	Draft Horse		Field		-","751	Dewpider	Water/Bug	Water Bubble	Hard	Water 1/Bug	4080	22","752	Araquanid	Water/Bug	Water Bubble		Water 1/Bug		-","753	Fomantis	Grass	Sickle Grass	Hard	Grass	5355	34 (+ Day)","754	Lurantis	Grass	Bloom Sickle		Grass		-","755	Morelull	Grass/Fairy	Illuminating	Medium	Grass	5355	24","756	Shiinotic	Grass/Fairy	Illuminating		Grass		-","757	Salandit	Poison/Fire	Toxic Lizard	Medium	Monster/Dragon	5355	33 (Female)","758	Salazzle	Poison/Fire	Toxic Lizard		Monster/Dragon		-","759	Stufful	Normal/Fighting	Flailing	Hard	Field	4080	27","760	Bewear	Normal/Fighting	Strong Arm		Field		-","761	Bounsweet	Grass	Fruit	Medium	Grass	5355	18","762	Steenee	Grass	Fruit		Grass		29","763	Tsareena	Grass	Fruit		Grass		-","764	Comfey	Fairy	Posy Picker	Rare	Grass	5355	-","765	Oranguru	Normal/Psychic	Sage	Rare	Field	5355	-","766	Passimian	Fighting	Teamwork	Rare	Field	5355	-","767	Wimpod	Bug/Water	Turn Tail	Medium	Bug/Water 3	5355	30","768	Golisopod	Bug/Water	Hard Scale		Bug/Water 3		-","769	Sandygast	Ghost/Ground	Sand Heap	Hard	Amorphous	3840	42","770	Palossand	Ghost/Ground	Sand Castle		Amorphous		-","771	Pyukumuku	Water	Sea Cucumber	Medium	Water 1	4080	-","772	Type: Null	?	?	?	?	30855	-","773	Silvally	?	?		?		-","774	Minior	Rock/Flying	Meteor	Event	Mineral	6630	-","775	Komala	Normal	Drowsing	Hard	Field	5355	-","776	Turtonator	Fire/Dragon	Blast Turtle	Rare	Monster/Dragon	5355	-","777	Togedemaru	Electric/Steel	Roly-Poly	Medium	Field/Fairy	2805	-","778	Mimikyu	Ghost/Fairy	Disguise	Rare	Amorphous	5355	-","779	Bruxish	Water/Psychic	Gnash Teeth	Special	Water 2	4080	-","780	Drampa	Normal/Dragon	Placid	Rare	Monster/Dragon	5355	-","781	Dhelmise	?	?	?	?	6630	-","782	Jangmo-o	Dragon	Scaly	Rare	Dragon	10455	35","783	Hakamo-o	Dragon/Fighting	Scaly		Dragon		45","784	Kommo-o	Dragon/Fighting	Scaly		Dragon		-","785	Tapu Koko	?	?	?	?	?	-","786	Tapu Lele	?	?	?	?	?	-","787	Tapu Bulu	?	?	?	?	?	-","788	Tapu Fini	?	?	?	?	?	-","789	Cosmog	Psychic	Nebula	Special	Undiscovered	30855	43","790	Cosmoem	Psychic	Protostar		Undiscovered		53","791	Solgaleo	Psychic/Steel	Sunne		Undiscovered		-","792	Lunala	Phychic/Ghost	Moone		Undiscovered		-",'793	Nihilego	Rock/Poison	Parasite	Quest	Undiscovered	30855	-', '794	Buzzwole	Bug/Fighting	Swollen	Quest	Undiscovered	30855	-', '795	Pheromosa	Bug/Fighting	Lissome	Quest	Undiscovered	30855	-', '796	Xurkitree	Electric	Glowing	Quest	Undiscovered	30855	-', '797	Celesteela	Steel/Flying	Launch	Quest	Undiscovered	30855	-', '798	Kartana	Grass/Steel	Drawn Sword	Quest	Undiscovered	30855	-', '799	Guzzlord	Dark/Dragon	Junkivore	Quest	Undiscovered	30855	-', '800	Necrozma	?	?	?	?	?	-', '801	Magearna	Steel/Fairy	Artificial	Special	Undiscovered	30855	-', '802	Marshadow	Fighting/Ghost	Gloomdweller	Special	Undiscovered	30855	-', '803	Marshadow (Zenith)	Fighting/Ghost	Zenith	Special	Undiscovered	30855	-', '804	Poipole	Poison	Poison Pin	Quest	Undiscovered	30855	40', '805	Naganadel	Poison	Poison Pin		Undiscovered		-', '806	Stakataka	Rock/Steel	Rampart	Quest	Undiscovered	30855	-', '807	Blacephalon	Fire/Ghost	Fireworks	Quest	Undiscovered	30855	-', '808	Zeraora	Electric	Thunderclap	Special	Undiscovered	30855	-', '809	Meltan	Steel	Hex Nut	Special	Undiscovered	30855	-', '810	Melmetal	Steel	Hex Nut		Undiscovered		-', '810	Grookey	Grass	Chimp	Starter	Field/Grass	5355	16', '811	Thwackey	Grass	Beat		Field/Grass		35', '812	Rillaboom	Grass	Drummer		Field/Grass		-', '813	Scorbunny	Fire	Rabbit	Starter	Field/Human-Like	5355	16', '814	Raboot	Fire	Rabbit		Field/Human-Like		35', '815	Cinderace	Fire	Striker		Field/Human-Like		-', '816	Sobble	Water	Water Lizard	Starter	Water 1/Field	5355	16', '817	Drizzile	Water	Water Lizard		Water 1/Field		35', '818	Inteleon	Water	Secret Agent		Water 1/Field		-', '819	Skwovet	Normal	Cheeky	Medium	Field	5355	24', '820	Greedent	Normal	Greedy		Field		-', '821	Rookidee	Flying	Tiny Bird	Easy	Flying	4080	18', '822	Corvisquire	Flying	Raven		Flying		38', '823	Corviknight	Flying/Steel	Raven		Flying		-', '824	Blipbug	Bug	Larva	Easy	Bug	4080	10', '825	Dottler	Bug/Psychic	Radome		Bug		30', '826	Orbeetle	Bug/Psychic	Seven Spot		Bug		-', '827	Nickit	Dark	Fox	Medium	Field	4080	18', '828	Thievul	Dark	Fox		Field		-', '829	Gossifleur	Grass	Flowering	Medium	Grass	5355	20', '830	Eldegoss	Grass	Cotton Bloom		Grass		-', '831	Wooloo	Normal	Sheep	Medium	Field	4080	24', '832	Dubwool	Normal	Sheep		Field		-', '833	Chewtle	Water	Snapping	Medium	Monster/Water 1	5355	22', '834	Drednaw	Water/Rock	Bite		Monster/Water 2		-', '835	Yamper	Electric	Puppy	Medium	Field	5355	25', '836	Boltund	Electric	Dog		Field		-', '837	Rolycoly	Rock	Coal	Hard	Mineral	4080	18', '838	Carkol	Rock/Fire	Coal		Mineral		34', '839	Coalossal	Rock/Fire	Coal		Mineral		-', '840	Applin	Grass/Dragon	Apple Core	Special	Grass/Dragon	5355	-', '841	Flapple	Grass/Dragon	Apple Wing		Grass/Dragon		-', '842	Appletun	Grass/Dragon	Apple Nectar		Grass/Dragon		-', '843	Silicobra	Ground	Sand Snake	Medium	Field/Dragon	5355	36', '844	Sandaconda	Ground	Sand Snake		Field/Dragon		-', '845	Cramorant	Flying/Water	Gulp	Rare	Water 1/Flying	5355	-', '846	Arrokuda	Water	Rush	Medium	Water 2	5355	26', '847	Barraskewda	Water	Skewer		Water 2		-', '848	Toxel	Electric/Poison	Baby	Rare	Undiscovered	6630	30', '849	Toxtricity	Electric/Poison	Punk		Human-Like		-', '850	Sizzlipede	Fire/Bug	Radiator	Hard	Bug	5355	28', '851	Centiskorch	Fire/Bug	Radiator		Bug		-', '852	Clobbopus	Fighting	Tantrum	Medium	Water 1/Human-Like	6630	35', '853	Grapploct	Fighting	Jujitsu		Water 1/Human-Like		-', '854	Sinistea	Ghost	Black Tea	Hard	Mineral/Amorphous	5355	-', '855	Polteageist	Ghost	Black Tea		Mineral/Amorphous		-', '856	Hatenna	Psychic	Calm	Hard	Fairy	5355	32', '857	Hattrem	Psychic	Serene		Fairy		42', '858	Hatterene	Psychic/Fairy	Silent		Fairy		-', '859	Impidimp	Dark/Fairy	Wily	Hard	Fairy/Human-Like	5355	32', '860	Morgrem	Dark/Fairy	Devious		Fairy/Human-Like		42', '861	Grimmsnarl	Dark/Fairy	Bulk Up		Fairy/Human-Like		-', '862	Obstagoon	Dark/Normal	Blocking		Field		-', '863	Perrserker	Steel	Viking		Field		-', '864	Cursola	Ghost	Coral		Water 1/Water 3		-', "865	Sirfetch'd	Fighting	Wild Duck		Flying/Field		-", '866	Mr. Rime	Ice/Psychic	Comedian		Human-Like		-', '867	Runerigus	Ground/Ghost	Grudge		Mineral/Amorphous		-', '868	Milcery	Fairy					', '869	Alcremie	Fairy					', '870	Falinks	Fighting	Formation	Hard	Fairy/Mineral	6630	-', '871	Pincurchin	Electric	Sea Urchin	Medium	Water 1/Amorphous	5355	-', '872	Snom	Ice/Bug	Worm	Easy	Bug	5355	-', '873	Frosmoth	Ice/Bug	Frost Moth		Bug		-', '874	Stonjourner	Rock	Big Rock	Rare	Mineral	6630	-', '875	Eiscue	Ice	Penguin	Hard	Water 1/Field	6630	-', '876	Indeedee	Psychic/Normal	Emotion	Hard	Fairy	10455	-', '877	Morpeko	Electric/Dark	Two-Sided	Medium	Field/Fairy	2805	-', '878	Cufant	Steel	Copperderm	Hard	Field/Mineral	6630	34', '879	Copperajah	Steel	Copperderm		Field/Mineral		-', '880	Dracozolt	Electric/Dragon	Fossil	Special	Undiscovered	7905	-', '881	Arctozolt	Electric/Ice	Fossil	Special	Undiscovered	7905	-', '882	Dracovish	Water/Dragon	Fossil	Special	Undiscovered	7905	-', '883	Arctovish	Water/Ice	Fossil	Special	Undiscovered	7905	-', '884	Duraludon	Steel/Dragon					-', '885	Dreepy	Dragon/Ghost					50', '886	Drakloak	Dragon/Ghost					60', '887	Dragapult	Dragon/Ghost					-', '888	Zacian	Fairy	Warrior	Special	Undiscovered	30855	-', '889	Zamazenta	Fighting	Warrior	Special	Undiscovered	30855	-', '890	Eternatus	Poison/Dragon	Gigantic	Special	Undiscovered	30855	-', '891	Kubfu	Fighting	Wushu	???	???	30855	-', '892	Urshifu (Single Strike)	Fighting/Dark	Wushu	???	???	30855	-', '892	Urshifu (Rapid Strike)	Fighting/Water	Wushu	???	???	30855	-', '893	Zarude	Dark/Grass		???	Undiscovered	30855	-', '894	Regieleki	Electric	Electron	???	Undiscovered	30855	-', '895	Regidrago	Dragon	Dragon Orb	???	Undiscovered	30855	-']
            for(let data of datas) {
                if(data.indexOf(name) >= 0) {
                    var info = data.split("	");
                    if(info[info.length - 1] == looking) {
                        setTimeout(function(){
                            console.log(name)
                            document.location = link;
                        }, ((parseInt(tunnelDelay))+(Math.random()*100)))
                    }
                }
            }
        }
    })
}

function poketunnel3(id, link, looking) {
    var obj = null;
    $.ajax({
        type:"POST",
        url:"includes/ajax/pokedex/view_entry.php",
        data:{
            'pkdxnr':id,
        },
        async: false,
        complete: function(data) {
            data = data.responseText;
            var name = data.split('<span style="font-size: 14pt; font-weight: bold">#')[1].split("</span>")[0];
            name = name.split(" ");
            name.splice(0,1);
            name = name.join(" ");
            console.log(2,name,id,link,looking)

            if(looking == "Weight") {
                var pkWeight = data.split("Weight:</b> ")[1].split("kg<br>")[0];
                pkWeight = parseFloat(pkWeight);
                console.log("Weight: ", pkWeight);
                obj = [pkWeight, link];
            }
            if(looking == "Height") {
                var pkHeight = data.split("Height:</b> ")[1].split("m<br>")[0];
                pkHeight = parseFloat(pkHeight);
                console.log("Height: ", pkHeight);
                obj = [pkHeight, link];
            }
        }
    });
    return obj;
}

function updateDelay() {
    tunnelDelay = $("#delayinput")[0].value
    document.cookie = "tunnelDelay="+tunnelDelay+"; expires=Thu, 18 Dec 2029 12:00:00 UTC;";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}