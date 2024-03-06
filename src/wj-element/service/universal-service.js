export class UniversalService {
	constructor(props = {}) {
		this._store = props.store
		this.premenna= null
	}

	findByKey(attrName, key, keyValue){
		if (this._store.getState()[attrName] instanceof Array) {
			let find = this._store.getState()[attrName].find((item) => item[key] == keyValue);
			return find;
		} else {
			console.warn(` Attribute ${attrName} is not array`);
		}
	}

	findById(attrName, id){
		if (this._store.getState()[attrName] instanceof Array) {
			let find = this._store.getState()[attrName].find((item) => item.id == id);
			return find;
		} else {
			console.warn(` Attribute ${attrName} is not array`);
		}
	}

	findAttributeValue(attrName){
		return this._store.getState()[attrName];
	}

	update(data, action){
		this._store.dispatch(action(data))
	}

	add(data, action) {
		this._store.dispatch(action(data))
	}

	_save(url, data, action, dispatchMethod, method){
		let promise = fetch(url, {
			method: method,
			body: JSON.stringify(data),
			cache: 'no-cache',
			headers: {
				'Content-Type': 'application/json'
			},
			referrerPolicy: 'same-origin',
		}).then((response) => {
			if(response.ok){
				return response.json();
			} else {
				return response.json();
			}
		});

		return this.dispatch(promise, dispatchMethod, action);
	}

	_get(url, action, dispatchMethod){
		let promise = fetch(url, {
			method: 'GET',
			cache: 'no-cache',
			headers: {
				'Content-Type': 'application/json'
			},
			referrerPolicy: 'same-origin',
		}).then(async (response) => {
			let text;
			try {
				let text = await response.text(); // Parse it as text
				const data = JSON.parse(text); // Try to parse it as JSON
				return data
			} catch(err) {
				return text
			}

			// if(response.ok){
			// 	return response.json();
			// } else {
			// 	throw new Error(`HTTP Response Code: ${response?.status}`)
			// }
		});

		return this.dispatch(promise, dispatchMethod, action);
	}

	put(url, data, action, dispatchMethod = true){
		return this._save(url, data, action, dispatchMethod, "PUT");
	}

	post(url, data, action, dispatchMethod = true) {
		return this._save(url, data, action, dispatchMethod, "POST");
	}

	delete(url, data, action, dispatchMethod = true) { 
		return this._save(url, data, action, dispatchMethod, "DELETE");
	}

	get(url, action, dispatchMethod = true) {
		return this._get(url, action, dispatchMethod);
	}

	dispatch(promise, dispatchMethod, action){
		if(dispatchMethod){
			return promise.then((data)=>{
				this._store.dispatch(action(data.data));
				return data;
			}).catch(error =>{
				console.error(error)
			});
		}

		return promise;
	}
/*
	loadPromise = (url, action, method='GET', data, permissionCallBack = ()=>{}) =>{
		return fetch(url, {
			method:method,
			body: data,
			cache: 'no-cache',
			headers: {
				'Content-Type': 'application/json'
			},
			async: true,
			referrerPolicy: 'same-origin',
		}).then( (response,e)=>{
			let permissions = response.headers.get('permissions')?.split(',')
			permissionCallBack(permissions)

			if(response.ok){
				return response.json();
			} else {
				 throw response.json()
			}
		}).then((data)=>{
			this._store.dispatch(action(data));
			return data
		});
	}

	loadOnePromise = (url, action) => {
		return fetch(url, {
			cache: 'no-cache',
			headers: {
				'Content-Type': 'application/json'
			},
			referrerPolicy: 'same-origin',
		}).then((data)=>{
			data = data.json()
			if(action){
				this._store.dispatch(action(data))
			}
			return data
		})
	};

	load = (url, async = false) => {
		return $.ajax({
			method: "GET",
			url: url,
			async: async,
			dataType: 'json',
		});
	}
	*/
}
