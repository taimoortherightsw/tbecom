let AppHelpers = {
	notifyStack: 0,
	successIcon: `
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 70">
			<path d="M34.5 67h-.13c-8.68-.03-16.83-3.45-22.94-9.61C5.32 51.23 1.97 43.06 2 34.38 2.07 16.52 16.65 2 34.5 2h.13c8.68.03 16.83 3.45 22.94 
			9.61 6.12 6.16 9.46 14.34 9.43 23.02C66.93 52.48 52.35 67 34.5 67zm0-62C18.3 5 5.06 18.18 5 34.39c-.03 7.88 3.01 15.3 8.56 20.89 5.55 5.59 
			12.95 8.69 20.83 8.72h.12c16.2 0 29.44-13.18 29.5-29.39.03-7.88-3.01-15.3-8.56-20.89C49.89 8.13 42.49 5.03 34.61 5h-.11z"></path>
			<path d="M32.17 46.67l-10.7-10.08c-.6-.57-.63-1.52-.06-2.12.57-.6 1.52-.63 2.12-.06l8.41 7.92 14.42-16.81c.54-.63 1.49-.7 2.12-.16.63.54.7 
			1.49.16 2.12L32.17 46.67z"></path>
		</svg>
	`,
	errorIcon: `
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 70">
			<path d="M34.5 67C16.58 67 2 52.42 2 34.5S16.58 2 34.5 2 67 16.58 67 34.5 52.42 67 34.5 67zm0-62C18.23 5 5 18.23 5 34.5S18.23 64 34.5 64 
			64 50.77 64 34.5 50.77 5 34.5 5z"></path>
			<path d="M34.5 49c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM35.5 38.57h-2l-1-14c0-1.17.89-2.07 
			2-2.07s2 .9 2 2l-1 14.07z"></path>
		</svg>
	`,
	closeIcon: `
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
			<path d="M15.6 15.5c-.53.53-1.38.53-1.91 0L8.05 9.87 2.31 15.6c-.53.53-1.38.53-1.91 0s-.53-1.38 0-1.9l5.65-5.64L.4 2.4C-.13 1.87-.13 
			1.02.4.49s1.38-.53 1.91 0l5.64 5.63L13.69.39c.53-.53 1.38-.53 1.91 0s.53 1.38 0 1.91L9.94 7.94l5.66 5.65c.52.53.52 1.38 0 1.91z"></path>
		</svg>
	`,
	fireDialog: function (parms = { id, confirm, cancel }) {
		let modal = $('#' + parms.id);

		modal.show();

		$(modal).off('click', '.ta__confirm-btn');
		$(modal).off('click', '.ta__cancel-btn');

		$(modal).on('click', '.ta__confirm-btn', function () {
			let _self = $(this);
			let cancelBtn = _self.closest('.main-popup__buttons').find('.ta__cancel-btn');

			_self.addClass('btn-loading');
			cancelBtn.attr('disabled', 'disabled');

			(async () => {
				let result = await parms.confirm();

				_self.removeClass('btn-loading');
				cancelBtn.removeAttr('disabled');

				if (result == 'success') {
					_self.closest('.main-overlay').fadeOut(500, function () {
						modal.find('input').val('').closest('.field').removeClass('field--filled');
					});
				}
			})();
		});

		$(modal).on('click', '.ta__cancel-btn', function () {
			let _self = $(this);

			(async () => {
				let result = await parms.cancel();

				_self.closest('.main-overlay').fadeOut(500, function () {
					modal.find('input').val('').closest('.field').removeClass('field--filled');
				});
			})();
		});
	},
	ucWords: function (string) {
		string = string.toLowerCase().replace(/^[\u00C0-\u1FFF\u2C00-\uD7FF\w]|\s[\u00C0-\u1FFF\u2C00-\uD7FF\w]/g, function (letter) {
			return letter.toUpperCase();
		});

		return string;
	},
	toast: function (type = 'success', message = 'Your request has been processed.', timeout = 3000) {

		this.notifyStack += 1;

		var className = type == 'success' ? 'notify--success' : 'notify--error';
		var notifyIcon = type == 'success' ? this.successIcon : this.errorIcon;

		$('.ta__notifications').append(`
			<div class="notify ${className} notify--show ta__notify--${this.notifyStack}">
				<div class="notify__content">
					<div class="notify__icon">${notifyIcon}</div>
					<div class="notify__title">${message}</div>
					<div class="notify__close">${this.closeIcon}</div>
				</div>
			</div>
		`);

		var notify = $('.ta__notify--' + this.notifyStack);

		setTimeout(function () {
			notify.fadeOut(300, function () {
				notify.remove();
			});
		}, timeout);
	}
}

$(function () {
	$(document).on('click', '.ta__notifications .notify__close', function () {
		var notify = $(this).closest('.notify');
		notify.fadeOut(100, function () {
			notify.remove();
		});
	});
});
