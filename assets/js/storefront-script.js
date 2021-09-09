let appId = 'custom-app-63750040-1';

(function() {
	if (typeof jQuery == 'undefined') {
		let script = document.createElement('script'); 
		script.type = 'text/javascript';
		script.src = host + '/public/js/jquery-3.6.0.min.js';
		document.getElementsByTagName('head')[0].appendChild(script);
	}
})();

let states = {
	'Abu Dhabi': 'AD',
	'Ajman': 'AJ',
	'Dubai': 'DB',
	'Fujairah': 'FJ',
	'Ras al-Khaimah': 'RK',
	'Sharjah': 'SH',
	'Umm al-Quwain': 'UQ'
}

$(function() {
	Ecwid.OnPageLoaded.add(function(page) {
		if (page.type == 'CHECKOUT_ADDRESS') {

			GoogleAutocomplete.load();
			DeliveryFields.init();
			CheckoutFields.hydrate({});

			$(document).on('change', '.ec-form__row--area select', function() {
				DeliveryFields.updateArea($(this).val(), false);
			});

			$(document).on('change', '.ec-form__row--deliveryCity select', function() {
				DeliveryFields.updateCity($(this).val(), false);
			});

			$(document).on('change', '#ec-country', function() {
				CheckoutFields.update();
			});

			$(document).on('mousedown', '.ec-form__row--continue', function() {
				CheckoutFields.update();
			});
		}
	});
});

let CheckoutFields = {
	hydrate: function(data, delayed = false) {
		setTimeout(() => {
			let dom = $(document);

			let defaults = {
				countryName: dom.find('[name="country-list"]').find("option:selected").text(),
				name: dom.find('#ec-full-name').val(),
				phone: dom.find('#ec-phone').val(),
				street: dom.find('#ec-address-line1').val(),
				city: dom.find('#ec-city-list').val(),
				postalCode: dom.find('#ec-postal-code').val(),
				stateOrProvinceCode: dom.find('[name="province"]').find("option:selected").val()
			}

			let address = $.extend({}, defaults, data);

			Ecwid.Cart.setAddress(address);
			Ecwid.refreshConfig();

		  	console.log('%cCheckout fields hydrated successfully', 'color: green');
		}, delayed ? 500 : 0);
	},
	hide: function() {
		let dom = $(document);

		dom.find('.ec-form__cell--street').closest('.ec-form__row').hide();
		dom.find('.ec-form__cell--city').closest('.ec-form__row').hide();
		dom.find('.ec-form__cell--state').closest('.ec-form__row').hide();
	},
	update: function() {
		setTimeout(() => {
			let dom = $(document);
			let stateSelect = dom.find('.ec-form__cell--state');
			let stateExists = stateSelect.find('select option[value="'+states[TBCookies.read('_tb-city')]+'"]').length > 0;

			let pinLocation = dom.find('input[name="nearestLandmark"]');

			this.hydrate({
				street: pinLocation.length > 0 ? pinLocation.val() : '',
				city: TBCookies.read('_tb-city'),
				stateOrProvinceCode: stateExists ? states[TBCookies.read('_tb-city')] : $(stateSelect.find('option')[1]).attr('value'),
			});

			this.hide();
		}, 500);
	}
}

