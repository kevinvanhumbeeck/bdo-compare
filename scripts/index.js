function accumulate(arr, lvl) {
    var total = { ...arr[0]};
    for (i=1; i<=lvl; i++) {
        Object.keys(arr[i]).forEach(stat => {
            total[stat] += arr[i][stat];
        })
    }

    return total;
}
function sum(one, two) {
    // temporary listing of all the stats ...
    var sum = {...one, ...two};
    // because this merge cannot really calculate sums
    Object.keys(sum).forEach(stat => {
        if (Number.isInteger(one[stat]) && Number.isInteger(two[stat])) {
            sum[stat] = one[stat] + two[stat];
        }
    });

    return sum;
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
function display(one, two, diff) {
    var output = "<div class=\"row\"><div class=\"col-6\">STAT</div>";
    output += "<div class=\"col-2 text-right\">A</div>";
    output += "<div class=\"col-2 text-right\">B</div>";
    output += "<div class=\"col-2 text-right\">C</div></div>";
    Object.keys(one).forEach(stat => {
        output += "<div class=\"row\"><div class=\"col-6\">" + unCamelCase(stat) + "</div>";
        output += "<div class=\"col-2 text-right\">" + one[stat] + "</div>";
        output += "<div class=\"col-2 text-right\">" + two[stat] + "</div>";
        output += "<div class=\"col-2 text-right\">" + color(diff[stat]) + "</div></div>";
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
    // display
    document.getElementById("display").innerHTML = display(itemOne, itemTwo, change);    
}

function findItem(id) {
    return items.find(item => item.id == id);
}

function setEnhancement(caphra=true, parentDomId, itemId) {
    parentDomId = parentDomId || this.domId;
    itemId = itemId || this.itemId;
    var item = findItem(itemId);
    // el = document.getElementById(parentDomId);
    id = caphra ? parentDomId + 'enhancement' : parentDomId + 'caphra';
    map = {
        16: ["PRI", "I"],
        17: ["DUO", "II"],
        18: ["TRI", "III"],
        19: ["TET", "IV"],
        20: ["PEN", "V"],
    }
    for (i = 0; i < 21; i++) {
        var option = document.createElement("option");
        option.text = i <= 15 || !caphra ? "+" + i : map[i][0];
        document.getElementById(id).add(option);
    }
    if (item && item.caphras === undefined) {
        setEnhancement(caphra=false, parentDomId, undefined);
    }
}

// Makes list of items to select from (built from items.js)
function setItems(domId) {
    var el = document.getElementById(domId);
    items.forEach(item => {
        var option = document.createElement('option');
        option.value = item.id;
        option.text = item.name;
        el.add(option);
    });
    el.addEventListener("change", setEnhancement.bind({domId: domId, itemId: el.value}));
}