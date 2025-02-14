import { ChangeDetectorRef, Component, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { ProductService } from 'src/app/services/product.service';
import { SupplierService } from 'src/app/services/supplier.service';

@Component({
    selector: 'app-supplier',
    templateUrl: './supplier.component.html',
    styleUrl: './supplier.component.scss',
    standalone: false
})
export class SupplierComponent implements OnInit {
  suppliers: any[] = [];
  products: any[] = [];
  sortOrder!: number;
  sortField!: string;
  sortOptions!: SelectItem[];
  sortStatus!: SelectItem[];
  visible: boolean = false;
  createUptForm: FormGroup;
  visibleUpt: boolean = false;
  id:string = "";
  notes:string = "";
  status:string="";
  loading: boolean = false;
  filteredSuppliers: any[] = [];
  searchTerm: string = '';
  supplierType = [
    { label: 'Wholesaler', value: 'Wholesaler' },
    { label: 'Manufacturers', value: 'Manufacturers' },
    { label: 'Importers', value: 'Importers' },

];
  visibleNotes: boolean = false;
  constructor(private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private supplierService: SupplierService,
    private productService: ProductService,

    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,

  ) {
    this.createUptForm = this.fb.group({
          name: ['', [Validators.required]],
          contact: ['',[Validators.required]],
          phone:['', [Validators.required]],
          email:['', [Validators.required, Validators.email]],
          supplierType: ['', [Validators.required]],
          notes:[''],
          address: this.fb.group({
            street: [''],
            city: [''],
            state: [''],
            postalCode: [''],
            country: ['']
          })
          
        });
  }

  ngOnInit() {
    this.getSuppliers();
    this.sortOptions = [
      { label: 'Name (A - Z)', value: 'name' },
      { label: 'Name (Z - A)', value: '!name' },
  ];
    this.sortStatus = [
      { label: 'Active', value: 'status' },
      { label: 'Inactive', value: '!status' },]
  }
  getSuppliers(){
    this.loading = true;
    this.supplierService.getSuppliers().subscribe({
      next: (data) => {
        this.suppliers = data;
        this.filteredSuppliers = data;
        this.loading = false;
        this.cdr.detectChanges(); 
      },
      error: (error) => {
        this.showToast('error','An error occurred'+ error);
      }
    });
  }

  getSupplierById(id: String){
    this.supplierService.getSupplierById(id).subscribe({
      next: (response:any) => {
        this.products = [];
        this.createUptForm.patchValue({
          name:response.name ,
          contact: response.contact,
          phone:response.phone,
          email:response.email,
          supplierType:response.supplierType ,
          notes:response.notes,
          address: response.address
          
        });
        if(response.suppliedProducts) {
          response.suppliedProducts.map((product:any) =>{
            this.products.push(product);
          })
        }
        
        this.products;
        this.id = response._id;
        this.status = response.status;
        this.notes = response.notes
      },
      error: (error) => {
        this.showToast('error','An error occurred'+ error);
      }
    });
  }
 
  updateSupplier(id: string) {
    if (this.createUptForm.valid) {
      this.confirmationService.confirm({
        message: 'Are you sure you want to edit this supplier?',
        header: 'Edit Confirmation',
        icon: 'pi pi-exclamation-circle',
        accept: () => {
            const supplierData = this.createUptForm.value
            this.supplierService.updateSupplier(id, supplierData).subscribe({
              next: () => {
                this.showToast('success', 'The supplier updated successfully');
                this.getSuppliers();
                this.createUptForm.reset();
                this.visibleUpt = false;
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
    
  createSupplier() {
    if (this.createUptForm.valid) {
        const supplierData = {...this.createUptForm.value, 'status':'active'};
        this.supplierService.createSupplier(supplierData).subscribe({
          next: () => {
            this.showToast('success', 'New brand added successfully');
            this.getSuppliers();
            this.createUptForm.reset();
            this.visible = false;
          },
          error: (error) => {
            this.showToast('error', 'An error occurred: ' + error);
          }
        });
    } else {
      this.showToast('warn', 'The form is invalid');
    }
  }
inactiveActive(id:String){
  this.getSupplierById(id);
  this.confirmationService.confirm({
    message: 'Are you sure you want to change the status of this supplier?',
    header: 'Edit Confirmation',
    icon: 'pi pi-exclamation-circle',
    accept: () => {
        const supplierData = {status:this.status === 'active'? 'inactive' : 'active'}
        this.supplierService.updateSupplier(id, supplierData).subscribe({
          next: () => {
            this.showToast('success', 'The status of the supplier changed');
            this.getSuppliers();
          },
          error: (error: any) => {
            this.showToast('error', 'An error occurred: ' + error);
          }
        });
     
    }
  });
}
  

  showDialogCreate(){
    this.visible = true;
    this.createUptForm.reset();
  }
  showDialogNotes(id:String){
    this.visibleNotes = true;
    this.getSupplierById(id)
  }
  showDialogUpdate(id:String){
    this.getSupplierById(id);
    this.visibleUpt = true;
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

    this.sortSupplier();
  }

  sortSupplier() {
    this.suppliers.sort((a, b) => {
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
      this.filteredSuppliers = this.suppliers;
    } else {
      const lowerSearch = this.searchTerm.toLowerCase();
      this.filteredSuppliers = this.suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(lowerSearch)
      );
    }
  }
  
}

