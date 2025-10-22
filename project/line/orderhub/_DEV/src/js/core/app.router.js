/* =======================
	/js/core/app.router.js
	內容：路由分流。
	來源方法：route
	======================= */
Object.assign(APP, {
	route: function() {
		const h = location.hash || '#/add';
		this.el.$tabAdd.toggleClass('active', h.startsWith('#/add'));
		this.el.$tabEdit.toggleClass('active', h.startsWith('#/edit'));
		if (h.startsWith('#/add')) return this.renderAdd();
		if (h.startsWith('#/edit')) return this.renderEdit();
		location.hash = '#/add';
	}
});