
const ui = require("ui-lib/library");
var dialog = null; var button = null;
var maxLoop; isOwner() ? maxLoop = 1E10 : maxLoop = 2000	// i know what i'm doing (i think)

var block = Blocks.coreNucleus;
var floor = Vars.content.block(0);
var overlay = Vars.content.block(0);
var team = Vars.state.rules.defaultTeam;
var rot = 0;

const startPos = new Vec2(-1, -1);
const endPos = new Vec2(-1, -1);

function invalidCoords(x, y) {
	// comment here so that i can collapse the function
	if (Vars.world.tile(x, y)) {return false} else {Log.err("x: " + x + " y: " + y + " are invalid coordinates"); return true}
}

function isOwner() {
	// comment here for the same reason as before
	if (Core.settings.get("name", "").includes(Vars.mods.getMod("block-placer").meta.author)) {return true}
}

function placeBlock() {
	if (invalidCoords(startPos.x, startPos.y)) return

	// build code anyways, just run it or send /js + code
	var code = [
		"Vars.world.tile(" + startPos.x + ", " + startPos.y + ").setNet(Vars.content.block(" + block.id + "), Team.get(" + team.id + "), " + rot + ")"
				].join("");

	if (Vars.net.client()) {
		Call.sendChatMessage("/js " + code);
	} else {
		Vars.mods.getScripts().runConsole(code);
		if (isOwner()) {Log.debug(code);	Log.debug(Vars.mods.getScripts().runConsole(code))} // log input and output in debug if it's me
	}
}

function placeFloor() {
	if (invalidCoords(startPos.x, startPos.y)) return

	// @setFloorUnder, please sync in multiplayer | spoiler: it doesn't and i had to use setFloorNet()
	var code = [
		"t=Vars.world.tile(" + startPos.x + ", " + startPos.y + "); t.setFloorNet(Vars.content.block(" + floor.id + "), t.overlay())"
				].join("");

	if (Vars.net.client()) {
		Call.sendChatMessage("/js " + code);
	} else {
		Vars.mods.getScripts().runConsole(code);
		if (isOwner()) {Log.debug(code);	Log.debug(Vars.mods.getScripts().runConsole(code))}
	}
}

function placeOverlay() {
	if (invalidCoords(startPos.x, startPos.y)) return

	// pain
	var code = [
		"t=Vars.world.tile(" + startPos.x + ", " + startPos.y + "); t.setFloorNet(t.floor(), Vars.content.block(" + overlay.id + "))"
				].join("");

	if (Vars.net.client()) {
		Call.sendChatMessage("/js " + code);
	} else {
		Vars.mods.getScripts().runConsole(code);
		if (isOwner()) {Log.debug(code);	Log.debug(Vars.mods.getScripts().runConsole(code))}
	}
}

function fillBlock() {
	if (invalidCoords(startPos.x, startPos.y) || invalidCoords(endPos.x, endPos.y)) return

	if (startPos.x > endPos.x) {
		let tmp = startPos.x;
		startPos.x = endPos.x;
		endPos.x = tmp;
	}

	if (startPos.y > endPos.y) {
		let tmp = startPos.y;
		startPos.y = endPos.y;
		endPos.y = tmp
	}

	var timesX = Math.round((endPos.x - startPos.x) / block.size);
	var timesY = Math.round((endPos.y - startPos.y) / block.size);

	var code = [
		"for(i=0; i<" + timesX + "; i++) {x=" + (startPos.x + Math.floor(block.size / 2)) + "+" + block.size + "*i; for(j=0; j<" + timesY + "; j++) {y=" + (startPos.y + Math.floor(block.size / 2)) + "+" + block.size + "*j; Vars.world.tile(x, y).setNet(Vars.content.block(" + block.id + "), Team.get(" + team.id + "), " + rot + ")}}"
				].join("");

	if (Vars.net.client()) {
		Call.sendChatMessage("/js " + code);
	} else {
		Vars.mods.getScripts().runConsole(code);
		if (isOwner()) {Log.debug(code);	Log.debug(Vars.mods.getScripts().runConsole(code))}
	}
}

