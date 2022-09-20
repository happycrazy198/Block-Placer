
const ui = require("ui-lib/library");
const blockPlacer = Vars.mods.getMod(this.modName)
var dialog = null; var button = null;

var block = Blocks.coreNucleus;
var floor = Vars.content.block(0);
var overlay = Vars.content.block(0);
var team = Team.sharded;
var rot = 0;

const startPos = new Vec2(-1, -1);
const endPos = new Vec2(-1, -1);

function correctCoords() {
	// still a lot of if statements but at least better than before
	if (!Vars.world.tile(startPos.x, startPos.y)) {
		startPos.x = Mathf.clamp(startPos.x, 0, Vars.state.map.width);
    	startPos.y = Mathf.clamp(startPos.y, 0, Vars.state.map.height);
	}

	if (!Vars.world.tile(endPos.x, endPos.y)) {
    	endPos.x = Mathf.clamp(endPos.x, 0, Vars.state.map.width);
    	endPos.y = Mathf.clamp(endPos.y, 0, Vars.state.map.height);
    }

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
}

function isOwner() {
	return Core.settings.getString("name").includes(Strings.stripColors(blockPlacer.meta.author))
}

function clearSelection() {
	block = Vars.content.block(0);
	floor = Vars.content.block(0);
	overlay = Vars.content.block(0);
}

function placeBlock() {
	correctCoords();

	// build code anyways, just run it or send /js + code
	var code = [
		"Vars.world.tile(" + startPos.x + "," + startPos.y + ").setNet(Vars.content.block(" + block.id + "),Team.get(" + team.id + ")," + rot + ")"
				].join("");

	Vars.net.client() ? Call.sendChatMessage("/js " + code) : Vars.mods.getScripts().runConsole(code);
	if (isOwner()) Log.debug(code); Log.debug(Vars.mods.getScripts().runConsole(code));
}

function placeFloor() {
	correctCoords();

	// setFloorNet() fun yey! (-.-)
	var code = [
		"t=Vars.world.tile(" + startPos.x + "," + startPos.y + ");t.setFloorNet(Vars.content.block(" + floor.id + "),t.overlay())"
				].join("");

	Vars.net.client() ? Call.sendChatMessage("/js " + code) : Vars.mods.getScripts().runConsole(code);
	if (isOwner()) Log.debug(code); Log.debug(Vars.mods.getScripts().runConsole(code));
}

function placeOverlay() {
	correctCoords();

	var code = [
		"t=Vars.world.tile(" + startPos.x + ", " + startPos.y + ");t.setFloorNet(t.floor(),Vars.content.block(" + overlay.id + "))"
				].join("");

	Vars.net.client() ? Call.sendChatMessage("/js " + code) : Vars.mods.getScripts().runConsole(code);
	if (isOwner()) Log.debug(code); Log.debug(Vars.mods.getScripts().runConsole(code));
}

function fillBlock() {
	correctCoords();

	var timesX = Math.round((endPos.x - startPos.x) / block.size);
	var timesY = Math.round((endPos.y - startPos.y) / block.size);

	var code = [
		"for(i=0;i<" + timesX + ";i++){x=" + (startPos.x + Math.floor(block.size / 2)) + "+" + block.size + "*i;for(j=0;j<" + timesY + ";j++){y=" + (startPos.y + Math.floor(block.size / 2)) + "+" + block.size + "*j;Vars.world.tile(x,y).setNet(Vars.content.block(" + block.id + "),Team.get(" + team.id + ")," + rot + ")}}"
				].join("");

	Vars.net.client() ? Call.sendChatMessage("/js " + code) : Vars.mods.getScripts().runConsole(code);
	if (isOwner()) Log.debug(code); Log.debug(Vars.mods.getScripts().runConsole(code));
}

function fillFloor() {
	correctCoords();

	var timesX = Math.round((endPos.x - startPos.x) / floor.size);
	var timesY = Math.round((endPos.y - startPos.y) / floor.size);

	var code = [
		"for(i=0;i<" + timesX + ";i++){x=" + (startPos.x + Math.floor(floor.size / 2)) + "+" + floor.size + "*i;for(j=0;j<" + timesY + ";j++){y=" + (startPos.y + Math.floor(floor.size / 2)) + "+" + floor.size + "*j;t=Vars.world.tile(x,y);t.setFloorNet(Vars.content.block(" + floor.id + "),t.overlay())}}"
				].join("");

	Vars.net.client() ? Call.sendChatMessage("/js " + code) : Vars.mods.getScripts().runConsole(code);
	if (isOwner()) Log.debug(code); Log.debug(Vars.mods.getScripts().runConsole(code));
}

