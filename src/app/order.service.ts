import { Injectable } from '@angular/core';
import { Order } from './bruno-list/bruno-list.component';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError, Subject } from 'rxjs';
import { environment } from '../environments/environment';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly baseUrl = environment.apiUrl;
  lastReport: string = '';

  private newOrderSubject = new Subject<Order>();
  newOrder$ = this.newOrderSubject.asObservable();

  private deleteSubject = new Subject<Order>();
  deleteOrder$ = this.deleteSubject.asObservable();

  private resetSubject = new Subject<void>();
  reset$ = this.resetSubject.asObservable();

  private initSubject = new Subject<void>();
  init$ = this.initSubject.asObservable();

  constructor(private http: HttpClient, private socketIo: Socket) {
    this.registerSocketEvents();
    this.socketIo.connect();
  }

  create(o: Order) {
    this.http.post(this.baseUrl + '/api/order', {
      name: o.name,
      article: o.article
    })
      .pipe(
        catchError(error => {
          alert('Errore durante l\'invio dell\'ordine!');
          return throwError(() => error);
        })
      )
      .subscribe(() => this.clearReport());
  }

  report() {
    this.http.get(this.baseUrl + '/api/order/report', { responseType: 'text' })
      .pipe(
        catchError(error => {
          alert('Errore nel generare il report!');
          return throwError(() => error);
        })
      )
      .subscribe(result => {
        this.lastReport = result;
      });
  }

  delete(order: Order) {
    return this.http.delete(this.baseUrl + '/api/order', { body: order })
      .pipe(
        catchError(error => {
          alert('Errore nella cancellazione dell\'ordine');
          return throwError(() => error);
        })
      )
      .subscribe(() => this.clearReport());
  }

  reset() {
    this.clearReport();
    return this.http.delete(this.baseUrl + '/api/order/all')
      .subscribe();
  }

  private registerSocketEvents() {
    this.socketIo.on("connect", () => this.onSocketConnect());
    this.socketIo.on("disconnect", () => this.onSocketDisconnect());

    // custom events from socket IO
    this.socketIo.on("order", (order: Order) => { this.newOrderSubject.next(order) });
    this.socketIo.on("delete", (order: Order) => { this.deleteSubject.next(order) });
    this.socketIo.on("reset", () => { this.resetSubject.next() });
    this.socketIo.on("init", () => { this.initSubject.next() });
  }

  private onSocketDisconnect() {
    console.debug("Socket disconnected!");
  }

  private onSocketConnect() {
    console.debug("Socket IO connected successfully!");
  }

  private clearReport() {
    this.lastReport = '';
  }
}
