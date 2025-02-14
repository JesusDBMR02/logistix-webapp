import { ChangeDetectorRef, Component, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import jsPDF from 'jspdf';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { ProductService } from 'src/app/services/product.service';
import { PurchaseService } from 'src/app/services/purchase.service';
import { SupplierService } from 'src/app/services/supplier.service';

@Component({
    selector: 'app-purchase',
    templateUrl: './purchase.component.html',
    styleUrl: './purchase.component.scss',
    standalone: false
})
export class PurchaseComponent implements OnInit {
  suppliersArray: any[] = [];
  purchases: any[] = [];
  sortOrder!: number;
  sortField!: string;
  sortOptions!: SelectItem[];
  visible: boolean = false;
  createUptForm: FormGroup;
  statusForm: FormGroup;
  visibleUpt: boolean = false;
  id:string = "";
  selectedStatus: string='';
  selectedSupplier: string='';
  status:string = "";
  loading: boolean = false;
  filteredPurchases: any[] = [];
  searchTerm: string = '';
  totalPurchase: number = 0; 
  quantities: { [key: number]: number } = {}; 
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
    private purchaseService: PurchaseService,
    private supplierService: SupplierService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,

  ) {
    this.createUptForm = this.fb.group({
      notes: ['',[Validators.required,]],
      paymentMethod: ['',[Validators.required,]],
      idSupplier: ['',[Validators.required,]],
    });
    this.statusForm = this.fb.group({
      status: ['',[Validators.required,]],
    });
  }

  ngOnInit() {
    this.getPurchases();
    this.getSuppliers();
  }
  getPurchases(){
    this.loading = true;
    this.purchaseService.getPurchases().subscribe({
      next: (data) => {
        this.purchases = data;
        console.log(this.purchases);
        this.filteredPurchases = data;
        this.loading = false;
        this.cdr.detectChanges(); 
      },
      error: (error) => {
        this.showToast('error','An error occurred'+ error);
      }
    });
  }

  getSuppliers(){
    this.loading = true;
    this.supplierService.getSuppliers().subscribe({
      next: (response:any) => {
        response.map((supplier:any) =>{
          this.suppliersArray.push({
            label: supplier.name,
            value: supplier._id
          })
        });
        this.loading = false;
        this.cdr.detectChanges(); 
      },
      error: (error) => {
        this.showToast('error','An error occurred'+ error);
      }
    });
  }

  getPurchaseById(id: String): Promise<any>{
    return new Promise<void>((resolve,reject) =>{
    this.purchaseService.getPurchaseById(id).subscribe({
      next: (response:any) => {
        this.createUptForm.patchValue({
          notes: response.notes,
          paymentMethod: response.paymentMethod,
          idSupplier: response.supplier._id,

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

  getSupplierById(id: String): Promise<void>{
    return new Promise<void>((resolve,reject) =>{
    this.supplierService.getSupplierById(id).subscribe({
      next: (response:any) => {
        this.sourceProducts = response.suppliedProducts;
        resolve(response);
      },
      error: (error) => {
        this.showToast('error','An error occurred'+ error);
      }
    });
  });
  }

  updatePurchase(id: string) {
    if (this.createUptForm.valid) {
      this.confirmationService.confirm({
        message: 'Are you sure you want to edit this purchase?',
        header: 'Edit Confirmation',
        icon: 'pi pi-exclamation-circle',
        accept: () => {
          const selectedProductsWithQuantities = this.targetProducts.map(product => ({
            ...product,
            quantity: Number(this.quantities[product._id]) || 0,
            totalAmount: product.purchasePrice *  Number(this.quantities[product._id]) 
          }));
            const saleData = { ...this.createUptForm.value, products:selectedProductsWithQuantities };
            this.purchaseService.updatePurchase(id, saleData).subscribe({
              next: () => {
                this.showToast('success', 'The purchase updated successfully');
                this.visibleUpt = false
                this.getPurchases();
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
            this.purchaseService.updatePurchase(id, this.statusForm.value).subscribe({
              next: () => {
                if (this.statusForm.get('status')?.value === 'COMPLETED') {
                  this.getPurchaseById(id).then((response:any) => {
                    response.products.map((product:any) => {
                      let stockActualizado = product.stock + product.quantity;
                      this.productService.updateProduct(product._id, {stock: stockActualizado}).subscribe(
                        (response:any) => {
                          this.showToast('success', 'The status updated successfully');
                          this.visibleUptStatus = false
                          this.getPurchases();
                        }, (error):any =>{
                          this.showToast('error', 'Failed to update stock'+ error.message);
                      });
                    });
                  });
                }
                else{
                  this.showToast('success', 'The status updated successfully');
                  this.visibleUptStatus = false
                  this.getPurchases();
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
    
  createPurchase() {
    const saleDate = new Date();
    const isoDate = saleDate.toISOString();
    const formattedDate = isoDate.substring(0, 19).replace("T", " "); 

    if (this.createUptForm.valid) {
      const selectedProductsWithQuantities = this.targetProducts.map(product => ({
        ...product,
        quantity: Number(this.quantities[product._id]) || 0,
        totalAmount: product.purchasePrice *  Number(this.quantities[product._id]) 
    }));
      this.getSupplierById(this.createUptForm.get('idSupplier')?.value).then((response) =>{
        const saleData = { notes:this.createUptForm.get('notes')?.value,paymentMethod: this.createUptForm.get('paymentMethod')?.value, products:selectedProductsWithQuantities, supplier:response , purchaseDate:formattedDate };
        this.purchaseService.createPurchase(saleData).subscribe({
          next: (response:any) => {
            console.log(response);
            this.showToast('success', 'New purchase added successfully');
            location.reload();
          },
          error: (error) => {
            this.showToast('error', 'An error occurred: ' + error);
          }
        });      });
        
    } else {
      this.showToast('warn', 'The form is invalid');
    }
  }
  onSuppliersChange(event:any){
    this.loading = true;
    this.getSupplierById(event.value).then((response) =>{
      this.loading = false;
    });
  }
  showDialogCreate(){
    this.visible = true;
    this.createUptForm.reset();
  }
  showDialogUpdate(id:String){
    this.getPurchaseById(id).then((response) =>{
      this.getSupplierById(response.supplier._id).then((response) =>{
        this.visibleUpt = true;
      }).catch((error) => {
        this.showToast('error', 'An error occurred: ' + error);
      });
    }).catch((error) => {
      this.showToast('error', 'An error occurred: ' + error);
    });
  }
  showDialogUpdateStatus(id:String){
    this.getPurchaseById(id);
    this.visibleUptStatus = true;
  }
  onSortChange(event: any) {
    let filtered = [...this.purchases];
    if (this.selectedStatus) {
      filtered = filtered.filter(purchase => purchase.status === this.selectedStatus);
    }
    if (this.selectedSupplier) {
      filtered = filtered.filter(purchase => purchase.supplier._id === this.selectedSupplier);
    }
    
    this.filteredPurchases = filtered;
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
      this.filteredPurchases = this.purchases;
    } else {
      const lowerSearch = this.searchTerm.toLowerCase();
      this.filteredPurchases = this.purchases.filter(purchase =>
        purchase.name.toLowerCase().includes(lowerSearch)
      );
    }
  }
clearFilters(){
  this.selectedStatus = "";
  this.selectedSupplier = "";
  this.filteredPurchases = [...this.purchases]; 
  this.searchTerm = ''; 
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
  generatePDF(id:String) {
    this.getPurchaseById(id)
    .then((response : any) => {
      const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Purchase Invoice', 10, 10);

    doc.setFontSize(12);
    doc.text('Name: '+response.name, 10, 20);
    doc.text('Date: '+response.purchaseDate, 10, 30);
    doc.text('Status: ' + response.status, 10, 40);
    doc.text('Payment Method: '+response.paymentMethod, 10, 50);

    let startY = 60;
    doc.text('Products:', 10, startY);
    startY += 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Product', 10, startY);
    doc.text('Price', 70, startY);
    doc.text('Quantity', 100, startY);
    doc.text('Total', 150, startY);
    doc.setFont('helvetica', 'normal');

    response.products.map((product:any) => {
      startY += 10;
      doc.text(product.name, 10, startY);
      doc.text(product.purchasePrice + '€', 70, startY);
      doc.text(product.quantity + '', 100, startY);
      doc.text(product.totalAmount + '€' , 150, startY);
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