let DeliveryFields = {
	data: JSON.parse(Ecwid.getAppPublicConfig(appId)),
	updateArea: function(value, dispatchEvent = true) {
		if (dispatchEvent) {
			let el = document.querySelector('.ec-form__row--area select');
			if (el !== null) {
				el.value = value;
				el.dispatchEvent(new Event('change', {bubbles:true, cancelable:true}));
			}
		}

		TBCookies.store('_tb-area', value, 365);
	},
	updateCity: function(value, dispatchEvent = true) {
		if (dispatchEvent) {
			let el = document.querySelector('.ec-form__row--deliveryCity select');
			if (el !== null) {
				el.value = value;
				el.dispatchEvent(new Event('change', {bubbles:true, cancelable:true}));
			}
		}

		TBCookies.store('_tb-city', value, 365);

		let areaOptions = [];
		if (typeof this.data.areas[value][0] !== 'undefined') {
			areaOptions = this.data.areas[value];
		}

		ec.order.extraFields.area.selectOptions = areaOptions;
		Ecwid.refreshConfig();

		let inArray = false;
		for (key in areaOptions) {
			if (areaOptions[key] == TBCookies.read('_tb-area')) {
				inArray = true;
				break;
			}
		}

		setTimeout(() => {
			if (inArray) {
				this.updateArea(TBCookies.read('_tb-area'), true);
			} else {
				this.updateArea(areaOptions[0], true);
			}
		}, 300);
	},
	create: function() {
		if (typeof this.data.cities[0] === 'undefined') return;

		ec.order = ec.order || {};
		ec.order.extraFields = ec.order.extraFields || {};

		let areaOptions = [];
		if (typeof this.data.areas[TBCookies.read('_tb-city')] !== 'undefined') {
			areaOptions = this.data.areas[TBCookies.read('_tb-city')];
		}
		else if (typeof this.data.areas[this.data.cities[0]] !== 'undefined') {
			areaOptions = this.data.areas[this.data.cities[0]];
		}

		ec.order.extraFields.area = {
		    'title': 'Area',
		    'textPlaceholder': 'Area',
		    'type': 'select',
		    'selectOptions': areaOptions,
		    'required': true,
		    'checkoutDisplaySection': 'shipping_address',
		    'value': TBCookies.read('_tb-area'),
		};

		ec.order.extraFields.address = {
		    'title': 'Address, home number etc.',
		    'textPlaceholder': 'Address, home number etc.',
		    'type': 'text',
		    'required': true,
		    'checkoutDisplaySection': 'shipping_address',
		};

		ec.order.extraFields.nearestLandmark = {
		    'title': 'Pin Location',
		    'textPlaceholder': 'Pin Location',
		    'type': 'text',
		    'required': true,
		    'checkoutDisplaySection': 'shipping_address',
		};

		ec.order.extraFields.deliveryCity = {
		    'title': 'City',
		    'textPlaceholder': 'City',
		    'type': 'select',
		    'selectOptions': typeof this.data.cities !== 'undefined' ? this.data.cities : [],
		    'required': true,
		    'checkoutDisplaySection': 'shipping_address',
		    'value': TBCookies.read('_tb-city'),
		};

		Ecwid.refreshConfig();
	},
	init: function() {
		this.create();
		setTimeout(() => {
			this.updateCity(TBCookies.read('_tb-city'));
		}, 500);
	}
};

let GoogleAutocomplete = {
	load: function() {
		if (typeof google !== 'undefined') return;

		let k = '',
			e = document.createElement('script');
		e.type = 'text/javascript';
		e.src = `https://maps.google.com/maps/api/js?key=${k}&libraries=places`;
		document.getElementsByTagName('head')[0].appendChild(e);
	},
	bind: function() {
		let input = document.querySelector('input[name="nearestLandmark"]');

		if (typeof input === 'undefined' || input == null) return;

		let autocomplete = new google.maps.places.Autocomplete(
			input,
			{
				types: ['establishment'],
				fields: ['place_id', 'name'],
			}
		);

		if (typeof input.placeholder !== 'undefined') input.placeholder = '';

		autocomplete.addListener('place_changed', function() {
			input.value = autocomplete.getPlace().name;
			input.dispatchEvent(new Event('input', {bubbles:true, cancelable:true}));
			input.dispatchEvent(new Event('blur'));

			CheckoutFields.update();
		});
	}
}

let TbCookies = {
	read: function(name) {
	    var nameEQ = name + "=";
	    var ca = document.cookie.split(';');
	    for(var i=0;i < ca.length;i++) {
	        var c = ca[i];
	        while (c.charAt(0)==' ') c = c.substring(1,c.length);
	        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	    }
	    return null;
	},
	store: function(name, value, days) {
	    var expires = "";
	    if (days) {
	        var date = new Date();
	        date.setTime(date.getTime() + (days*24*60*60*1000));
	        expires = "; expires=" + date.toUTCString();
	    }
	    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
	},
	erase: function(name) {
		document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	}
}
