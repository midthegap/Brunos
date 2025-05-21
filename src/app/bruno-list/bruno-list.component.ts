import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../order.service';
import { Subscription } from 'rxjs';

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

  // subscriptions for orders updates
  private newOrderSub?: Subscription;
  private deleteOrderSub?: Subscription;
  private resetSub?: Subscription;

  constructor(private orderService: OrderService) { }

  ngOnInit() {
    this.newOrderSub = this.orderService.newOrder$.subscribe(order => {
      console.log("Received order", order);
      this.orders.push(order);
    });
    
    this.deleteOrderSub = this.orderService.deleteOrder$.subscribe(order => {
      const index = this.orders.findIndex(o => o.name === order.name && o.article === order.article);
      if (index !== -1) {
        this.orders.splice(index, 1);
      }
    });
    
    this.resetSub = this.orderService.reset$.subscribe(() => {
      this.orders = [];
    });
  }

  ngOnDestroy() {
    this.newOrderSub?.unsubscribe();
    this.deleteOrderSub?.unsubscribe();
    this.resetSub?.unsubscribe();
  }

  onArticleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.article = target.value;
  }

  addOrder() {
    this.add(this.username, this.article);
  }

  private add(name: string, article: string) {
    name = name.trim();
    article = article.trim();

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
    if (window.confirm('Sei sicuro di voler cancellare?')) {
      this.orderService.delete(selected);
    }
  }

  reset() {
    if (window.confirm('Sei sicuro di voler cancellare tutti gli ordini?')) {
      this.orderService.reset();
    }
  }
}
