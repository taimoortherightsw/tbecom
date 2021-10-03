let appId = 'custom-app-63750040-1';
let host = 'https://taimoortherightsw.github.io/tbecom';

(function () {
	if (typeof jQuery == 'undefined') {
		let script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = host + '/assets/js/jquery-3.6.0.min.js';
		document.getElementsByTagName('head')[0].appendChild(script);
	}
})();

$(function () {
	Ecwid.OnPageLoaded.add(function (page) {
		if (page.type == 'CHECKOUT_ADDRESS') {

			let appConfig = JSON.parse(Ecwid.getAppPublicConfig(appId));
			if (!appConfig.enabled) return;

			if ($('#ec-country').val() == 'KW' || typeof $('#ec-country').val() == 'undefined') {
				CheckoutFields.init();
			}

			$(document).on('change', '#ec-country', function () {
				if ($(this).val() == 'KW') CheckoutFields.init();
				else CheckoutFields.destroy();
			});
		}

		else CheckoutFields.destroy();
	});
});

let CheckoutFields = {
	config: JSON.parse(Ecwid.getAppPublicConfig(appId)),
	init: function () {
		this.hide();
		this.create();

		$(document).on('change', '.ec-form__row--governorate select', function () {
			CheckoutFields.update('governorate', $(this).val());
		});

		$(document).on('change', '.ec-form__row--area select', function () {
			CheckoutFields.update('area', $(this).val());
		});

		$(document).on('mousedown', '.ec-form__row--continue', function () {
			CheckoutFields.hydrate();
		});
	},
	destroy: function () {
		this.show();

		ec.order.extraFields = {};
		Ecwid.refreshConfig();

		$(document).off('change', '.ec-form__row--governorate select');
		$(document).off('change', '.ec-form__row--area select');
		$(document).off('mousedown', '.ec-form__row--continue');
	},
	create: function () {
		if (typeof this.config.governorates[0] === 'undefined') return;

		let governorates = [];
		for (let key in this.config.governorates) {
			if (this.config.areas[this.config.governorates[key]].length > 0) {
				governorates.push(this.config.governorates[key]);
			}
		}

		ec.order = ec.order || {};
		ec.order.extraFields = ec.order.extraFields || {};

		ec.order.extraFields.governorate = {
			title: 'Governorate',
			textPlaceholder: 'Select a governorate',
			type: 'select',
			selectOptions: governorates,
			required: true,
			checkoutDisplaySection: 'shipping_address',
		};

		let selectedGovernorate = $(document).find('.ec-form__row--governorate select').val();
		selectedGovernorate = selectedGovernorate ? selectedGovernorate : governorates[0];

		ec.order.extraFields.area = {
			title: 'Area',
			textPlaceholder: 'Select an area',
			type: 'select',
			selectOptions: this.config.areas[selectedGovernorate],
			required: true,
			checkoutDisplaySection: 'shipping_address',
		};

		ec.order.extraFields.block = {
			title: 'Block',
			textPlaceholder: 'Specify the block',
			type: 'text',
			required: true,
			checkoutDisplaySection: 'shipping_address',
		};

		ec.order.extraFields.streetNo = {
			title: 'Street',
			textPlaceholder: 'Provide street number',
			required: true,
			checkoutDisplaySection: 'shipping_address',
		};

		ec.order.extraFields.avenue = {
			title: 'Avenue (optional)',
			textPlaceholder: 'Specify the avenue',
			required: false,
			checkoutDisplaySection: 'shipping_address',
		};

		ec.order.extraFields.additionalDirections = {
			title: 'Additional Directions (optional)',
			textPlaceholder: 'Provide additional directions for the delivery',
			required: false,
			checkoutDisplaySection: 'shipping_address',
		};

		Ecwid.refreshConfig();
	},
	update: function (field, value) {
		if (!value) return;

		ec.order = ec.order || {};
		ec.order.extraFields = ec.order.extraFields || {};

		if (field == 'governorate') {
			ec.order.extraFields.area.selectOptions = this.config.areas[value];
			let el = document.querySelector('.ec-form__row--area select');
			setTimeout(() => {
				el.value = this.config.areas[value][0];
				el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
			}, 100);
		}

		if (field == 'area') {
			let el = document.querySelector('.ec-form__row--governorate select');
			if (el.value == '') {
				setTimeout(() => {
					el.value = this.config.governorates[0];
					el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
				}, 100);
			}
		}

		Ecwid.refreshConfig();
	},
	hydrate: function () {
		let dom = $(document);

		let block = dom.find('.ec-form__row--block input').val();
		let streetNo = dom.find('.ec-form__row--streetNo input').val();
		let avenue = dom.find('.ec-form__row--avenue input').val();
		let area = dom.find('.ec-form__row--area select').val();
		let additionalDirections = dom.find('.ec-form__cell--additionalDirections input').val();

		if (block) {
			let target = block.substring(0, 5);
			if (target.toLowerCase() == 'block') {
				block = block.replace(target, '').trim();
			}
		}

		if (streetNo) {
			let target = streetNo.substring(0, 6);
			if (target.toLowerCase() == 'street') {
				streetNo = streetNo.replace(target, '').trim();
			}
		}

		if (avenue) {
			let target = avenue.substring(0, 6);
			if (target.toLowerCase() == 'avenue') {
				avenue = avenue.replace(target, '').trim();
			}
		}

		let address = avenue ? `Block ${block}, Street ${streetNo}, Avenue ${avenue}` : `Block ${block}, Street ${streetNo}`;

		Ecwid.Cart.setAddress({
			countryName: dom.find('[name="country-list"]').find("option:selected").text(),
			name: dom.find('#ec-full-name').val(),
			phone: dom.find('#ec-phone').val(),
			street: address,
			city: area,
			postalCode: dom.find('#ec-postal-code').val(),
			stateOrProvinceCode: this.getState()
		});

		Ecwid.refreshConfig();

		let el = document.querySelector('.ec-form__cell--state select');
		el.value = this.getState();
		el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));

		if (additionalDirections) {
			Ecwid.Cart.setOrderComments('Leave order at the door.',
				function () {
					console.log('Successfully set order comments.')
				},
				function () {
					console.log('Error setting order comments.');
				}
			);
		}

		console.log('%cCheckout fields hydrated successfully', 'color: green');
	},
	hide: function () {
		let dom = $(document);

		for (let timeout = 0; timeout <= 5000; timeout += 500) {
			setTimeout(() => {
				dom.find('.ec-form__cell--street').closest('.ec-form__row').hide();
				dom.find('.ec-form__cell--city').closest('.ec-form__row').hide();
				dom.find('.ec-form__cell--state').closest('.ec-form__row').hide();
			}, timeout);
		}
	},
	show: function () {
		let dom = $(document);

		for (let timeout = 0; timeout <= 5000; timeout += 500) {
			setTimeout(() => {
				dom.find('.ec-form__cell--street').closest('.ec-form__row').show();
				dom.find('.ec-form__cell--city').closest('.ec-form__row').show();
				dom.find('.ec-form__cell--state').closest('.ec-form__row').show();
			}, timeout);
		}
	},
	getState: function () {
		let governorate = $(document).find('.ec-form__row--governorate select').val();
		if (!governorate) return 'KW-AH';

		let states = {
			'KW-AH': 'ahmadi',
			'KW-KU': 'asimah',
			'KW-FA': 'farwaniyah',
			'KW-JA': 'jahra',
			'KW-HA': 'hawalli',
			'KW-MU': 'mubarak'
		}

		governorate = governorate.toLowerCase().split(' ');

		for (let index in states) {
			if (governorate.includes(states[index])) return index;
		}

		return 'KW-AH';
	}
}
