import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../order.service';
import { Subscription } from 'rxjs';
import { ChatComponent } from '../chat/chat.component';
import { ClipboardService } from '../clipboard.service';

export interface Order {
  name: string;
  article: string;
}

@Component({
  selector: 'app-bruno-list',
  imports: [NgFor, FormsModule, NgIf, ChatComponent],
  templateUrl: './bruno-list.component.html',
  styleUrl: './bruno-list.component.css'
})
export class BrunoListComponent {
  username: string = '';
  article: string = '';
  orders: Order[] = [];
  toastVisible = false;
  errorVisible = false;

  // subscriptions for orders updates
  private newOrderSub?: Subscription;
  private deleteOrderSub?: Subscription;
  private resetSub?: Subscription;
  private initSub?: Subscription;

  constructor(private orderService: OrderService,
    private clipboard: ClipboardService) { }

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

    this.initSub = this.orderService.init$.subscribe(() => {
      this.orders = [];
    });

    // restore username, if any
    const savedName = this.getCookie('bruno-username');
    if (savedName) {
      this.username = savedName;
    }
  }

  ngOnDestroy() {
    this.newOrderSub?.unsubscribe();
    this.deleteOrderSub?.unsubscribe();
    this.resetSub?.unsubscribe();
    this.initSub?.unsubscribe();
  }

  onArticleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.article = target.value;
  }

  onUsernameChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.username = value;
    this.setCookie('bruno-username', value, 180);
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

  copyReport() {
    if (this.reportText) {
      this.clipboard.copyToClipboard(this.reportText).then((success) => {
        if (success) {
          this.toastVisible = true;
          setTimeout(() => this.toastVisible = false, 3000);
        } else {
          this.errorVisible = true;
          setTimeout(() => this.errorVisible = false, 3000);
        }
      });
    }
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

  setCookie(name: string, value: string, days: number) {
    const oneDayInMillis = 864e5;
    const expires = new Date(Date.now() + days * oneDayInMillis).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
  }

  getCookie(name: string): string | null {
    return document.cookie.split('; ').reduce((r, v) => {
      const parts = v.split('=');
      return parts[0] === name ? decodeURIComponent(parts[1]) : r
    }, null as string | null);
  }
}
