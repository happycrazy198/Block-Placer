
const ui = require("ui-lib/library");
var dialog = null, button = null;

//change to show ALL blocks (not racommended)
const showAllBlocks = false;

var bRot = 0;
const maxRot = 3;

var bType = Blocks.coreNucleus;
var bTeam = Vars.state.rules.defaultTeam;
const bPos = new Vec2(-1, -1);

function placeLocal() {

	if (Vars.world.tile(bPos.x, bPos.y)) {
		
		Vars.world.tile(bPos.x, bPos.y).setNet(bType, bTeam, bRot);
		
	} else {
		Call.sendMessage("[scarlet]ERROR: illegal coordinates");
		Log.err("impossible to place " + bType + " at x: " + bPos.x + " y: " + bPos.y);
	}

}

function placeRemote() {
	
	if (Vars.world.tile(bPos.x, bPos.y)) {
		
		const code = [
			"Vars.world.tile(" + bPos.x + ", " + bPos.y + ").setNet(Vars.content.getByID(ContentType.block, " + bType.id + "), Team.all[" + bTeam.id + "], " + bRot + ")"
		].join("");
		
		Call.sendChatMessage("/js " + code);
		
	} else {
		Call.sendMessage("[scarlet]ERROR: illegal coordinates")
		Log.err("impossible to place " + bType + " at x: " + bPos.x + " y: " + bPos.y)
	}
}

function place() {
	(Vars.net.client() ? placeRemote : placeLocal)();
}

ui.onLoad(() => {
	dialog = new BaseDialog("Place a block");
	const table = dialog.cont;

	table.label(() => bType.localizedName);

	table.row();

	table.pane(list => {
		
		var i = 0;
		const blocks = Vars.content.blocks();
		blocks.sort();
		
		var maxLine;
		if (Vars.mobile) { maxLine = 4 } else { maxLine = 10 }
			
		blocks.each(block => {
			
			//sort out unusefull blocks/buggy blocks (to turn off set "showAllBlocks" to true)
			if ((block == "build1" || block == "build2" || block == "build3" || block == "build4" ||
				block == "build5" || block == "build6" || block == "build7" || block == "build8" ||
				block == "build9" || block == "build10" || block == "build11" || block == "build12" ||
				block == "build13" || block == "build14" || block == "build15" || block == "build16" ||
				block == "legacy-mech-pad" || block == "legacy-unit-factory" || block == "legacy-unit-factory-air" || block == "legacy-unit-factory-ground" ||
				block == "air" || block == "empty") && !showAllBlocks) { return }
			
			if (i++ % maxLine == 0) {
				list.row();
			}
			
			const icon = new TextureRegionDrawable(block.icon(Cicon.full));
			list.button(icon, () => {
				bType = block;
				button.style.imageUp = icon;
			}).size(128);
			
		});

	}).top().center();
	
	table.row();
	
	const rotDial = table.table().center().bottom().get();
	var rotSlider, rotField;
	rotDial.defaults().left();
	
	rotSlider = rotDial.slider(0, maxRot, bRot, num => {
		bRot = num;
		rotField.text = num;
	}).get();
	
	rotDial.add(" rotation: ");
	
	rotField = rotDial.field("" + bRot, text => {
		bRot = parseInt(text);
		rotSlider.value = bRot;
	}).get();
	rotField.validator = text => !isNaN(parseInt(text));
	
	table.row();
	
	var posDial;
	posDial = table.button("Set position", () => {
		dialog.hide();
		ui.click((screen, world) => {
			bPos.set(Math.round(world.x/8), Math.round(world.y/8));
			posDial.getLabel().text = "Place at " + bPos.x + ", " + bPos.y;
			dialog.show();
		}, true);
	}).width(250).get();
	
	table.row();
	
	dialog.addCloseButton();
	
	dialog.buttons.button("Place block", Icon.modeSurvival, place)
	.disabled(() => Vars.state.isCampaign());
	
	const iconCol = extend(TextureRegionDrawable, Tex.whiteui, {});
	iconCol.tint.set(bTeam.color);
	dialog.buttons.button("Set team", iconCol, 40, () => {
		ui.select("Set team", Team.all, t => {
			bTeam = t;
			iconCol.tint.set(bTeam.color);
		}, (i, t) => "[#" + t.color + "]" + t);
	});
});

ui.addButton("Block placer", bType, () => {
	dialog.show();
}, b => { button = b.get() });
