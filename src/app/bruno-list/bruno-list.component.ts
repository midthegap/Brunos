import { NgFor, NgIf } from '@angular/common';

import { devOnlyGuardedExpression } from '@angular/compiler';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../order.service';

export interface Order {
  name : string;
  article : string;
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
  
  constructor(private orderService: OrderService) {}

  onArticleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.article = target.value;
  }
  
  addOrder() {
    if (this.username.length == 0) {
      alert('Metti il nome, furbetto!');
      return;
    }

    if (this.article.length == 0) {
      return;
    }

    const newOrder: Order = { name: this.username, article: this.article };
    this.orders.push(newOrder);

    this.orderService.create(newOrder);

    // clear input
    this.article = '';
  }
  
  metoo(selected: Order) {
    //TODO implement me!!
  }

  report() {
    this.orderService.report();
  }

  get reportText(): string {
    return this.orderService.lastReport;
  }
}