function fillFloor() {
	if (invalidCoords(startPos.x, startPos.y) || invalidCoords(endPos.x, endPos.y)) return

	if (startPos.x > endPos.x) {
		let tmp = startPos.x;
		startPos.x = endPos.x;
		endPos.x = tmp;
	}

	if (startPos.y > endPos.y) {
		let tmp = startPos.y;
		startPos.y = endPos.y;
		endPos.y = tmp
	}

	var timesX = Math.round((endPos.x - startPos.x) / floor.size);
	var timesY = Math.round((endPos.y - startPos.y) / floor.size);

	var code = [
		"for(i=0; i<" + timesX + "; i++) {x=" + (startPos.x + Math.floor(floor.size / 2)) + "+" + floor.size + "*i; for(j=0; j<" + timesY + "; j++) {y=" + (startPos.y + Math.floor(floor.size / 2)) + "+" + floor.size + "*j; t=Vars.world.tile(x, y); t.setFloorNet(Vars.content.block(" + floor.id + "), t.overlay())}}"
				].join("");

	if (Vars.net.client()) {
		Call.sendChatMessage("/js " + code);
	} else {
		Vars.mods.getScripts().runConsole(code);
		if (isOwner()) {Log.debug(code);	Log.debug(Vars.mods.getScripts().runConsole(code))}
	}
}

function fillOverlay() {
	if (invalidCoords(startPos.x, startPos.y) || invalidCoords(endPos.x, endPos.y)) return

	if (startPos.x > endPos.x) {
		let tmp = startPos.x;
		startPos.x = endPos.x;
		endPos.x = tmp;
	}

	if (startPos.y > endPos.y) {
		let tmp = startPos.y;
		startPos.y = endPos.y;
		endPos.y = tmp
	}

	var timesX = Math.round((endPos.x - startPos.x) / overlay.size);
	var timesY = Math.round((endPos.y - startPos.y) / overlay.size);

	var code = [
		"for(i=0; i<" + timesX + "; i++) {x=" + (startPos.x + Math.floor(overlay.size / 2)) + "+" + overlay.size + "*i; for(j=0; j<" + timesY + "; j++) {y=" + (startPos.y + Math.floor(overlay.size / 2)) + "+" + overlay.size + "*j; t=Vars.world.tile(x, y); t.setFloorNet(t.floor(), Vars.content.block(" + overlay.id + "))}}"
				].join("");

	if (Vars.net.client()) {
		Call.sendChatMessage("/js " + code);
	} else {
		Vars.mods.getScripts().runConsole(code);
		if (isOwner()) {Log.debug(code);	Log.debug(Vars.mods.getScripts().runConsole(code))}
	}
}

function autoChoose(tile) {
	// never called... yes very sad

	if ((tile.id >= 19 && tile.id <= 49) || (tile.id >= 73 && tile.id <= 84)) {
		// it's a floor
	} else if (tile.id >= 86 && tile.id <= 93) {
		// it's an ore
	} else {
		// it's a block (default)
	}

	if (tile.id > 253) {
		Log.warn(tile + " comes from a mod, Block Placer coudn't determine if it was a floor, an ore or a block, defaulting to block")
	}
}

