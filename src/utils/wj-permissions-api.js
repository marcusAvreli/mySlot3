export class WjPermissionsApi {
    constructor() {}

    static get permissions() {
        return [
            ...(intranet.storage().getItem('permissions', 'settings') || []),
            ...(intranet.storage().getItem('globalPermissions', 'settings') || []),
        ];
    }

    static includesKey(key) {
        return WjPermissionsApi.permissions.includes(key);
    }

    static getKeys() {
        let key = [];
        if (this.hasAttribute('permission-check')) {
            key = this.getAttribute('permission-check').split(',');
        }

        return key;
    }

    static shouldShow() {
        return this.hasAttribute('show') && JSON.parse(this.getAttribute('show'));
    }

    static isPermissionFulfilled() {
        return (
            WjPermissionsApi.getKeys
                .bind(this)()
                .some((perm) => WjPermissionsApi.permissions.includes(perm)) || WjPermissionsApi.shouldShow.bind(this)()
        );
    }
}