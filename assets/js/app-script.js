EcwidApp.init({
	app_id: "custom-app-63750040-1",
	autoloadedflag: true,
	autoheight: true
});

EcwidApp.getAppStorage('installed', function (config) {
	if (config == null) {
		var initialConfig = {
			public: {
				enabled: true,
				governorates: [],
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
		};

		EcwidApp.setAppPublicConfig(JSON.stringify(config), function(updatedConfig){
			console.log(updatedConfig);
		});
	},
	load: function () {
		EcwidApp.getAppStorage('public', function (config) {
			config = JSON.parse(config);
			console.log(config);

			if (config.enabled) $('#app-status').attr('checked', 'checked');
			else $('#app-status').removeAttr('checked');

			for (key in config.governorates) {
				this.createUI('governorate', config.governorates[key]);
			}
		});
	},
	save: function (type, value) {
		EcwidApp.getAppStorage('public', function (config) {
			config = JSON.parse(config);
			console.log(config);

			if (type == 'status') config.enabled = value;

			console.log(type, value, config);

			if (type == 'governorate') {
				config.governorates.push(value);
				this.createUI(type, value);
			}

			EcwidApp.setAppPublicConfig(JSON.stringify(config), function (updatedConfig) {
				console.log(type + ' has been saved: ' + value);
			});
		});
	},
	delete: function (type, value) {
		EcwidApp.getAppStorage('public', function (config) {
			config = JSON.parse(config);

			if (type == 'governorate') {
				let index = config.governorates.indexOf(value);
				if (index > -1) config.governorates.splice(index, 1);
			}

			EcwidApp.setAppPublicConfig(JSON.stringify(config), function (updatedConfig) {
				console.log(type + ' has been removed: ' + value);
			});
		});
	},
	createUI: function (type, data) {
		if (type == 'governorate') {
			let governorateTemplate = `
				<div class="list-element list-element--has-hover list-element--compact list-element--inline-mode">
					<div class="list-element__content">
						<div class="list-element__info">
							<div class="list-element__data-row">
								<span class="text-default">
									<b><span class="gwt-InlineLabel">${data}</span></b>
								</span>
							</div>
						</div>
						<div class="list-element__actions">
							<label class="checkbox" style="padding-right: 90px; margin-top: 4px;">
								<input type="checkbox" class="tb-data-switch" data-type="governorate" data-value="${data}">
								<div data-on="enabled" data-off="disabled"><div></div></div>
							</label>
							<div class="list-element__buttons-set">
								<div class="list-element__button-wrapper">
									<button type="button" class="btn btn-default btn-small ta__delete-btn" data-type="governorate" data-value="${data}">
										Delete
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			`;
	
			$('#ta__governorates-container').append(governorateTemplate);
		}
	}
}
