EcwidApp.init({
	app_id: "custom-app-63750040-1",
	autoloadedflag: true,
	autoheight: false
});

EcwidApp.getAppStorage('installed', function (config) {
	if (config == null) {
		var initialConfig = {
			public: {
				enabled: true,
				governorates: [],
				areas: {}
			},
			private: {
				installed: 'true',
				instructionTitle: 'TBEcom'
			}
		};

		initialConfig.public = JSON.stringify(initialConfig.public);

		EcwidApp.setAppPublicConfig(initialConfig.public, function (updatedConfig) {
			console.log('Initial public app data saved!');
		});

		EcwidApp.setAppStorage(initialConfig.private, function (updatedConfig) {
			console.log('Initial private app data saved!');
		});
	}
});

let AppStorage = {
	reset: function () {
		var config = {
			enabled: true,
			governorates: [],
			areas: {}
		};

		EcwidApp.setAppPublicConfig(JSON.stringify(config), function(updatedConfig){
			console.log(updatedConfig);
		});
	},
	load: function () {
		let _self = this;
		EcwidApp.getAppStorage('public', function (config) {
			config = JSON.parse(config);
			console.log(config);

			if (config.enabled) $('#ta__app-status').attr('checked', 'checked');
			else $('#ta__app-status').removeAttr('checked');

			let governorate;

			for (key in config.governorates) {
				governorate = config.governorate[key];
				_self.createGovernorateUI(governorate);

				for (key2 in config.areas[governorate]) {
					_self.createAreaUI(governorate, config.areas[governorate]);
				}
			}
		});
	},
	save: function (type, value, governorate = null) {
		let _self = this;
		EcwidApp.getAppStorage('public', function (config) {
			config = JSON.parse(config);
			console.log(config);

			if (type == 'status') config.enabled = value;

			console.log(type, value, config);

			if (type == 'governorate') {
				config.governorates.push(value);
				config.areas[value] = [];
				_self.createGovernorateUI(value);
			}

			if (type == 'area' && governorate != null) {
				config.areas[governorate].push(value);
				_self.createAreaUI(value);
			}

			EcwidApp.setAppPublicConfig(JSON.stringify(config), function (updatedConfig) {
				console.log(type + ' has been saved: ' + value);
			});
		});
	},
	delete: function (type, value, governorate = null) {
		EcwidApp.getAppStorage('public', function (config) {
			config = JSON.parse(config);

			if (type == 'governorate') {
				let index = config.governorates.indexOf(value);
				if (index > -1) config.governorates.splice(index, 1);

				delete config.areas[value];
			}

			if (type == 'area' && governorate != null) {
				let index = config.areas[governorate].indexOf(value);
				if (index > -1) config.areas[governorate].splice(index, 1);
			}

			EcwidApp.setAppPublicConfig(JSON.stringify(config), function (updatedConfig) {
				console.log(type + ' has been removed: ' + value);
			});
		});
	},
	createGovernorateUI: function (governorate) {
		let governorateTemplate = `
			<div class="list-element list-element--has-hover list-element--compact list-element--inline-mode">
				<div class="list-element__content">
					<div class="list-element__info">
						<div class="list-element__data-row">
							<span class="text-default">
								<b><span class="gwt-InlineLabel">${governorate}</span></b>
							</span>
						</div>
					</div>
					<div class="list-element__actions">
						<label class="checkbox" style="padding-right: 90px; margin-top: 4px;">
							<input type="checkbox" class="ta__data-switch" data-type="governorate" data-value="${governorate}">
							<div data-on="enabled" data-off="disabled"><div></div></div>
						</label>
						<div class="list-element__buttons-set">
							<div class="list-element__button-wrapper">
								<button type="button" class="btn btn-default btn-small ta__delete-btn" data-type="governorate" data-value="${governorate}">
									Delete
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		`;

		$('#ta__governorates-container').append(governorateTemplate);

		let areaGovernorateTemplate = `
			<span data-areas-for="${governorate}">
				<div class="list-element list-element--compact list-element--inline-mode" style="border-top: none;">
					<div class="list-element__content">
						<div class="list-element__info">
							<div class="list-element__data-row">
								<span class="text-default">
									<h3>${governorate}</h3>
								</span>
							</div>
						</div>
						<div class="list-element__actions">
							<div class="list-element__buttons-set">
								<div class="list-element__button-wrapper">
									<button type="button" class="btn btn-primary btn-small ta__add-btn" data-type="area" data-governorate="${governorate}">
										<span class="svg-icon">
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" focusable="false">
												<path d="M6.712 5.314H11v1.39H6.712V11H5.267V6.706H1V5.314h4.267V1h1.446v4.314z"></path>
											</svg>
										</span>
										New
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</span>
		`;
	
		$('#ta__areas-container').append(areaGovernorateTemplate);
	},
	createAreaUI: function (governorate, area) {
		let areaTemplate = `
			<div class="list-element list-element--has-hover list-element--compact list-element--inline-mode">
				<div class="list-element__content">
					<div class="list-element__info">
						<div class="list-element__data-row">
							<span class="text-default">
								<b><span class="gwt-InlineLabel">${area}</span></b>
							</span>
						</div>
					</div>
					<div class="list-element__actions">
						<label class="checkbox" style="padding-right: 90px; margin-top: 4px;">
							<input type="checkbox" class="ta__data-switch" data-type="area" data-value="${area}">
							<div data-on="enabled" data-off="disabled"><div></div></div>
						</label>
						<div class="list-element__buttons-set">
							<div class="list-element__button-wrapper">
								<button type="button" class="btn btn-default btn-small ta__delete-btn" data-type="area" data-value="${area}" data-governorate="${governorate}">
									Delete
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		`;

		$('span[data-areas-for="' + governorate +'"]').append(areaTemplate);
	}
}