ui.onLoad(() => {
	dialog = new BaseDialog("Place a block");
	const table = dialog.cont;

	let labels = table.table().top().center().get();
	labels.label(() => block.localizedName);
	labels.row();
	labels.label(() => floor.localizedName);
	labels.row();
	labels.label(() => overlay.localizedName);

	table.row();

	let panes = table.table().top().center().get();

	// pane 1 (blocks)
	panes.pane(list => {
		var i = 0;
		const blocks = Vars.content.blocks();
		blocks.sort();

		var maxLine;
		maxLine = 5;

		blocks.each(build => {
			// remove non-blocks
			if (((build.id >= 3 && build.id <= 49) || (build.id >= 73 && build.id <= 84) || (build.id >= 86 && build.id <= 93))) return

			if (i++ % maxLine == 0) {
				list.row();
			}

			const icon = new TextureRegionDrawable(build.icon(Cicon.full));
			list.button(icon, () => {
				block = build;
				button.style.imageUp = icon;
			}).size(96);
		});
	})

	// pane 2 (floors)
	panes.pane(list => {
		var i = 0;
		const blocks = Vars.content.blocks();
		blocks.sort();

		var maxLine = 5;

		blocks.each(build => {
			if (!((build.id <= 2) || (build.id >= 19 && build.id <= 49) || (build.id >= 73 && build.id <= 84))) return

			if (i++ % maxLine == 0) {
				list.row();
			}

			const icon = new TextureRegionDrawable(build.icon(Cicon.full));
			list.button(icon, () => {
				floor = build;
				button.style.imageUp = icon;
			}).size(96);
		});
	})

	// pane 3 (ores)
	panes.pane(list => {
		var i = 0;
		const blocks = Vars.content.blocks();
		blocks.sort();

		var maxLine;
		maxLine = 5;

		blocks.each(build => {
			if (!((build.id <= 1) || (build.id >= 86 && build.id <= 93))) return

			if (i++ % maxLine == 0) {
				list.row();
			}

			const icon = new TextureRegionDrawable(build.icon(Cicon.full));
			list.button(icon, () => {
				overlay = build;
				button.style.imageUp = icon;
			}).size(96);
		});
	})

	table.row();

	const sliders = table.table().bottom().center().get();
	var rotSlider, rotField, teamSlider, teamField;
	sliders.defaults().left();

	rotSlider = sliders.slider(0, 3, 1, rot, n => {
		rot = n;
		rotField.text = n;
	}).get();

	sliders.add(" rotation: ");

	rotField = sliders.field("" + rot, text => {
		rot = parseInt(text);
		rotSlider.value = rot;
	}).get();
	rotField.validator = text => !isNaN(parseInt(text));

	sliders.add("          ");

	teamSlider = sliders.slider(0, 255, 1, team, t => {
		team = team.get(t);
		teamField.text = t;
	}).get();

	sliders.add(" team id: ");

	teamField = sliders.field(team.id, text => {
		team = team.get(parseInt(text));
		teamSlider.value = parseInt(text);
	}).get();
	teamField.validator = text => !isNaN(parseInt(text));

	table.row();

	var placeButtons = table.table().bottom().get();
	
	placeButtons.left().button("fill blocks", Icon.fill, fillBlock)
		.disabled(() => Vars.state.isCampaign()).width(250);
	
	placeButtons.center().button("fill floors", Icon.fill, fillFloor)
		.disabled(() => Vars.state.isCampaign()).width(250);
	
	placeButtons.right().button("fill ores", Icon.fill, fillOverlay)
		.disabled(() => Vars.state.isCampaign()).width(250);
	
	placeButtons.row();

	placeButtons.left().button("place block", Icon.terrain, placeBlock)
		.disabled(() => Vars.state.isCampaign()).width(250);

	placeButtons.center().button("place floor", Icon.terrain, placeFloor)
		.disabled(() => Vars.state.isCampaign()).width(250);

	placeButtons.right().button("place ore", Icon.terrain, placeOverlay)
		.disabled(() => Vars.state.isCampaign()).width(250);
	
	table.row();

	var posDial = table.table().center().bottom().get();

	var startPosDial;
	startPosDial = posDial.button("Set start position", () => {
		dialog.hide();
		ui.click((screen, world) => {
			startPos.set(Math.floor(world.x / 8), Math.floor(world.y / 8));
			startPosDial.getLabel().text = "start pos: " + startPos.x + ", " + startPos.y;
			dialog.show();
		}, true);
	}).width(250).height(50).get();

	var endPosDial;
	endPosDial = posDial.button("Set end position", () => {
		dialog.hide();
		ui.click((screen, world) => {
			endPos.set(Math.ceil(world.x / 8), Math.ceil(world.y / 8));
			endPosDial.getLabel().text = "end pos: " + endPos.x + ", " + endPos.y;
			dialog.show();
		}, true);
	}).width(250).height(50).get();

	dialog.addCloseButton();

	dialog.buttons.button("pick tile", Icon.pencil, () => {
		dialog.hide();
		ui.click((screen, world) => {
			block = Vars.world.tile(world.x / 8, world.y / 8).block();
			floor = Vars.world.tile(world.x / 8, world.y / 8).floor();
			overlay = Vars.world.tile(world.x / 8, world.y / 8).overlay();
			dialog.show();
		}, true);
	});

	dialog.buttons.button("clear", Icon.cancel, () => {
		block = Vars.content.block(0);
		floor = Vars.content.block(0);
		overlay = Vars.content.block(0);
	});
});

// weird bug: it shows the last thing you selected, not just the "block". Not complaining tho bc it looks better
ui.addButton("Block placer", block, () => {
	dialog.show();
}, b => { button = b.get() });

// do the funny (2% chance)
Events.on(EventType.ClientLoadEvent, () => {
	if (Math.random()*100 <= 2) {Core.app.openURI("https://bit.ly/gdy2ibdiy")}
})
