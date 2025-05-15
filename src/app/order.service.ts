import { Injectable } from '@angular/core';
import { Order } from './bruno-list/bruno-list.component';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  lastReport: string = '';
  
  constructor(private http: HttpClient) { }

  create(o: Order) {
    this.http.post('http://localhost:8080/api/order', {
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
    this.http.get('http://localhost:8080/api/order/report', { responseType: 'text' })
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
}
