import { ChangeDetectorRef, Component, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { BrandService } from 'src/app/services/brand.service';
import { FirebaseStorageService } from 'src/app/services/firebaseStorage.service';
import { ProductService } from 'src/app/services/product.service';
import { SaleService } from 'src/app/services/sale.service';

@Component({
  selector: 'app-sale',
  templateUrl: './sale.component.html',
  styleUrl: './sale.component.scss'
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
  status:string = "";
  loading: boolean = false;
  filteredSales: any[] = [];
  searchTerm: string = '';
  selectedFile: File | null = null; 
  logo: string = '';
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
    private firebaseStorageService: FirebaseStorageService

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

  getSaleById(id: String){
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
      },
      error: (error) => {
        this.showToast('error','An error occurred'+ error);
      }
    });
  }
  onFileSelected(event: any) {
    const file = event.files[0]; 
    if (file) {
      this.selectedFile = file;
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logo = e.target.result; 
      };
      reader.readAsDataURL(file);
    }  }

  uploadFile(callback: (url: string) => void) {
    if (this.selectedFile) {
      const folder = 'brands/img';
      this.firebaseStorageService.uploadFile(this.selectedFile, folder).subscribe({
        next: (url: string) => {
          callback(url); 
        },
        error: (error) => {
          this.showToast('error', 'Failed to upload the file: ' + error);
        }
      });
    } else {
      callback(this.logo); 
    }
  }
  updateSale(id: string) {
    if (this.createUptForm.valid) {
      this.confirmationService.confirm({
        message: 'Are you sure you want to edit this sale?',
        header: 'Edit Confirmation',
        icon: 'pi pi-exclamation-circle',
        accept: () => {
          
            const saleData = { ...this.createUptForm.value, products:this.targetProducts };
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
                this.showToast('success', 'The status updated successfully');
                this.visibleUptStatus = false
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

  deleteBrand(id: string) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this brand?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.saleService.deleteSale(id).subscribe({
          next: () => {
            this.showToast('success', 'Brand deleted successfully');
            this.getSales();
          },
          error: (error: any) => {
            this.showToast('error', 'An error occurred: ' + error);
          }
        });
      }
    });
  }
    
  createSale() {
    const saleDate = new Date();
    const isoDate = saleDate.toISOString();
    const formattedDate = isoDate.substring(0, 19).replace("T", " "); 
    if (this.createUptForm.valid) {
        const saleData = { ...this.createUptForm.value, products:this.targetProducts, saleDate:formattedDate };
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
    const value = event.value;

    if (value.startsWith('!')) {
      this.sortOrder = -1;
      this.sortField = value.substring(1);
    } else {
      this.sortOrder = 1;
      this.sortField = value;
    }

    this.sortBrands();
  }

  sortBrands() {
    this.sales.sort((a, b) => {
      const fieldA = a[this.sortField].toLowerCase();
      const fieldB = b[this.sortField].toLowerCase();

      if (fieldA < fieldB) return this.sortOrder === 1 ? -1 : 1;
      if (fieldA > fieldB) return this.sortOrder === 1 ? 1 : -1;
      return 0;
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
  filterBrands(): void {
    if (!this.searchTerm) {
      this.filteredSales = this.sales;
    } else {
      const lowerSearch = this.searchTerm.toLowerCase();
      this.filteredSales = this.sales.filter(brand =>
        brand.name.toLowerCase().includes(lowerSearch)
      );
    }
  }
  onMoveToTarget(event: any): void {
    console.log('Moved to target:', event.items);
  }

  onMoveToSource(event: any): void {
    console.log('Moved to source:', event.items);
  }
}

