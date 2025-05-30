import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private menuUpdatedSubject = new Subject<void>();
  menuUpdated$ = this.menuUpdatedSubject.asObservable();

  constructor(private socketIo: Socket) {
    this.socketIo.on('menu-updated', () => {
      this.menuUpdatedSubject.next();
    });
  }
}
