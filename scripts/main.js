
const ui = require("ui-lib/library");
var dialog = null; var button = null;
const showAllBlocks = false;
const maxLoop = 25 * 25;

var block = Blocks.coreNucleus;
var team = Vars.state.rules.defaultTeam;
var rot = 0;

const startPos = new Vec2(-1, -1);
const endPos = new Vec2(-1, -1);
var blockX, blockY;

function singlePlace() {
	blockX = startPos.x;
	blockY = startPos.y;
	place();
}

function place() {

	if (Vars.world.tile(blockX, blockY)) {
		if (Vars.net.client()) {
			//remote
			const code = [
				"Vars.world.tile(" + blockX + ", " + blockY + ").setNet(Vars.content.block(" + block.id + "), Team.get(" + team.id + "), " + rot + ")"
			].join("");

			Call.sendChatMessage("/js " + code);

		} else {
			//local
			Vars.world.tile(blockX, blockY).setNet(block, team, rot);
		}
	} else {
		Vars.player.sendMessage("[Block Placer] [scarlet]ERROR: invalid coordinates");
		Log.errTag("Block Placer", "[scarlet]the block: " + block + " [scarlet]cound't be placed at x: " + blockX + " y: " + blockY);
	}

}

function fill() {

	if (startPos.x > endPos.x) {
		var temp = startPos.x;
		startPos.set(endPos.x, startPos.y);
		endPos.set(temp, endPos.y);
	}

	if (startPos.y > endPos.y) {
		var temp = startPos.y;
		startPos.set(startPos.x, endPos.y);
		endPos.set(endPos.x, temp);
	}

	var timesX = Math.round((endPos.x - startPos.x) / block.size);
	var timesY = Math.round((endPos.y - startPos.y) / block.size);
	var error = !(Vars.world.tile(startPos.x, startPos.y) && Vars.world.tile(endPos.x, endPos.y) && (timesX * timesY) < maxLoop);

	if (!error) {

		if (Vars.net.client()) {
			// remote
			var code = [
				"for(i=0; i<" + timesX + "; i++) {x=" + (startPos.x + Math.floor(block.size / 2)) + "+" + block.size + "*i; for(j=0; j<" + timesY + "; j++) {y=" + (startPos.y + Math.floor(block.size / 2) + "+" + block.size) + "*j; Vars.world.tile(x, y).setNet(Vars.content.block(" + block.id + "), Team.get(" + team.id + "), " + rot + ")}}"
			].join("");

			Call.sendChatMessage("/js " + code);

		} else {
			// local
			for (var i = 0; i < timesX; i++) {
				blockX = startPos.x + Math.floor(block.size / 2) + block.size * i;
				for (var j = 0; j < timesY; j++) {
					blockY = startPos.y + Math.floor(block.size / 2) + block.size * j;
					place(); // this is local, won't realy matter if we spam it
				}
			}
		}
	} else {
		// something is wrong
		if (!Vars.world.tile(startPos.x, startPos.y)) {
			Vars.player.sendMessage("[Block Placer] [scarlet]ERROR: invalid starting coordinates");
			Log.errTag("Block Placer", "[scarlet]the block cound't be placed because the starting position is x: " + startPos.x + " y: " + startPos.y);
		}

		if (!Vars.world.tile(endPos.x, endPos.y)) {
			Vars.player.sendMessage("[Block Placer] [scarlet]ERROR: invalid ending coordinates");
			Log.errTag("Block Placer", "[scarlet]the block cound't be placed because the ending position is x: " + endPos.x + " y: " + endPos.y);
		}

		if (timesX * timesY > maxLoop) {
			// the loop is too big
			Vars.player.sendMessage("[Block Placer] [scarlet]ERROR: loop is too big")
			Log.warn("[Block Placer] [scarlet]ERROR: loop is too big, you are trying to loop " + (timesX * timesY) + " times, the max is: " + maxLoop * maxLoop);
		}

	}
}

ui.onLoad(() => {

	dialog = new BaseDialog("Place a block");
	const table = dialog.cont;

	table.label(() => block.localizedName);

	table.row();

	table.pane(list => {

		var i = 0;
		const blocks = Vars.content.blocks();
		blocks.sort();

		var maxLine;
		if (Vars.mobile) { maxLine = 4 } else { maxLine = 10 }

		blocks.each(build => {

			//sort out unusefull blocks/buggy blocks (to turn off set "showAllBlocks" to true)
			if ((build == "build1" || build == "build2" || build == "build3" || build == "build4" ||
				build == "build5" || build == "build6" || build == "build7" || build == "build8" ||
				build == "build9" || build == "build10" || build == "build11" || build == "build12" ||
				build == "build13" || build == "build14" || build == "build15" || build == "build16" ||
				build == "legacy-mech-pad" || build == "legacy-unit-factory" || build == "legacy-unit-factory-air" || build == "legacy-unit-factory-ground" ||
				build == "empty") && !showAllBlocks) { return }

			if (i++ % maxLine == 0) {
				list.row();
			}

			const icon = new TextureRegionDrawable(build.icon(Cicon.full));
			list.button(icon, () => {
				block = build;
				button.style.imageUp = icon;
			}).size(128);

		});

	}).top().center();

	table.row();

	const sliders = table.table().center().bottom().get();
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

	table.row();

	teamSlider = sliders.slider(0, 255, 1, team, m => {
		team = Team.get(m);
		teamField.text = m;
	}).get();

	sliders.add(" team id: ");

	teamField = sliders.field(team.id, text => {
		team = Team.get(parseInt(text));
		teamSlider.value = parseInt(text);
	}).get();
	teamField.validator = text => !isNaN(parseInt(text));

	var posDial = table.table().center().bottom().get();

	var startPosDial;
	startPosDial = posDial.button("Set start position", () => {
		dialog.hide();
		ui.click((screen, world) => {
			startPos.set(Math.round(world.x / 8), Math.round(world.y / 8));
			startPosDial.getLabel().text = "start pos: " + startPos.x + ", " + startPos.y;
			dialog.show();
		}, true);
	}).width(250).get();

	var endPosDial;
	endPosDial = posDial.button("Set end position", () => {
		dialog.hide();
		ui.click((screen, world) => {
			endPos.set(Math.round(world.x / 8), Math.round(world.y / 8));
			endPosDial.getLabel().text = "end pos: " + endPos.x + ", " + endPos.y;
			dialog.show();
		}, true);
	}).width(250).get();

	table.row();

	dialog.addCloseButton();

	dialog.buttons.button("Place block", Icon.terrain, singlePlace)
		.disabled(() => Vars.state.isCampaign());

	dialog.buttons.button("Fill blocks", Icon.fill, fill)
		.disabled(() => Vars.state.isCampaign());
});


ui.addButton("Block placer", block, () => {
	dialog.show();
}, b => { button = b.get() });
