import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../order.service';

export interface Order {
  name: string;
  article: string;
}

@Component({
  selector: 'app-bruno-list',
  imports: [NgFor, FormsModule, NgIf],
  templateUrl: './bruno-list.component.html',
  styleUrl: './bruno-list.component.css'
})
export class BrunoListComponent {
  username: string = '';
  article: string = '';
  orders: Order[] = [];

  constructor(private orderService: OrderService) { }

  ngOnInit() {
    this.loadOrders();
  }

  private loadOrders() {
    this.orderService.getAllObservable().subscribe(
      orders => { this.orders = orders; });
  }

  onArticleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.article = target.value;
  }

  addOrder() {
    this.add(this.username, this.article);
  }

  private add(name: string, article: string) {
    if (name.length == 0) {
      alert('Metti il nome, furbetto!');
      return;
    }

    if (article.length == 0) {
      return;
    }

    if (this.orders.some(order => order.name.toLowerCase() === name.toLowerCase())) {
      alert("C'e' gia' un ordine per " + name + ".\nCancella prima quello vecchio.");
      return;
    }

    const newOrder: Order = { name: name, article: article };
    this.orderService.create(newOrder);
    this.orders.push(newOrder);

    // clear input
    this.article = '';
  }

  metoo(selected: Order) {
    this.add(this.username, selected.article);
  }

  report() {
    this.orderService.report();
  }

  get reportText(): string {
    return this.orderService.lastReport;
  }

  delete(selected: Order) {
    this.orderService.deleteObservable(selected).subscribe({
      next: () => this.loadOrders(),
      error: err => console.error('Delete failed', err)
    });
  }

  reset() {
    this.orderService.reset();
    this.orders = [];
  }
}
