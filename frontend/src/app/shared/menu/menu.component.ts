import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  items: MenuItem[] | undefined;
  model: any[] = [];

  ngOnInit() {
    this.items = [
      { label: 'Home',
        items:[
          {label: 'Home', icon: 'pi pi-home', routerLink: 'home'},
        ]
       },
      { label: 'Warehouse',
        items: [
          { label: 'Products', icon: 'pi pi-box', routerLink: '/products' },
        ]
       },
      {
        label: 'Brands & Categories',
        items: [
          { label: 'Brands', icon: 'pi pi-bookmark', routerLink: '/brands' },
          { label: 'Categories', icon: 'pi pi-bookmark-fill', routerLink: 'category' },
        ]
      },
      { label: 'Suppliers',
        items: [
          { label: 'Suppliers', icon: 'pi pi-users', routerLink: '/suppliers' },
        ]
       },
      { label: 'Finances',
        items: [
          { label: 'Purchases', icon: 'pi pi-shopping-cart', routerLink: '/orders' },
          { label: 'Sales', icon: 'pi pi-shopping-bag', routerLink: '/invoices' },
        ]
       },

    ];
    
  }
}
