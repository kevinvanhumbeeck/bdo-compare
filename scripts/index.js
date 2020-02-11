function sum(stat) {
    if (!stat.caphra) {
        return stat.enhancement;
    }
    statEnhKeys = Object.keys(stat.enhancement);
    statCapKeys = Object.keys(stat.caphra);
    stats = {};

    temp = (statEnhKeys.length >= statCapKeys.length) ? stat.enhancement : stat.caphra;

    Object.keys(temp).forEach(t => {
        if (stats[t]) {
            stats[t] += temp[t]; 
        } else {
            stats[t] = temp[t];
        }
    });
    return stats;
}

function diff(one, two) {
    // temporary listing of all the stats ...
    var diff = {...one, ...two};
    Object.keys(diff).forEach(stat => {
        one[stat] = one[stat] || 0;
        two[stat] = two[stat] || 0;
        diff[stat] = two[stat] - one[stat];
    });

    return diff;
}
function addDerivedStats(item) {
    item.dp = item.evasion + item.dr;
    item.totalEvasion = item.evasion + item.hiddenEvasion;
    item.totalDr = item.dr + item.hiddenDr;
    
    return item;
}
function unCamelCase(name) {
    if (name.length > 2) {
        return name
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
    } else {
        return name.toUpperCase();
    }

}
function color(int) {
    if (int > 0) {
        int = "<span style=\"color:green\">" + int + "</span>";
    } else if (int < 0) {
        int = "<span style=\"color:red\">" + int + "</span>";
    } else if (int == 0) {
        int = "";
    }
    return int;
}
function display(one, two) {
    var output = "<div class=\"row\"><div class=\"col-6\">STAT</div>";
    output += "<div class=\"col-2 text-right\">A</div>";
    output += "<div class=\"col-2 text-right\">B</div>";
    output += "<div class=\"col-2 text-right\">C</div></div>";
    Object.keys(one).forEach(stat => {
        output += "<div class=\"row\"><div class=\"col-6\">" + unCamelCase(stat) + "</div>";
        output += "<div class=\"col-2 text-right\">" + one[stat] + "</div>";
        output += "<div class=\"col-2 text-right\">" + two[stat] + "</div>";
        output += "<div class=\"col-2 text-right\">" + /*color(diff[stat])*/ "UNFINISHED" + "</div></div>";
    });

    return output;
}
function calc(lvlOne, lvlTwo, capOne=0, capTwo=0) {
    // base stats
    var itemOne = { ...leebur[lvlOne] };
    var itemTwo = { ...leebur[lvlTwo] };
    // caphra'd stats
    /*
    var capraOne = itemOne.caphra ? itemOne.caphra[capOne] || {} : {};
    var capraTwo = itemTwo.caphra ? itemTwo.caphra[capTwo] || {} : {};
    if (itemOne.caphra)
        delete itemOne.caphra;
    if (itemTwo.caphra)
        delete itemTwo.caphra;
    */
    var caphraOne = accumulate(caphra['armor'][3][lvlOne], capOne);
    var caphraTwo = accumulate(caphra['armor'][3][lvlTwo], capTwo);
    itemOne = sum(itemOne, caphraOne);
    itemTwo = sum(itemTwo, caphraTwo);
    // derived stats
    itemOne = addDerivedStats(itemOne);
    itemTwo = addDerivedStats(itemTwo);
    // difference
    var change = diff(itemOne, itemTwo);  
}

// get stats from enhancement object
function getStats(enh) {
    item = findItem(enh.id);
    caphraStats = getCaphras(enh);
    // make object of all stats (enhancement + caphra)
    return stats = {
        enhancement: item.enhancement[enh.enhancement],
        caphra: caphraStats,
    };
}

// get caphras for a specific item
function getCaphras(enh) {
    item = findItem(enh.id);
    caphraLevel = enh.caphra;
    enhancementLevel = enh.enhancement;
    if (enhancementLevel >= 18) {
        if (item.set && enhancementLevel == 20) {
            caphra = caphras.find(caphra => caphra.id == 'boss-armor');
        } else {
            caphra = caphras.find(caphra => caphra.enhancement.find(enh => enh == enhancementLevel) && caphra.slots.find(slot => slot == item.type));
        }
    } else {
        return false;
    }

    return caphra.stats[enhancementLevel];
}

// gets all values needed from dropdowns
function getValues() {
    doms = document.getElementsByClassName('item');
    selectedItems = [];
    for (var i = 0; i < doms.length; i++) {
        name = doms[i].id.replace(/caphra|enhancement/, '');
        type = doms[i].id.replace(/.*(caphra|enhancement)/, '$1').replace(/.*\d+/, 'id');
        value = doms[i].value;

        item = selectedItems.find(item => item.name == name);
        if (!item) {
            obj = {
                name,
            }
            obj[type] = value;
            selectedItems.push(obj);
        } else {
            item[type] = value;
        }
    }

    return selectedItems;
}

function findItem(id) {
    return items.find(item => item.id == id);
}

function setEnhancement(second=false) {
    domId = this.id;
    itemId = this.value;
    item = findItem(itemId);
    id = second ? domId + 'caphra' : domId + 'enhancement';
    el = document.getElementById(id)
    map = {
        16: ["PRI", "I"],
        17: ["DUO", "II"],
        18: ["TRI", "III"],
        19: ["TET", "IV"],
        20: ["PEN", "V"],
    }
    for (i = 0; i < 21; i++) {
        option = document.createElement("option");
        option.value = i;
        option.text = i <= 15 || second ? "+" + i : map[i][0];
        el.add(option);
    }

    if (id.match(/enhancement/)) {
        el.addEventListener('change', toggleCaphras);
        toggleCaphras.call(el);
    }

    if (item.caphras === undefined && !second) {
        setEnhancement.call(this, true);
    }
}

function toggleCaphras() {
    value = this.value;
    id = this.id.replace(/enhancement/, '');
    id += 'caphra';
    el = document.getElementById(id);
    if (value > 17) {
        el.disabled = false;
    } else {
        el.disabled = true;
    }
}

// Makes list of items to select from (built from items.js)
function setItems(domId) {
    el = document.getElementById(domId);
    items.forEach(item => {
        option = document.createElement('option');
        option.value = item.id;
        option.text = item.name;
        el.add(option);
    });
    el.addEventListener("change", setEnhancement.bind(el, false));
}

function init() {
    values = getValues();
    itemsStats = [];
    values.forEach(value => {
        stats = getStats(value);
        stats = sum(stats);
        itemsStats.push(stats);
    });
    document.getElementById("display").innerHTML = display(itemsStats[0], itemsStats[1]);;  
}

// enh = enhancement object
// stat = stat object --> enhancement + caphra stats