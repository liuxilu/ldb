const padColor = val => {
	const str = val.toString(16);
	return "0".repeat(6 - str.length) + str.toUpperCase();
};

global.override.block(LogicDisplay, {
	ldbColor: { c : 0x565666, r : 0x56, g : 0x56, b : 0x66 },
	fields: {},
	sliders: {},
	// locks to prevent recursive setting
	ldbSetSelf : false,
	ldbSetOther : false,

	c2rgb(val) {
		this.ldbColor.c = val;
		this.ldbColor.r = (this.ldbColor.c >> 16) & 0xFF;
		this.ldbColor.g = (this.ldbColor.c >>  8) & 0xFF;
		this.ldbColor.b = (this.ldbColor.c >>  0) & 0xFF;
		return val;
	},
	rgb2c() {
		const val =
			((this.ldbColor.r & 0xFF) << 16) +
			((this.ldbColor.g & 0xFF) <<  8) +
			((this.ldbColor.b & 0xFF) <<  0);
		this.ldbColor.c = val;
		return val;
	},

	buildConfiguration(table) {
		const setAll = (val, setSlider, setField) => {
			if (!this.ldbSetSelf && !isNaN(val) && 0 <= val && val <= 0xFFFFFF) {
				this.ldbSetSelf = true;
				if (setField) {
					cf.text = padColor(val);
				}
				if (setSlider) {
					cs.value = val;
				}
				this.ldbSetSelf = false;

				if (!this.ldbSetOther) {
					this.ldbSetOther = true;
					this.c2rgb(val);
					setChannel(this.ldbColor.r, "r", true, true);
					setChannel(this.ldbColor.g, "g", true, true);
					setChannel(this.ldbColor.b, "b", true, true);
					this.ldbSetOther = false;
				}
			}
		};
		const setChannel = (val, chan, setSlider, setField) => {
			if (!this.ldbSetSelf && !isNaN(val) && 0 <= val && val <= 255) {
				this.ldbSetSelf = true;
				this.ldbColor[chan] = val;
				if (setField) {
					this.fields[chan].text = val;
				}
				if (setSlider) {
					this.sliders[chan].value = val;
				}
				this.ldbSetSelf = false;

				if (!this.ldbSetOther) {
					this.ldbSetOther = true;
					setAll(this.rgb2c(), true, true);
					this.ldbSetOther = false;
				}
			}
		};

		table.background(Styles.black6);

		global.ldbTipNo("Clear Screen",
			table.button(Icon.eraser, Styles.clearTransi, () => {
				// add "draw clear R G B" to the display's command buffer
				const r = this.ldbColor.r,
					g = this.ldbColor.g,
					b = this.ldbColor.b;
				this.commands.addLast(DisplayCmd.get(0, r, g, b, 0, 0, 0));
			}).size(40).pad(10)
		);

		const color = this.ldbColor.c;
		const cs = table.slider(0, 0xFFFFFF, 1, color, v => setAll(v, false, true)).padRight(10).get();
		const cf = table.field(padColor(color), v => setAll(parseInt(v, 16), true, false)).padRight(10).get();
		table.row();

		const channel = color => {
			const chan = color[0];
			const value = this.ldbColor[chan];
			table.add("[" + color + "]" + chan.toUpperCase());
			this.sliders[chan] = table.slider(0, 0xFF, 1, value, v => setChannel(v, chan, false, true)).padRight(10).get();
			this.fields[chan] = table.field(value + "", v => setChannel(parseInt(v), chan, true, false)).padRight(10).get();
			table.row();
		};

		channel("red");
		channel("green");
		channel("blue");

		table.table(null, t => {
			const img = new Image();
			img.color = new Color();
			img.update(() => img.color.rgb888(this.ldbColor.c));
			t.add(img).height(50).width(300);
		}).colspan(3).pad(10);
	}
}, block => {
	block.configurable = true;
});
