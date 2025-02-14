import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ProductService } from 'src/app/services/product.service';
import { PurchaseService } from 'src/app/services/purchase.service';
import { SaleService } from 'src/app/services/sale.service';
import { SessionService } from 'src/app/services/session.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: false
})
export class HomeComponent implements OnInit {
    userEmail: string = '';
    products: any[] = [];
    sales: any[] = [];
    purchases: any[] = [];
    responsiveOptions = [
        {
            breakpoint: '1199px',
            numVisible: 1,
            numScroll: 1
        },
        {
            breakpoint: '991px',
            numVisible: 2,
            numScroll: 1
        },
        {
            breakpoint: '767px',
            numVisible: 1,
            numScroll: 1
        }
    ];

    constructor(
        private productService: ProductService,
        private sessionService: SessionService,
        private saleService: SaleService,
        private purchaseService: PurchaseService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef,
        
    ) {
        
     }

    ngOnInit(): void {
        this.userEmail = this.sessionService.getEmail() || '';
        this.getProducts();
        this.getSales();
        this.getPurchases();
    }

    getProducts() {
        this.productService.getProducts().subscribe((response) => {
            this.products = response.filter((product) => product.status === 'OUTSTOCK');
            this.cdr.detectChanges(); 
            console.log(this.products);
        },
        (error) => {
           this.showToast('error','Error fetching products:'+ error.message);
        });
    }

    getSales(){
        this.saleService.getSales().subscribe((response) => {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            this.sales = response.filter((sale) => {
                const saleDateString = sale.saleDate.replace(' ', 'T');
                const saleDate = new Date(saleDateString);
                return sale.status === 'COMPLETED' && saleDate >= oneWeekAgo;
            });
            this.cdr.detectChanges(); 
            console.log(this.sales);
        },
        (error) => {
           this.showToast('error','Error fetching products:'+ error.message);
        });
    }
    getPurchases(){
        this.purchaseService.getPurchases().subscribe((response) => {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            this.purchases = response.filter((purchase) => {
                const purchaseDateString = purchase.purchaseDate.replace(' ', 'T');
                const purchaseDate = new Date(purchaseDateString);
                return purchase.status === 'COMPLETED' && purchaseDate >= oneWeekAgo;
            });
            this.cdr.detectChanges(); 
            console.log(this.purchases);
        },
        (error) => {
           this.showToast('error','Error fetching products:'+ error.message);
        });
    }
    showToast(severity: 'success' | 'info' | 'warn' | 'error', detail: string): void {
        this.messageService.add({
          severity: severity,
          summary: severity === 'warn' ? 'Advertencia' : severity === 'error' ? 'Error' : 'Información',
          detail: detail,
          life: 3000,
        });
      }

}