EcwidApp.init({
	app_id: "custom-app-63750040-1", // actual Ecwid app_id
	autoloadedflag: true,
	autoheight: true
});

function initApplication() {
	EcwidApp.getAppStorage('public', function(allData) {
		let applicationData = JSON.parse(allData);

		if (applicationData.enabled) {
			$('#app-status').attr('checked', 'checked');
		} else {
			$('#app-status').removeAttr('checked');
		}

		for (key in applicationData.areas) {
			createAreaUI(applicationData.areas[key]);
		}
	});
}

function saveApplicationData(type, value) {
	EcwidApp.getAppStorage('public', function(allData) {
		let applicationData = JSON.parse(allData);

		if (type == 'status') {
			applicationData.enabled = status;
		}

		if (type == 'area') {
			applicationData.areas.push(value);
			createAreaUI(value);
		}

		EcwidApp.setAppPublicConfig(JSON.stringify(applicationData), function(savedData){
			console.log(type + ' has been saved: ' + value);
		});
	});
}

function deleteApplicationData(type, value) {
	EcwidApp.getAppStorage('public', function(allData) {
		let applicationData = JSON.parse(allData);

		if (type == 'area') {
			let index = applicationData.areas.indexOf(value);
			if (index > -1) applicationData.areas.splice(index, 1);
		}

		EcwidApp.setAppPublicConfig(JSON.stringify(applicationData), function(savedData){
			console.log(type + ' has been removed.');
		});
	});
}

function createAreaUI(area) {
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
					<div class="list-element__buttons-set">
						<div class="list-element__button-wrapper">
							<button type="button" class="btn btn-default btn-small tb-delete-btn" data-type="area" data-value="${area}">
								Delete
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	`;

	$('#tb-areas-container').append(areaTemplate);
}

EcwidApp.getAppStorage('installed', function(value) {
	if (value == null) {
		var initialConfig = {
			public: {
				areas: [],
				enabled: true,
			},
			private: {
				installed: 'true',
				instructionTitle: 'TBEcom'
			}
		};

		initialConfig.public = JSON.stringify(initialConfig.public);

		EcwidApp.setAppPublicConfig(initialConfig.public, function(value) {
			console.log('Initial public user preferences saved!');
		});

		EcwidApp.setAppStorage(initialConfig.private, function(value) {
			console.log('Initial private user preferences saved!');
		});
	}
});
