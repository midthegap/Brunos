import { Injectable } from '@angular/core';
import { Order } from './bruno-list/bruno-list.component';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly baseUrl = environment.apiUrl;
  lastReport: string = '';

  constructor(private http: HttpClient) { }

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
      .subscribe();
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

  getAllObservable() {
    return this.http.get<Order[]>(this.baseUrl + '/api/order')
      .pipe(
        catchError(error => {
          alert('Errore nel recupero degli ordini!');
          return throwError(() => error);
        })
      );
  }

  deleteObservable(order: Order) {
    return this.http.delete(this.baseUrl + '/api/order', { body: order })
      .pipe(
        catchError(error => {
          alert('Errore nella cancellazione dell\'ordine');
          return throwError(() => error);
        })
      );
  }

  reset() {
    return this.http.delete(this.baseUrl + '/api/order/all')
      .subscribe();
  }
}