function fillOverlay() {
	correctCoords();

	var timesX = Math.round((endPos.x - startPos.x) / overlay.size);
	var timesY = Math.round((endPos.y - startPos.y) / overlay.size);

	var code = [
		"for(i=0;i<" + timesX + ";i++){x=" + (startPos.x + Math.floor(overlay.size / 2)) + "+" + overlay.size + "*i;for(j=0;j<" + timesY + ";j++){y=" + (startPos.y + Math.floor(overlay.size / 2)) + "+" + overlay.size + "*j;t=Vars.world.tile(x,y);t.setFloorNet(t.floor(),Vars.content.block(" + overlay.id + "))}}"
				].join("");

	Vars.net.client() ? Call.sendChatMessage("/js " + code) : Vars.mods.getScripts().runConsole(code);
	if (isOwner()) Log.debug(code); Log.debug(Vars.mods.getScripts().runConsole(code));
}

function fillCircleBlock() {
	correctCoords();

	if (block.size > 2) {
		Call.sendMessage("[scarlet][E][] [[" + blockPlacer.meta.name + "] unsupported block size for circle fill (max=2)")
		Log.errTag(blockPlacer.meta.name,"unsupported block size for circle fill (max=2) (current=" + block.size + ")")
		return
	}

	var code = [
		"Geometry.circle(" + Math.floor(startPos.x + ((endPos.x - startPos.x) / 2)) + "," + Math.floor(startPos.y + ((endPos.y - startPos.y) / 2)) + "," + Math.ceil((endPos.y - startPos.y) / 2) + ",(x,y)=>{" + (block.size == 2 ? "if(x%2&&y%2)" : "") + "Vars.world.tile(x,y).setNet(Vars.content.block(" + block.id + "),Team.get(" + team.id + ")," + rot + ")})"
				].join("");

	Vars.net.client() ? Call.sendChatMessage("/js " + code) : Vars.mods.getScripts().runConsole(code);
	if (isOwner()) Log.debug(code); Log.debug(Vars.mods.getScripts().runConsole(code));
}

function fillCircleFloor() {
	correctCoords();

	// there are no 2x2+ floors
	var code = [
		"Geometry.circle(" + Math.floor(startPos.x + ((endPos.x - startPos.x) / 2)) + "," + Math.floor(startPos.y + ((endPos.y - startPos.y) / 2)) + "," + Math.ceil((endPos.y - startPos.y) / 2) + ",(x,y)=>{t=Vars.world.tile(x,y);t.setFloorNet(Vars.content.block(" + floor.id + "),t.overlay())})"
				].join("");

	Vars.net.client() ? Call.sendChatMessage("/js " + code) : Vars.mods.getScripts().runConsole(code);
	if (isOwner()) Log.debug(code); Log.debug(Vars.mods.getScripts().runConsole(code));
}

function fillCircleOverlay() {
	correctCoords();

	var code = [
		"Geometry.circle(" + Math.floor(startPos.x + ((endPos.x - startPos.x) / 2)) + "," + Math.floor(startPos.y + ((endPos.y - startPos.y) / 2)) + "," + Math.ceil((endPos.y - startPos.y) / 2) + ",(x,y)=>{t=Vars.world.tile(x,y);t.setFloorNet(t.floor(),Vars.content.block(" + overlay.id + "))})"
				].join("");

	Vars.net.client() ? Call.sendChatMessage("/js " + code) : Vars.mods.getScripts().runConsole(code);
	if (isOwner()) Log.debug(code); Log.debug(Vars.mods.getScripts().runConsole(code));
}

