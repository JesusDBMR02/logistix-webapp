import { ChangeDetectorRef, Component, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import jsPDF from 'jspdf';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { ProductService } from 'src/app/services/product.service';
import { SaleService } from 'src/app/services/sale.service';

@Component({
    selector: 'app-sale',
    templateUrl: './sale.component.html',
    styleUrl: './sale.component.scss',
    standalone: false
})
export class SaleComponent implements OnInit {
  sales: any[] = [];
  sortOrder!: number;
  sortField!: string;
  sortOptions!: SelectItem[];
  visible: boolean = false;
  createUptForm: FormGroup;
  statusForm: FormGroup;
  visibleUpt: boolean = false;
  id:string = "";
  quantities: { [key: number]: number } = {}; 
  selectedStatus: string='';
  status:string = "";
  loading: boolean = false;
  filteredSales: any[] = [];
  searchTerm: string = '';
  totalSale: number = 0; 
  sourceProducts:any[] = [];
  targetProducts:any[] = [];
  statusArray:any[] = [
    { label: 'Pending', value: 'PENDING' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];
  paymentMethod:any[] = [
    { label: 'Cash', value: 'CASH' },
    { label: 'Credit Card', value: 'CREDIT CARD' },
    { label: 'Transfer', value: 'TRANSFER' },
    { label: 'Bizum', value: 'BIZUM' },
    { label: 'PayPal', value: 'PAYPAL' },
    { label: 'Other', value: 'OTHER' },
  ]
  @ViewChild('fileUpload') fileUpload!: FileUpload;
  visibleUptStatus: boolean = false;

  constructor(private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private saleService: SaleService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,

  ) {
    this.createUptForm = this.fb.group({
      notes: ['',[Validators.required,]],
      paymentMethod: ['',[Validators.required,]],

    });
    this.statusForm = this.fb.group({
      status: ['',[Validators.required,]],
    });
  }

  ngOnInit() {
    this.getSales();
    this.getProducts();
    this.sortOptions = [
      { label: 'Name (A - Z)', value: 'name' },
      { label: 'Name (Z - A)', value: '!name' },
  ];
  }
  getSales(){
    this.loading = true;
    this.saleService.getSales().subscribe({
      next: (data) => {
        this.sales = data;
        this.filteredSales = data;
        this.loading = false;
        this.cdr.detectChanges(); 
      },
      error: (error) => {
        this.showToast('error','An error occurred'+ error);
      }
    });
  }

  getProducts(){
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (data:any) => {
        
        this.sourceProducts = data.filter((product: any) => product.status != 'OUTSTOCK' );
        this.loading = false;
        this.cdr.detectChanges(); 
      },
      error: (error) => {
        this.showToast('error','An error occurred'+ error);
      }
    });
  }

  getSaleById(id: String): Promise<void>{
    return new Promise<void>((resolve,reject) =>{
    this.saleService.getSaleById(id).subscribe({
      next: (response:any) => {
        this.createUptForm.patchValue({
          notes: response.notes,
          paymentMethod: response.paymentMethod,
          
        });
        this.statusForm.patchValue({
          status: response.status,
        });
        this.id = response._id;
        this.targetProducts = response.products;
        resolve(response);
      },
      error: (error) => {
        this.showToast('error','An error occurred'+ error);
      }
    });
  });
  }

  updateSale(id: string) {
    if (this.createUptForm.valid) {
      this.confirmationService.confirm({
        message: 'Are you sure you want to edit this sale?',
        header: 'Edit Confirmation',
        icon: 'pi pi-exclamation-circle',
        accept: () => {
          const selectedProductsWithQuantities = this.targetProducts.map(product => ({
            ...product,
            quantity: Number(this.quantities[product._id]) || 0,
            totalAmount: product.total *  Number(this.quantities[product._id]) 
          }));
            const saleData = { ...this.createUptForm.value, products:selectedProductsWithQuantities };
            this.saleService.updateSale(id, saleData).subscribe({
              next: () => {
                this.showToast('success', 'The sale updated successfully');
                this.visibleUpt = false
                this.getSales();
              },
              error: (error: any) => {
                this.showToast('error', 'An error occurred: ' + error);
              }
            });
         
        }
      });
    } else {
      this.showToast('warn', 'The form is invalid');
    }
  }
  updateStatus(id: string) {
    if (this.statusForm.valid) {
      this.confirmationService.confirm({
        message: 'Are you sure you want to edit this status?',
        header: 'Edit Confirmation',
        icon: 'pi pi-exclamation-circle',
        accept: () => {
            this.saleService.updateSale(id, this.statusForm.value).subscribe({
              next: () => {
                if (this.statusForm.get('status')?.value === 'COMPLETED') {
                  this.getSaleById(id).then((response:any) => {
                    response.products.map((product:any) => {
                      let stockActualizado = product.stock - product.quantity;
                      this.productService.updateProduct(product._id, {stock: stockActualizado}).subscribe(
                        (response:any) => {
                          this.showToast('success', 'The status updated successfully');
                          this.visibleUptStatus = false
                          this.getSales();
                        }, (error):any =>{
                          this.showToast('error', 'Failed to update stock'+ error.message);
                      });
                    });
                  });
                }
                else{
                  this.showToast('success', 'The status updated successfully');
                  this.visibleUptStatus = false
                  this.getSales();
                }
                
              },
              error: (error: any) => {
                this.showToast('error', 'An error occurred: ' + error);
              }
            });
         
        }
      });
    } else {
      this.showToast('warn', 'The form is invalid');
    }
  }
    
  createSale() {
    const saleDate = new Date();
    const isoDate = saleDate.toISOString();
    const formattedDate = isoDate.substring(0, 19).replace("T", " "); 
    if (this.createUptForm.valid) {
      const selectedProductsWithQuantities = this.targetProducts.map(product => ({
        ...product,
        quantity: Number(this.quantities[product._id]) || 0,
        totalAmount: product.total *  Number(this.quantities[product._id]) 
      }));
        const saleData = { ...this.createUptForm.value, products:selectedProductsWithQuantities, saleDate:formattedDate };
        this.saleService.createSale(saleData).subscribe({
          next: (response:any) => {
            console.log(response);
            this.showToast('success', 'New sale added successfully');
            this.visible=false;
            this.getSales();
          },
          error: (error) => {
            this.showToast('error', 'An error occurred: ' + error);
          }
        });
    } else {
      this.showToast('warn', 'The form is invalid');
    }
  }

  showDialogCreate(){
    this.visible = true;
    this.createUptForm.reset();
  }
  showDialogUpdate(id:String){
    this.getSaleById(id);
    this.visibleUpt = true;
  }
  showDialogUpdateStatus(id:String){
    this.getSaleById(id);
    this.visibleUptStatus = true;
  }
  onSortChange(event: any) {
    let filtered = [...this.sales];
    if (this.selectedStatus) {
      filtered = filtered.filter(product => product.status === this.selectedStatus);
    }
    
    this.filteredSales = filtered;
  }

  
  showToast(severity: 'success' | 'info' | 'warn' | 'error', detail: string): void {
    this.messageService.add({
      severity: severity,
      summary: severity === 'warn' ? 'Advertencia' : severity === 'error' ? 'Error' : 'Información',
      detail: detail,
      life: 3000,
    });
  }
  filterSale(): void {
    if (!this.searchTerm) {
      this.filteredSales = this.sales;
    } else {
      const lowerSearch = this.searchTerm.toLowerCase();
      this.filteredSales = this.sales.filter(sale =>
        sale.name.toLowerCase().includes(lowerSearch)
      );
    }
  }
  addCuantityToProduct(event:any, product: any){
  this.quantities[product._id] = event.target.value;
}
initializeQuantities(event:any){
  event.items.forEach((product: any) => {
    if (!this.quantities[product._id]) {
        this.quantities[product._id] = 0;
    }
});
}
  clearFilters(){
    this.selectedStatus = "";
    this.filteredSales = [...this.sales]; 
    this.searchTerm = ''; 
  }
  generatePDF(id:String) {
    this.getSaleById(id)
    .then((response : any) => {
      const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Sale Invoice', 10, 10);

    doc.setFontSize(12);
    doc.text('Name: '+response.name, 10, 20);
    doc.text('Date: '+response.saleDate, 10, 30);
    doc.text('Status: ' + response.status, 10, 40);
    doc.text('Payment Method: '+response.paymentMethod, 10, 50);

    let startY = 60;
    doc.text('Products:', 10, startY);
    startY += 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Product', 10, startY);
    doc.text('Price', 80, startY);
    doc.text('Quantity', 110, startY);
    doc.text('Discount', 130, startY);
    doc.text('Tax', 155, startY);
    doc.text('Total', 170, startY);
    doc.setFont('helvetica', 'normal');

    response.products.map((product:any) => {
      startY += 10;
      doc.text(product.name, 10, startY);
      doc.text(product.salePrice + '€', 80, startY);
      doc.text(product.quantity + '', 110, startY);
      doc.text(product.discount + '%', 130, startY);
      doc.text(product.tax + '%', 155, startY);
      doc.text(product.totalAmount + '€' , 170, startY);
    });

    startY += 20;
    doc.setFontSize(14);
    doc.text('Total Amount: '+response.totalAmount+ '€', 10, startY);

    startY += 10;
    doc.text('Notes: '+response.notes, 10, startY);
    const pdfBlob = doc.output('blob');

    const pdfUrl = URL.createObjectURL(pdfBlob);

    const pdfWindow = window.open(pdfUrl, response.name);

    if (pdfWindow) {
      pdfWindow.onload = () => {
        URL.revokeObjectURL(pdfUrl); 
      };
    } else {
      this.showToast('error','The popup could not be opened.');
      doc.save(`${response.name}.pdf`);
    }
  
    })
    .catch((error) => {
      this.showToast('error','An error occurred:'+ error);    });
  }
    
}

