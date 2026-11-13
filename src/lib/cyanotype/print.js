// The Cyanotype print: every book's colours, the colour maths that sets type on them,
// the brushed coating and the plant photograms. Ported as-is from the approved mockup
// (theme-research-2026-11-12/cyanotype-complete.html); change both together.
/* eslint-disable */

  var B = [
    ["Genesis",50,"The book of","Genesis","Earth","#6E4B32","Adam is made from the ground, and to the ground he returns.","2:7","fig","Ficus carica","FIG","3:7","c. 1400 BC","Wilderness"],
    ["Exodus",40,"The book of","Exodus","Passover blood","#8C1D24","The blood on the doorposts is the sign that saves Israel.","12:13","sprig","Origanum syriacum","HYSSOP","12:22","c. 1400 BC","Sinai"],
    ["Leviticus",27,"The book of","Leviticus","Fine linen","#E8E0CC","Holiness is worn: the priest goes in dressed in white linen.","16:4","cedar","Cedrus libani","CEDAR","14:4","c. 1400 BC","Sinai"],
    ["Numbers",36,"The book of","Numbers","Wilderness sand","#C49A5E","Forty years of camps and marches through the desert.","1:1","flower","Prunus dulcis","ALMOND","17:8","c. 1400 BC","Plains of Moab"],
    ["Deuteronomy",34,"The book of","Deuteronomy","Good-land green","#56702F","Moses describes the green land waiting across the Jordan.","8:7","flower","Punica granatum","POMEGRANATE","8:8","c. 1400 BC","Plains of Moab"],
    ["Joshua",24,"The book of","Joshua","River stone","#74706A","Twelve stones from the Jordan mark the crossing.","4:9","reed","Linum usitatissimum","FLAX","2:6","c. 1370 BC","Canaan"],
    ["Judges",21,"The book of","Judges","Torch fire","#8F3B1B","Torches, burning fields and fire run through its wars.","7:20","grain","Triticum aestivum","WHEAT","6:11","c. 1050 BC","Israel"],
    ["Ruth",4,"The book of","Ruth","Barley gold","#C8A04A","The story runs from the barley harvest to the threshing floor.","1:22","grain","Hordeum vulgare","BARLEY","2:23","c. 1000 BC","Israel"],
    ["1 Samuel",31,"The first book of","Samuel","Anointing oil","#8F8A3C","Samuel pours the horn of oil over Saul, then David.","16:13","sprig","Pistacia palaestina","TEREBINTH","17:2","c. 930 BC","Israel"],
    ["2 Samuel",24,"The second book of","Samuel","Royal purple","#5A2A5C","David reigns as king over all Israel.","5:3","cedar","Cedrus libani","CEDAR","7:2","c. 930 BC","Israel"],
    ["1 Kings",22,"The first book of","Kings","Temple gold","#B3862C","Solomon covers the whole temple in gold.","6:22","frond","Phoenix dactylifera","DATE PALM","6:29","c. 560 BC","Babylon"],
    ["2 Kings",25,"The second book of","Kings","Burnt city","#4B3A33","The kingdom ends with Jerusalem burned.","25:9","fig","Ficus carica","FIG","20:7","c. 560 BC","Babylon"],
    ["1 Chronicles",29,"The first book of","Chronicles","Bronze","#8A5530","David gathers bronze beyond weighing for the temple.","22:3","cedar","Cedrus libani","CEDAR","22:4","c. 430 BC","Jerusalem"],
    ["2 Chronicles",36,"The second book of","Chronicles","Cloud of glory","#C3C9CD","The cloud of glory fills the finished temple.","5:14","flower","Lilium candidum","LILY","4:5","c. 430 BC","Jerusalem"],
    ["Ezra",10,"The book of","Ezra","Foundation stone","#CFC1A2","The returned exiles lay the temple foundation again.","3:10","cedar","Cedrus libani","CEDAR","3:7","c. 440 BC","Jerusalem"],
    ["Nehemiah",13,"The book of","Nehemiah","City wall","#9A7A4C","The whole book is the rebuilding of Jerusalem’s wall.","2:17","sprig","Myrtus communis","MYRTLE","8:15","c. 430 BC","Jerusalem"],
    ["Esther",10,"The book of","Esther","Royal blue","#2A4A8A","Mordecai leaves the king dressed in royal blue and white.","8:15","sprig","Myrtus communis","MYRTLE","2:7","c. 460 BC","Persia"],
    ["Job",42,"The book of","Job","Whirlwind","#3C4550","God answers Job out of the storm.","38:1","reed","Cyperus papyrus","PAPYRUS","8:11","Unknown","Unknown"],
    ["Psalms",150,"The book of","Psalms","Green pastures","#3C6A3E","The shepherd leads to green pastures and still waters.","23:2","sprig","Populus euphratica","WILLOW","137:2","c. 1000–450 BC","Israel"],
    ["Proverbs",31,"The book of","Proverbs","Ruby","#7C1E48","Wisdom is worth more than rubies, and so is a good wife.","3:15","sprig","Malus domestica","APPLE","25:11","c. 950–700 BC","Jerusalem"],
    ["Ecclesiastes",12,"The book of","Ecclesiastes","Vapour","#ABAFAA","Hevel, breath or vapour, is the word the whole book turns on.","1:2","flower","Prunus dulcis","ALMOND","12:5","c. 935 BC","Jerusalem"],
    ["Song of Songs",8,"The","Song of Songs","Rose of Sharon","#B65A70","A love poem set among gardens, vines and blossom.","2:1","flower","Lilium candidum","LILY","2:1","c. 950 BC","Jerusalem"],
    ["Isaiah",66,"The book of","Isaiah","Snow","#E3E8EA","Sins as scarlet are made white as snow.","1:18","cedar","Cedrus libani","CEDAR","2:13","c. 740–680 BC","Jerusalem"],
    ["Jeremiah",52,"The book of","Jeremiah","Potter’s clay","#A5553A","Israel is clay in the potter’s hand.","18:6","flower","Prunus dulcis","ALMOND","1:11","c. 627–580 BC","Jerusalem"],
    ["Lamentations",5,"The","Lamentations","Ashes","#3A3633","Five laments over a city covered in ashes.","3:16","sprig","Artemisia herba-alba","WORMWOOD","3:15","c. 586 BC","Jerusalem"],
    ["Ezekiel",48,"The book of","Ezekiel","Amber fire","#BF7420","The first vision glows like amber in the middle of fire.","1:4","cedar","Cedrus libani","CEDAR","17:22","c. 593–571 BC","Babylon"],
    ["Daniel",12,"The book of","Daniel","Night visions","#282C5A","Dreams and visions in the night, in Babylon.","7:13","sprig","Lens culinaris","LENTIL","1:12","c. 530 BC","Babylon"],
    ["Hosea",14,"The book of","Hosea","Dew","#A8C3B6","God will be like the dew, and Israel will blossom.","14:5","flower","Lilium candidum","LILY","14:5","c. 750 BC","Israel"],
    ["Joel",3,"The book of","Joel","Locust swarm","#6A5D2B","A plague of locusts strips the land bare.","1:4","fig","Ficus carica","FIG","1:7","Unknown","Judah"],
    ["Amos",9,"The book of","Amos","Rolling waters","#2E6A6C","Let justice roll on like rivers.","5:24","fig","Ficus sycomorus","SYCAMORE FIG","7:14","c. 760 BC","Bethel"],
    ["Obadiah",1,"The book of","Obadiah","Edom sandstone","#B26B5C","Edom, whose name means red, lives in the clefts of the rock.","1:3","none","","","","c. 586 BC","Judah"],
    ["Jonah",4,"The book of","Jonah","The deep","#1E4C5E","Jonah is thrown into the heart of the sea.","2:3","fig","Ricinus communis","CASTOR VINE","4:6","c. 760 BC","Israel"],
    ["Micah",7,"The book of","Micah","Mountain sage","#7B8A69","The mountain of the Lord, where each sits under his vine.","4:1","fig","Vitis vinifera","VINE","4:4","c. 735 BC","Judah"],
    ["Nahum",3,"The book of","Nahum","Scarlet shields","#B0262F","Nineveh falls to soldiers in scarlet behind red shields.","2:3","none","","","","c. 650 BC","Judah"],
    ["Habakkuk",3,"The book of","Habakkuk","Watchtower dusk","#6C6386","The prophet waits on the watchtower for an answer.","2:1","fig","Ficus carica","FIG","3:17","c. 605 BC","Judah"],
    ["Zephaniah",3,"The book of","Zephaniah","Smoke","#4C4956","A day of clouds and thick darkness.","1:15","none","","","","c. 630 BC","Judah"],
    ["Haggai",2,"The book of","Haggai","Silver","#9BA1A7","The silver is mine and the gold is mine, says the Lord.","2:8","sprig","Olea europaea","OLIVE","2:19","520 BC","Jerusalem"],
    ["Zechariah",14,"The book of","Zechariah","Myrtle shade","#3C5D4A","A rider stands among the myrtle trees in the hollow.","1:8","sprig","Myrtus communis","MYRTLE","1:8","c. 520–480 BC","Jerusalem"],
    ["Malachi",4,"The book of","Malachi","Sunrise","#D07B57","The sun of righteousness rises with healing.","4:2","none","","","","c. 430 BC","Jerusalem"],
    ["Matthew",28,"The good news according to","Matthew","Mustard","#B39A2C","The kingdom grows from the smallest seed.","13:31","flower","Brassica nigra","MUSTARD","13:31","c. AD 60–80","Unknown"],
    ["Mark",16,"The good news according to","Mark","Galilee","#2D6688","Most of the book happens on and around the Sea of Galilee.","4:39","fig","Ficus carica","FIG","11:13","c. AD 60s","Rome"],
    ["Luke",24,"The good news according to","Luke","Manger straw","#CDB37E","Only Luke tells of the child laid in a manger.","2:7","flower","Anemone coronaria","FIELD LILY","12:27","c. AD 60–80","Unknown"],
    ["John",21,"The good news according to","John","Lamplight","#E0C066","The light shines in the darkness.","1:5","fig","Vitis vinifera","VINE","15:5","c. AD 90s","Ephesus"],
    ["Acts",28,"The","Acts","Tongues of fire","#D2652E","The Spirit comes as tongues of fire.","2:3","none","","","","c. AD 62–80","Rome"],
    ["Romans",16,"The letter of Paul to the","Romans","Olive","#5E6B3B","Gentiles are grafted into the olive tree.","11:17","sprig","Olea europaea","OLIVE","11:17","AD 56–57","Corinth"],
    ["1 Corinthians",16,"The first letter of Paul to the","Corinthians","Sounding brass","#A88B3E","Without love I am sounding brass.","13:1","grain","Triticum aestivum","WHEAT","15:37","AD 54–55","Ephesus"],
    ["2 Corinthians",13,"The second letter of Paul to the","Corinthians","Clay jar","#B9845F","Treasure held in jars of clay.","4:7","none","","","","AD 55–56","Macedonia"],
    ["Galatians",6,"The letter of Paul to the","Galatians","Fruit of the Spirit","#7A3E5E","Love, joy and peace are the fruit of the Spirit.","5:22","none","","","","AD 48–55","Unknown"],
    ["Ephesians",6,"The letter of Paul to the","Ephesians","Armour","#5C6670","Put on the whole armour of God.","6:11","none","","","","AD 60–62","Rome"],
    ["Philippians",4,"The letter of Paul to the","Philippians","Heaven blue","#6E92B8","Our citizenship is in heaven.","3:20","none","","","","AD 60–62","Rome"],
    ["Colossians",4,"The letter of Paul to the","Colossians","Rooted","#7A5C48","Rooted and built up in him.","2:7","none","","","","AD 60–62","Rome"],
    ["1 Thessalonians",5,"The first letter of Paul to the","Thessalonians","Clouds","#9CA9BA","Caught up together in the clouds.","4:17","none","","","","AD 50–51","Corinth"],
    ["2 Thessalonians",3,"The second letter of Paul to the","Thessalonians","Flaming fire","#A8322A","The Lord is revealed from heaven in flaming fire.","1:8","none","","","","AD 51","Corinth"],
    ["1 Timothy",6,"The first letter of Paul to","Timothy","Marble pillar","#BDB7AE","The church is the pillar and foundation of the truth.","3:15","none","","","","AD 62–64","Macedonia"],
    ["2 Timothy",4,"The second letter of Paul to","Timothy","Parchment","#D6C39A","Bring the cloak, the books, and above all the parchments.","4:13","none","","","","AD 64–67","Rome"],
    ["Titus",3,"The letter of Paul to","Titus","Clear water","#7FA8B0","Saved through the washing of new birth.","3:5","none","","","","AD 62–64","Macedonia"],
    ["Philemon",1,"The letter of Paul to","Philemon","Heart","#9A3F4E","Refresh my heart in Christ.","1:20","none","","","","AD 60–62","Rome"],
    ["Hebrews",13,"The letter to the","Hebrews","Veil","#4B3F7A","A new and living way, opened through the veil.","10:20","flower","Prunus dulcis","ALMOND","9:4","c. AD 60s","Unknown"],
    ["James",5,"The letter of","James","Rain","#607C8C","The farmer waits for the early and late rain.","5:7","flower","Anemone coronaria","WILD FLOWER","1:10","c. AD 45–50","Jerusalem"],
    ["1 Peter",5,"The first letter of","Peter","Living stone","#8A8478","You are living stones, built into a spiritual house.","2:5","reed","Poaceae","GRASS","1:24","c. AD 62–64","Rome"],
    ["2 Peter",3,"The second letter of","Peter","Morning star","#8EA0C4","Until the day dawns and the morning star rises.","1:19","none","","","","c. AD 64–68","Rome"],
    ["1 John",5,"The first letter of","John","Pure light","#EFE6C6","God is light, and in him is no darkness at all.","1:5","none","","","","c. AD 85–95","Ephesus"],
    ["2 John",1,"The second letter of","John","Ink","#23262E","I would rather not write with paper and ink.","1:12","none","","","","c. AD 85–95","Ephesus"],
    ["3 John",1,"The third letter of","John","Reed pen","#8C7A55","I would rather not write to you with pen and ink.","1:13","none","","","","c. AD 85–95","Ephesus"],
    ["Jude",1,"The letter of","Jude","Sea foam","#5E7A72","Wild waves of the sea, foaming out their shame.","1:13","none","","","","c. AD 65–80","Unknown"],
    ["Revelation",22,"The","Revelation","Emerald","#1E6A55","A rainbow like an emerald circles the throne.","4:3","sprig","Arbor vitae","TREE OF LIFE","22:2","c. AD 95","Patmos"]
  ];
  // Second colour for each book: [name, colour, verse]
  var S = [["Eden green","#4F7A3A","2:8"],["Pillar of fire","#E08A2E","13:21"],["Scarlet thread","#B0262F","14:4"],["Bronze serpent","#A8743A","21:9"],["Milk and honey","#E0B34A","6:3"],
["Scarlet cord","#B32631","2:18"],["Dew on the fleece","#DCE6E2","6:37"],["Threshing-floor night","#2B2F4F","3:2"],["Shepherd’s field","#6E8A4A","16:11"],["Gold crown","#D0A43A","12:30"],
["Fire from heaven","#E0742A","18:38"],["Chariot of fire","#D9662A","2:11"],["Fine linen","#ECE5D2","15:27"],["Altar fire","#D9572A","7:1"],["Silver vessels","#B9BEC4","1:10"],
["Booth branches","#5C8A4A","8:15"],["White linen","#EEEDE6","8:15"],["Morning stars","#E8D9A0","38:7"],["Still waters","#4C88A8","23:2"],["Gold","#CFA23F","3:14"],
["Sun","#E6B84A","1:3"],["Pomegranate","#A8343F","4:3"],["Crimson","#9E1B34","1:18"],["Almond blossom","#F1D9DC","1:11"],["Tears","#8FA3B5","2:11"],
["Sapphire throne","#2E4FA0","1:26"],["Furnace fire","#E2672A","3:19"],["New wine","#6E1F3A","2:8"],["Blood moon","#8E2A24","2:31"],["Summer fruit","#D69A3A","8:1"],
["Nest among the stars","#252A4A","1:4"],["Gourd vine","#6E9A3E","4:6"],["Vine","#5E8A3C","4:4"],["Flood waters","#3E6E8A","1:8"],["Glory over the sea","#3E7AA0","2:14"],
["Searching lamps","#D9A845","1:12"],["Signet gold","#B88A2E","2:23"],["Golden lampstand","#D9B24A","4:2"],["Refiner’s silver","#C3C8CE","3:3"],["Scarlet robe","#9E1F2E","27:28"],
["Dove white","#EDEDE8","1:10"],["Glory in the night","#E6C35A","2:9"],["Darkness","#1E2036","1:5"],["Open sea","#2F5E86","27:14"],["Daybreak","#E8C37A","13:12"],
["Dim mirror","#5A5F66","13:12"],["Light out of darkness","#F0D98A","4:6"],["Harvest","#B98A2E","6:9"],["Children of light","#F0DC9A","5:8"],["Shining stars","#F2E6B0","2:15"],
["Salt","#E7E4DC","4:6"],["Trumpet brass","#C49A45","4:16"],["Steadfast blue","#4F78A8","3:5"],["Pearl","#EDE7DA","2:9"],["Wool cloak","#7A5A3E","4:13"],
["Grace at dawn","#F0C27A","2:11"],["Prison iron","#4F545A","1:9"],["Cloud of witnesses","#CDD3DA","12:1"],["Field flower","#8A6AB0","1:10"],["Gold refined by fire","#D4A63A","1:7"],
["Fire of the last day","#D2552A","3:10"],["Love","#B33A4A","4:8"],["Paper","#EEE7D4","1:12"],["Ink","#22252E","1:13"],["Wandering stars","#1E2238","1:13"],["City gold","#E2B84A","21:18"]];
  // Seven books in Catholic Bibles (ids 66–72), same fields as above.
  B.push(
    ["Tobit",14,"The book of","Tobit","Tigris water","#3F7068","Tobias and the angel travel by the Tigris, where the fish leaps out.","6:2","none","","","","c. 200 BC","Unknown"],
    ["Judith",16,"The book of","Judith","Sackcloth","#5A4E40","A widow in sackcloth puts it off to save her city.","8:5","none","","","","c. 150–100 BC","Judea"],
    ["Wisdom",19,"The book of","Wisdom","Spotless mirror","#AEB6BE","Wisdom is a spotless mirror of God’s working.","7:26","none","","","","c. 50 BC","Alexandria"],
    ["Sirach",51,"The wisdom of","Sirach","Cedar of Lebanon","#3E5A3C","Wisdom grows tall like a cedar on Lebanon.","24:13","cedar","Cedrus libani","CEDAR","24:13","c. 180 BC","Jerusalem"],
    ["Baruch",6,"The book of","Baruch","Mourning grey","#5C5A60","Jerusalem is told to take off its garment of mourning.","5:1","none","","","","c. 150 BC","Unknown"],
    ["1 Maccabees",16,"The first book of","Maccabees","Bronze shields","#8A5E30","Sunlight flashes on shields of gold and bronze.","6:39","frond","Phoenix dactylifera","PALM","13:51","c. 100 BC","Judea"],
    ["2 Maccabees",15,"The second book of","Maccabees","Riders in the sky","#5A6E9A","Horsemen in gold are seen racing through the air.","5:2","none","","","","c. 124 BC","Unknown"]);
  S.push(["Sight restored","#F0E2B0","11:13"], ["Festal gold","#D2A64A","10:4"], ["Eternal light","#F1D98A","7:26"], ["Rose of Jericho","#B85A6A","24:14"], ["Robe of glory","#D8B14A","5:1"], ["Temple lamps","#E8C35A","4:50"], ["Hidden fire","#E06A2A","1:22"]);
  var DRN = { 5: ["Josue", "The book of", "Josue"], 8: ["1 Kings", "The first book of", "Kings"], 9: ["2 Kings", "The second book of", "Kings"], 10: ["3 Kings", "The third book of", "Kings"], 11: ["4 Kings", "The fourth book of", "Kings"],
    12: ["1 Paralipomenon", "The first book of", "Paralipomenon"], 13: ["2 Paralipomenon", "The second book of", "Paralipomenon"], 14: ["1 Esdras", "The first book of", "Esdras"], 15: ["2 Esdras", "The second book of", "Esdras"],
    66: ["Tobias", "The book of", "Tobias"], 69: ["Ecclesiasticus", "The book of", "Ecclesiasticus"], 21: ["Canticle of Canticles", "The", "Canticle of Canticles"], 22: ["Isaias", "The book of", "Isaias"], 23: ["Jeremias", "The book of", "Jeremias"],
    25: ["Ezechiel", "The book of", "Ezechiel"], 27: ["Osee", "The book of", "Osee"], 30: ["Abdias", "The book of", "Abdias"], 31: ["Jonas", "The book of", "Jonas"], 32: ["Micheas", "The book of", "Micheas"], 34: ["Habacuc", "The book of", "Habacuc"],
    35: ["Sophonias", "The book of", "Sophonias"], 36: ["Aggeus", "The book of", "Aggeus"], 37: ["Zacharias", "The book of", "Zacharias"], 38: ["Malachias", "The book of", "Malachias"], 71: ["1 Machabees", "The first book of", "Machabees"], 72: ["2 Machabees", "The second book of", "Machabees"], 65: ["Apocalypse", "The", "Apocalypse"] };
  var T3 = { 0: ["Light", "#F1E3A6", "1:3"], 1: ["Tabernacle blue", "#2C4A9A", "25:4"], 2: ["Hyssop green", "#6E8A4E", "14:4"], 16: ["Purple robe", "#5E2A6E", "8:15"],
    21: ["Vineyard green", "#5E7A3A", "2:15"], 22: ["Live coal", "#E2702A", "6:6"], 25: ["Beryl wheels", "#7FB6A8", "1:16"], 26: ["Golden image", "#D4A63A", "3:1"],
    37: ["Red horse", "#9E2E24", "1:8"], 65: ["Crystal river", "#9FD0E0", "22:1"] };
  function third(i) { return T3[i] || null; }
  var SEC = {}, IDX = {}; B.forEach(function (b, i) { SEC[b[5]] = S[i][1]; IDX[b[5]] = i; });
  /* ── colour maths ── */
  function hex2(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function toHex(c) { return '#' + c.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join('').toUpperCase(); }
  function lum(c) { var a = c.map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]; }
  function ratio(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function rgb2hsl(c) { var r = c[0] / 255, g = c[1] / 255, b = c[2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), h = 0, s = 0, l = (mx + mn) / 2, d = mx - mn;
    if (d) { s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [h, s, l]; }
  function hsl2rgb(h, s, l) { h = ((h % 360) + 360) % 360 / 360; function f(p, q, t) { if (t < 0) t += 1; if (t > 1) t -= 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; }
    if (!s) return [l * 255, l * 255, l * 255]; var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q; return [f(p, q, h + 1 / 3) * 255, f(p, q, h) * 255, f(p, q, h - 1 / 3) * 255]; }
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function rgba(c, a) { return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + a + ')'; }

  // Middle tones can't carry readable type, so the printed coating is nudged darker or lighter, keeping its hue.
  function printed(hex) {
    var c = hex2(hex), L = lum(c), hsl = rgb2hsl(c), l = hsl[2], out = c, n = 0;
    if (L > 0.13 && L < 0.2) { while (lum(out) > 0.13 && n++ < 80) { l -= 0.01; out = hsl2rgb(hsl[0], hsl[1], l); } }
    else if (L >= 0.2 && L < 0.3) { while (lum(out) < 0.3 && n++ < 80) { l += 0.01; out = hsl2rgb(hsl[0], hsl[1], l); } }
    return out.map(Math.round);
  }
  // Dark mode: every coating deepened (hue kept, a little more saturation) until light type reads at 9 to 1 or better.
  function deep(hex) {
    var hsl = rgb2hsl(hex2(hex)), l = hsl[2], s = Math.min(1, hsl[1] < 0.12 ? hsl[1] : hsl[1] * 1.15), out = hsl2rgb(hsl[0], s, l), n = 0;
    while (lum(out) > 0.065 && n++ < 100) { l -= 0.01; out = hsl2rgb(hsl[0], s, l); }
    return out.map(Math.round);
  }
  function paperFor(hex, mode) { return mode === 'night' ? mix(hex2(hex), [19, 18, 17], 0.94).map(Math.round) : mix(hex2(hex), [248, 246, 241], 0.9).map(Math.round); }
  function coatFor(hex) { return hex2(hex); } // the book's true colour, in both modes
  // Type colours for a background, from the book's hue. Light type on dark, dark type on light; highlight = opposite hue.
  function derive(hex, bg) {
    var hsl = rgb2hsl(hex2(hex)), h = hsl[0], s = hsl[1], dark = ratio([255, 255, 255], bg) >= ratio([0, 0, 0], bg), ch = s < 0.12 ? 42 : h + 180;
    function solve(hh, ss, L, target, dir) { var c, r; for (var i = 0; i < 90; i++) { c = hsl2rgb(hh, ss, L); r = ratio(c, bg); if (r >= target) break; L += dir * 0.01; if (L > 1 || L < 0) { L = Math.max(0, Math.min(1, L)); c = hsl2rgb(hh, ss, L); r = ratio(c, bg); break; } } return { c: c.map(Math.round), r: r }; }
    var o = dark
      ? { ink: solve(h, Math.min(s, 0.45) * 0.55, 0.9, 7, 1), ash: solve(h, Math.min(s, 0.5) * 0.55, 0.72, 4.5, 1), dim: solve(h, Math.min(s, 0.5) * 0.45, 0.6, 3, 1), hi: solve(ch, 0.8, 0.72, 4.5, 1) }
      : { ink: solve(h, Math.min(s, 0.6) * 0.75, 0.22, 7, -1), ash: solve(h, Math.min(s, 0.5) * 0.6, 0.38, 4.5, -1), dim: solve(h, 0.3, 0.46, 3, -1), hi: solve(ch, 0.75, 0.38, 4.5, -1) };
    var bi = IDX[hex], t3 = third(bi); if (t3) { var h3 = rgb2hsl(hex2(t3[1])); o.nav = solve(h3[0], h3[1], h3[2], 4.5, dark ? 1 : -1); }
    var sec = SEC[hex]; if (sec) { var h2 = rgb2hsl(hex2(sec)); o.hi = solve(h2[0], h2[1], h2[2], 4.5, dark ? 1 : -1); o.pl = solve(h2[0], h2[1], h2[2], 3, dark ? 1 : -1); } else o.pl = o.ink;
    if (!o.nav) o.nav = o.hi;
    o.dark = dark; return o;
  }

  /* ── brushed coating, in any colour ── */
  function RNG(s) { return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; }
  function coat(cv, W, H, seed, inset, base) {
    cv.width = W; cv.height = H; var k = cv.getContext('2d'), rnd = RNG(seed), dk = mix(base, [0, 0, 0], 0.4), lt = mix(base, [255, 255, 255], 0.35);
    k.fillStyle = '#EFECE3'; k.fillRect(0, 0, W, H); k.lineCap = 'butt';
    for (var pass = 0; pass < 3; pass++) for (var y = inset.t; y < H - inset.b; y += 5 + rnd() * 3) {
      var x0 = inset.l + (rnd() - 0.2) * Math.min(60, W * 0.06), x1 = W - inset.r - (rnd() - 0.2) * Math.min(60, W * 0.06), j = (rnd() - 0.5) * 0.18;
      k.strokeStyle = rgba(j < 0 ? mix(base, [0, 0, 0], -j) : mix(base, [255, 255, 255], j), 0.55 + rnd() * 0.25); k.lineWidth = 10 + rnd() * 12;
      k.beginPath(); k.moveTo(x0, y); k.bezierCurveTo(x0 + (x1 - x0) * 0.3, y + (rnd() - 0.5) * 6, x0 + (x1 - x0) * 0.7, y + (rnd() - 0.5) * 6, x1, y + (rnd() - 0.5) * 4); k.stroke();
    }
    var area = W * H / 1024000;
    for (var n = 0; n < 900 * area; n++) { var sy = inset.t + rnd() * (H - inset.t - inset.b), sx = inset.l + rnd() * (W - inset.l - inset.r) * 0.8, L = 40 + rnd() * 260; k.strokeStyle = rnd() < 0.5 ? rgba(dk, 0.08) : rgba(lt, 0.08); k.lineWidth = 0.6 + rnd() * 1.4; k.beginPath(); k.moveTo(sx, sy); k.lineTo(Math.min(sx + L, W - inset.r), sy + (rnd() - 0.5) * 2); k.stroke(); }
    k.save(); k.beginPath(); k.rect(inset.l, inset.t, W - inset.l - inset.r, H - inset.t - inset.b); k.clip();
    for (var m = 0; m < Math.max(5, 26 * area); m++) { var mx = rnd() * W, my = rnd() * H, r = (60 + rnd() * 220) * Math.min(1, Math.sqrt(area) * 1.4), g = k.createRadialGradient(mx, my, 0, mx, my, r), deep = rnd() < 0.6; g.addColorStop(0, deep ? rgba(dk, 0.12) : rgba(lt, 0.12)); g.addColorStop(1, 'rgba(0,0,0,0)'); k.fillStyle = g; k.fillRect(0, 0, W, H); }
    k.restore();
    for (var s = 0; s < 140 * Math.max(area, 0.15); s++) { k.fillStyle = 'rgba(240,238,230,' + (0.15 + rnd() * 0.35) + ')'; k.beginPath(); k.arc(inset.l + rnd() * (W - inset.l - inset.r), inset.t + rnd() * (H - inset.t - inset.b), 0.5 + rnd() * 1.2, 0, 6.29); k.fill(); }
  }
  function average(cv, x, y, w, h) { var d = cv.getContext('2d').getImageData(x, y, w, h).data, t = [0, 0, 0], n = 0; for (var i = 0; i < d.length; i += 16) { t[0] += d[i]; t[1] += d[i + 1]; t[2] += d[i + 2]; n++; } return t.map(function (v) { return Math.round(v / n); }); }

  /* ── photograms: every plate drawn at 680×510 ── */
  function bez(t, a, b, c, d) { var u = 1 - t; return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d; }
  function bp(P, t) { return [bez(t, P[0][0], P[1][0], P[2][0], P[3][0]), bez(t, P[0][1], P[1][1], P[2][1], P[3][1])]; }
  function stem(k, P, w) { k.lineWidth = w; k.beginPath(); for (var t = 0; t <= 1.001; t += 0.02) { var p = bp(P, t); t ? k.lineTo(p[0], p[1]) : k.moveTo(p[0], p[1]); } k.stroke(); }
  function leaf(k, x, y, ang, len, w) { k.save(); k.translate(x, y); k.rotate(ang); k.beginPath(); k.moveTo(0, 0); k.quadraticCurveTo(len * 0.42, -w, len, 0); k.quadraticCurveTo(len * 0.42, w, 0, 0); k.fill(); k.restore(); }
  var PLANT = {
    sprig: function (k, rnd, b) {
      var P = [[40, 480], [230, 370], [420, 230], [660, 60]], big = /Myrtus|Lens|Malus|Pistacia/.test(b[9]), L = big ? 46 : 70, Wd = big ? 13 : 9;
      k.globalAlpha = 0.9; stem(k, P, 6);
      for (var n = 0; n < 28; n++) { var t = 0.05 + n * 0.033, p = bp(P, t), q = bp(P, t + 0.01), dir = Math.atan2(q[1] - p[1], q[0] - p[0]), side = n % 2 ? 1 : -1; k.globalAlpha = 0.42 + rnd() * 0.3; leaf(k, p[0], p[1], dir + side * (0.5 + rnd() * 0.4), L + rnd() * 34 - n * 0.4, Wd + rnd() * 4); }
      k.globalAlpha = 0.7; leaf(k, 660, 60, -0.62, L * 0.8, Wd);
      if (/Olea|Malus|Myrtus/.test(b[9])) for (var o = 0; o < 5; o++) { var pp = bp(P, 0.26 + o * 0.11); k.globalAlpha = 0.55; k.beginPath(); k.ellipse(pp[0] + 12, pp[1] + 20, /Malus/.test(b[9]) ? 18 : 10, /Malus/.test(b[9]) ? 18 : 14, 0.4, 0, 6.29); k.fill(); }
    },
    grain: function (k, rnd) {
      k.save(); k.translate(60, -10); k.scale(1.27, 1.27); k.lineCap = 'round';
      [[150, 400, 230, 40, -0.2], [230, 400, 330, 70, 0.15], [300, 400, 400, 150, 0.45]].forEach(function (s, si) {
        var bx = s[0], by = s[1], tx = s[2], ty = s[3], cx = (bx + tx) / 2 + 30, cy = (by + ty) / 2;
        k.globalAlpha = 0.85; k.lineWidth = 3; k.beginPath(); k.moveTo(bx, by); k.quadraticCurveTo(cx, cy, tx, ty); k.stroke();
        k.globalAlpha = 0.4; k.save(); k.translate(bx + (cx - bx) * 0.5, by + (cy - by) * 0.6); k.rotate(-1.1 + si * 0.3); k.beginPath(); k.moveTo(0, 0); k.quadraticCurveTo(60, -10, 150, -40); k.quadraticCurveTo(60, 4, 0, 0); k.fill(); k.restore();
        var ang = Math.atan2(ty - cy, tx - cx);
        for (var g = 0; g < 16; g++) { var u = g / 16, gx = tx - Math.cos(ang) * (120 - u * 120), gy = ty - Math.sin(ang) * (120 - u * 120), side = g % 2 ? 1 : -1, a = ang + side * 0.42;
          k.globalAlpha = 0.6 + rnd() * 0.25; k.beginPath(); k.ellipse(gx + Math.cos(a) * 6, gy + Math.sin(a) * 6, 4, 9, a + Math.PI / 2, 0, 6.29); k.fill();
          k.globalAlpha = 0.5; k.lineWidth = 1; k.beginPath(); k.moveTo(gx + Math.cos(a) * 10, gy + Math.sin(a) * 10); k.lineTo(gx + Math.cos(ang + side * 0.16) * 95, gy + Math.sin(ang + side * 0.16) * 95); k.stroke(); }
      }); k.restore();
    },
    fig: function (k, rnd, b) {
      var lobes = /Vitis|Ricinus/.test(b[9]) ? (/Ricinus/.test(b[9]) ? 7 : 5) : 5, deep = /Ricinus/.test(b[9]) ? 0.55 : 0.4;
      [[250, 300, 150, -0.5], [450, 210, 165, 0.35], [400, 400, 120, 1.1]].forEach(function (f) {
        k.save(); k.translate(f[0], f[1]); k.rotate(f[3]); k.globalAlpha = 0.5 + rnd() * 0.15; k.beginPath();
        for (var a = 0; a <= 6.30; a += 0.04) { var r = f[2] * (1 - deep + deep * Math.pow(Math.abs(Math.cos(a * lobes / 2)), 0.7)) * (a > 4.2 && a < 5.2 ? 0.6 : 1); k.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
        k.closePath(); k.fill(); k.restore();
      });
      k.globalAlpha = 0.85; k.lineCap = 'round'; k.lineWidth = 5; k.beginPath(); k.moveTo(330, 500); k.quadraticCurveTo(320, 380, 300, 330); k.moveTo(330, 500); k.quadraticCurveTo(400, 330, 440, 260); k.stroke();
      if (/Vitis/.test(b[9])) { k.lineWidth = 2; k.beginPath(); for (var t = 0; t < 30; t++) { var a2 = t * 0.5, r2 = 40 - t; k.lineTo(560 + Math.cos(a2) * r2, 120 + t * 4 + Math.sin(a2) * r2); } k.stroke(); }
      else { k.globalAlpha = 0.6; for (var i = 0; i < 3; i++) { k.beginPath(); k.ellipse(560 + i * 30, 380 + i * 22, 20, 26, 0.3, 0, 6.29); k.fill(); } }
    },
    cedar: function (k, rnd) {
      var P = [[60, 480], [240, 380], [430, 220], [640, 70]]; k.globalAlpha = 0.9; k.lineCap = 'round'; stem(k, P, 6);
      for (var n = 0; n < 9; n++) { var p = bp(P, 0.1 + n * 0.1), side = n % 2 ? 1 : -1, ang = -0.65 + side * 1.0, len = 150 - n * 8;
        k.globalAlpha = 0.75; k.lineWidth = 3; k.beginPath(); k.moveTo(p[0], p[1]); var ex = p[0] + Math.cos(ang) * len, ey = p[1] + Math.sin(ang) * len; k.lineTo(ex, ey); k.stroke();
        for (var t = 0.2; t <= 1; t += 0.16) { var x = p[0] + (ex - p[0]) * t, y = p[1] + (ey - p[1]) * t; k.globalAlpha = 0.35 + rnd() * 0.25; k.lineWidth = 1.4;
          for (var q = 0; q < 14; q++) { var a = rnd() * 6.29, r = 10 + rnd() * 12; k.beginPath(); k.moveTo(x, y); k.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); k.stroke(); } }
      }
      k.globalAlpha = 0.6; k.beginPath(); k.ellipse(600, 150, 26, 40, 0.2, 0, 6.29); k.fill();
    },
    flower: function (k, rnd, b) {
      var lily = /Lilium|Anemone/.test(b[9]), petals = lily ? 6 : 5, small = /Brassica/.test(b[9]);
      k.lineCap = 'round'; k.globalAlpha = 0.85;
      var stems = [[[300, 510], [300, 380], [340, 250], [380, 150]], [[300, 510], [260, 400], [200, 320], [170, 260]]];
      stems.forEach(function (P) { stem(k, P, 4); });
      for (var l = 0; l < 4; l++) { var p = bp(stems[0], 0.15 + l * 0.15); k.globalAlpha = 0.4; leaf(k, p[0], p[1], (l % 2 ? -0.3 : -2.6) + rnd() * 0.3, lily ? 130 : 80, lily ? 10 : 16); }
      [[380, 150, small ? 34 : 80], [170, 260, small ? 26 : 60]].forEach(function (f) {
        if (small) { for (var c = 0; c < 9; c++) { k.globalAlpha = 0.6; k.beginPath(); k.arc(f[0] + (rnd() - 0.5) * 60, f[1] + (rnd() - 0.5) * 60, 9, 0, 6.29); k.fill(); } return; }
        for (var i = 0; i < petals; i++) { k.globalAlpha = 0.45 + rnd() * 0.15; leaf(k, f[0], f[1], i * 6.283 / petals + rnd() * 0.2, f[2], lily ? f[2] * 0.2 : f[2] * 0.38); }
        k.globalAlpha = 0.8; k.lineWidth = 1.2; for (var s = 0; s < 6; s++) { var a = s * 1.05 + 0.3; k.beginPath(); k.moveTo(f[0], f[1]); k.lineTo(f[0] + Math.cos(a) * f[2] * 0.55, f[1] + Math.sin(a) * f[2] * 0.55); k.stroke(); k.beginPath(); k.arc(f[0] + Math.cos(a) * f[2] * 0.58, f[1] + Math.sin(a) * f[2] * 0.58, 4, 0, 6.29); k.fill(); }
      });
    },
    frond: function (k, rnd) {
      var P = [[40, 500], [180, 260], [420, 90], [660, 120]]; k.lineCap = 'round'; k.globalAlpha = 0.9; stem(k, P, 6);
      for (var n = 0; n < 46; n++) { var t = 0.1 + n * 0.019, p = bp(P, t), q = bp(P, t + 0.01), dir = Math.atan2(q[1] - p[1], q[0] - p[0]), side = n % 2 ? 1 : -1; k.globalAlpha = 0.38 + rnd() * 0.25; leaf(k, p[0], p[1], dir + side * 0.75, 150 - Math.abs(n - 20) * 2.4, 6); }
    },
    reed: function (k, rnd, b) {
      var pap = /Cyperus/.test(b[9]); k.lineCap = 'round';
      for (var i = 0; i < 8; i++) { var x = 220 + i * 34, bend = (rnd() - 0.3) * 160, top = 60 + rnd() * 120; k.globalAlpha = 0.4 + rnd() * 0.2;
        k.beginPath(); k.moveTo(x - 6, 510); k.quadraticCurveTo(x + bend * 0.5, 300, x + bend, top); k.quadraticCurveTo(x + bend * 0.5 + 4, 300, x + 6, 510); k.fill();
        if ((pap && i % 3 === 1) || (!pap && i % 2)) { k.globalAlpha = 0.6; k.lineWidth = 1.2;
          for (var r = 0; r < (pap ? 26 : 10); r++) { var a = -Math.PI / 2 + (r / (pap ? 25 : 9) - 0.5) * (pap ? 2.6 : 1.2), len = pap ? 70 + rnd() * 30 : 30 + rnd() * 20; k.beginPath(); k.moveTo(x + bend, top); k.lineTo(x + bend + Math.cos(a) * len, top + Math.sin(a) * len); k.stroke(); if (!pap) { k.beginPath(); k.ellipse(x + bend + Math.cos(a) * len, top + Math.sin(a) * len, 3, 7, a + 1.57, 0, 6.29); k.fill(); } } }
      }
    }
  };
  function plate(cv, b, ink, glow, seed) { cv.width = 680; cv.height = 510; var k = cv.getContext('2d'); k.shadowColor = glow; k.shadowBlur = 14; k.fillStyle = ink; k.strokeStyle = ink; PLANT[b[8]](k, RNG(seed), b); }
  var ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split(' '), TENS = ',,twenty,thirty,forty,fifty,sixty,seventy,eighty,ninety'.split(',');
  function words(n) { if (n < 20) return ONES[n]; if (n < 100) return TENS[n / 10 | 0] + (n % 10 ? '-' + ONES[n % 10] : ''); return 'one hundred' + (n % 100 ? ' and ' + words(n % 100) : ''); }
  function roman(n) { var v = [[50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']], s = ''; v.forEach(function (p) { while (n >= p[0]) { s += p[1]; n -= p[0]; } }); return s; }
  var EC = {"e": {"0": [[18, 3053, 469], [22, 2105, 241], [57, 1767, 218], [39, 1512, 306], [44, 1450, 186], [1, 1315, 286], [43, 1222, 255], [41, 1218, 271], [42, 1169, 163], [4, 1038, 211]], "1": [[4, 3245, 396], [18, 2944, 394], [3, 1373, 329], [2, 1291, 316], [0, 1208, 251], [57, 1088, 235], [22, 1073, 181], [65, 955, 166], [39, 887, 209], [43, 777, 184]], "2": [[1, 1469, 413], [4, 1083, 222], [57, 729, 224], [3, 701, 202], [25, 517, 131], [39, 471, 142], [44, 470, 148], [22, 433, 143], [18, 378, 119], [41, 340, 98]], "3": [[1, 1760, 543], [4, 1250, 317], [18, 1152, 224], [2, 1045, 342], [0, 871, 277], [57, 588, 155], [5, 556, 168], [22, 470, 116], [39, 442, 139], [42, 407, 97]], "4": [[1, 2955, 437], [18, 2583, 356], [22, 1735, 222], [2, 1192, 223], [3, 1103, 308], [5, 1075, 190], [23, 1066, 182], [39, 1060, 203], [41, 1033, 172], [0, 998, 205]], "5": [[4, 3186, 290], [18, 1477, 107], [1, 1118, 175], [3, 822, 256], [0, 795, 190], [2, 725, 32], [44, 540, 38], [39, 474, 75], [6, 438, 141], [10, 384, 57]], "6": [[5, 660, 197], [0, 621, 192], [18, 586, 177], [8, 571, 173], [4, 528, 154], [1, 337, 86], [3, 317, 97], [19, 283, 99], [22, 266, 79], [39, 215, 87]], "7": [[18, 276, 36], [0, 181, 40], [39, 142, 36], [19, 115, 19], [4, 104, 25], [41, 97, 25], [9, 80, 9], [8, 70, 16], [57, 63, 14], [53, 58, 7]], "8": [[18, 1826, 293], [39, 1291, 143], [19, 1006, 115], [41, 856, 119], [9, 791, 204], [0, 778, 222], [22, 768, 108], [4, 737, 110], [6, 706, 210], [5, 661, 156]], "9": [[18, 1395, 318], [8, 1245, 347], [12, 930, 228], [0, 601, 201], [10, 515, 148], [39, 414, 126], [19, 356, 108], [22, 355, 97], [6, 335, 110], [4, 335, 96]], "10": [[13, 1064, 317], [9, 718, 231], [11, 704, 197], [4, 648, 171], [18, 636, 182], [39, 598, 181], [1, 597, 197], [5, 473, 109], [8, 445, 155], [0, 441, 159]], "11": [[10, 1423, 452], [13, 789, 274], [22, 752, 205], [23, 624, 181], [18, 582, 135], [4, 537, 175], [39, 465, 161], [1, 425, 118], [41, 407, 121], [43, 366, 120]], "12": [[18, 1169, 219], [9, 912, 323], [0, 687, 229], [23, 637, 41], [8, 548, 203], [10, 537, 158], [3, 516, 205], [13, 512, 133], [5, 503, 188], [22, 493, 75]], "13": [[10, 1221, 427], [18, 931, 221], [4, 924, 210], [22, 827, 149], [23, 780, 157], [12, 765, 258], [11, 711, 268], [1, 651, 187], [19, 518, 77], [39, 446, 133]], "14": [[18, 530, 49], [13, 418, 58], [15, 404, 149], [12, 236, 75], [4, 151, 39], [59, 142, 3], [23, 125, 23], [44, 121, 21], [2, 107, 35], [24, 106, 5]], "15": [[18, 606, 120], [14, 534, 175], [4, 403, 84], [1, 270, 65], [22, 243, 47], [12, 238, 90], [13, 205, 61], [43, 197, 66], [26, 181, 25], [23, 177, 47]], "16": [[18, 228, 55], [0, 189, 42], [26, 167, 39], [19, 132, 27], [8, 120, 24], [39, 110, 31], [22, 107, 30], [43, 92, 25], [41, 79, 22], [9, 69, 21]], "17": [[18, 5045, 984], [22, 1734, 351], [19, 1680, 279], [0, 995, 233], [39, 891, 217], [58, 821, 117], [23, 728, 172], [44, 660, 163], [4, 633, 155], [41, 530, 173]], "18": [[22, 12949, 1223], [19, 6645, 469], [39, 5706, 757], [42, 5619, 481], [23, 4841, 484], [65, 4642, 755], [17, 4508, 600], [57, 4329, 403], [41, 4204, 601], [44, 3848, 476]], "19": [[18, 9147, 732], [39, 3492, 330], [22, 2648, 217], [41, 2609, 246], [23, 2172, 131], [17, 1887, 223], [58, 1872, 144], [4, 1487, 115], [44, 1380, 147], [42, 1256, 179]], "20": [[19, 1181, 150], [18, 1071, 156], [22, 661, 60], [46, 579, 19], [17, 575, 91], [39, 491, 73], [44, 431, 42], [41, 423, 80], [0, 357, 73], [4, 311, 26]], "21": [[18, 344, 103], [22, 217, 63], [42, 189, 62], [65, 162, 46], [39, 144, 62], [41, 113, 41], [19, 85, 24], [48, 85, 35], [46, 71, 27], [0, 68, 24]], "22": [[18, 11372, 954], [23, 5281, 591], [39, 4569, 494], [42, 4481, 283], [44, 4330, 327], [65, 4178, 595], [43, 3499, 254], [41, 3447, 340], [57, 2831, 190], [25, 2195, 288]], "23": [[18, 7348, 600], [22, 6719, 920], [25, 2827, 394], [65, 1926, 332], [4, 1748, 317], [39, 1680, 307], [41, 1408, 232], [17, 1262, 115], [32, 1042, 84], [44, 1012, 160]], "24": [[18, 1559, 215], [22, 540, 98], [23, 500, 135], [17, 189, 53], [41, 168, 37], [57, 154, 12], [25, 153, 39], [4, 125, 43], [32, 124, 7], [15, 94, 12]], "25": [[23, 2732, 680], [22, 2329, 580], [18, 1736, 391], [65, 1339, 363], [4, 781, 202], [42, 717, 133], [2, 702, 210], [39, 682, 209], [1, 598, 182], [41, 597, 172]], "26": [[65, 1170, 221], [18, 1141, 169], [22, 804, 154], [39, 610, 108], [43, 560, 136], [23, 511, 97], [41, 493, 103], [25, 303, 72], [17, 274, 50], [0, 253, 71]], "27": [[22, 906, 148], [23, 655, 133], [18, 432, 95], [19, 295, 33], [39, 294, 43], [44, 281, 49], [4, 266, 63], [25, 250, 54], [42, 186, 45], [11, 179, 57]], "28": [[22, 505, 70], [43, 393, 12], [18, 270, 40], [23, 264, 40], [25, 231, 25], [37, 173, 13], [65, 140, 38], [58, 130, 10], [27, 108, 11], [29, 102, 16]], "29": [[23, 539, 112], [22, 466, 101], [18, 304, 52], [25, 251, 49], [0, 176, 23], [65, 174, 29], [11, 165, 48], [27, 163, 30], [32, 160, 24], [39, 151, 38]], "30": [[22, 110, 26], [23, 81, 21], [29, 59, 9], [25, 55, 12], [18, 51, 15], [28, 40, 6], [65, 29, 7], [58, 22, 3], [32, 21, 4], [37, 20, 3]], "31": [[18, 553, 64], [39, 175, 25], [41, 158, 18], [23, 95, 15], [22, 71, 17], [43, 68, 23], [0, 58, 13], [1, 54, 6], [28, 54, 7], [11, 49, 4]], "32": [[22, 882, 140], [18, 600, 89], [23, 546, 63], [4, 424, 29], [41, 265, 30], [19, 240, 12], [27, 211, 29], [39, 209, 31], [50, 156, 5], [25, 155, 24]], "33": [[18, 355, 30], [22, 277, 63], [23, 149, 38], [42, 130, 2], [24, 77, 4], [54, 74, 1], [25, 63, 15], [19, 61, 3], [65, 58, 25], [44, 46, 5]], "34": [[18, 752, 69], [22, 395, 45], [23, 197, 42], [65, 161, 30], [57, 143, 11], [4, 136, 20], [44, 102, 6], [24, 82, 5], [26, 78, 12], [41, 77, 9]], "35": [[22, 734, 77], [23, 426, 55], [18, 296, 24], [25, 193, 26], [32, 145, 12], [57, 141, 7], [65, 124, 20], [41, 101, 13], [42, 87, 10], [29, 77, 11]], "36": [[18, 123, 14], [22, 108, 16], [14, 63, 15], [39, 62, 14], [4, 57, 9], [38, 57, 7], [37, 55, 10], [12, 37, 5], [41, 35, 11], [1, 34, 7]], "37": [[22, 1303, 205], [18, 1065, 114], [23, 722, 125], [65, 633, 119], [39, 492, 110], [25, 458, 85], [42, 327, 60], [45, 297, 27], [41, 275, 69], [13, 244, 17]], "38": [[22, 466, 47], [41, 362, 33], [39, 310, 33], [18, 309, 26], [4, 244, 32], [23, 220, 22], [57, 213, 12], [65, 210, 19], [46, 184, 6], [19, 161, 7]], "39": [[41, 12048, 952], [40, 6744, 627], [18, 6448, 487], [42, 6385, 528], [22, 6281, 445], [19, 3059, 188], [44, 2627, 148], [43, 2424, 313], [57, 2068, 141], [65, 2034, 163]], "40": [[39, 5957, 879], [41, 3489, 558], [42, 2784, 349], [22, 1682, 194], [43, 1425, 184], [18, 1291, 228], [44, 714, 58], [23, 585, 63], [58, 576, 43], [57, 528, 75]], "41": [[39, 8998, 1203], [18, 4493, 570], [42, 4306, 533], [40, 4003, 564], [22, 3614, 446], [43, 2574, 397], [44, 1622, 157], [19, 1414, 174], [23, 1373, 153], [65, 1215, 158]], "42": [[61, 5768, 163], [22, 5051, 380], [18, 4165, 400], [39, 3812, 546], [44, 3142, 124], [41, 2909, 399], [43, 2104, 249], [57, 1509, 110], [65, 1388, 91], [40, 1326, 227]], "43": [[18, 2295, 387], [39, 2089, 430], [22, 1952, 314], [42, 1928, 305], [41, 1716, 344], [44, 1222, 162], [45, 1137, 173], [40, 916, 150], [46, 778, 125], [57, 715, 102]], "44": [[48, 4562, 116], [18, 4375, 284], [59, 3859, 108], [47, 2914, 156], [45, 2451, 153], [22, 2418, 231], [23, 2401, 110], [46, 2259, 113], [42, 2180, 105], [54, 1815, 47]], "45": [[44, 2357, 207], [48, 1617, 88], [46, 1562, 156], [18, 1530, 161], [47, 1461, 73], [59, 1296, 64], [22, 1275, 109], [50, 1169, 62], [39, 1094, 118], [57, 999, 61]], "46": [[44, 2176, 135], [45, 1907, 171], [22, 1796, 95], [48, 1657, 53], [25, 1340, 25], [18, 1291, 101], [57, 1227, 48], [59, 982, 35], [47, 892, 61], [65, 842, 30]], "47": [[44, 2597, 158], [45, 1376, 70], [46, 1014, 55], [57, 777, 42], [50, 680, 20], [42, 655, 30], [59, 587, 15], [48, 583, 31], [22, 530, 48], [58, 526, 14]], "48": [[50, 3365, 113], [44, 2646, 96], [22, 1658, 94], [46, 1612, 43], [18, 1440, 107], [59, 1254, 45], [45, 1068, 52], [42, 933, 46], [49, 904, 25], [19, 885, 53]], "49": [[22, 2545, 56], [46, 2382, 56], [48, 1941, 31], [18, 1694, 77], [44, 1574, 67], [59, 1351, 29], [39, 1281, 30], [50, 1246, 26], [51, 1099, 23], [42, 1048, 29]], "50": [[48, 2610, 91], [44, 1386, 60], [42, 907, 30], [57, 801, 32], [18, 779, 58], [59, 636, 25], [45, 604, 35], [39, 568, 23], [47, 431, 21], [22, 426, 42]], "51": [[44, 835, 56], [48, 604, 23], [45, 559, 47], [59, 536, 28], [57, 456, 26], [50, 367, 13], [41, 357, 18], [49, 329, 18], [43, 322, 45], [39, 304, 25]], "52": [[51, 321, 38], [18, 240, 34], [45, 236, 24], [39, 212, 17], [44, 163, 23], [42, 153, 12], [19, 150, 17], [65, 138, 19], [22, 134, 31], [54, 112, 6]], "53": [[54, 733, 52], [55, 689, 62], [18, 420, 64], [45, 417, 32], [59, 352, 31], [57, 340, 22], [19, 331, 41], [39, 297, 39], [60, 283, 20], [44, 275, 36]], "54": [[18, 960, 58], [44, 951, 31], [53, 846, 51], [42, 537, 19], [60, 460, 19], [43, 456, 53], [57, 452, 20], [61, 421, 11], [59, 414, 19], [45, 408, 23]], "55": [[53, 405, 43], [48, 346, 19], [54, 309, 24], [44, 265, 22], [59, 253, 19], [22, 192, 25], [18, 152, 22], [45, 115, 9], [39, 115, 12], [61, 105, 6]], "56": [[50, 76, 13], [46, 76, 20], [48, 44, 11], [49, 44, 8], [44, 43, 10], [45, 39, 11], [39, 35, 9], [54, 24, 4], [51, 23, 4], [47, 21, 5]], "57": [[18, 4018, 199], [22, 2111, 152], [44, 1736, 105], [23, 1484, 56], [59, 1342, 73], [39, 1283, 96], [46, 1232, 38], [42, 1001, 75], [45, 994, 62], [4, 873, 58]], "58": [[19, 1826, 64], [39, 1649, 84], [18, 1332, 95], [59, 1243, 32], [42, 946, 28], [41, 867, 51], [44, 860, 45], [61, 612, 21], [48, 585, 15], [47, 547, 23]], "59": [[18, 1970, 92], [22, 1194, 70], [44, 1144, 66], [39, 1000, 39], [48, 983, 40], [58, 845, 29], [57, 817, 43], [41, 722, 29], [19, 639, 37], [45, 561, 32]], "60": [[18, 441, 45], [22, 352, 36], [39, 347, 22], [44, 343, 22], [41, 316, 19], [65, 278, 18], [57, 268, 19], [53, 260, 10], [64, 250, 22], [59, 181, 13]], "61": [[42, 2873, 144], [18, 1168, 87], [44, 1130, 34], [39, 609, 29], [45, 544, 23], [57, 481, 24], [19, 472, 28], [23, 466, 20], [58, 424, 15], [46, 407, 20]], "62": [[61, 175, 18], [42, 121, 13], [45, 41, 4], [53, 33, 5], [57, 30, 2], [44, 27, 3], [47, 27, 3], [52, 23, 2], [59, 21, 4], [50, 19, 2]], "63": [[60, 98, 2], [18, 72, 5], [59, 65, 4], [42, 43, 7], [22, 37, 3], [50, 36, 4], [51, 36, 4], [46, 34, 10], [43, 33, 5], [47, 30, 4]], "64": [[60, 297, 19], [48, 165, 6], [45, 150, 11], [44, 129, 10], [18, 122, 19], [54, 120, 7], [53, 110, 6], [65, 107, 11], [57, 92, 8], [59, 88, 8]], "65": [[22, 2852, 297], [18, 2007, 262], [39, 1648, 117], [42, 1354, 85], [26, 1314, 169], [25, 1037, 148], [23, 975, 121], [41, 675, 78], [57, 653, 57], [44, 612, 54]]}, "v": {"0": [[46, 4, 6, 6, 78], [42, 1, 5, 5, 67], [22, 45, 7, 7, 56], [22, 60, 19, 19, 48], [61, 1, 5, 5, 44], [48, 5, 8, 8, 38], [42, 3, 19, 19, 33], [18, 97, 11, 11, 32], [42, 1, 9, 9, 31], [18, 33, 6, 6, 29], [18, 148, 5, 5, 29], [18, 33, 9, 9, 28]], "7": [[2, 23, 22, 22, 9], [2, 19, 9, 9, 6], [4, 24, 19, 21, 5], [2, 19, 16, 16, 2], [7, 2, 7, 7, 2]], "18": [[65, 7, 17, 17, 90], [65, 22, 1, 1, 63], [25, 34, 13, 14, 43], [18, 46, 4, 4, 38], [65, 21, 6, 6, 33], [22, 49, 9, 10, 27], [65, 22, 17, 17, 26], [22, 30, 23, 23, 24], [17, 34, 29, 29, 7], [22, 8, 6, 6, 1]], "42": [[42, 3, 19, 20, 65], [42, 12, 36, 40, 48], [45, 2, 14, 14, 44], [17, 24, 13, 17, 35], [42, 1, 10, 10, 28], [44, 1, 28, 28, 24], [19, 1, 22, 22, 14], [19, 1, 29, 30, 14]], "44": [[59, 5, 10, 10, 556], [58, 1, 12, 12, 449], [0, 50, 20, 20, 375], [44, 5, 3, 5, 298], [45, 2, 9, 9, 256], [44, 8, 35, 39, 209], [58, 1, 3, 4, 207], [4, 8, 2, 3, 111], [1, 20, 6, 6, 81], [37, 13, 9, 9, 76], [18, 46, 1, 2, 69], [15, 1, 5, 5, 65]]}};

export { B, S, T3, DRN, EC, third, hex2, toHex, lum, ratio, rgb2hsl, hsl2rgb, mix, rgba, paperFor, coatFor, derive, RNG, coat, average, plate, words, roman }
