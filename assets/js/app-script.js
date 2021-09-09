EcwidApp.init({
	app_id: "custom-app-63750040-1", // actual Ecwid app_id
	autoloadedflag: true,
	autoheight: true
});

function initApplication() {
	EcwidApp.getAppStorage('public', function(allData) {

		let addressData = JSON.parse(allData);
		let city, area, branch;

		for (key in addressData.cities) {
			city = addressData.cities[key];
			updateCityUI(city);

			for (key2 in addressData.areas[city]) {
				updateAreaUI(addressData.areas[city][key2], city);
			}

			for (key3 in addressData.branches[city]) {
				updateBranchesUI(addressData.branches[city][key3], city);
			}
		}

		if (addressData.enabled) {
			$('#app-status').attr('checked', 'checked');
		} else {
			$('#app-status').removeAttr('checked');
		}
	});
}

function changeAppStatus(status) {
	EcwidApp.getAppStorage('public', function(allData) {

		let addressData = JSON.parse(allData);

		addressData.enabled = status;

		EcwidApp.setAppPublicConfig(JSON.stringify(addressData), function(savedData) {
			console.log('Application enabled: ' + addressData.enabled);
		});
	});
}

function saveAddressData(type, value, city = null) {
	EcwidApp.getAppStorage('public', function(allData) {

		let addressData = JSON.parse(allData);

		if (type == 'city') {
			addressData.cities.push(value);
			addressData.areas[value] = [];
			addressData.branches[value] = [];

			updateCityUI(value);
		}

		if (type == 'area' && city != null) {
			addressData.areas[city].push(value);

			updateAreaUI(value, city);
		}

		if (type == 'branch' && city != null) {
			addressData.branches[city].push(value);

			updateBranchesUI(value, city);
		}

		EcwidApp.setAppPublicConfig(JSON.stringify(addressData), function(savedData){
			console.log(type + ' has been saved.');
		});
	});
}

function deleteAddressData(type, value, city = null) {
	EcwidApp.getAppStorage('public', function(allData) {

		let addressData = JSON.parse(allData);

		if (type == 'city') {
			let index = addressData.cities.indexOf(value);
			if (index > -1) addressData.cities.splice(index, 1);

			delete addressData.areas[value];
			delete addressData.branches[value];
		}

		if (type == 'area' && city != null) {
			let index = addressData.areas[city].indexOf(value);
			if (index > -1) addressData.areas[city].splice(index, 1);
		}

		if (type == 'branch' && city != null) {
			let index = addressData.branches[city].indexOf(value);
			if (index > -1) addressData.branches[city].splice(index, 1);
		}

		EcwidApp.setAppPublicConfig(JSON.stringify(addressData), function(savedData){
			console.log(type + ' has been removed.');
		});
	});
}

function updateCityUI(city) {
	let cityTemplate = `
		<div class="list-element list-element--has-hover list-element--compact list-element--inline-mode">
			<div class="list-element__content">
				<div class="list-element__info">
					<div class="list-element__data-row">
						<span class="text-default">
							<b><span class="gwt-InlineLabel">${city}</span></b>
						</span>
					</div>
				</div>
				<div class="list-element__actions">
					<div class="list-element__buttons-set">
						<div class="list-element__button-wrapper">
							<button type="button" class="btn btn-default btn-small ob-delete-btn" data-type="city" data-value="${city}">
								Delete
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	`;

	$('#ob-cities-container').append(cityTemplate);

	let cityAreaTemplate = `
		<span data-areas-for="${city}">
			<div class="list-element list-element--compact list-element--inline-mode" style="border-top: none;">
				<div class="list-element__content">
					<div class="list-element__info">
						<div class="list-element__data-row">
							<span class="text-default">
								<h3>${city}</h3>
							</span>
						</div>
					</div>
					<div class="list-element__actions">
						<div class="list-element__buttons-set">
							<div class="list-element__button-wrapper">
								<button type="button" class="btn btn-primary btn-small ob-add-btn" data-type="area" data-city="${city}">
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

	$('#ob-areas-container').append(cityAreaTemplate);

	let cityBranchesTemplate = `
		<span data-branches-for="${city}">
			<div class="list-element list-element--compact list-element--inline-mode" style="border-top: none;">
				<div class="list-element__content">
					<div class="list-element__info">
						<div class="list-element__data-row">
							<span class="text-default">
								<h3>${city}</h3>
							</span>
						</div>
					</div>
					<div class="list-element__actions">
						<div class="list-element__buttons-set">
							<div class="list-element__button-wrapper">
								<button type="button" class="btn btn-primary btn-small ob-add-btn" data-type="branch" data-city="${city}">
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

	$('#ob-branches-container').append(cityBranchesTemplate);
}

function updateAreaUI(area, city) {
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
							<button type="button" class="btn btn-default btn-small ob-delete-btn" data-type="area" data-value="${area}" data-city="${city}">
								Delete
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	`;

	$('span[data-areas-for="' + city +'"]').append(areaTemplate);
}

function updateBranchesUI(branch, city) {
	let branchTemplate = `
		<div class="list-element list-element--has-hover list-element--compact list-element--inline-mode">
			<div class="list-element__content">
				<div class="list-element__info">
					<div class="list-element__data-row">
						<span class="text-default">
							<b><span class="gwt-InlineLabel">${branch}</span></b>
						</span>
					</div>
				</div>
				<div class="list-element__actions">
					<div class="list-element__buttons-set">
						<div class="list-element__button-wrapper">
							<button type="button" class="btn btn-default btn-small ob-delete-btn" data-type="branch" data-value="${branch}" data-city="${city}">
								Delete
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	`;

	$('span[data-branches-for="' + city +'"]').append(branchTemplate);
}

EcwidApp.getAppStorage('installed', function(value) {
	if (value == null) {
		var initialConfig = {
			public: {
				cities: [],
				areas: {},
				branches: {},
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
