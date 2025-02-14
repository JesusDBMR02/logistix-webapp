import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrl: './menu.component.scss',
    standalone: false
})
export class MenuComponent {
  items: MenuItem[] | undefined;
  model: any[] = [];
  menuVisible = false; // Estado del menú

  ngOnInit() {
    this.items = [
      { label: 'Home',
        items:[
          {label: 'Home', icon: 'pi pi-home', routerLink: 'home'},
        ]
       },
      { label: 'Warehouse',
        items: [
          { label: 'Products', icon: 'pi pi-box', routerLink: 'product' },
        ]
       },
      {
        label: 'Brands & Categories',
        items: [
          { label: 'Brands', icon: 'pi pi-bookmark', routerLink: 'brand' },
          { label: 'Categories', icon: 'pi pi-tag', routerLink: 'category' },
        ]
      },
      { label: 'Suppliers',
        items: [
          { label: 'Suppliers', icon: 'pi pi-users', routerLink: 'supplier' },
        ]
       },
      { label: 'Accounting',
        items: [
          { label: 'Purchases', icon: 'pi pi-shopping-cart', routerLink: 'purchase' },
          { label: 'Sales', icon: 'pi pi-shopping-bag', routerLink: 'sale' },
        ]
       },

    ];
    
  }
  toggleMenu() {
    this.menuVisible = !this.menuVisible;
  }
}
