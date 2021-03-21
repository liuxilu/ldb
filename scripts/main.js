require("override-lib/library");

global.ldbTipNo =
function(tip, cell) {
    if (Vars.net.client()) {
        cell.disabled(true);
        cell.tooltip("not on client");
    } else {
        if (!(tip === undefined)) {
            cell.tooltip(tip);
        }
    }
    return cell;
};

require("ldb/mem");
require("ldb/proc");
require("ldb/disp");