ui.onLoad(() => {
	dialog = new BaseDialog("Place a block");
	const table = dialog.cont;

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
			if ((build.isFloor() && build.id != 0) || (build.id >= 3 && build.id <= 18)) return

			if (i++ % maxLine == 0) {
				list.row();
			}

			const icon = new TextureRegionDrawable(build.uiIcon);
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
			if (!build.isFloor() || build.id == 30) return

			if (i++ % maxLine == 0) {
				list.row();
			}

			const icon = new TextureRegionDrawable(build.uiIcon);
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
			if (!(build.isOverlay() || build.id == 0)) return

			if (i++ % maxLine == 0) {
				list.row();
			}

			const icon = new TextureRegionDrawable(build.uiIcon);
			list.button(icon, () => {
				overlay = build;
				button.style.imageUp = icon;
			}).size(96);
		});

		// doesn't even work lmao
		list.row(); i = 0;

		blocks.each(build => {
			// show ores first and than floors
			if (build.isOverlay() || build.id == 0) return
			if (!build.isFloor() || build.id == 30) return

			if (i++ % maxLine == 0) {
				list.row();
			}

			const icon = new TextureRegionDrawable(build.uiIcon);
			list.button(icon, () => {
				overlay = build;
				button.style.imageUp = icon;
			}).size(96);
		});
	})

	table.row();

	var placeButtons = table.table().bottom().center().get();

	placeButtons.right().button("Fill zone ores", Icon.fill, fillOverlay)
		.disabled(() => Vars.state.isCampaign()).width(250);
	
	placeButtons.right().button("Fill circle ores", Icon.infoCircle, fillCircleOverlay)
		.disabled(() => Vars.state.isCampaign()).width(250);

	placeButtons.right().button("Place ore", Icon.terrain, placeOverlay)
		.disabled(() => Vars.state.isCampaign()).width(250);
	placeButtons.row();

	placeButtons.right().button("Fill zone floors", Icon.fill, fillFloor)
		.disabled(() => Vars.state.isCampaign()).width(250);
	
	placeButtons.right().button("Fill circle floors", Icon.infoCircle, fillCircleFloor)
		.disabled(() => Vars.state.isCampaign()).width(250);
	
	placeButtons.right().button("Place ore", Icon.terrain, placeFloor)
		.disabled(() => Vars.state.isCampaign()).width(250);

	placeButtons.row();
	
	placeButtons.right().button("Fill zone blocks", Icon.fill, fillBlock)
		.disabled(() => Vars.state.isCampaign()).width(250);

	placeButtons.right().button("Fill circle blocks", Icon.infoCircle, fillCircleBlock)
		.disabled(() => Vars.state.isCampaign()).width(250);

	placeButtons.right().button("Place block", Icon.terrain, placeBlock)
		.disabled(() => Vars.state.isCampaign()).width(250);
	
	table.row();

	var labels = table.table().bottom().center().get();

	// ui skill issue
	labels.label(() => {return "[coral]Block: []" + block.localizedName + " " + block.emoji()});
	labels.add("          ");
	labels.label(() => {return "[coral]Floor: []" + floor.localizedName + " " + floor.emoji()});
	labels.add("          ");
	labels.label(() => {return "[coral]Ore: []" + overlay.localizedName + " " + overlay.emoji()});

	table.row()

	const props = table.table().bottom().center().get();
	var teamColor = extend(TextureRegionDrawable, Tex.whiteui, {});
	var rotSlider, rotLabel, startPosDial, endPosDial;

	teamColor.tint.set(team.color);
	props.button("Select Team", teamColor, 40, () => {
		var teamListDial = new BaseDialog("Select Team");
		teamListDial.cont.pane(teamList=>{
			Team.all.forEach(t=>{
				if (t.id % 6 == 0) {
					teamList.row();
				}

				teamList.button("[#" + t.color + "]" + t, () => {
					team = t;
					teamColor.tint.set(t.color);
					teamListDial.hide();
				}).width(128).height(64);
			});
			teamListDial.addCloseButton();
		});
		teamListDial.show();
	}).width(250).height(50);

	props.add("   ");

	startPosDial = props.button("Set start position", () => {
		dialog.hide();
		ui.click((screen, world) => {
			startPos.set(Math.floor(world.x / 8), Math.floor(world.y / 8));
			startPosDial.getLabel().text = "start pos: " + startPos.x + ", " + startPos.y;
			dialog.show();
		}, true);
	}).width(250).height(50).get();

	endPosDial = props.button("Set end position", () => {
		dialog.hide();
		ui.click((screen, world) => {
			endPos.set(Math.ceil(world.x / 8), Math.ceil(world.y / 8));
			endPosDial.getLabel().text = "end pos: " + endPos.x + ", " + endPos.y;
			dialog.show();
		}, true);
	}).width(250).height(50).get();

	props.add("   ");

	rotSlider = props.slider(0, 3, 1, rot, n => {
		// TODO: display arrow depending on rotation
		rot = n;
	}).get();

	props.add(" rotation: ");
	rotLabel = props.label(() => rot.toString())

	dialog.addCloseButton();

	dialog.buttons.button("Pick tile", Icon.pencil, () => {
		dialog.hide();
		ui.click((screen, world) => {
			if (!Vars.world.tile(world.x / 8, world.y / 8)) {
				clearSelection();
			} else {
				block = Vars.world.tile(world.x / 8, world.y / 8).block();
				team = Vars.world.tile(world.x / 8, world.y / 8).team();
				floor = Vars.world.tile(world.x / 8, world.y / 8).floor();
				overlay = Vars.world.tile(world.x / 8, world.y / 8).overlay();
			}
			
			dialog.show();
		}, true);
	});

	dialog.buttons.button("Clear", Icon.cancel, () => {
		clearSelection();
	});
});

ui.addButton("Block-Placer", block, () => {
	dialog.show();
}, b => { button = b.get() });

// do the funny (1% chance)
Events.on(EventType.ClientLoadEvent, () => {
	if (Math.random() <= 0.01) {Core.app.openURI("https://bit.ly/gdy2ibdiy")}
})
