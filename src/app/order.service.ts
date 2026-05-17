import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError, BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';
import { Socket } from 'ngx-socket-io';
import { User } from './user.service';

export interface Order {
  id: number;
  article: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly baseUrl = environment.apiUrl;
  lastReport: string = '';

  private ordersSubject = new BehaviorSubject<Order[]>([]);
  orders$ = this.ordersSubject.asObservable();

  constructor(private http: HttpClient, private socketIo: Socket) {
    this.registerSocketEvents();
    this.socketIo.connect();
    this.loadInitial();
  }

  create(userId: number, article: string) {
    this.http.post(this.baseUrl + '/api/order', { userId, article })
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
    return this.http.delete(this.baseUrl + '/api/order', {
      body: { userId: order.user.id, article: order.article }
    })
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

  private loadInitial() {
    this.http.get<Order[]>(this.baseUrl + '/api/order').subscribe(orders => {
      this.ordersSubject.next(orders);
    });
  }

  private registerSocketEvents() {
    this.socketIo.on("connect", () => this.onSocketConnect());
    this.socketIo.on("disconnect", () => this.onSocketDisconnect());

    this.socketIo.on("order", (order: Order) => {
      this.ordersSubject.next([...this.ordersSubject.value, order]);
    });
    this.socketIo.on("delete", (order: Order) => {
      this.ordersSubject.next(
        this.ordersSubject.value.filter(o => o.id !== order.id)
      );
    });
    this.socketIo.on("reset", () => {
      this.ordersSubject.next([]);
    });
    this.socketIo.on("init", () => {
      this.loadInitial();
    });
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
