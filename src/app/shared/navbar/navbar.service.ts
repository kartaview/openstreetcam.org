import { Injectable } from '@angular/core';

@Injectable()
export class NavbarService {
    protected _theme = 'white';
    protected _visible = true;

    isVisible(): boolean {
        return this._visible;
    }

    hide() {
        this._visible = false;
    }

    show() {
        this._visible = true;
    }

    setTheme(theme: string) {
        this._theme = theme;
    }

    getTheme() {
        return this._theme;
    }
}
